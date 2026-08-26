document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const form = document.getElementById("login-form");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const button = document.getElementById("login-button");
  const message = document.getElementById("login-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    button.disabled = true;
    button.textContent = I18n.t("loggingIn");
    message.textContent = "";
    message.className = "form-message";
    try {
      const result = await Api.login(username.value.trim(), password.value);
      Api.setCsrf(result.csrf_token);
      window.location.replace("/app");
    } catch (error) {
      message.textContent = I18n.t(error.status === 401 ? "badCredentials" : "loginError");
      message.className = "form-message error";
    } finally {
      button.disabled = false;
      button.textContent = I18n.t("login");
    }
  });
});
