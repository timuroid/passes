document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const form = document.getElementById("pass-form");
  const input = document.getElementById("vehicle-number");
  const phoneInput = document.getElementById("phone-number");
  const button = document.getElementById("submit-button");
  const message = document.getElementById("form-message");
  const copyButton = document.getElementById("copy-link");
  const copyStatus = document.getElementById("copy-status");

  function setMessage(text, kind) {
    message.textContent = text;
    message.className = `form-message ${kind || ""}`;
  }

  input.addEventListener("input", () => {
    const start = input.selectionStart;
    input.value = input.value.toUpperCase();
    input.setSelectionRange(start, start);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const number = input.value.trim().replace(/\s+/g, " ").toUpperCase();
    if (number.length < 2 || number.length > 24 || !/^[\p{L}\p{N} -]+$/u.test(number)) {
      setMessage(I18n.t("invalidNumber"), "error");
      input.focus();
      return;
    }
    const phone = phoneInput.value.trim();
    if (!phone || !/^[0-9+().\s-]+$/.test(phone) || phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 15) {
      setMessage(I18n.t("invalidPhone"), "error");
      phoneInput.focus();
      return;
    }
    button.disabled = true;
    button.textContent = I18n.t("sending");
    setMessage("", "");
    try {
      const created = await Api.request("/api/public/passes", {
        method: "POST", body: { vehicle_number: number, phone_number: phone }
      });
      setMessage(I18n.t("sent", { number: created.vehicle_number }), "success");
      form.reset();
    } catch (error) {
      setMessage(I18n.t(error.status === 429 ? "tooMany" : "submitError"), "error");
    } finally {
      button.disabled = false;
      button.textContent = I18n.t("send");
    }
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/");
      copyStatus.textContent = I18n.t("copied");
      window.setTimeout(() => { copyStatus.textContent = ""; }, 2500);
    } catch (_) {
      copyStatus.textContent = window.location.origin + "/";
    }
  });
});
