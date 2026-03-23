import { createEnvPatchedAccountSetupAdapter } from "openclaw/plugin-sdk/setup";
import { ChannelSetupAdapter } from "openclaw/plugin-sdk/setup-runtime";
import { INFOFLOW_CHANNEL } from "../consts.ts";

export const InfoflowSetupAdapter: ChannelSetupAdapter = createEnvPatchedAccountSetupAdapter({
  channelKey: INFOFLOW_CHANNEL,
  defaultAccountOnlyEnvError: "Infoflow not supported by this adapter.",
  missingCredentialError: "Infoflow not supported by this adapter.",
  hasCredentials: () => false,
  buildPatch: (input) => (input.token ? { token: input.token } : {}),
});
