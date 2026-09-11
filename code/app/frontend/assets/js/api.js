(function () {
  "use strict";

  let csrfToken = "";

  class ApiError extends Error {
    constructor(status, body) {
      super(body && body.detail ? body.detail : `HTTP ${status}`);
      this.status = status;
      this.body = body;
    }
  }

  async function request(path, options) {
    const config = { credentials: "same-origin", headers: { Accept: "application/json" }, ...(options || {}) };
    config.headers = { Accept: "application/json", ...(options && options.headers ? options.headers : {}) };
    if (config.body && typeof config.body !== "string") {
      config.headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(config.body);
    }
    if (csrfToken && config.method && !["GET", "HEAD"].includes(config.method.toUpperCase())) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
    const response = await fetch(path, config);
    const contentType = response.headers.get("content-type") || "";
    const body = response.status === 204 ? null : (contentType.includes("json") ? await response.json() : await response.text());
    if (!response.ok) throw new ApiError(response.status, body);
    return body;
  }

  window.Api = {
    request,
    ApiError,
    setCsrf(value) { csrfToken = value || ""; },
    login(username, password) { return request("/api/auth/login", { method: "POST", body: { username, password } }); },
    me() { return request("/api/auth/me"); },
    logout() { return request("/api/auth/logout", { method: "POST" }); }
  };
})();

