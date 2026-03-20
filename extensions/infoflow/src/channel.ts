import { formatAllowFromLowercase } from "openclaw/plugin-sdk/allow-from";
import { createHybridChannelConfigAdapter } from "openclaw/plugin-sdk/channel-config-helpers";
import {
  createPairingPrefixStripper,
  createTextPairingAdapter,
} from "openclaw/plugin-sdk/channel-runtime";
import { createLazyRuntimeNamedExport } from "openclaw/plugin-sdk/lazy-runtime";
import { ChannelPlugin, OpenClawConfig } from "../runtime-api.js";
import {
  listInfoflowAccountIds,
  resolveInfoflowAccount,
  resolveDefaultInfoflowAccountId,
} from "./accounts.js";
import { infoflowChannelActions } from "./channel-action.js";
import { resolveInfoflowOutboundSessionRoute } from "./channel-route.js";
import { INFOFLOW_CHANNEL, infoflowMeta, PAIRING_APPROVED_MESSAGE } from "./consts.js";
import { infoflowOutbound } from "./outbound.js";
import { InfoflowSetupAdapter } from "./setup-core.js";
import { looksLikeInfoflowId, normalizeInfoflowTarget } from "./target.js";
import { ResolvedInfoflowAccount } from "./types.js";

const infoflowConfigAdapter = createHybridChannelConfigAdapter<
  ResolvedInfoflowAccount,
  ResolvedInfoflowAccount,
  OpenClawConfig
>({
  sectionKey: INFOFLOW_CHANNEL,
  listAccountIds: listInfoflowAccountIds,
  resolveAccount: (cfg, accountId) => resolveInfoflowAccount({ cfg, accountId }),
  defaultAccountId: resolveDefaultInfoflowAccountId,
  clearBaseFields: [
    "name",
    "webhookUrl",
    "token",
    "encodingAESKey",
    "appKey",
    "appSecret",
    "appAgentId",
  ],
  resolveAllowFrom: (account: ResolvedInfoflowAccount) => account.config.dmPolicy?.allowFrom,
  formatAllowFrom: (allowFrom) => formatAllowFromLowercase({ allowFrom }),
  resolveDefaultTo: (account: ResolvedInfoflowAccount) => account.config.defaultTo,
});

export const loadInfoflowChannelRuntime = createLazyRuntimeNamedExport(
  () => import("./channel.runtime.js"),
  "infoflowChannelRuntime",
);

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
  reload: { configPrefixes: ["channels.infoflow"] },
  setup: { ...InfoflowSetupAdapter }, // 如流的不支持仅通过一个token配置路由
  config: {
    // 处理账号配置
    ...infoflowConfigAdapter,
    isConfigured: (account) => account.configured,
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: account.configured,
    }),
  },
  pairing: createTextPairingAdapter({
    idLabel: "infoflowUserId",
    message: PAIRING_APPROVED_MESSAGE,
    normalizeAllowEntry: createPairingPrefixStripper(/^(infoflow|user):/i),
    notify: async ({ cfg, id, message }) => {
      const { sendMessageInfoflow } = await loadInfoflowChannelRuntime();
      await sendMessageInfoflow({
        cfg: cfg,
        to: id,
        messageType: "markdown",
        messages: {
          content: message,
        },
      });
    },
  }),
  actions: infoflowChannelActions,
  messaging: {
    normalizeTarget: normalizeInfoflowTarget,
    resolveOutboundSessionRoute: resolveInfoflowOutboundSessionRoute,
    targetResolver: {
      looksLikeId: looksLikeInfoflowId,
      hint: "<user:username|group:groupId>",
    },
  },
  outbound: infoflowOutbound,
};
