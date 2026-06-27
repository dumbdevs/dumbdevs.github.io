(function () {
  var storageKey = "dumb-site-language";
  var languageSelect = document.querySelector("[data-language-select]");

  function getSavedLanguage() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem(storageKey, language);
    } catch (error) {
      return;
    }
  }

  function normalizeLanguage(value) {
    var supportedLanguages = ["en", "zh", "zh-Hant", "ja"];

    return supportedLanguages.indexOf(value) === -1 ? "en" : value;
  }

  function browserLanguage() {
    var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    var language = (languages[0] || "").toLowerCase();

    if (language.indexOf("ja") === 0) {
      return "ja";
    }

    if (
      language.indexOf("zh-hant") === 0 ||
      language.indexOf("zh-tw") === 0 ||
      language.indexOf("zh-hk") === 0 ||
      language.indexOf("zh-mo") === 0
    ) {
      return "zh-Hant";
    }

    if (language.indexOf("zh") === 0) {
      return "zh";
    }

    return "en";
  }

  function preferredLanguage() {
    var saved = getSavedLanguage();

    if (saved) {
      return normalizeLanguage(saved);
    }

    return browserLanguage();
  }

  function applyLanguage(language) {
    var nextLanguage = normalizeLanguage(language);

    document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : nextLanguage;
    document.body.dataset.lang = nextLanguage;
    saveLanguage(nextLanguage);

    if (languageSelect) {
      languageSelect.value = nextLanguage;
    }
  }

  if (languageSelect) {
    languageSelect.addEventListener("change", function () {
      applyLanguage(languageSelect.value);
    });
  }

  applyLanguage(preferredLanguage());
})();
