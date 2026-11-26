export type ThemePreference = "automatic" | "light" | "dark";

const themeStorageKey = "wwallet-theme";
const themeChangedEvent = "wwallet-theme-changed";

export function readThemePreference(): ThemePreference {
  const saved = localStorage.getItem(themeStorageKey);
  return saved === "automatic" || saved === "light" || saved === "dark"
    ? saved
    : "dark";
}

export function saveThemePreference(theme: ThemePreference) {
  localStorage.setItem(themeStorageKey, theme);
  window.dispatchEvent(new Event(themeChangedEvent));
}

export function startThemeSync() {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const applyTheme = () => {
    const preference = readThemePreference();
    document.documentElement.dataset.theme =
      preference === "automatic"
        ? systemTheme.matches
          ? "dark"
          : "light"
        : preference;
  };

  systemTheme.addEventListener("change", applyTheme);
  window.addEventListener("storage", applyTheme);
  window.addEventListener(themeChangedEvent, applyTheme);
  applyTheme();

  return () => {
    systemTheme.removeEventListener("change", applyTheme);
    window.removeEventListener("storage", applyTheme);
    window.removeEventListener(themeChangedEvent, applyTheme);
  };
}
