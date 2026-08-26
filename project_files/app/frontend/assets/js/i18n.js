(function () {
  "use strict";

  const dictionaries = {
    ru: {
      brandService: "Сервис пропусков", language: "Язык", employeeLogin: "Вход", themeLight: "Включить светлую тему", themeDark: "Включить тёмную тему",
      driverEyebrow: "Водителям", driverTitle: "Введите номер",
      vehicleLabel: "Номер автомобиля", vehiclePlaceholder: "А 123 ВС 77",
      phoneLabel: "Номер телефона", phonePlaceholder: "+7 999 123-45-67", invalidPhone: "Введите корректный номер телефона.",
      vehicleHint: "Можно использовать буквы, цифры, пробел и дефис.", send: "Отправить", sending: "Отправляем…",
      sent: "Номер {number} отправлен логисту.", submitError: "Не удалось отправить номер. Попробуйте ещё раз.",
      invalidNumber: "Введите номер: от 2 до 24 символов.", tooMany: "Слишком много отправок. Подождите минуту.",
      qrEyebrow: "Быстрый доступ", qrTitle: "QR-код страницы", qrLead: "Распечатайте код или откройте его на другом устройстве.",
      qrAlt: "QR-код страницы водителя", copyLink: "Скопировать ссылку", copied: "Ссылка скопирована",
      staffEyebrow: "Для сотрудников", loginTitle: "Вход в кабинет", loginLead: "Используйте выданные логин и пароль.",
      username: "Логин", password: "Пароль", login: "Войти", loggingIn: "Входим…", badCredentials: "Неверный логин или пароль.",
      loginError: "Не удалось войти. Повторите попытку.", backDriver: "← Вернуться на страницу водителя",
      connecting: "Подключение…", online: "В реальном времени", offline: "Нет realtime-связи", logout: "Выйти",
      logistRole: "Логист", adminRole: "Администратор", requestsTitle: "Заявки на пропуск",
      openQr: "Открыть QR-код", closeQr: "Закрыть QR-код", qrDialogEyebrow: "Для водителей", qrDialogTitle: "QR-код страницы водителя", qrDialogLead: "Отсканируйте код камерой телефона, чтобы открыть страницу отправки номера.",
      passesTab: "Пропуска", usersTab: "Пользователи", dateFrom: "Дата от", dateTo: "Дата до",
      searchNumber: "Поиск номера", searchPlaceholder: "Например, А 123", sortOrder: "Порядок",
      oldFirst: "Сначала ранние", newFirst: "Сначала поздние", visibility: "Видимость",
      allRecords: "Все", visibleRecords: "Видимые", hiddenRecords: "Скрытые", apply: "Применить", reset: "Сбросить",
      onPage: "На странице", vehicleNumber: "Номер автомобиля", phoneNumber: "Телефон", submittedAt: "Получен", status: "Статус", actions: "Действия",
      emptyTitle: "Записей не найдено", emptyLead: "Измените фильтры или дождитесь новой заявки.", loading: "Загрузка…",
      previous: "Назад", next: "Вперёд", total: "Всего: {count}", page: "Страница {page} из {pages}", noPages: "Нет страниц",
      visible: "Виден", hidden: "Скрыт", hide: "Скрыть", restore: "Вернуть", actionDone: "Видимость записи изменена.",
      usersTitle: "Пользователи", role: "Роль", createdAt: "Создан", active: "Активен", inactive: "Отключён",
      createUserTitle: "Создать пользователя", createUserLead: "Учётная запись сохраняется в локальной базе.",
      newPassword: "Новый пароль", passwordRules: "Не менее 8 символов: буква, цифра и спецсимвол.", create: "Создать", creating: "Создаём…",
      userCreated: "Пользователь {username} создан в локальной базе.", userExists: "Пользователь с таким логином уже существует.", userCreateError: "Не удалось создать пользователя. Проверьте поля.",
      disableUser: "Отключить", enableUser: "Включить", currentAccount: "Текущая", confirmDisable: "Отключить пользователя {username}? Его активные сессии завершатся.",
      userDisabled: "Пользователь {username} отключён.", userEnabled: "Пользователь {username} восстановлен.", userStateError: "Не удалось изменить состояние пользователя.",
      usersCount: "Всего: {count}", loadError: "Не удалось загрузить данные.", sessionExpired: "Сессия завершена. Войдите снова."
    },
    tg: {
      brandService: "Хадамоти иҷозатномаҳо", language: "Забон", employeeLogin: "Воридшавӣ", themeLight: "Фаъол кардани мавзӯи равшан", themeDark: "Фаъол кардани мавзӯи торик",
      driverEyebrow: "Барои ронандагон", driverTitle: "Рақамро ворид кунед",
      vehicleLabel: "Рақами автомобил", vehiclePlaceholder: "А 123 ВС 77",
      phoneLabel: "Рақами телефон", phonePlaceholder: "+7 999 123-45-67", invalidPhone: "Рақами дурусти телефонро ворид кунед.",
      vehicleHint: "Ҳарфҳо, рақамҳо, фосила ва дефис иҷозат дода мешаванд.", send: "Фиристодан", sending: "Фиристода истодааст…",
      sent: "Рақами {number} ба логист фиристода шуд.", submitError: "Рақам фиристода нашуд. Боз кӯшиш кунед.",
      invalidNumber: "Рақамро аз 2 то 24 аломат ворид кунед.", tooMany: "Дархостҳо зиёданд. Як дақиқа интизор шавед.",
      qrEyebrow: "Дастрасии зуд", qrTitle: "QR-коди саҳифа", qrLead: "Кодро чоп кунед ё дар дастгоҳи дигар кушоед.",
      qrAlt: "QR-коди саҳифаи ронанда", copyLink: "Нусхаи пайванд", copied: "Пайванд нусха шуд",
      staffEyebrow: "Барои кормандон", loginTitle: "Воридшавӣ ба кабинет", loginLead: "Логин ва рамзи додашударо истифода баред.",
      username: "Логин", password: "Рамз", login: "Ворид шудан", loggingIn: "Воридшавӣ…", badCredentials: "Логин ё рамз нодуруст аст.",
      loginError: "Ворид шудан муяссар нашуд. Боз кӯшиш кунед.", backDriver: "← Бозгашт ба саҳифаи ронанда",
      connecting: "Пайвастшавӣ…", online: "Дар вақти воқеӣ", offline: "Пайвасти realtime нест", logout: "Баромадан",
      logistRole: "Логист", adminRole: "Маъмур", requestsTitle: "Дархостҳои иҷозатнома",
      openQr: "Кушодани QR-код", closeQr: "Бастани QR-код", qrDialogEyebrow: "Барои ронандагон", qrDialogTitle: "QR-коди саҳифаи ронанда", qrDialogLead: "Кодро бо камераи телефон скан кунед, то саҳифаи фиристодани рақамро кушоед.",
      passesTab: "Иҷозатномаҳо", usersTab: "Истифодабарандагон", dateFrom: "Сана аз", dateTo: "Сана то",
      searchNumber: "Ҷустуҷӯи рақам", searchPlaceholder: "Масалан, А 123", sortOrder: "Тартиб",
      oldFirst: "Аввал барвақт", newFirst: "Аввал дер", visibility: "Намоёнӣ",
      allRecords: "Ҳама", visibleRecords: "Намоён", hiddenRecords: "Пинҳон", apply: "Татбиқ", reset: "Тоза кардан",
      onPage: "Дар саҳифа", vehicleNumber: "Рақами автомобил", phoneNumber: "Телефон", submittedAt: "Қабул шуд", status: "Ҳолат", actions: "Амалҳо",
      emptyTitle: "Сабт ёфт нашуд", emptyLead: "Филтрҳоро тағйир диҳед ё дархости навро интизор шавед.", loading: "Боркунӣ…",
      previous: "Қафо", next: "Пеш", total: "Ҳамагӣ: {count}", page: "Саҳифаи {page} аз {pages}", noPages: "Саҳифа нест",
      visible: "Намоён", hidden: "Пинҳон", hide: "Пинҳон кардан", restore: "Баргардондан", actionDone: "Намоёнии сабт тағйир ёфт.",
      usersTitle: "Истифодабарандагон", role: "Нақш", createdAt: "Сохта шуд", active: "Фаъол", inactive: "Хомӯш",
      createUserTitle: "Сохтани истифодабаранда", createUserLead: "Ҳисоб дар пойгоҳи маҳаллӣ нигоҳ дошта мешавад.",
      newPassword: "Рамзи нав", passwordRules: "Камаш 8 аломат: ҳарф, рақам ва аломати махсус.", create: "Сохтан", creating: "Сохта истодааст…",
      userCreated: "Истифодабарандаи {username} дар пойгоҳи маҳаллӣ сохта шуд.", userExists: "Истифодабаранда бо ин логин аллакай ҳаст.", userCreateError: "Истифодабаранда сохта нашуд. Майдонҳоро санҷед.",
      disableUser: "Хомӯш кардан", enableUser: "Фаъол кардан", currentAccount: "Ҷорӣ", confirmDisable: "Истифодабарандаи {username} хомӯш шавад? Сессияҳои фаъол анҷом меёбанд.",
      userDisabled: "Истифодабарандаи {username} хомӯш шуд.", userEnabled: "Истифодабарандаи {username} барқарор шуд.", userStateError: "Ҳолати истифодабаранда тағйир дода нашуд.",
      usersCount: "Ҳамагӣ: {count}", loadError: "Маълумот бор карда нашуд.", sessionExpired: "Сессия анҷом ёфт. Аз нав ворид шавед."
    }
  };

  let language = localStorage.getItem("ztz-language") || "ru";
  if (!dictionaries[language]) language = "ru";

  function t(key, values) {
    let text = dictionaries[language][key] || dictionaries.ru[key] || key;
    Object.entries(values || {}).forEach(([name, value]) => { text = text.replaceAll(`{${name}}`, String(value)); });
    return text;
  }

  function applyDocument() {
    document.documentElement.lang = language;
    document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
    document.querySelectorAll("[data-i18n-alt]").forEach((node) => { node.alt = t(node.dataset.i18nAlt); });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => { node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel)); });
    const selector = document.getElementById("language-select");
    if (selector) selector.value = language;
  }

  function setLanguage(nextLanguage) {
    if (!dictionaries[nextLanguage]) return;
    language = nextLanguage;
    localStorage.setItem("ztz-language", language);
    applyDocument();
    window.dispatchEvent(new CustomEvent("ztz:language", { detail: { language } }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyDocument();
    const selector = document.getElementById("language-select");
    if (selector) selector.addEventListener("change", (event) => setLanguage(event.target.value));
  });

  window.I18n = { t, setLanguage, get language() { return language; } };
})();
