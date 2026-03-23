import { ChannelPlugin } from "openclaw/plugin-sdk/core";
import { createLazyRuntimeNamedExport } from "openclaw/plugin-sdk/lazy-runtime";
import { infoflowChannelActions } from "./adapter/actions.ts";
import { infoflowConfigAdapter } from "./adapter/config.ts";
import { infoflowMessagingAdapter } from "./adapter/messaging.ts";
import { infoflowOutbound } from "./adapter/outbound.ts";
import { infoflowPairingAdapter } from "./adapter/pairing.ts";
import { InfoflowSetupAdapter as infoflowSetupAdapter } from "./adapter/setup.ts";
import { infoflowMeta } from "./consts.ts";
import { ResolvedInfoflowAccount } from "./types.ts";

export const loadInfoflowChannelRuntime = createLazyRuntimeNamedExport(
  () => import("./channel.runtime.js"),
  "infoflowChannelRuntime",
);

export const infoflowPlugin: ChannelPlugin<ResolvedInfoflowAccount> = {
  id: "infoflow",
  meta: infoflowMeta,
  capabilities: {
    chatTypes: ["direct", "group"],
    polls: false,
    reactions: true,
    edit: false,
    unsend: true,
    reply: true,
    effects: false,
    groupManagement: true,
    threads: false,
    media: true,
    nativeCommands: true,
    blockStreaming: false,
  },
  reload: { configPrefixes: ["channels.infoflow"] },
  setup: infoflowSetupAdapter,
  config: infoflowConfigAdapter,
  pairing: infoflowPairingAdapter,
  actions: infoflowChannelActions,
  messaging: infoflowMessagingAdapter,
  outbound: infoflowOutbound,
  gateway: {},
};
