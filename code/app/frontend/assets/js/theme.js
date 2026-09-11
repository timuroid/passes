(function () {
  "use strict";
  const storageKey = "ztz-theme";
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const saved = localStorage.getItem(storageKey);
  let theme = saved === "light" || saved === "dark" ? saved : (media.matches ? "dark" : "light");

  function apply(nextTheme, persist) {
    theme = nextTheme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    if (persist) localStorage.setItem(storageKey, theme);
    const button = document.getElementById("theme-toggle");
    if (button) {
      const key = theme === "dark" ? "themeLight" : "themeDark";
      const label = window.I18n ? window.I18n.t(key) : (theme === "dark" ? "Светлая тема" : "Тёмная тема");
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      button.dataset.activeTheme = theme;
    }
  }

  apply(theme, false);
  document.addEventListener("DOMContentLoaded", () => {
    apply(theme, false);
    const button = document.getElementById("theme-toggle");
    if (button) button.addEventListener("click", () => apply(theme === "dark" ? "light" : "dark", true));
  });
  window.addEventListener("ztz:language", () => apply(theme, false));
  media.addEventListener("change", (event) => {
    if (!localStorage.getItem(storageKey)) apply(event.matches ? "dark" : "light", false);
  });
  window.Theme = { get current() { return theme; } };
})();
