import { createAccountListHelpers } from "openclaw/plugin-sdk/account-helpers";
import { ClawdbotConfig } from "../runtime-api.js";
import { ResolvedInfoflowAccount } from "./types.js";

const { listAccountIds, resolveDefaultAccountId } = createAccountListHelpers("infoflow");
export const listInfoflowAccountIds = listAccountIds;
export const resolveDefaultInfoflowAccountId = resolveDefaultAccountId;
export function resolveInfoflowAccount(params: {
  cfg: ClawdbotConfig;
  accountId?: string | null;
}): ResolvedInfoflowAccount {
  return {
    enabled: false,
    webhookUrl: "",
    token: "",
    encodingAESKey: "",
    appkey: "",
    appsecret: "",
    appAgentId: 0,
    config: {
      enabled: false,
      webhookUrl: "",
      token: "",
      encodingAESKey: "",
      appkey: "",
      appsecret: "",
      appAgentId: 0,
      messageType: "markdown",
    },
  };
}
