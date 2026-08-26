document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const state = { user: null, page: 1, pageSize: 25, meta: null, passes: [], users: [], activeTab: "passes" };
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
    openQr: document.getElementById("open-qr"), qrDialog: document.getElementById("qr-dialog"), closeQr: document.getElementById("close-qr")
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
  function openQrDialog() {
    if (typeof elements.qrDialog.showModal === "function") elements.qrDialog.showModal();
    else elements.qrDialog.setAttribute("open", "");
  }
  function closeQrDialog() {
    if (typeof elements.qrDialog.close === "function") elements.qrDialog.close();
    else elements.qrDialog.removeAttribute("open");
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
    const admin = state.user.role === "admin";
    state.passes.forEach((item) => {
      const row = document.createElement("tr");
      const id = document.createElement("td"); id.textContent = item.id;
      const vehicle = document.createElement("td"); vehicle.textContent = item.vehicle_number; vehicle.className = "vehicle-cell";
      const phone = document.createElement("td"); phone.textContent = item.phone_number || "—"; phone.className = "phone-cell";
      const received = document.createElement("td"); received.textContent = formatDate(item.submitted_at);
      row.append(id, vehicle, phone, received);
      if (admin) {
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
      }
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

  async function loadPasses() {
    elements.loading.classList.remove("hidden");
    const params = new URLSearchParams({ page: state.page, page_size: state.pageSize, sort: document.getElementById("sort").value });
    const mappings = [["date-from", "date_from"], ["date-to", "date_to"], ["search", "search"]];
    mappings.forEach(([id, key]) => { const value = document.getElementById(id).value.trim(); if (value) params.set(key, value); });
    if (state.user.role === "admin") params.set("visibility", document.getElementById("visibility").value);
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
      const values = [user.id, user.username];
      values.forEach((value) => { const cell = document.createElement("td"); cell.textContent = value; row.append(cell); });
      const role = document.createElement("td");
      const roleBadge = document.createElement("span"); roleBadge.className = "badge role-badge"; roleBadge.textContent = roleName(user.role); role.append(roleBadge);
      const active = document.createElement("td"); active.textContent = I18n.t(user.is_active ? "active" : "inactive"); active.className = user.is_active ? "status-active" : "";
      const created = document.createElement("td"); created.textContent = formatDate(user.created_at);
      const actionCell = document.createElement("td");
      const action = document.createElement("button");
      action.type = "button";
      action.className = `button button-small ${user.is_active ? "button-danger" : "button-secondary"}`;
      const ownAccount = user.id === state.user.id;
      action.textContent = I18n.t(ownAccount ? "currentAccount" : (user.is_active ? "disableUser" : "enableUser"));
      action.disabled = ownAccount;
      if (!ownAccount) action.addEventListener("click", () => changeUserActive(user, !user.is_active, action));
      actionCell.append(action);
      row.append(role, active, created, actionCell); elements.usersBody.append(row);
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
    if (!active && !window.confirm(I18n.t("confirmDisable", { username: user.username }))) return;
    button.disabled = true;
    try {
      await Api.request(`/api/users/${user.id}/active`, { method: "PATCH", body: { active } });
      showToast(I18n.t(active ? "userEnabled" : "userDisabled", { username: user.username }));
      await loadUsers();
    } catch (error) {
      button.disabled = false;
      if (error.status === 401) handleError(error);
      else showToast(error.body && error.body.detail ? error.body.detail : I18n.t("userStateError"));
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
    if (tab === "users") loadUsers(); else loadPasses();
  }

  function connectRealtime() {
    const source = new EventSource("/api/events");
    source.onopen = () => {
      if (elements.realtime) {
        elements.realtime.className = "realtime-status online";
        elements.realtime.lastElementChild.textContent = I18n.t("online");
      }
    };
    source.addEventListener("refresh", () => {
      if (state.activeTab === "passes") loadPasses(); else loadUsers();
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
  elements.visibilityField.classList.toggle("hidden", !admin);
  elements.statusHeading.classList.toggle("hidden", !admin);
  elements.actionsHeading.classList.toggle("hidden", !admin);
  await loadPasses();
  connectRealtime();
  window.setInterval(() => { if (state.activeTab === "passes") loadPasses(); }, 30000);

  elements.filters.addEventListener("submit", (event) => { event.preventDefault(); state.page = 1; loadPasses(); });
  document.getElementById("reset-filters").addEventListener("click", () => {
    elements.filters.reset(); document.getElementById("visibility").value = admin ? "all" : "visible"; state.page = 1; loadPasses();
  });
  elements.pageSize.addEventListener("change", () => { state.pageSize = Number(elements.pageSize.value); state.page = 1; loadPasses(); });
  elements.prev.addEventListener("click", () => { if (state.page > 1) { state.page -= 1; loadPasses(); } });
  elements.next.addEventListener("click", () => { if (state.meta && state.page < state.meta.pages) { state.page += 1; loadPasses(); } });
  document.querySelectorAll(".tab").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.tab)));
  document.getElementById("create-user-form").addEventListener("submit", createUser);
  elements.openQr.addEventListener("click", openQrDialog);
  elements.closeQr.addEventListener("click", closeQrDialog);
  elements.qrDialog.addEventListener("click", (event) => {
    if (event.target === elements.qrDialog) closeQrDialog();
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
  });
});
