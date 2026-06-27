(function () {
  var storageKey = "dumb-site-language";
  var githubFollowersStorageKey = "dumb-github-followers";
  var githubOrgApi = "https://api.github.com/orgs/D-U-M-B";
  var languageSelect = document.querySelector("[data-language-select]");
  var githubFollowerNodes = Array.prototype.slice.call(document.querySelectorAll("[data-github-followers]"));
  var githubFollowerCount = null;

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

  function localeForLanguage(language) {
    if (language === "zh") {
      return "zh-CN";
    }

    if (language === "zh-Hant") {
      return "zh-TW";
    }

    if (language === "ja") {
      return "ja-JP";
    }

    return "en";
  }

  function formatNumber(value, language) {
    try {
      return new Intl.NumberFormat(localeForLanguage(language)).format(value);
    } catch (error) {
      return String(value);
    }
  }

  function followerLabel(count) {
    var language = normalizeLanguage(document.body.dataset.lang);
    var countText = formatNumber(count, language);

    if (language === "zh") {
      return countText + " 位关注者";
    }

    if (language === "zh-Hant") {
      return countText + " 位追蹤者";
    }

    if (language === "ja") {
      return countText + " フォロワー";
    }

    return countText + " " + (count === 1 ? "follower" : "followers");
  }

  function renderGitHubFollowers() {
    if (githubFollowerCount === null || githubFollowerNodes.length === 0) {
      return;
    }

    githubFollowerNodes.forEach(function (node) {
      node.textContent = followerLabel(githubFollowerCount);
      node.hidden = false;
    });
  }

  function todayKey() {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");

    return [now.getFullYear(), month, day].join("-");
  }

  function getGitHubFollowersCache() {
    try {
      var value = window.localStorage.getItem(githubFollowersStorageKey);

      if (!value) {
        return null;
      }

      var cache = JSON.parse(value);

      if (
        !cache ||
        typeof cache.followers !== "number" ||
        !Number.isFinite(cache.followers)
      ) {
        return null;
      }

      return {
        followers: cache.followers,
        isFresh: cache.date === todayKey(),
      };
    } catch (error) {
      return null;
    }
  }

  function saveGitHubFollowers(count) {
    try {
      window.localStorage.setItem(
        githubFollowersStorageKey,
        JSON.stringify({
          date: todayKey(),
          followers: count,
        })
      );
    } catch (error) {
      return;
    }
  }

  function applyLanguage(language) {
    var nextLanguage = normalizeLanguage(language);

    document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : nextLanguage;
    document.body.dataset.lang = nextLanguage;
    saveLanguage(nextLanguage);

    if (languageSelect) {
      languageSelect.value = nextLanguage;
    }

    renderGitHubFollowers();
  }

  function fetchGitHubFollowers() {
    if (!window.fetch || githubFollowerNodes.length === 0) {
      return;
    }

    var cache = getGitHubFollowersCache();

    if (cache && cache.isFresh) {
      githubFollowerCount = cache.followers;
      renderGitHubFollowers();
      return;
    }

    window
      .fetch(githubOrgApi, {
        headers: {
          Accept: "application/vnd.github+json",
        },
      })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("GitHub request failed");
        }

        return response.json();
      })
      .then(function (data) {
        if (typeof data.followers !== "number" || !Number.isFinite(data.followers)) {
          return;
        }

        githubFollowerCount = data.followers;
        saveGitHubFollowers(githubFollowerCount);
        renderGitHubFollowers();
      })
      .catch(function () {
        if (cache) {
          githubFollowerCount = cache.followers;
          renderGitHubFollowers();
        }

        return;
      });
  }

  if (languageSelect) {
    languageSelect.addEventListener("change", function () {
      applyLanguage(languageSelect.value);
    });
  }

  applyLanguage(preferredLanguage());
  fetchGitHubFollowers();
})();
