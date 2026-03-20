function stripProviderPrefix(raw: string): string {
  return raw.replace(/^infoflow:/i, "").trim();
}

export function normalizeInfoflowTarget(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const withoutProvider = stripProviderPrefix(trimmed);
  const lowered = withoutProvider.toLowerCase();
  if (lowered.startsWith("user:")) {
    return withoutProvider.slice("user:".length).trim();
  }
  if (lowered.startsWith("group:")) {
    return withoutProvider.slice("group:".length).trim();
  }

  return withoutProvider;
}

export function looksLikeInfoflowId(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;

  const withoutProvider = stripProviderPrefix(trimmed);
  if (/^(group|user):/i.test(withoutProvider)) {
    return true;
  }
  if (/^\d+$/.test(withoutProvider)) {
    return true;
  }
  if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(withoutProvider)) {
    return true;
  }

  return false;
}
export function looksLikeInfoflowGroupId(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;

  const withoutProvider = stripProviderPrefix(trimmed);
  if (/^group:/i.test(withoutProvider)) {
    return true;
  }
  if (/^\d+$/.test(withoutProvider)) {
    return true;
  }

  return false;
}
