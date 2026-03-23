import { DmPolicy, GroupPolicy, OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { OutboundIdentity } from "openclaw/plugin-sdk/outbound-runtime";
import { HistoryEntry } from "openclaw/plugin-sdk/reply-history";
import { RuntimeEnv } from "openclaw/plugin-sdk/runtime-env";

export type ResolvedInfoflowAccount = {
  accountId: string;
  enabled: boolean;
  name?: string;
  apiHost: string;
  token: string;
  encodingAESKey: string;
  appKey: string;
  appSecret: string;
  appAgentId: number;
  configured: boolean;
  config: InfoflowAccountConfig;
};

export type InfoflowConfig = {
  accounts?: Record<string, InfoflowAccountConfig>;
  defaultAccount?: string;
} & InfoflowAccountConfig;

export type InfoflowAccountConfig = {
  enabled: boolean;
  name?: string;
  apiHost: string;
  token: string;
  encodingAESKey: string;
  appKey: string;
  appSecret: string;
  appAgentId: number;
  defaultAccount: string;
  defaultTo?: string | number;
  dmPolicy?: InfoflowDmPolicy;
  groupPolicy?: InfoflowGroupPolicy;
  contextPolicy?: InfoflowContextPolicy;
  messageType: "markdown" | "card";
};

export type InfoflowDmPolicy = {
  enabled: boolean;
  policy?: DmPolicy;
  allowFrom?: string[];
};

export type InfoflowGroupPolicy = {
  enabled: boolean;
  policy: GroupPolicy;
  allowFrom?: string[];
};

export type InfoflowContextPolicy = {
  maxRound: number; // 携带上下文的最大轮数
  messageStructure: "tree" | "list"; // 默认使用树形结构，提升上下文的效果，但可能会增加时延
  enableContextCompression: boolean; // 上下文压缩开关
};

export type MarkdownMessage = {
  content: string;
  mentions?: MentionTarget[];
  replyMsgKey?: string; // 仅群聊支持
};

export type CardMessage = {
  mentions?: MentionTarget[];
};

export type MentionTarget = {
  userId: string;
};

export type GetAppAccessTokenParams = {
  cfg: OpenClawConfig;
  accountId?: string;
};

export type GetAppAccessTokenResult = {
  ok: boolean;
  token?: string;
  error?: Error;
};

export type SendInfoflowMessageParams = {
  cfg: OpenClawConfig;
  to: string;
  messageType: "markdown" | "card";
  messages: MarkdownMessage | CardMessage[]; // 支持markdown和如流工作卡
  accountId?: string;
};

export type SendInfoflowMessageResult = {
  ok: boolean;
  msgKey?: string;
  error?: Error;
};

export type MsgData = {
  fromId: string;
  fromUserId: string;
  fromUserName: string;
  createTime: number;
  opencode: string;
  msgType: string;
  content?: string;
  picUrl?: string;
  voiceUrl?: string;
  event?: string;
  msgId: string;
  msgId2: string;
  selectorRef?: string;
  agentId: string;
};

export type InfoflowHandleMessageParams = {
  cfg: OpenClawConfig;
  msgData: MsgData;
  botId?: string;
  botName?: string;
  runtime?: RuntimeEnv;
  chatHistories?: Map<string, HistoryEntry[]>;
  accountId?: string;
  processingClaimHeld?: boolean;
};

export type InfoflowEchoStrEvent = {
  ok: boolean;
  eventType?: string;
  echostr?: string;
  error?: Error;
};

export type InfoflowPrivateChatEvent = {
  ok: boolean;
  eventType?: string;
  msgData: MsgData;
  error?: Error;
};

export type InfoflowGroupChatEvent = {
  ok: boolean;
  eventType?: string;
  msgData: MsgData;
  error?: Error;
};

export type InfoflowWebhookEvent =
  | InfoflowEchoStrEvent
  | InfoflowPrivateChatEvent
  | InfoflowGroupChatEvent;

export type InfoflowWebhookResult = {
  ok: boolean;
  type?: string;
  data?: string;
  error?: Error;
  isJson: boolean;
};

export type CreateInfoflowReplyDispatcherParams = {
  cfg: OpenClawConfig;
  agentId: string;
  runtime: RuntimeEnv;
  chatId: string;
  replyToMessageId?: string;
  mentionTargets?: MentionTarget[];
  accountId?: string;
  identity?: OutboundIdentity;
  messageCreateTimeMs?: number;
};

export type TypingIndicatorState = {
  messageId: string;
  reactionId: string | null;
};
