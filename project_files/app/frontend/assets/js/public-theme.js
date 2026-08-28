(function () {
  "use strict";

  function apply(theme) {
    const value = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
  }

  async function refresh() {
    try {
      const response = await fetch("/api/public/settings", { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) return;
      const settings = await response.json();
      apply(settings.driver_theme);
    } catch (_) {
      // При временной недоступности сохраняем последнюю применённую тему.
    }
  }

  apply("light");
  refresh();
  window.setInterval(refresh, 15000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
})();
