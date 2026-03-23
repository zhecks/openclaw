import {
  ChannelOutboundAdapter,
  ChannelOutboundContext,
} from "openclaw/plugin-sdk/channel-runtime";
import { createAttachedChannelResultAdapter } from "openclaw/plugin-sdk/channel-send-result";
import { loadInfoflowChannelRuntime } from "../channel.ts";
import { INFOFLOW_CHANNEL } from "../consts.ts";
import { getInfoflowRuntime } from "../runtime.ts";

export const infoflowOutbound: ChannelOutboundAdapter = {
  deliveryMode: "direct",
  chunkerMode: "markdown",
  chunker: (text, limit) => getInfoflowRuntime().channel.text.chunkMarkdownText(text, limit),
  textChunkLimit: 4000,
  ...createAttachedChannelResultAdapter({
    channel: INFOFLOW_CHANNEL,
    sendText: async (params: ChannelOutboundContext) => {
      const runtime = await loadInfoflowChannelRuntime();
      const res = await runtime.sendMessageInfoflow({
        cfg: params.cfg,
        accountId: params.accountId ?? undefined,
        to: params.to,
        messageType: "markdown",
        messages: {
          content: params.text,
          mentions: undefined,
          replyMsgKey: params.replyToId ?? undefined,
        },
      });
      return {
        channel: INFOFLOW_CHANNEL,
        messageId: res.ok ? (res.msgKey ?? "") : "",
      };
    },
    sendMedia: async ({}) => {
      return {
        channel: INFOFLOW_CHANNEL,
        messageId: "mock",
      };
    },
    sendPoll: undefined, // 不支持投票
  }),
};
