import { ChannelMessageActionAdapter } from "openclaw/plugin-sdk/channel-runtime";
import { extractToolSend } from "openclaw/plugin-sdk/tool-send";
import { describeInfoflowMessageTool } from "../action/channel-message.js";
import { handleInfoflowAction } from "../action/infoflow-action.js";

export const infoflowChannelActions: ChannelMessageActionAdapter = {
  describeMessageTool: describeInfoflowMessageTool,
  extractToolSend: extractToolSend,
  handleAction: handleInfoflowAction,
};
