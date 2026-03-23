import { createAccountListHelpers } from "openclaw/plugin-sdk/account-helpers";
import { normalizeAccountId } from "openclaw/plugin-sdk/account-id";
import { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { resolveAccountEntry } from "openclaw/plugin-sdk/routing";
import { InfoflowAccountConfig, ResolvedInfoflowAccount } from "./types.ts";

const { listAccountIds, resolveDefaultAccountId } = createAccountListHelpers("infoflow");
export const listInfoflowAccountIds = listAccountIds;
export const resolveDefaultInfoflowAccountId = resolveDefaultAccountId;

export function resolveInfoflowAccountConfig(
  cfg: OpenClawConfig,
  accountId: string,
): InfoflowAccountConfig | undefined {
  return resolveAccountEntry(cfg.channels?.infoflow?.accounts, accountId);
}

export function mergeInfoflowAccountConfig(
  cfg: OpenClawConfig,
  accountId: string,
): InfoflowAccountConfig {
  const { accounts: _ignored, ...base } = (cfg.channels?.infoflow ??
    {}) as InfoflowAccountConfig & {
    accounts?: unknown;
  };
  const account = resolveInfoflowAccountConfig(cfg, accountId) ?? {};
  return { ...base, ...account };
}

function checkInfoflowAccountConfigured(cfg: OpenClawConfig): boolean {
  const infoflowCfg = (cfg.channels?.infoflow ?? {}) as InfoflowAccountConfig;
  return (
    Boolean(infoflowCfg.apiHost) &&
    Boolean(infoflowCfg.token) &&
    Boolean(infoflowCfg.encodingAESKey) &&
    Boolean(infoflowCfg.appKey) &&
    Boolean(infoflowCfg.appSecret)
  );
}

export function resolveInfoflowAccount(params: {
  cfg: OpenClawConfig;
  accountId?: string | null;
}): ResolvedInfoflowAccount {
  const accountId = normalizeAccountId(params.accountId);
  const baseEnabled = params.cfg.channels?.infoflow?.enabled !== false;
  const merged = mergeInfoflowAccountConfig(params.cfg, accountId);
  const accountEnabled = merged.enabled !== false;
  const enabled = baseEnabled && accountEnabled;
  const configured = checkInfoflowAccountConfigured(params.cfg);
  return {
    accountId: accountId,
    enabled: enabled,
    apiHost: merged.apiHost,
    token: merged.token,
    encodingAESKey: merged.encodingAESKey,
    appKey: merged.appKey,
    appSecret: merged.appSecret,
    appAgentId: merged.appAgentId,
    configured: configured,
    config: merged,
  };
}

export function listEnabledInfoflowAccounts(cfg: OpenClawConfig): ResolvedInfoflowAccount[] {
  return listAccountIds(cfg)
    .map((accountId) => resolveInfoflowAccount({ cfg, accountId }))
    .filter((account) => account.enabled && account.configured);
}
