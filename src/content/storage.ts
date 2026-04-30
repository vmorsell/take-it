const KEY = "enabled";

export async function getEnabled(): Promise<boolean> {
  const result = await chrome.storage.local.get(KEY);
  return result[KEY] === true;
}

export async function setEnabled(value: boolean): Promise<void> {
  await chrome.storage.local.set({ [KEY]: value });
}

export function onEnabledChanged(cb: (enabled: boolean) => void): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: chrome.storage.AreaName,
  ) => {
    if (area !== "local") return;
    const change = changes[KEY];
    if (!change) return;
    cb(change.newValue === true);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
