import { createDecipheriv, createHash, timingSafeEqual } from "node:crypto";
import { IncomingMessage } from "node:http";
import { logVerbose } from "openclaw/plugin-sdk/runtime-env";
import { listEnabledInfoflowAccounts } from "./accounts.js";
import { messageCacheMap } from "./cache.ts";
import { getInfoflowRuntime } from "./runtime.ts";
import { InfoflowWebhookEvent, MsgData } from "./types.ts";
import { tryParseJson, tryParseXML } from "./utils/params.ts";

function base64UrlSafeDecode(s: string): Buffer {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  return Buffer.from(base64 + "=".repeat(padLen), "base64");
}

function decryptMessage(encryptedMsg: string, encodingAESKey: string): string {
  const aesKey = base64UrlSafeDecode(encodingAESKey);
  const cipherText = base64UrlSafeDecode(encryptedMsg);

  // Select AES algorithm based on key length
  let algorithm: string;
  switch (aesKey.length) {
    case 16:
      algorithm = "aes-128-ecb";
      break;
    case 24:
      algorithm = "aes-192-ecb";
      break;
    case 32:
      algorithm = "aes-256-ecb";
      break;
    default:
      throw new Error(`Invalid AES key length: ${aesKey.length} bytes (expected 16, 24, or 32)`);
  }

  // ECB mode does not use an IV (pass null)
  const decipher = createDecipheriv(algorithm, aesKey, null);
  const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return decrypted.toString("utf8");
}

function checkPrivateMessage(msgData: MsgData): Error | undefined {
  // 1. check fields
  if (
    msgData.fromUserId === "" ||
    msgData.fromUserName ||
    msgData.msgId === "" ||
    msgData.msgType === "" ||
    (msgData.content === "" && msgData.picUrl === "" && msgData.voiceUrl === "")
  ) {
    return new Error("invalid msg data");
  }
  // 2. check msg duplicate
  if (messageCacheMap.check(msgData.msgId)) {
    return new Error("duplicate msg");
  }

  return;
}

function transToMsgData(raw: Record<string, any>): MsgData {
  return {
    fromId: raw.FromId ?? "",
    fromUserId: raw.FromUserId ?? "",
    fromUserName: raw.FromUserName ?? "",
    createTime: raw.CreateTime ?? 0,
    event: raw.Event ?? "",
    content: raw.Content ?? "",
    opencode: raw.OpenCode ?? "",
    msgType: raw.MsgType ?? "",
    msgId: raw.MsgId ?? "",
    msgId2: raw.MsgId2 ?? "",
    agentId: raw.AgentId ?? "",
  };
}

export async function parseWebhookEvent(
  req: IncomingMessage,
  rawBody: string,
): Promise<InfoflowWebhookEvent> {
  const contentType = String(req.headers["content-type"] ?? "").toLowerCase();
  if (contentType.startsWith("application/x-www-form-urlencoded")) {
    const form = new URLSearchParams(rawBody);

    const echostr = form.get("echostr");
    if (echostr) {
      const signature = form.get("signature") ?? "";
      const timestamp = form.get("timestamp") ?? "";
      const rn = form.get("rn") ?? "";
      const runtime = getInfoflowRuntime();
      const cfg = runtime.config.loadConfig();
      const accounts = listEnabledInfoflowAccounts(cfg);
      for (const account of accounts) {
        const expectedSig = createHash("md5")
          .update(`${rn}${timestamp}${account.token}`)
          .digest("hex");
        if (
          signature.length == expectedSig.length &&
          timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
        ) {
          return {
            ok: true,
            eventType: "echostr",
            echostr: echostr,
          };
        }
      }
    } else {
      const messageJSONStr = form.get("messageJson") ?? "";
      logVerbose(`Infoflow webhook: message JSON: ${messageJSONStr}`);
      if (messageJSONStr) {
        const messageJSON = tryParseJson<{ Encrypt: string }>(messageJSONStr);
        if (!messageJSON) {
          return {
            ok: false,
            error: new Error("failed to parse message JSON"),
          };
        }

        const encrypt = messageJSON.Encrypt;
        if (!encrypt) {
          return {
            ok: false,
            error: new Error("no encrypt field in message JSON"),
          };
        }

        const runtime = getInfoflowRuntime();
        const cfg = runtime.config.loadConfig();
        const accounts = listEnabledInfoflowAccounts(cfg);
        for (const account of accounts) {
          let decryptContent: string;
          try {
            decryptContent = decryptMessage(encrypt, account.encodingAESKey);
          } catch {
            continue;
          }

          logVerbose(`Infoflow webhook: decrypt content: ${decryptContent}`);

          const rawMsgData = tryParseJson(decryptContent) ?? tryParseXML(decryptContent);
          if (!rawMsgData || Object.keys(rawMsgData).length === 0) {
            return {
              ok: false,
              error: new Error("failed to parse message data"),
            };
          }

          const msgData = transToMsgData(rawMsgData);

          logVerbose(`Infoflow webhook: msg data: ${JSON.stringify(msgData)}`);

          const err = checkPrivateMessage(msgData);
          if (err) {
            return { ok: false, error: err };
          }

          return {
            ok: true,
            msgData: msgData,
          };
        }
      }
    }
  }

  return { ok: true, error: new Error("Invalid request body") };
}
