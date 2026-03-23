import type { IncomingMessage, ServerResponse } from "node:http";
import { OpenClawPluginApi } from "openclaw/plugin-sdk/core";
import { logVerbose } from "openclaw/plugin-sdk/runtime-env";
import { INFOFLOW_WEBHOOK_PATH } from "./consts.ts";
import {
  InfoflowEchoStrEvent,
  InfoflowPrivateChatEvent,
  InfoflowWebhookEvent,
  InfoflowWebhookResult,
} from "./types.ts";
import { renderJson, renderText } from "./utils/http-render.ts";
import { readRawBody } from "./utils/params.ts";
import { parseWebhookEvent } from "./webhook-req-parse.ts";

export async function infoflowWebhookHandler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  logVerbose(`Infoflow webhook: received request`);
  if (req.method !== "POST") return false;

  const rawBody = await readRawBody(req);
  if (!rawBody.ok) {
    const code = rawBody.error.message === "payload too large" ? 413 : 400;
    renderText(res, code, rawBody.error.message);
    return true;
  }

  logVerbose(`Infoflow webhook: read raw body ${rawBody.raw}`);

  const event = await parseWebhookEvent(req, rawBody.raw);
  if (!event.ok) {
    renderText(res, 500, event.error?.message ?? "Internal Server Error");
    return true;
  }

  logVerbose(`Infoflow webhook: parsed event ${JSON.stringify(event)}`);

  const result = await handleWebhookEvent(event);

  logVerbose(`Infoflow webhook: handled event ${JSON.stringify(result)}`);

  if (!result.ok) {
    renderText(res, 500, result.error?.message ?? "Internal Server Error");
    return true;
  }

  if (result.isJson) {
    renderJson(res, 200, result.data ?? "ok");
  } else {
    renderText(res, 200, result.data ?? "ok");
  }

  logVerbose(`Infoflow webhook: sent response ${result.data ?? "ok"}`);

  return true;
}

async function handlePrivateChatEvent(event: InfoflowPrivateChatEvent) {}

async function handleWebhookEvent(event: InfoflowWebhookEvent): Promise<InfoflowWebhookResult> {
  try {
    switch (event.eventType) {
      case "echostr":
        // just response echostr
        const echostrEvent = event as InfoflowEchoStrEvent;
        return {
          ok: true,
          data: echostrEvent.echostr,
          isJson: false,
        };
      case "privateChat":
        const privateChatEvent = event as InfoflowPrivateChatEvent;
        handlePrivateChatEvent(privateChatEvent);
        return {
          ok: true,
          isJson: true,
        };
      default:
        return {
          ok: false,
          error: new Error("Unsupported event type"),
          isJson: false,
        };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error, isJson: false };
    } else {
      return { ok: false, error: new Error(String(error)), isJson: false };
    }
  }
}

export function registerInfoflowWebhookHandler(api: OpenClawPluginApi) {
  api.registerHttpRoute({
    path: INFOFLOW_WEBHOOK_PATH,
    handler: infoflowWebhookHandler,
    auth: "plugin", // need gateway's auth
  });
}
