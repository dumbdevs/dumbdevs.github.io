(function () {
  var storageKey = "dumb-site-language";
  var githubFollowersStorageKey = "dumb-github-followers";
  var githubOrgApi = "https://api.github.com/orgs/D-U-M-B";
  var incidentPaths = {
    en: "data/ai_coding_incidents.en.json",
    zh: "data/ai_coding_incidents.zh.json",
    "zh-Hant": "data/ai_coding_incidents.zh-Hant.json",
    ja: "data/ai_coding_incidents.ja.json",
  };
  var languagePanel = document.querySelector('[data-panel="language"]');
  var languageTrigger = document.querySelector("[data-language-trigger]");
  var languageCurrent = document.querySelector("[data-language-current]");
  var languageOptionButtons = Array.prototype.slice.call(document.querySelectorAll("[data-language-option]"));
  var panelToggles = Array.prototype.slice.call(document.querySelectorAll("[data-panel-toggle]"));
  var panelClosers = Array.prototype.slice.call(document.querySelectorAll("[data-panel-close]"));
  var panelBackdrop = document.querySelector("[data-panel-backdrop]");
  var navigationPanel = document.querySelector('[data-panel="navigation"]');
  var githubFollowerNodes = Array.prototype.slice.call(document.querySelectorAll("[data-github-followers]"));
  var githubFollowerCount = null;
  var incidentCarousel = document.querySelector("[data-incident-carousel]");
  var incidentTrack = document.querySelector("[data-incident-track]");
  var incidentWindow = document.querySelector("[data-incident-window]");
  var incidentCountNode = document.querySelector("[data-incident-count]");
  var incidentPrevButton = document.querySelector("[data-incident-prev]");
  var incidentNextButton = document.querySelector("[data-incident-next]");
  var incidentCache = {};
  var incidentItems = [];
  var incidentIndex = 0;
  var incidentTimer = null;
  var incidentDelay = 5600;
  var incidentDeadline = 0;
  var incidentRemaining = incidentDelay;
  var incidentRequestId = 0;
  var incidentIsPaused = false;
  var incidentIsPanelPaused = false;
  var shouldResetScrollOnLoad = isReloadNavigation();

  if (shouldResetScrollOnLoad && "scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  function isReloadNavigation() {
    var entries;

    if (window.performance && window.performance.getEntriesByType) {
      entries = window.performance.getEntriesByType("navigation");

      if (entries && entries.length > 0) {
        return entries[0].type === "reload";
      }
    }

    return Boolean(window.performance && window.performance.navigation && window.performance.navigation.type === 1);
  }

  function scrollToTop() {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    } catch (error) {
      window.scrollTo(0, 0);
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function resetReloadScroll() {
    if (!shouldResetScrollOnLoad) {
      return;
    }

    if (window.location.hash) {
      try {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      } catch (error) {
        // Keep the scroll reset even if the URL cannot be rewritten.
      }
    }

    scrollToTop();
  }

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

  function languageName(language) {
    if (language === "zh") {
      return "简体中文";
    }

    if (language === "zh-Hant") {
      return "繁體中文";
    }

    if (language === "ja") {
      return "日本語";
    }

    return "English";
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

  function publicReportLabel(language) {
    if (language === "zh") {
      return "公开报道";
    }

    if (language === "zh-Hant") {
      return "公開報導";
    }

    if (language === "ja") {
      return "公開報道";
    }

    return "public report";
  }

  function sourceLinkLabel(language) {
    if (language === "zh") {
      return "打开来源";
    }

    if (language === "zh-Hant") {
      return "開啟來源";
    }

    if (language === "ja") {
      return "出典を開く";
    }

    return "Open source";
  }

  function nextIncidentLabel(language) {
    if (language === "zh") {
      return "下一条";
    }

    if (language === "zh-Hant") {
      return "下一則";
    }

    if (language === "ja") {
      return "次へ";
    }

    return "next";
  }

  function pausedIncidentLabel(language) {
    if (language === "zh") {
      return "暂停";
    }

    if (language === "zh-Hant") {
      return "暫停";
    }

    if (language === "ja") {
      return "一時停止";
    }

    return "paused";
  }

  function formatIncidentDate(value, language) {
    var date = new Date(value + "T00:00:00Z");

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    try {
      return new Intl.DateTimeFormat(localeForLanguage(language), {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
    } catch (error) {
      return value;
    }
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

  function setPanelState(openPanel) {
    if (openPanel) {
      document.body.dataset.openPanel = openPanel;
      document.body.classList.add("panel-open");
      incidentIsPanelPaused = true;
      suspendIncidentTimer();
    } else {
      delete document.body.dataset.openPanel;
      document.body.classList.remove("panel-open");
      incidentIsPanelPaused = false;
      startIncidentTimer();
    }

    if (panelBackdrop) {
      panelBackdrop.hidden = !openPanel;
    }

    panelToggles.forEach(function (toggle) {
      toggle.setAttribute("aria-expanded", toggle.getAttribute("data-panel-toggle") === openPanel ? "true" : "false");
    });
  }

  function closePanels() {
    if (!document.body.dataset.openPanel) {
      return;
    }

    setPanelState("");
  }

  function togglePanel(panelName) {
    if (document.body.dataset.openPanel === panelName) {
      closePanels();
      return;
    }

    setPanelState(panelName);
  }

  function clearIncidentTimer() {
    if (incidentTimer) {
      window.clearInterval(incidentTimer);
      incidentTimer = null;
    }
  }

  function updateIncidentStatus() {
    var language = normalizeLanguage(document.body.dataset.lang);
    var hasCountdown = incidentItems.length > 1;
    var seconds = Math.max(1, Math.ceil(incidentRemaining / 1000));
    var text = "";

    if (!incidentCountNode || incidentItems.length === 0) {
      return;
    }

    text = formatNumber(incidentIndex + 1, language) + " / " + formatNumber(incidentItems.length, language);

    if (hasCountdown) {
      text += " · " + nextIncidentLabel(language) + " " + formatNumber(seconds, language) + "s";
    }

    if (hasCountdown && (incidentIsPaused || incidentIsPanelPaused || document.hidden)) {
      text += " · " + pausedIncidentLabel(language);
    }

    incidentCountNode.textContent = text;
  }

  function syncIncidentRemaining() {
    if (incidentTimer && incidentDeadline > 0) {
      incidentRemaining = Math.max(0, incidentDeadline - Date.now());
    }
  }

  function suspendIncidentTimer() {
    syncIncidentRemaining();
    clearIncidentTimer();
    updateIncidentStatus();
  }

  function updateIncidentPosition() {
    var cards = incidentTrack ? Array.prototype.slice.call(incidentTrack.querySelectorAll(".incident-card")) : [];

    if (!incidentTrack || incidentItems.length === 0) {
      return;
    }

    incidentTrack.style.transform = "translateX(-" + incidentIndex * 100 + "%)";

    cards.forEach(function (card, index) {
      card.setAttribute("aria-hidden", index === incidentIndex ? "false" : "true");
    });

    updateIncidentStatus();
  }

  function showIncident(index, shouldResetTimer) {
    if (incidentItems.length === 0) {
      return;
    }

    incidentIndex = (index + incidentItems.length) % incidentItems.length;
    updateIncidentPosition();

    if (shouldResetTimer) {
      incidentRemaining = incidentDelay;
      updateIncidentStatus();
      startIncidentTimer();
    }
  }

  function startIncidentTimer() {
    clearIncidentTimer();

    if (incidentIsPaused || incidentIsPanelPaused || document.hidden || incidentItems.length < 2) {
      updateIncidentStatus();
      return;
    }

    if (incidentRemaining <= 0 || incidentRemaining > incidentDelay) {
      incidentRemaining = incidentDelay;
    }

    incidentDeadline = Date.now() + incidentRemaining;
    updateIncidentStatus();

    incidentTimer = window.setInterval(function () {
      incidentRemaining = Math.max(0, incidentDeadline - Date.now());
      updateIncidentStatus();

      if (incidentRemaining <= 0) {
        showIncident(incidentIndex + 1, true);
      }
    }, 250);
  }

  function pauseIncidentTimer() {
    incidentIsPaused = true;
    suspendIncidentTimer();
  }

  function resumeIncidentTimer() {
    incidentIsPaused = false;
    startIncidentTimer();
  }

  function validIncident(incident) {
    return (
      incident &&
      typeof incident.time === "string" &&
      typeof incident.title === "string" &&
      typeof incident.reason_and_consequence === "string" &&
      typeof incident.source_url === "string"
    );
  }

  function createIncidentCard(incident, index, language) {
    var card = document.createElement("article");
    var meta = document.createElement("div");
    var date = document.createElement("span");
    var reportType = document.createElement("span");
    var title = document.createElement("h3");
    var summary = document.createElement("p");
    var source = document.createElement("a");

    card.className = "incident-card";
    card.setAttribute("aria-hidden", index === incidentIndex ? "false" : "true");

    meta.className = "incident-meta";
    date.textContent = formatIncidentDate(incident.time, language);
    reportType.textContent = publicReportLabel(language);
    meta.appendChild(date);
    meta.appendChild(reportType);

    title.textContent = incident.title;
    summary.textContent = incident.reason_and_consequence;

    source.className = "incident-source";
    source.href = incident.source_url;
    source.target = "_blank";
    source.rel = "noreferrer";
    source.textContent = sourceLinkLabel(language);

    card.appendChild(meta);
    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(source);

    return card;
  }

  function renderIncidents(data, language) {
    if (!incidentCarousel || !incidentTrack || data.length === 0) {
      return;
    }

    clearIncidentTimer();
    incidentItems = data.slice();
    incidentIndex = 0;
    incidentRemaining = incidentDelay;

    while (incidentTrack.firstChild) {
      incidentTrack.removeChild(incidentTrack.firstChild);
    }

    incidentItems.forEach(function (incident, index) {
      incidentTrack.appendChild(createIncidentCard(incident, index, language));
    });

    incidentCarousel.hidden = false;
    updateIncidentPosition();
    startIncidentTimer();
  }

  function hideIncidents() {
    if (!incidentCarousel || !incidentTrack) {
      return;
    }

    clearIncidentTimer();
    incidentItems = [];
    incidentIndex = 0;
    incidentRemaining = incidentDelay;
    incidentDeadline = 0;
    incidentTrack.style.transform = "translateX(0)";

    while (incidentTrack.firstChild) {
      incidentTrack.removeChild(incidentTrack.firstChild);
    }

    if (incidentCountNode) {
      incidentCountNode.textContent = "";
    }

    incidentCarousel.hidden = true;
  }

  function loadIncidents(language) {
    var nextLanguage = normalizeLanguage(language);
    var requestId = ++incidentRequestId;

    if (!window.fetch || !incidentCarousel || !incidentTrack) {
      return;
    }

    if (incidentCache[nextLanguage]) {
      renderIncidents(incidentCache[nextLanguage], nextLanguage);
      return;
    }

    hideIncidents();

    window
      .fetch(incidentPaths[nextLanguage], {
        headers: {
          Accept: "application/json",
        },
      })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Incident data request failed");
        }

        return response.json();
      })
      .then(function (data) {
        if (requestId !== incidentRequestId || !Array.isArray(data)) {
          return;
        }

        incidentCache[nextLanguage] = data
          .filter(validIncident)
          .sort(function (left, right) {
            return right.time.localeCompare(left.time);
          });

        renderIncidents(incidentCache[nextLanguage], nextLanguage);
      })
      .catch(function () {
        return;
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

    if (languageCurrent) {
      languageCurrent.textContent = languageName(nextLanguage);
    }

    if (languageTrigger) {
      languageTrigger.setAttribute("aria-label", languageName(nextLanguage));
    }

    languageOptionButtons.forEach(function (button) {
      if (button.getAttribute("data-language-option") === nextLanguage) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    renderGitHubFollowers();
    loadIncidents(nextLanguage);
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

  if (languagePanel && languageTrigger) {
    languagePanel.addEventListener("mouseenter", function () {
      languageTrigger.setAttribute("aria-expanded", "true");
    });
    languagePanel.addEventListener("mouseleave", function () {
      languageTrigger.setAttribute("aria-expanded", "false");
    });
    languagePanel.addEventListener("focusin", function () {
      languageTrigger.setAttribute("aria-expanded", "true");
    });
    languagePanel.addEventListener("focusout", function (event) {
      if (!event.relatedTarget || !languagePanel.contains(event.relatedTarget)) {
        languageTrigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  languageOptionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyLanguage(button.getAttribute("data-language-option"));
      closePanels();
    });
  });

  panelToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      togglePanel(toggle.getAttribute("data-panel-toggle"));
    });
  });

  panelClosers.forEach(function (closer) {
    closer.addEventListener("click", closePanels);
  });

  if (panelBackdrop) {
    panelBackdrop.addEventListener("click", closePanels);
  }

  if (navigationPanel) {
    Array.prototype.slice.call(navigationPanel.querySelectorAll("a")).forEach(function (link) {
      link.addEventListener("click", closePanels);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePanels();
    }
  });

  if (incidentPrevButton) {
    incidentPrevButton.addEventListener("click", function () {
      showIncident(incidentIndex - 1, true);
    });
  }

  if (incidentNextButton) {
    incidentNextButton.addEventListener("click", function () {
      showIncident(incidentIndex + 1, true);
    });
  }

  if (incidentCarousel) {
    incidentCarousel.addEventListener("mouseenter", pauseIncidentTimer);
    incidentCarousel.addEventListener("mouseleave", resumeIncidentTimer);
    incidentCarousel.addEventListener("focusin", pauseIncidentTimer);
    incidentCarousel.addEventListener("focusout", function (event) {
      if (!event.relatedTarget || !incidentCarousel.contains(event.relatedTarget)) {
        resumeIncidentTimer();
      }
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      suspendIncidentTimer();
      return;
    }

    startIncidentTimer();
  });

  window.addEventListener("pageshow", resetReloadScroll);
  window.addEventListener("load", function () {
    resetReloadScroll();
    window.setTimeout(function () {
      resetReloadScroll();
      shouldResetScrollOnLoad = false;
    }, 50);
  });
  window.addEventListener("hashchange", function () {
    shouldResetScrollOnLoad = false;
  });

  resetReloadScroll();
  applyLanguage(preferredLanguage());
  closePanels();
  fetchGitHubFollowers();
})();
