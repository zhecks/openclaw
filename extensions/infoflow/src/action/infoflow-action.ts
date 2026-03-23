import { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { ChannelMessageActionContext } from "openclaw/plugin-sdk/channel-runtime";
import { loadInfoflowChannelRuntime } from "../channel.ts";
import { INFOFLOW_CHANNEL } from "../consts.ts";
import { jsonActionResult } from "../utils/action.ts";
import { readFirstString } from "../utils/params.ts";

export async function handleInfoflowAction(
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
