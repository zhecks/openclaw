import type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelMessageToolDiscovery,
} from "openclaw/plugin-sdk/channel-runtime";
import { resolveInfoflowAccount } from "../accounts.ts";

export function describeInfoflowMessageTool({
  cfg,
  accountId,
}: Parameters<
  NonNullable<ChannelMessageActionAdapter["describeMessageTool"]>
>[0]): ChannelMessageToolDiscovery {
  const account = resolveInfoflowAccount({ cfg, accountId });
  if (!account.enabled) {
    return {
      actions: [],
    };
  }

  const actions = new Set<ChannelMessageActionName>(["send"]);
  return {
    actions: Array.from(actions),
  };
}
