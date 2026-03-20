import { AgentToolResult } from "@mariozechner/pi-agent-core";
import type {
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMessageActionName,
  ChannelMessageToolDiscovery,
} from "openclaw/plugin-sdk/channel-runtime";
import { extractToolSend } from "openclaw/plugin-sdk/tool-send";
import { resolveInfoflowAccount } from "./accounts.js";
import { loadInfoflowChannelRuntime } from "./channel.js";
import { INFOFLOW_CHANNEL } from "./consts.js";

function describeInfoflowMessageTool({
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

  // TODO: need to suport infoflow's work card
  const actions = new Set<ChannelMessageActionName>(["send"]);
  return {
    actions: Array.from(actions),
  };
}

function readFirstString(
  params: Record<string, unknown>,
  keys: string[],
  fallback?: string | null,
): string | undefined {
  for (const key of keys) {
    const value = params[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }
  return undefined;
}

function jsonActionResult(details: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(details) }],
    details,
  };
}

async function handleInfoflowAction(
  ctx: ChannelMessageActionContext,
): Promise<AgentToolResult<unknown>> {
  switch (ctx.action) {
    case "send":
      const to = readFirstString(ctx.params, ["to", "target"]);
      const message = readFirstString(ctx.params, ["message"]);
      if (!to) {
        throw new Error(`Infoflow ${ctx.action} requires a target (to).`);
      }
      if (!message) {
        throw new Error(`Infoflow ${ctx.action} requires a message (message).`);
      }

      const runtime = await loadInfoflowChannelRuntime();
      const result = await runtime.sendMessageInfoflow({
        cfg: ctx.cfg,
        to: to,
        messageType: "markdown",
        messages: {
          content: message,
        },
      });

      return jsonActionResult({
        channel: INFOFLOW_CHANNEL,
        action: ctx.action,
        ...result,
      });
  }

  throw new Error(`Unsupported infoflow action: ${ctx.action}`);
}
export const infoflowChannelActions: ChannelMessageActionAdapter = {
  describeMessageTool: describeInfoflowMessageTool,
  extractToolSend: extractToolSend,
  handleAction: handleInfoflowAction,
};
