import type { PluginRuntime } from "openclaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";

const { setRuntime: setInfoflowRuntime, getRuntime: getInfoflowRuntime } =
  createPluginRuntimeStore<PluginRuntime>("infoflow runtime not initialized");
export { getInfoflowRuntime, setInfoflowRuntime };
