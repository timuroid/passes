document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const state = { user: null, page: 1, pageSize: 25, meta: null, passes: [], users: [], activeTab: "passes", passwordTarget: null, actionsTarget: null, driverTheme: "light", driverThemeMessageKey: "", driverTexts: {}, driverTextLanguage: "ru", driverTextMessageKey: "" };
  const elements = {
    currentUser: document.getElementById("current-user"),
    realtime: document.getElementById("realtime-status"), adminTabs: document.getElementById("admin-tabs"),
    visibilityField: document.getElementById("visibility-field"), statusHeading: document.getElementById("status-heading"),
    actionsHeading: document.getElementById("actions-heading"), passesBody: document.getElementById("passes-body"),
    empty: document.getElementById("empty-state"), loading: document.getElementById("loading-state"),
    total: document.getElementById("total-label"), pageLabel: document.getElementById("page-label"),
    prev: document.getElementById("prev-page"), next: document.getElementById("next-page"),
    pageSize: document.getElementById("page-size"), filters: document.getElementById("filters-form"),
    usersBody: document.getElementById("users-body"), usersCount: document.getElementById("users-count"),
    usersLoading: document.getElementById("users-loading"), passesPanel: document.getElementById("passes-panel"),
    usersPanel: document.getElementById("users-panel"), toast: document.getElementById("toast"),
    exportButton: document.getElementById("export-button"),
    passwordDialog: document.getElementById("password-dialog"), passwordDialogUser: document.getElementById("password-dialog-user"),
    passwordForm: document.getElementById("password-update-form"), resetPassword: document.getElementById("reset-password"),
    passwordMessage: document.getElementById("password-update-message"), passwordUpdateButton: document.getElementById("password-update-button"),
    closePasswordDialog: document.getElementById("close-password-dialog"), newPassword: document.getElementById("new-password"),
    toggleNewPassword: document.getElementById("toggle-new-password"), toggleResetPassword: document.getElementById("toggle-reset-password"),
    userActionsDialog: document.getElementById("user-actions-dialog"), userActionsDialogUser: document.getElementById("user-actions-dialog-user"),
    closeUserActionsDialog: document.getElementById("close-user-actions-dialog"), userActionPassword: document.getElementById("user-action-password"),
    userActionActive: document.getElementById("user-action-active"), settingsPanel: document.getElementById("settings-panel"),
    driverThemeMessage: document.getElementById("driver-theme-message"), driverThemeButtons: document.querySelectorAll("[data-driver-theme]"),
    driverTextForm: document.getElementById("driver-text-form"), driverTextLanguage: document.getElementById("driver-text-language"),
    driverTitleSetting: document.getElementById("driver-title-setting"), driverKeyboardNoteSetting: document.getElementById("driver-keyboard-note-setting"),
    saveDriverText: document.getElementById("save-driver-text"), driverTextMessage: document.getElementById("driver-text-message")
  };

  function locale() { return I18n.language === "tg" ? "tg-TJ" : "ru-RU"; }
  function formatDate(value) {
    return new Intl.DateTimeFormat(locale(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  }
  function showToast(text) {
    elements.toast.textContent = text;
    elements.toast.classList.add("show");
    window.setTimeout(() => elements.toast.classList.remove("show"), 2600);
  }
  function renderDriverTheme(theme) {
    state.driverTheme = theme === "dark" ? "dark" : "light";
    elements.driverThemeButtons.forEach((button) => {
      const active = button.dataset.driverTheme === state.driverTheme;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  function setDriverThemeMessage(key, kind) {
    state.driverThemeMessageKey = key;
    elements.driverThemeMessage.textContent = key ? I18n.t(key) : "";
    elements.driverThemeMessage.className = `form-message user-create-message ${kind || ""}`;
  }
  function renderDriverTextForm() {
    const language = state.driverTextLanguage;
    const configured = state.driverTexts[language];
    elements.driverTextLanguage.value = language;
    elements.driverTitleSetting.value = configured?.title || I18n.tFor(language, "driverTitle");
    elements.driverKeyboardNoteSetting.value = configured?.keyboard_note || I18n.tFor(language, "driverKeyboardNote");
  }
  function setDriverTextMessage(key, kind) {
    state.driverTextMessageKey = key;
    elements.driverTextMessage.textContent = key ? I18n.t(key) : "";
    elements.driverTextMessage.className = `form-message user-create-message ${kind || ""}`;
  }
  async function loadDriverSettings(clearMessages = true) {
    try {
      const settings = await Api.request("/api/public/settings");
      renderDriverTheme(settings.driver_theme);
      state.driverTexts = settings.driver_texts || {};
      renderDriverTextForm();
      if (clearMessages) {
        setDriverThemeMessage("", "");
        setDriverTextMessage("", "");
      }
    } catch (_) {
      setDriverThemeMessage("driverThemeError", "error");
      setDriverTextMessage("driverTextError", "error");
    }
  }
  async function changeDriverTheme(theme) {
    elements.driverThemeButtons.forEach((button) => { button.disabled = true; });
    setDriverThemeMessage("", "");
    try {
      const settings = await Api.request("/api/settings/driver-theme", { method: "PATCH", body: { theme } });
      renderDriverTheme(settings.driver_theme);
      state.driverTexts = settings.driver_texts || state.driverTexts;
      setDriverThemeMessage("driverThemeSaved", "success");
    } catch (error) {
      if (error.status === 401) return handleError(error);
      setDriverThemeMessage("driverThemeError", "error");
    } finally {
      elements.driverThemeButtons.forEach((button) => { button.disabled = false; });
    }
  }
  async function saveDriverText(event) {
    event.preventDefault();
    if (!elements.driverTextForm.reportValidity()) return;
    const language = state.driverTextLanguage;
    const title = elements.driverTitleSetting.value.trim();
    const keyboardNote = elements.driverKeyboardNoteSetting.value.trim();
    const lines = keyboardNote.split(/\r?\n/).filter((line) => line.trim()).length;
    if (lines > 2) {
      setDriverTextMessage("driverTextLinesError", "error");
      elements.driverKeyboardNoteSetting.focus();
      return;
    }
    elements.saveDriverText.disabled = true;
    elements.saveDriverText.textContent = I18n.t("savingDriverText");
    setDriverTextMessage("", "");
    try {
      const updated = await Api.request(`/api/settings/driver-text/${language}`, {
        method: "PATCH", body: { title, keyboard_note: keyboardNote }
      });
      state.driverTexts[language] = updated;
      renderDriverTextForm();
      setDriverTextMessage("driverTextSaved", "success");
    } catch (error) {
      if (error.status === 401) return handleError(error);
      setDriverTextMessage("driverTextError", "error");
    } finally {
      elements.saveDriverText.disabled = false;
      elements.saveDriverText.textContent = I18n.t("saveDriverText");
    }
  }
  function setPasswordToggle(input, button) {
    const visible = input.type === "text";
    button.textContent = I18n.t(visible ? "hidePassword" : "showPassword");
    button.setAttribute("aria-label", I18n.t(visible ? "hidePassword" : "showPassword"));
    button.setAttribute("aria-pressed", String(visible));
  }
  function togglePassword(input, button) {
    input.type = input.type === "password" ? "text" : "password";
    setPasswordToggle(input, button);
  }
  function openPasswordDialog(user) {
    state.passwordTarget = user;
    elements.passwordDialogUser.textContent = user.username;
    elements.resetPassword.value = "";
    elements.passwordMessage.textContent = "";
    elements.passwordMessage.className = "form-message";
    elements.resetPassword.type = "password";
    setPasswordToggle(elements.resetPassword, elements.toggleResetPassword);
    if (typeof elements.passwordDialog.showModal === "function") elements.passwordDialog.showModal();
    else elements.passwordDialog.setAttribute("open", "");
    elements.resetPassword.focus();
  }
  function closePasswordDialog() {
    state.passwordTarget = null;
    if (typeof elements.passwordDialog.close === "function") elements.passwordDialog.close();
    else elements.passwordDialog.removeAttribute("open");
  }
  function syncUserActionDialog() {
    const user = state.actionsTarget;
    if (!user) return;
    const ownAccount = user.id === state.user.id;
    elements.userActionsDialogUser.textContent = user.username;
    elements.userActionActive.classList.toggle("hidden", ownAccount);
    if (!ownAccount) {
      elements.userActionActive.disabled = false;
      elements.userActionActive.className = `button ${user.is_active ? "button-danger" : "button-secondary"}`;
      elements.userActionActive.textContent = I18n.t(user.is_active ? "disableUser" : "enableUser");
    }
  }
  function openUserActionsDialog(user) {
    state.actionsTarget = user;
    syncUserActionDialog();
    if (elements.userActionsDialog.open) return;
    if (typeof elements.userActionsDialog.showModal === "function") elements.userActionsDialog.showModal();
    else elements.userActionsDialog.setAttribute("open", "");
  }
  function closeUserActionsDialog() {
    state.actionsTarget = null;
    if (typeof elements.userActionsDialog.close === "function") elements.userActionsDialog.close();
    else elements.userActionsDialog.removeAttribute("open");
  }
  function handleError(error) {
    if (error.status === 401) {
      window.location.replace("/login");
      return;
    }
    showToast(I18n.t("loadError"));
  }
  function roleName(role) { return I18n.t(role === "admin" ? "adminRole" : "logistRole"); }

  function renderPasses() {
    elements.passesBody.replaceChildren();
    state.passes.forEach((item) => {
      const row = document.createElement("tr");
      const id = document.createElement("td"); id.textContent = item.id;
      const vehicle = document.createElement("td"); vehicle.textContent = item.vehicle_number; vehicle.className = "vehicle-cell";
      const phone = document.createElement("td"); phone.textContent = item.phone_number || "—"; phone.className = "phone-cell";
      const received = document.createElement("td"); received.textContent = formatDate(item.submitted_at);
      row.append(id, vehicle, phone, received);
      const statusCell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `badge ${item.is_hidden ? "badge-hidden" : "badge-visible"}`;
      badge.textContent = I18n.t(item.is_hidden ? "hidden" : "visible");
      statusCell.append(badge);
      const actionCell = document.createElement("td");
      const action = document.createElement("button");
      action.type = "button";
      action.className = `button button-small ${item.is_hidden ? "button-secondary" : "button-ghost"}`;
      action.textContent = I18n.t(item.is_hidden ? "restore" : "hide");
      action.addEventListener("click", () => changeVisibility(item, !item.is_hidden, action));
      actionCell.append(action);
      row.append(statusCell, actionCell);
      elements.passesBody.append(row);
    });
    const empty = state.passes.length === 0;
    elements.empty.classList.toggle("hidden", !empty);
    elements.loading.classList.add("hidden");
    elements.total.textContent = I18n.t("total", { count: state.meta ? state.meta.total : 0 });
    const pages = state.meta ? state.meta.pages : 0;
    elements.pageLabel.textContent = pages ? I18n.t("page", { page: state.page, pages }) : I18n.t("noPages");
    elements.prev.disabled = state.page <= 1;
    elements.next.disabled = !pages || state.page >= pages;
  }

  function buildPassParams(includePagination = true) {
    const params = new URLSearchParams({ sort: document.getElementById("sort").value });
    if (includePagination) {
      params.set("page", state.page);
      params.set("page_size", state.pageSize);
    }
    const mappings = [["date-from", "date_from"], ["date-to", "date_to"], ["search", "search"]];
    mappings.forEach(([id, key]) => { const value = document.getElementById(id).value.trim(); if (value) params.set(key, value); });
    params.set("visibility", document.getElementById("visibility").value);
    return params;
  }

  async function loadPasses() {
    elements.loading.classList.remove("hidden");
    const params = buildPassParams();
    try {
      const result = await Api.request(`/api/passes?${params}`);
      if (result.meta.pages > 0 && state.page > result.meta.pages) {
        state.page = result.meta.pages;
        return loadPasses();
      }
      state.passes = result.items;
      state.meta = result.meta;
      renderPasses();
    } catch (error) {
      elements.loading.classList.add("hidden");
      handleError(error);
    }
  }

  async function exportPasses() {
    const button = elements.exportButton;
    button.disabled = true;
    button.textContent = I18n.t("exportingExcel");
    try {
      const response = await fetch(`/api/passes/export.xlsx?${buildPassParams(false)}`, {
        credentials: "same-origin",
        headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
      });
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filenameMatch ? filenameMatch[1] : "vehicles.xlsx";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (_) {
      showToast(I18n.t("exportError"));
    } finally {
      button.disabled = false;
      button.textContent = I18n.t("exportExcel");
    }
  }

  async function changeVisibility(item, hidden, button) {
    button.disabled = true;
    try {
      await Api.request(`/api/passes/${item.id}/visibility`, { method: "PATCH", body: { hidden } });
      showToast(I18n.t("actionDone"));
      await loadPasses();
    } catch (error) {
      button.disabled = false;
      handleError(error);
    }
  }

  function renderUsers() {
    elements.usersBody.replaceChildren();
    state.users.forEach((user) => {
      const row = document.createElement("tr");
      row.className = "user-row";
      row.tabIndex = 0;
      row.setAttribute("role", "button");
      row.setAttribute("aria-label", I18n.t("openUserActions", { username: user.username }));
      row.addEventListener("click", () => openUserActionsDialog(user));
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openUserActionsDialog(user);
        }
      });
      const values = [user.id, user.username];
      values.forEach((value) => { const cell = document.createElement("td"); cell.textContent = value; row.append(cell); });
      const role = document.createElement("td");
      const roleBadge = document.createElement("span"); roleBadge.className = "badge role-badge"; roleBadge.textContent = roleName(user.role); role.append(roleBadge);
      const active = document.createElement("td"); active.textContent = I18n.t(user.is_active ? "active" : "inactive"); active.className = user.is_active ? "status-active" : "";
      const created = document.createElement("td"); created.textContent = formatDate(user.created_at);
      row.append(role, active, created); elements.usersBody.append(row);
    });
    elements.usersCount.textContent = I18n.t("usersCount", { count: state.users.length });
    elements.usersLoading.classList.add("hidden");
  }

  async function loadUsers() {
    elements.usersLoading.classList.remove("hidden");
    try { state.users = await Api.request("/api/users"); renderUsers(); }
    catch (error) { elements.usersLoading.classList.add("hidden"); handleError(error); }
  }

  async function changeUserActive(user, active, button) {
    button.disabled = true;
    try {
      await Api.request(`/api/users/${user.id}/active`, { method: "PATCH", body: { active } });
      showToast(I18n.t(active ? "userEnabled" : "userDisabled", { username: user.username }));
      await loadUsers();
      return true;
    } catch (error) {
      button.disabled = false;
      if (error.status === 401) handleError(error);
      else showToast(error.body && error.body.detail ? error.body.detail : I18n.t("userStateError"));
      return false;
    }
  }

  async function updateUserPassword(event) {
    event.preventDefault();
    const user = state.passwordTarget;
    if (!user) return;
    const password = elements.resetPassword.value;
    const button = elements.passwordUpdateButton;
    button.disabled = true;
    button.textContent = I18n.t("savingPassword");
    elements.passwordMessage.textContent = "";
    elements.passwordMessage.className = "form-message";
    try {
      await Api.request(`/api/users/${user.id}/password`, { method: "PATCH", body: { password } });
      if (user.id === state.user.id) {
        window.alert(I18n.t("ownPasswordChanged"));
        window.location.replace("/login");
        return;
      }
      closePasswordDialog();
      showToast(I18n.t("passwordChanged", { username: user.username }));
      await loadUsers();
    } catch (error) {
      elements.passwordMessage.textContent = error.body && error.body.detail ? error.body.detail : I18n.t("passwordChangeError");
      elements.passwordMessage.className = "form-message error";
    } finally {
      button.disabled = false;
      button.textContent = I18n.t("savePassword");
    }
  }

  async function createUser(event) {
    event.preventDefault();
    const form = document.getElementById("create-user-form");
    const button = document.getElementById("create-user-button");
    const message = document.getElementById("create-user-message");
    const username = document.getElementById("new-username").value.trim().toLowerCase();
    const password = document.getElementById("new-password").value;
    const role = document.getElementById("new-role").value;
    button.disabled = true;
    button.textContent = I18n.t("creating");
    message.textContent = "";
    message.className = "form-message user-create-message";
    try {
      const user = await Api.request("/api/users", { method: "POST", body: { username, password, role } });
      message.textContent = I18n.t("userCreated", { username: user.username });
      message.className = "form-message user-create-message success";
      form.reset();
      await loadUsers();
    } catch (error) {
      message.textContent = I18n.t(error.status === 409 ? "userExists" : "userCreateError");
      message.className = "form-message user-create-message error";
    } finally {
      button.disabled = false;
      button.textContent = I18n.t("create");
    }
  }

  function setTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll(".tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
    elements.passesPanel.classList.toggle("hidden", tab !== "passes");
    elements.usersPanel.classList.toggle("hidden", tab !== "users");
    elements.settingsPanel.classList.toggle("hidden", tab !== "settings");
    if (tab === "passes") loadPasses();
    else if (tab === "users") loadUsers();
    else loadDriverSettings();
  }

  function connectRealtime() {
    const source = new EventSource("/api/events");
    source.onopen = () => {
      if (elements.realtime) {
        elements.realtime.className = "realtime-status online";
        elements.realtime.lastElementChild.textContent = I18n.t("online");
      }
    };
    source.addEventListener("refresh", (event) => {
      let eventType = "";
      try { eventType = JSON.parse(event.data).type || ""; } catch (_) { /* ignore malformed refresh */ }
      if (state.activeTab === "passes") loadPasses();
      else if (state.activeTab === "users") loadUsers();
      else if (eventType.startsWith("settings.")) loadDriverSettings(false);
    });
    source.onerror = () => {
      if (elements.realtime) {
        elements.realtime.className = "realtime-status offline";
        elements.realtime.lastElementChild.textContent = I18n.t("offline");
      }
    };
  }

  try {
    const auth = await Api.me();
    Api.setCsrf(auth.csrf_token);
    state.user = auth.user;
  } catch (_) {
    window.location.replace("/login");
    return;
  }

  const admin = state.user.role === "admin";
  elements.currentUser.textContent = `${state.user.username} · ${roleName(state.user.role)}`;
  elements.adminTabs.classList.toggle("hidden", !admin);
  elements.visibilityField.classList.remove("hidden");
  elements.statusHeading.classList.remove("hidden");
  elements.actionsHeading.classList.remove("hidden");
  await loadPasses();
  connectRealtime();
  window.setInterval(() => { if (state.activeTab === "passes") loadPasses(); }, 30000);

  elements.filters.addEventListener("submit", (event) => { event.preventDefault(); state.page = 1; loadPasses(); });
  document.getElementById("reset-filters").addEventListener("click", () => {
    elements.filters.reset(); document.getElementById("visibility").value = "visible"; state.page = 1; loadPasses();
  });
  elements.pageSize.addEventListener("change", () => { state.pageSize = Number(elements.pageSize.value); state.page = 1; loadPasses(); });
  elements.prev.addEventListener("click", () => { if (state.page > 1) { state.page -= 1; loadPasses(); } });
  elements.next.addEventListener("click", () => { if (state.meta && state.page < state.meta.pages) { state.page += 1; loadPasses(); } });
  document.querySelectorAll(".tab").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.tab)));
  document.getElementById("create-user-form").addEventListener("submit", createUser);
  elements.passwordForm.addEventListener("submit", updateUserPassword);
  elements.toggleNewPassword.addEventListener("click", () => togglePassword(elements.newPassword, elements.toggleNewPassword));
  elements.toggleResetPassword.addEventListener("click", () => togglePassword(elements.resetPassword, elements.toggleResetPassword));
  elements.exportButton.addEventListener("click", exportPasses);
  elements.driverThemeButtons.forEach((button) => {
    button.addEventListener("click", () => changeDriverTheme(button.dataset.driverTheme));
  });
  elements.driverTextLanguage.addEventListener("change", () => {
    state.driverTextLanguage = elements.driverTextLanguage.value;
    renderDriverTextForm();
    setDriverTextMessage("", "");
  });
  elements.driverTextForm.addEventListener("submit", saveDriverText);
  elements.closePasswordDialog.addEventListener("click", closePasswordDialog);
  elements.passwordDialog.addEventListener("click", (event) => {
    if (event.target === elements.passwordDialog) closePasswordDialog();
  });
  elements.closeUserActionsDialog.addEventListener("click", closeUserActionsDialog);
  elements.userActionsDialog.addEventListener("click", (event) => {
    if (event.target === elements.userActionsDialog) closeUserActionsDialog();
  });
  elements.userActionPassword.addEventListener("click", () => {
    const user = state.actionsTarget;
    if (!user) return;
    closeUserActionsDialog();
    openPasswordDialog(user);
  });
  elements.userActionActive.addEventListener("click", async () => {
    const user = state.actionsTarget;
    if (!user) return;
    const updated = await changeUserActive(user, !user.is_active, elements.userActionActive);
    if (updated) closeUserActionsDialog();
  });
  document.getElementById("logout-button").addEventListener("click", async () => {
    try { await Api.logout(); } finally { window.location.replace("/login"); }
  });
  window.addEventListener("ztz:language", () => {
    elements.currentUser.textContent = `${state.user.username} · ${roleName(state.user.role)}`;
    if (elements.realtime) {
      elements.realtime.lastElementChild.textContent = I18n.t(elements.realtime.classList.contains("online") ? "online" : "offline");
    }
    renderPasses();
    if (state.users.length) renderUsers();
    renderDriverTheme(state.driverTheme);
    if (state.driverThemeMessageKey) elements.driverThemeMessage.textContent = I18n.t(state.driverThemeMessageKey);
    renderDriverTextForm();
    if (state.driverTextMessageKey) elements.driverTextMessage.textContent = I18n.t(state.driverTextMessageKey);
    syncUserActionDialog();
    setPasswordToggle(elements.newPassword, elements.toggleNewPassword);
    setPasswordToggle(elements.resetPassword, elements.toggleResetPassword);
  });
});
