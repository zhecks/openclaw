import { createHash } from "node:crypto";
import { resolveInfoflowAccount } from "./accounts.js";
import { tokenCacheMap } from "./cache.ts";
import {
  DEFAULT_TIMEOUT_MS,
  INFOFLOW_GET_ACCESS_TOKEN_PATH,
  INFOFLOW_SEND_PRIVATE_MSG_PATH,
} from "./consts.ts";
import { looksLikeInfoflowGroupId, normalizeInfoflowTarget } from "./target.ts";
import {
  GetAppAccessTokenParams,
  GetAppAccessTokenResult,
  MarkdownMessage,
  SendInfoflowMessageParams,
  SendInfoflowMessageResult,
} from "./types.ts";

function ensureHttps(apiHost: string): string {
  if (apiHost.startsWith("http://")) {
    const url = new URL(apiHost);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (!isLocal) {
      return apiHost.replace(/^http:/, "https:");
    }
  }

  return apiHost;
}

export async function getAppAccessToken(
  params: GetAppAccessTokenParams,
): Promise<GetAppAccessTokenResult> {
  const account = resolveInfoflowAccount({ cfg: params.cfg, accountId: params.accountId });
  const cached = tokenCacheMap.get(account.accountId);
  // token is cached and not expired
  if (cached && cached.expiresAt > Date.now()) {
    return {
      ok: true,
      token: cached.token,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const md5Secret = createHash("md5").update(account.appSecret).digest("hex").toLowerCase();
    const api = `${ensureHttps(account.apiHost)}${INFOFLOW_GET_ACCESS_TOKEN_PATH}`;

    const res = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_key: account.appKey,
        app_secret: md5Secret,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: new Error(`Failed to get access token: ${res.statusText}`),
      };
    }

    const result = await res.json();
    const { code, data, msg } = result;
    if (code != "ok") {
      return {
        ok: false,
        error: new Error(`Failed to get access token: ${msg}`),
      };
    }

    const token = data?.app_access_token as string;
    const expiresAt = data?.expire as number;

    // cache token
    tokenCacheMap.set(account.accountId, {
      token: token,
      expiresAt: expiresAt,
    });

    return {
      ok: true,
      token: token,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: new Error(msg),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function sendPrivateMdMessageInfoflow(
  params: SendInfoflowMessageParams,
): Promise<SendInfoflowMessageResult> {
  const account = resolveInfoflowAccount({ cfg: params.cfg, accountId: params.accountId });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const api = `${ensureHttps(account.apiHost)}${INFOFLOW_SEND_PRIVATE_MSG_PATH}`;
    const tokenRes = await getAppAccessToken({ cfg: params.cfg, accountId: params.accountId });
    if (!tokenRes.ok) {
      return tokenRes;
    }
    if (!tokenRes.token) return { ok: false, error: new Error("token is empty") };

    const token = tokenRes.token;
    const needSendMsg = params.messages as MarkdownMessage;

    const sendRes = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer-" + token,
      },
      body: JSON.stringify({
        touser: params.to,
        msgtype: "md",
        md: {
          content: needSendMsg.content,
        },
      }),
      signal: controller.signal,
    });

    if (!sendRes.ok) {
      return {
        ok: false,
        error: new Error(`Failed to send message: ${sendRes.statusText}`),
      };
    }

    const result = await sendRes.json();
    const { code, data, msg } = result;

    if (code != "ok") {
      return {
        ok: false,
        error: new Error(`Failed to send message: ${msg}`),
      };
    }

    const errMsg = data?.errmsg ?? "";
    if (errMsg != "" && errMsg != "ok") {
      return {
        ok: false,
        error: new Error(`Failed to send message: ${errMsg}`),
      };
    }

    return {
      ok: true,
      msgKey: String(data?.msgkey),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: new Error(msg),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendPrivateMessageInfoflow(
  params: SendInfoflowMessageParams,
): Promise<SendInfoflowMessageResult> {
  switch (params.messageType) {
    case "markdown":
      return sendPrivateMdMessageInfoflow(params);
    case "card":
      return {
        ok: true,
      };
    default:
      return {
        ok: false,
        error: new Error("Unsupported message type"),
      };
  }
}

export async function sendGroupMessageInfoflow(
  params: SendInfoflowMessageParams,
): Promise<SendInfoflowMessageResult> {
  return {
    ok: false,
  };
}

export async function sendMessageInfoflow(
  params: SendInfoflowMessageParams,
): Promise<SendInfoflowMessageResult> {
  const target = normalizeInfoflowTarget(params.to);
  if (!target) {
    return {
      ok: false,
      error: new Error(`Invalid target: ${params.to}`),
    };
  }

  params.to = target;
  const isGroup = looksLikeInfoflowGroupId(params.to);

  if (isGroup) {
    return sendGroupMessageInfoflow(params);
  } else {
    return sendPrivateMessageInfoflow(params);
  }
}
