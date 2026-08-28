document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const form = document.getElementById("pass-form");
  const vehicleInput = document.getElementById("vehicle-number");
  const phoneInput = document.getElementById("phone-number");
  const button = document.getElementById("submit-button");
  const message = document.getElementById("form-message");
  const keyboardTitle = document.getElementById("keyboard-title");
  const vehicleKeyboard = document.getElementById("vehicle-keyboard");
  const phoneKeyboard = document.getElementById("phone-keyboard");
  const visualEquivalents = { А: "A", В: "B", Е: "E", К: "K", М: "M", Н: "H", О: "O", Р: "P", С: "C", Т: "T", У: "Y", Х: "X" };
  const allowedVehicle = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  let activeInput = vehicleInput;
  let currentMessageKey = "";
  let currentMessageValues = {};

  function setMessage(text, kind, key = "", values = {}) {
    currentMessageKey = key;
    currentMessageValues = values;
    message.textContent = text;
    message.className = `form-message ${kind || ""}`;
  }

  function normalizeVehicle(value) {
    return Array.from(value.toUpperCase())
      .map((character) => visualEquivalents[character] || character)
      .filter((character) => allowedVehicle.has(character))
      .join("")
      .slice(0, 24);
  }

  function normalizePhone(value) {
    const hasLeadingPlus = value.trimStart().startsWith("+");
    const digits = value.replace(/\D/g, "").slice(0, 15);
    return `${hasLeadingPlus ? "+" : ""}${digits}`;
  }

  function getValue(input) {
    return input.dataset.value || "";
  }

  function setValue(input, value) {
    const normalized = input === vehicleInput ? normalizeVehicle(value) : normalizePhone(value);
    input.dataset.value = normalized;
    input.textContent = normalized;
    input.setAttribute("aria-valuetext", normalized || input.dataset.placeholder || "");
  }

  function setActiveInput(input) {
    activeInput = input;
    const vehicleActive = input === vehicleInput;
    vehicleInput.classList.toggle("keyboard-active", vehicleActive);
    phoneInput.classList.toggle("keyboard-active", !vehicleActive);
    vehicleKeyboard.classList.toggle("hidden", !vehicleActive);
    phoneKeyboard.classList.toggle("hidden", vehicleActive);
    keyboardTitle.dataset.i18n = vehicleActive ? "vehicleKeyboard" : "phoneKeyboard";
    keyboardTitle.textContent = I18n.t(keyboardTitle.dataset.i18n);
  }

  function appendValue(input, value) {
    setValue(input, `${getValue(input)}${value}`);
    input.focus({ preventScroll: true });
    setMessage("", "");
  }

  function backspace(input) {
    setValue(input, Array.from(getValue(input)).slice(0, -1).join(""));
    input.focus({ preventScroll: true });
    setMessage("", "");
  }

  function handleKeyboard(event) {
    const keyButton = event.target.closest("button");
    if (!keyButton) return;
    event.preventDefault();
    if (keyButton.dataset.action === "backspace") {
      backspace(activeInput);
      return;
    }
    appendValue(activeInput, keyButton.dataset.key || "");
  }

  [vehicleInput, phoneInput].forEach((input) => {
    input.addEventListener("focus", () => setActiveInput(input));
    input.addEventListener("click", () => setActiveInput(input));
  });
  vehicleKeyboard.addEventListener("pointerdown", (event) => event.preventDefault());
  phoneKeyboard.addEventListener("pointerdown", (event) => event.preventDefault());
  vehicleKeyboard.addEventListener("click", handleKeyboard);
  phoneKeyboard.addEventListener("click", handleKeyboard);

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest("button")) return;
    if (event.key === "Backspace") {
      event.preventDefault();
      backspace(activeInput);
      return;
    }
    if (event.key === "Delete") {
      event.preventDefault();
      setValue(activeInput, "");
      setMessage("", "");
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      form.requestSubmit();
      return;
    }
    if (event.key.length !== 1) return;
    const next = activeInput === vehicleInput ? normalizeVehicle(event.key) : normalizePhone(event.key);
    if (!next) return;
    event.preventDefault();
    appendValue(activeInput, next);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const number = normalizeVehicle(getValue(vehicleInput)).trim().replace(/\s+/g, " ");
    if (number.length < 2 || number.length > 24) {
      setMessage(I18n.t("invalidNumber"), "error", "invalidNumber");
      setActiveInput(vehicleInput);
      vehicleInput.focus();
      return;
    }
    const phone = normalizePhone(getValue(phoneInput));
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setMessage(I18n.t("invalidPhone"), "error", "invalidPhone");
      setActiveInput(phoneInput);
      phoneInput.focus();
      return;
    }
    button.disabled = true;
    button.textContent = I18n.t("sending");
    setMessage("", "");
    try {
      await Api.request("/api/public/passes", {
        method: "POST", body: { vehicle_number: number, phone_number: phone }
      });
      setValue(vehicleInput, "");
      setValue(phoneInput, "");
      setMessage(I18n.t("sent", { vehicle: number }), "success", "sent", { vehicle: number });
      setActiveInput(vehicleInput);
      vehicleInput.focus({ preventScroll: true });
    } catch (error) {
      const messageKey = error.status === 429 ? "tooMany" : "submitError";
      setMessage(I18n.t(messageKey), "error", messageKey);
    } finally {
      button.disabled = false;
      button.textContent = I18n.t("send");
    }
  });

  window.addEventListener("ztz:language", () => {
    setActiveInput(activeInput);
    if (currentMessageKey) message.textContent = I18n.t(currentMessageKey, currentMessageValues);
  });
  setValue(vehicleInput, "");
  setValue(phoneInput, "");
  setActiveInput(vehicleInput);
});
