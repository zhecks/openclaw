import { defineChannelPluginEntry } from "openclaw/plugin-sdk/core";
import { infoflowPlugin } from "./src/channel.ts";
import { setInfoflowRuntime } from "./src/runtime.ts";
import { registerInfoflowWebhookHandler } from "./src/webhook.ts";

export default defineChannelPluginEntry({
  id: "infoflow",
  name: "infoflow",
  description: "OpenClaw Infoflow plugin",
  plugin: infoflowPlugin,
  setRuntime: setInfoflowRuntime,
  registerFull: (api) => {
    registerInfoflowWebhookHandler(api);
  },
});
