import { ChannelMeta } from "openclaw/plugin-sdk/channel-runtime";

export const INFOFLOW_CHANNEL = "infoflow" as const;

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
