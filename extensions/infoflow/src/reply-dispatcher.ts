import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { createReplyPrefixContext } from "../runtime-api.ts";
import { resolveInfoflowAccount } from "./accounts.ts";
import { INFOFLOW_CHANNEL } from "./consts.ts";
import { getInfoflowRuntime } from "./runtime.ts";
import { CreateInfoflowReplyDispatcherParams, TypingIndicatorState } from "./types.ts";

export function createInfoflowReplyDispatcher(params: CreateInfoflowReplyDispatcherParams) {
  const core = getInfoflowRuntime();
  const { cfg, agentId, chatId, replyToMessageId, mentionTargets, accountId, identity } = params;

  const account = resolveInfoflowAccount({ cfg, accountId });
  const prefixCtx = createReplyPrefixContext({ cfg, agentId });

  let typpingState: TypingIndicatorState | null = null;
  const { typingCallbacks } = createChannelReplyPipeline({
    cfg,
    agentId,
    channel: INFOFLOW_CHANNEL,
    accountId: accountId,
    typing: {
      start: function (): Promise<void> {
        // add emoji
        throw new Error("Function not implemented.");
      },
      onStartError: function (err: unknown): void {
        throw new Error("Function not implemented.");
      },
    },
  });
}
