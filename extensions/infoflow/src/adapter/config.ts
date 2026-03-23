import { formatAllowFromLowercase } from "openclaw/plugin-sdk/allow-from";
import { createHybridChannelConfigAdapter } from "openclaw/plugin-sdk/channel-config-helpers";
import { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import {
  listInfoflowAccountIds,
  resolveDefaultInfoflowAccountId,
  resolveInfoflowAccount,
} from "../accounts.ts";
import { INFOFLOW_CHANNEL } from "../consts.ts";
import { ResolvedInfoflowAccount } from "../types.ts";

export const infoflowConfigAdapter = {
  ...createHybridChannelConfigAdapter<
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
  }),
  isConfigured: (account: ResolvedInfoflowAccount) => account.configured,
  describeAccount: (account: ResolvedInfoflowAccount) => ({
    accountId: account.accountId,
    name: account.name,
    enabled: account.enabled,
    configured: account.configured,
  }),
};
