// webhook or websocket(内测中，暂不支持如流卡片)
export type ResolvedInfoflowAccount = {
  enabled: boolean;
  name?: string;
  webhookUrl: string;
  token: string;
  encodingAESKey: string;
  appkey: string;
  appsecret: string;
  appAgentId: number;
  config: InfoflowAccountConfig;
};

export type InfoflowAccountConfig = {
  enabled: boolean;
  name?: string;
  webhookUrl: string;
  token: string;
  encodingAESKey: string;
  appkey: string;
  appsecret: string;
  appAgentId: number;
  groupPolicy?: GroupPolicy;
  contextPolicy?: ContextPolicy;
  messageType: "markdown" | "card";
};

export type GroupPolicy = {
  mode: "allowlist" | "open" | "close";
  allowlist: string[];
};

export type ContextPolicy = {
  maxRound: number; // 携带上下文的最大轮数
  messageStructure: "tree" | "list"; // 默认使用树形结构，提升上下文的效果，但可能会增加时延
  enableContextCompression: boolean; // 上下文压缩开关
};
