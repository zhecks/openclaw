import { defineChannelPluginEntry } from "openclaw/plugin-sdk/core";
import { infoflowPlugin } from "./src/channel.ts";
import { setInfoflowRuntime } from "./src/runtime.ts";

export default defineChannelPluginEntry({
  id: "infoflow",
  name: "infoflow",
  description: "OpenClaw Infoflow plugin",
  plugin: infoflowPlugin,
  setRuntime: setInfoflowRuntime,
});
