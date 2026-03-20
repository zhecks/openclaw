import type { IncomingMessage, ServerResponse } from "node:http";
import type { OpenClawPluginApi } from "../runtime-api.js";
import { INFOFLOW_WEBHOOK_PATH } from "./consts.ts";

function getClientIp(req: IncomingMessage): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress;
}

export function handleInfoflowWebhook(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean | void> | boolean | void {
  console.log("infoflow webhook");
  const ip = getClientIp(req);

  res.statusCode = 200;
  res.end(`${ip}`);
  return true;
}

export function registerInfoflowWebhookHandler(api: OpenClawPluginApi) {
  api.registerHttpRoute({
    path: INFOFLOW_WEBHOOK_PATH,
    handler: handleInfoflowWebhook,
    auth: "plugin", // need gateway's auth
  });
}
