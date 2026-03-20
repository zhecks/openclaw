import {
  buildChannelOutboundSessionRoute,
  ChannelOutboundSessionRouteParams,
} from "openclaw/plugin-sdk/core";
import {
  looksLikeInfoflowGroupId,
  looksLikeInfoflowId,
  normalizeInfoflowTarget,
} from "./target.js";

export function resolveInfoflowOutboundSessionRoute(params: ChannelOutboundSessionRouteParams) {
  if (looksLikeInfoflowId(params.target)) {
    return null;
  }

  const to = normalizeInfoflowTarget(params.target);
  if (!to) {
    return null;
  }

  const isGroup = looksLikeInfoflowGroupId(params.target);

  return buildChannelOutboundSessionRoute({
    cfg: params.cfg,
    agentId: params.agentId,
    channel: "infoflow",
    accountId: params.accountId,
    peer: {
      kind: isGroup ? "group" : "direct",
      id: to,
    },
    chatType: isGroup ? "group" : "direct",
    from: isGroup ? `infoflow:group:${to}` : `infoflow:user:${to}`,
    to: to,
  });
}
