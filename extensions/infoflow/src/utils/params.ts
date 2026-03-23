import { IncomingMessage } from "node:http";
import { MAX_BODY_SIZE } from "../consts.ts";

export function readFirstString(
  params: Record<string, unknown>,
  keys: string[],
  fallback?: string | null,
): string | undefined {
  for (const key of keys) {
    const value = params[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }
  return undefined;
}

export async function readRawBody(
  req: IncomingMessage,
  maxBytes = MAX_BODY_SIZE,
): Promise<{ ok: true; raw: string } | { ok: false; error: Error }> {
  const chunks: Buffer[] = [];
  let total = 0;
  let done = false;
  return await new Promise((resolve) => {
    req.on("data", (chunk: Buffer) => {
      if (done) return;
      total += chunk.length;
      if (total > maxBytes) {
        done = true;
        resolve({ ok: false, error: new Error("payload too large") });
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (done) return;
      done = true;
      const raw = Buffer.concat(chunks).toString("utf8");
      resolve({ ok: true, raw });
    });
    req.on("error", (err) => {
      if (done) return;
      done = true;
      resolve({
        ok: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    });
  });
}

export function tryParseJson<T extends Record<string, any>>(str: string): T | null {
  try {
    const result = JSON.parse(str);

    if (typeof result === "object" && result !== null && !Array.isArray(result)) {
      return result as T;
    }
  } catch (e) {
    return null;
  }

  return null;
}

export function tryParseXML<T extends Record<string, string>>(xmlString: string): T | null {
  if (!xmlString || typeof xmlString !== "string") return null;

  try {
    const result: Record<string, string> = {};

    // 正则说明：
    // 1. <(\w+)> : 匹配开始标签
    // 2. (?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*)) : 优先匹配 CDATA 内容，否则匹配普通文本
    // 3. <\/\1> : 匹配闭合标签
    const tagRegex = /<(\w+)>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))<\/\1>/g;

    let match;
    let found = false;

    tagRegex.lastIndex = 0;

    while ((match = tagRegex.exec(xmlString)) !== null) {
      const tagName = match[1];
      // match[2] 是 CDATA 内容, match[3] 是普通文本内容
      const content = match[2] ?? match[3] ?? "";
      result[tagName] = content.trim();
      found = true;
    }

    return found ? (result as T) : null;
  } catch (e) {
    return null;
  }
}
