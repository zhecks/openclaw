import { createHybridChannelConfigAdapter } from "openclaw/plugin-sdk/channel-config-helpers";
import { ChannelPlugin, ClawdbotConfig } from "../runtime-api.js";
import { listInfoflowAccountIds, resolveInfoflowAccount } from "./accounts.js";
import { INFOFLOW_CHANNEL, infoflowMeta } from "./consts.js";
import { ResolvedInfoflowAccount } from "./types.js";

const infoflowConfigAdapter = createHybridChannelConfigAdapter<
  ResolvedInfoflowAccount,
  ResolvedInfoflowAccount,
  ClawdbotConfig
>({
  sectionKey: INFOFLOW_CHANNEL,
  listAccountIds: listInfoflowAccountIds,
  resolveAccount: (cfg, accountId) => resolveInfoflowAccount({ cfg, accountId }),
  defaultAccountId: function (cfg: ClawdbotConfig): string {
    throw new Error("Function not implemented.");
  },
  clearBaseFields: [],
  resolveAllowFrom: function (
    account: ResolvedInfoflowAccount,
  ): Array<string | number> | null | undefined {
    throw new Error("Function not implemented.");
  },
  formatAllowFrom: function (allowFrom: Array<string | number>): string[] {
    throw new Error("Function not implemented.");
  },
});

export const infoflowPlugin: ChannelPlugin<ResolvedInfoflowAccount> = {
  id: "infoflow",
  meta: infoflowMeta,
  capabilities: {
    chatTypes: ["direct", "group"], // 支持的消息类型
    polls: false, // 是否支持投票
    reactions: true, // 是否支持添加表情
    edit: false, // 是否支持消息重新编辑
    unsend: true, // 是否支持消息撤回
    reply: true, // 是否支持消息回复
    effects: false, // 是否支持特效
    groupManagement: true, // 是否支持群管理
    threads: false, // 是否支持线程回复
    media: true, // 是否支持多媒体
    nativeCommands: true, // 是否支持原生命令
    blockStreaming: false, // 是否使用阻塞流式（可以通过如流卡模拟）
  },
  config: {
    ...infoflowConfigAdapter,
  },
};
