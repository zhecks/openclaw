import { resolveInfoflowOutboundSessionRoute } from "../session-route.ts";
import { looksLikeInfoflowId, normalizeInfoflowTarget } from "../target.ts";

export const infoflowMessagingAdapter = {
  normalizeTarget: normalizeInfoflowTarget,
  resolveOutboundSessionRoute: resolveInfoflowOutboundSessionRoute,
  targetResolver: {
    looksLikeId: looksLikeInfoflowId,
    hint: "<user:username|group:groupId>",
  },
};
