import { defineSetupPluginEntry } from "openclaw/plugin-sdk/core";
import { infoflowPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(infoflowPlugin);
