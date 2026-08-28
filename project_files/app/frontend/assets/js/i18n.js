(function () {
  "use strict";

  const dictionaries = {
    ru: {
      language: "Язык", themeLight: "Включить светлую тему", themeDark: "Включить тёмную тему",
      driverEyebrow: "Водителям", driverTitle: "Введите номер",
      vehicleLabel: "Номер автомобиля", vehiclePlaceholder: "A123BC77",
      phoneLabel: "Номер телефона", phonePlaceholder: "+7 999 123-45-67", invalidPhone: "Введите корректный номер телефона.",
      vehicleHint: "Можно использовать буквы, цифры, пробел и дефис.", send: "Отправить", sending: "Отправляем…",
      sent: "{vehicle} передан в работу. С вами свяжутся по указанному телефону.", submitError: "Не удалось отправить данные. Попробуйте ещё раз.",
      invalidNumber: "Введите номер: от 2 до 24 символов.", tooMany: "Слишком много отправок. Подождите минуту.",
      vehicleKeyboard: "Клавиатура номера", phoneKeyboard: "Клавиатура телефона", touchHint: "Коснитесь поля, затем используйте кнопки", digits: "Цифры", latinLetters: "Латинские буквы",
      space: "Пробел", clear: "Очистить", backspace: "Удалить символ",
      staffEyebrow: "Для сотрудников", loginTitle: "Вход в кабинет", loginLead: "Используйте выданные логин и пароль.",
      username: "Логин", password: "Пароль", login: "Войти", loggingIn: "Входим…", badCredentials: "Неверный логин или пароль.",
      loginError: "Не удалось войти. Повторите попытку.", backDriver: "← Вернуться на страницу водителя",
      connecting: "Подключение…", online: "В реальном времени", offline: "Нет realtime-связи", logout: "Выйти",
      logistRole: "Logist", adminRole: "Administrator", requestsTitle: "Список транспортных средств",
      exportExcel: "Выгрузить в Excel", exportingExcel: "Формируем файл…", exportError: "Не удалось сформировать Excel-файл.",
      passesTab: "Транспорт", usersTab: "Пользователи", settingsTab: "Настройки", dateFrom: "Дата от", dateTo: "Дата до",
      driverThemeTitle: "Тема водительского киоска", driverThemeLead: "Выбранная тема применяется на публичной водительской странице.",
      driverThemeLight: "Светлая", driverThemeDark: "Тёмная", driverThemeSaved: "Тема водительской страницы сохранена.", driverThemeError: "Не удалось изменить тему водительской страницы.",
      searchNumber: "Поиск номера", searchPlaceholder: "Например, А 123", sortOrder: "Порядок",
      oldFirst: "Сначала ранние", newFirst: "Сначала поздние", visibility: "Видимость",
      allRecords: "Все", visibleRecords: "Активные", hiddenRecords: "Скрытые", apply: "Применить", reset: "Сбросить",
      onPage: "На странице", vehicleNumber: "Номер автомобиля", phoneNumber: "Телефон", submittedAt: "Получен", status: "Статус", actions: "Действия",
      emptyTitle: "Записей не найдено", emptyLead: "Измените фильтры или дождитесь новой заявки.", loading: "Загрузка…",
      previous: "Назад", next: "Вперёд", total: "Всего: {count}", page: "Страница {page} из {pages}", noPages: "Нет страниц",
      visible: "Активен", hidden: "Скрыт", hide: "Скрыть", restore: "Вернуть", actionDone: "Видимость записи изменена.",
      usersTitle: "Пользователи", role: "Роль", createdAt: "Создан", active: "Активен", inactive: "Отключён",
      createUserTitle: "Создать пользователя", createUserLead: "Укажите логин, пароль и роль.",
      newPassword: "Новый пароль", passwordRules: "Не менее 8 символов: буква, цифра и спецсимвол.", create: "Создать", creating: "Создаём…",
      showPassword: "Показать", hidePassword: "Скрыть", changePassword: "Изменить пароль", savePassword: "Сохранить пароль", savingPassword: "Сохраняем…",
      passwordDialogEyebrow: "Пользователь", closePasswordDialog: "Закрыть окно", passwordChanged: "Пароль пользователя {username} изменён.", ownPasswordChanged: "Пароль изменён. Войдите в кабинет с новым паролем.", passwordChangeError: "Не удалось изменить пароль. Проверьте поля.",
      userActions: "Действия", userActionsTitle: "Действия с пользователем", closeUserActionsDialog: "Закрыть окно", openUserActions: "Открыть действия пользователя {username}",
      userCreated: "Пользователь {username} создан.", userExists: "Пользователь с таким логином уже существует.", userCreateError: "Не удалось создать пользователя. Проверьте поля.",
      disableUser: "Отключить", enableUser: "Включить", currentAccount: "Текущая",
      userDisabled: "Пользователь {username} отключён.", userEnabled: "Пользователь {username} восстановлен.", userStateError: "Не удалось изменить состояние пользователя.",
      usersCount: "Всего: {count}", loadError: "Не удалось загрузить данные.", sessionExpired: "Сессия завершена. Войдите снова."
    },
    tg: {
      language: "Забон", themeLight: "Фаъол кардани мавзӯи равшан", themeDark: "Фаъол кардани мавзӯи торик",
      driverEyebrow: "Барои ронандагон", driverTitle: "Рақамро ворид кунед",
      vehicleLabel: "Рақами автомобил", vehiclePlaceholder: "A123BC77",
      phoneLabel: "Рақами телефон", phonePlaceholder: "+7 999 123-45-67", invalidPhone: "Рақами дурусти телефонро ворид кунед.",
      vehicleHint: "Ҳарфҳо, рақамҳо, фосила ва дефис иҷозат дода мешаванд.", send: "Фиристодан", sending: "Фиристода истодааст…",
      sent: "{vehicle} ба кор супурда шуд. Бо шумо тавассути телефони зикршуда тамос мегиранд.", submitError: "Маълумот фиристода нашуд. Боз кӯшиш кунед.",
      invalidNumber: "Рақамро аз 2 то 24 аломат ворид кунед.", tooMany: "Дархостҳо зиёданд. Як дақиқа интизор шавед.",
      vehicleKeyboard: "Клавиатураи рақам", phoneKeyboard: "Клавиатураи телефон", touchHint: "Майдонро интихоб карда, тугмаҳоро истифода баред", digits: "Рақамҳо", latinLetters: "Ҳарфҳои лотинӣ",
      space: "Фосила", clear: "Тоза кардан", backspace: "Нест кардани аломат",
      staffEyebrow: "Барои кормандон", loginTitle: "Воридшавӣ ба кабинет", loginLead: "Логин ва рамзи додашударо истифода баред.",
      username: "Логин", password: "Рамз", login: "Ворид шудан", loggingIn: "Воридшавӣ…", badCredentials: "Логин ё рамз нодуруст аст.",
      loginError: "Ворид шудан муяссар нашуд. Боз кӯшиш кунед.", backDriver: "← Бозгашт ба саҳифаи ронанда",
      connecting: "Пайвастшавӣ…", online: "Дар вақти воқеӣ", offline: "Пайвасти realtime нест", logout: "Баромадан",
      logistRole: "Logist", adminRole: "Administrator", requestsTitle: "Рӯйхати воситаҳои нақлиёт",
      exportExcel: "Боргирӣ ба Excel", exportingExcel: "Файл омода мешавад…", exportError: "Файли Excel омода нашуд.",
      passesTab: "Нақлиёт", usersTab: "Истифодабарандагон", settingsTab: "Танзимот", dateFrom: "Сана аз", dateTo: "Сана то",
      driverThemeTitle: "Мавзӯи киоски ронанда", driverThemeLead: "Мавзӯи интихобшуда дар саҳифаи оммавии ронанда истифода мешавад.",
      driverThemeLight: "Равшан", driverThemeDark: "Торик", driverThemeSaved: "Мавзӯи саҳифаи ронанда нигоҳ дошта шуд.", driverThemeError: "Мавзӯи саҳифаи ронанда тағйир дода нашуд.",
      searchNumber: "Ҷустуҷӯи рақам", searchPlaceholder: "Масалан, А 123", sortOrder: "Тартиб",
      oldFirst: "Аввал барвақт", newFirst: "Аввал дер", visibility: "Намоёнӣ",
      allRecords: "Ҳама", visibleRecords: "Фаъол", hiddenRecords: "Пинҳон", apply: "Татбиқ", reset: "Тоза кардан",
      onPage: "Дар саҳифа", vehicleNumber: "Рақами автомобил", phoneNumber: "Телефон", submittedAt: "Қабул шуд", status: "Ҳолат", actions: "Амалҳо",
      emptyTitle: "Сабт ёфт нашуд", emptyLead: "Филтрҳоро тағйир диҳед ё дархости навро интизор шавед.", loading: "Боркунӣ…",
      previous: "Қафо", next: "Пеш", total: "Ҳамагӣ: {count}", page: "Саҳифаи {page} аз {pages}", noPages: "Саҳифа нест",
      visible: "Фаъол", hidden: "Пинҳон", hide: "Пинҳон кардан", restore: "Баргардондан", actionDone: "Намоёнии сабт тағйир ёфт.",
      usersTitle: "Истифодабарандагон", role: "Нақш", createdAt: "Сохта шуд", active: "Фаъол", inactive: "Хомӯш",
      createUserTitle: "Сохтани истифодабаранда", createUserLead: "Логин, рамз ва нақшро ворид кунед.",
      newPassword: "Рамзи нав", passwordRules: "Камаш 8 аломат: ҳарф, рақам ва аломати махсус.", create: "Сохтан", creating: "Сохта истодааст…",
      showPassword: "Намоиш", hidePassword: "Пинҳон кардан", changePassword: "Тағйир додани рамз", savePassword: "Нигоҳ доштани рамз", savingPassword: "Нигоҳ дошта истодааст…",
      passwordDialogEyebrow: "Истифодабаранда", closePasswordDialog: "Пӯшидани равзана", passwordChanged: "Рамзи истифодабарандаи {username} иваз шуд.", ownPasswordChanged: "Рамз иваз шуд. Бо рамзи нав аз нав ворид шавед.", passwordChangeError: "Рамз иваз нашуд. Майдонҳоро санҷед.",
      userActions: "Амалҳо", userActionsTitle: "Амалҳо бо истифодабаранда", closeUserActionsDialog: "Пӯшидани равзана", openUserActions: "Кушодани амалҳо барои истифодабарандаи {username}",
      userCreated: "Истифодабарандаи {username} сохта шуд.", userExists: "Истифодабаранда бо ин логин аллакай ҳаст.", userCreateError: "Истифодабаранда сохта нашуд. Майдонҳоро санҷед.",
      disableUser: "Хомӯш кардан", enableUser: "Фаъол кардан", currentAccount: "Ҷорӣ",
      userDisabled: "Истифодабарандаи {username} хомӯш шуд.", userEnabled: "Истифодабарандаи {username} барқарор шуд.", userStateError: "Ҳолати истифодабаранда тағйир дода нашуд.",
      usersCount: "Ҳамагӣ: {count}", loadError: "Маълумот бор карда нашуд.", sessionExpired: "Сессия анҷом ёфт. Аз нав ворид шавед."
    },
    uz: {
      language: "Til", driverEyebrow: "Haydovchilar uchun", driverTitle: "Raqamni kiriting",
      vehicleLabel: "Avtomobil raqami", vehiclePlaceholder: "A123BC77", phoneLabel: "Telefon raqami", phonePlaceholder: "+7 999 123-45-67",
      invalidPhone: "To‘g‘ri telefon raqamini kiriting.", send: "Yuborish", sending: "Yuborilmoqda…",
      sent: "{vehicle} ishga qabul qilindi. Ko‘rsatilgan telefon orqali siz bilan bog‘lanishadi.", submitError: "Ma’lumot yuborilmadi. Qayta urinib ko‘ring.",
      invalidNumber: "2 dan 24 tagacha belgidan iborat raqamni kiriting.", tooMany: "Juda ko‘p yuborish. Bir daqiqa kuting.",
      vehicleKeyboard: "Raqam klaviaturasi", phoneKeyboard: "Telefon klaviaturasi", touchHint: "Maydonni tanlang va tugmalardan foydalaning", digits: "Raqamlar", latinLetters: "Lotin harflari", backspace: "Belgini o‘chirish"
    },
    kk: {
      language: "Тіл", driverEyebrow: "Жүргізушілерге", driverTitle: "Нөмірді енгізіңіз",
      vehicleLabel: "Көлік нөмірі", vehiclePlaceholder: "A123BC77", phoneLabel: "Телефон нөмірі", phonePlaceholder: "+7 999 123-45-67",
      invalidPhone: "Дұрыс телефон нөмірін енгізіңіз.", send: "Жіберу", sending: "Жіберілуде…",
      sent: "{vehicle} жұмысқа қабылданды. Көрсетілген телефон арқылы сізбен хабарласады.", submitError: "Деректер жіберілмеді. Қайталап көріңіз.",
      invalidNumber: "2–24 таңбадан тұратын нөмірді енгізіңіз.", tooMany: "Жіберу саны тым көп. Бір минут күтіңіз.",
      vehicleKeyboard: "Нөмір пернетақтасы", phoneKeyboard: "Телефон пернетақтасы", touchHint: "Өрісті таңдап, батырмаларды пайдаланыңыз", digits: "Сандар", latinLetters: "Латын әріптері", backspace: "Таңбаны өшіру"
    },
    ky: {
      language: "Тил", driverEyebrow: "Айдоочулар үчүн", driverTitle: "Номерди киргизиңиз",
      vehicleLabel: "Унаанын номери", vehiclePlaceholder: "A123BC77", phoneLabel: "Телефон номери", phonePlaceholder: "+7 999 123-45-67",
      invalidPhone: "Туура телефон номерин киргизиңиз.", send: "Жөнөтүү", sending: "Жөнөтүлүүдө…",
      sent: "{vehicle} ишке кабыл алынды. Көрсөтүлгөн телефон аркылуу сиз менен байланышат.", submitError: "Маалымат жөнөтүлгөн жок. Кайра аракет кылыңыз.",
      invalidNumber: "2ден 24кө чейинки белгиден турган номерди киргизиңиз.", tooMany: "Өтө көп жөнөтүү. Бир мүнөт күтүңүз.",
      vehicleKeyboard: "Номер клавиатурасы", phoneKeyboard: "Телефон клавиатурасы", touchHint: "Талааны тандап, баскычтарды колдонуңуз", digits: "Сандар", latinLetters: "Латын тамгалары", backspace: "Белгини өчүрүү"
    },
    az: {
      language: "Dil", driverEyebrow: "Sürücülər üçün", driverTitle: "Nömrəni daxil edin",
      vehicleLabel: "Avtomobil nömrəsi", vehiclePlaceholder: "A123BC77", phoneLabel: "Telefon nömrəsi", phonePlaceholder: "+7 999 123-45-67",
      invalidPhone: "Düzgün telefon nömrəsini daxil edin.", send: "Göndər", sending: "Göndərilir…",
      sent: "{vehicle} işə qəbul edildi. Göstərilən telefonla sizinlə əlaqə saxlanılacaq.", submitError: "Məlumat göndərilmədi. Yenidən cəhd edin.",
      invalidNumber: "2–24 simvoldan ibarət nömrə daxil edin.", tooMany: "Çox sayda göndəriş. Bir dəqiqə gözləyin.",
      vehicleKeyboard: "Nömrə klaviaturası", phoneKeyboard: "Telefon klaviaturası", touchHint: "Sahəni seçin və düymələrdən istifadə edin", digits: "Rəqəmlər", latinLetters: "Latın hərfləri", backspace: "Simvolu sil"
    }
  };

  const isKiosk = document.body && document.body.classList.contains("kiosk-page");
  const storageKey = isKiosk ? "ztz-driver-language" : "ztz-language";
  let language = isKiosk ? (localStorage.getItem(storageKey) || "ru") : "ru";
  if (!dictionaries[language]) language = "ru";

  function t(key, values) {
    let text = dictionaries[language][key] || dictionaries.ru[key] || key;
    Object.entries(values || {}).forEach(([name, value]) => { text = text.replaceAll(`{${name}}`, String(value)); });
    return text;
  }

  function applyDocument() {
    document.documentElement.lang = language;
    document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const placeholder = t(node.dataset.i18nPlaceholder);
      if ("placeholder" in node) node.placeholder = placeholder;
      node.dataset.placeholder = placeholder;
      node.setAttribute("aria-placeholder", placeholder);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((node) => { node.alt = t(node.dataset.i18nAlt); });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => { node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel)); });
    const selector = document.getElementById("language-select");
    if (selector) selector.value = language;
    document.querySelectorAll("[data-language]").forEach((button) => {
      const active = button.dataset.language === language;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setLanguage(nextLanguage) {
    if (!dictionaries[nextLanguage]) return;
    language = nextLanguage;
    localStorage.setItem(storageKey, language);
    applyDocument();
    window.dispatchEvent(new CustomEvent("ztz:language", { detail: { language } }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyDocument();
    const selector = document.getElementById("language-select");
    if (selector) selector.addEventListener("change", (event) => setLanguage(event.target.value));
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
  });

  window.I18n = { t, setLanguage, get language() { return language; } };
})();
