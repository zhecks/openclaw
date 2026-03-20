import { DmPolicy, GroupPolicy, OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";

// webhook or websocket(内测中，暂不支持如流卡片)
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
  mentions?: MetionTarget[];
  replyMsgKey?: string; // 仅群聊支持
};

export type CardMessage = {
  mentions?: MetionTarget[];
};

export type MetionTarget = {
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
