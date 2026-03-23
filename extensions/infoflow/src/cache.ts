import { createDedupeCache } from "openclaw/plugin-sdk/feishu";

export const tokenCacheMap = new Map<
  string,
  {
    token: string;
    expiresAt: number;
  }
>();

export const messageCacheMap = createDedupeCache({
  ttlMs: 5 * 60 * 1000,
  maxSize: 1000,
});
