import {
  createPairingPrefixStripper,
  createTextPairingAdapter,
} from "openclaw/plugin-sdk/channel-pairing";
import { PAIRING_APPROVED_MESSAGE } from "openclaw/plugin-sdk/channel-status";
import { loadInfoflowChannelRuntime } from "../channel.ts";

export const infoflowPairingAdapter = createTextPairingAdapter({
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
});
