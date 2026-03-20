import { ChannelMeta } from "openclaw/plugin-sdk/channel-runtime";

export const INFOFLOW_CHANNEL = "infoflow";
export const PAIRING_APPROVED_MESSAGE = "✅ 你的 OpenClaw 助手已就绪。有什么我可以帮你的吗？";

export const infoflowMeta: ChannelMeta = {
  id: INFOFLOW_CHANNEL,
  label: "Infoflow",
  selectionLabel: "Infoflow (Bot API)",
  docsPath: "./channels/infoflow",
  docsLabel: "infoflow",
  blurb: "try to support infoflow",
  order: 75,
  aliases: ["ruliu"],
  // selectionDocsPrefix: undefined,
  // selectionDocsOmitLabel: undefined,
  // selectionExtras: undefined,
  // detailLabel: undefined,
  systemImage: undefined,
  showConfigured: true,
  quickstartAllowFrom: true,
  forceAccountBinding: false,
  // preferSessionLookupForAnnounceTarget: undefined,
  // preferOver: undefined
};

export const DEFAULT_TIMEOUT_MS = 30_000;

export const INFOFLOW_GET_ACCESS_TOKEN_PATH = "/api/v1/auth/app_access_token";
export const INFOFLOW_SEND_PRIVATE_MSG_PATH = "/api/v1/app/message/send";
export const INFOFLOW_SEND_GROUP_MSG_PATH = "/api/v1/robot/msg/groupmsgsend";
export const INFOFLOW_WEBHOOK_PATH = "infoflow/webhook";

export const WEBHOOK_WHITE_LIST = ["127.0.0.1"];
