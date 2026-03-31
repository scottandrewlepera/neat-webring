import { processTemplate } from "./template.js";
import { getConfig, getStyles, getNsfwPref } from "./util.js";

const nsfwBase = new URL('../nsfw/', import.meta.url).href;

async function webring_init(siteData) {
  let {
    siteUrl,
    siteOrigin,
    darkMode
  } = siteData;

  function abort() {
    window.parent.postMessage(
      {
        "abort": true
      },
      siteOrigin
    );
  }

  window.addEventListener("error", (evt) => {
    console.error(evt.message);
    abort();
  });

  const settingsPath = "../settings.txt";
  let styles, settings;

  try {
    styles = await getStyles('./core.css');
    settings = await getConfig(settingsPath);
  } catch (err) {
    console.error(err);
    abort();
  }

  function normalizeURLs(urls) {
    return urls
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(Boolean);
  }

  if (settings.length === 0) {
    console.error('No settings found in settings.txt file.');
    abort();
    return;
  }
  const config = settings.shift();
  if (!config?.webringName) {
    console.error('Missing webring settings.');
    abort()
    return;
  }
 
  if (settings.length === 0) {
    console.error('No sites found in sites.txt file.');
    abort()
    return;
  }

  const hideNsfw = getNsfwPref();

  const utmSource = config.utmSource || 'neat_webring';
  const utm = `?utm_source=${utmSource}&utm_medium=web`;

  // When the pref is set, remove NSFW sites from navigation entirely.
  const visibleSettings = hideNsfw
    ? settings.filter(site => site && !site.nsfw)
    : settings.filter(Boolean);

  const siteUrls = visibleSettings.map(site => site.link || null);
  const urls = normalizeURLs(siteUrls);
  const index = urls.findIndex(loc => siteUrl.startsWith(loc));

  if (index === -1) return;

  config.currentSite = visibleSettings[index];

  const filtered = urls.filter(loc => !siteUrl.startsWith(loc));
  const randomIndex = Math.floor(Math.random() * filtered.length);

  const prevIndex = (index - 1 + urls.length) % urls.length;
  const nextIndex = (index + 1) % urls.length;

  // Resolve the actual destination URL, routing NSFW sites through the warning
  // page when the user has not opted out (they would already be filtered above).
  // UTM params are encoded into the destination so template.js can safely append
  // its own utm suffix to the warning page URL without breaking the inner url param.
  function resolveUrl(site, url) {
    if (!url) return null;
    if (!hideNsfw && site?.nsfw) {
      return `${nsfwBase}?url=${encodeURIComponent(url + utm)}`;
    }
    return url;
  }

  const prevSite = visibleSettings[prevIndex];
  const nextSite = visibleSettings[nextIndex];
  const randomSite = filtered.length > 0
    ? visibleSettings.find(s => s.link === filtered[randomIndex]) || null
    : null;

  const prevUrl = resolveUrl(prevSite, urls[prevIndex]);
  const nextUrl = resolveUrl(nextSite, urls[nextIndex]);
  const prevSiteName = prevSite?.name || 'Previous site';
  const nextSiteName = nextSite?.name || 'Next site';
  const randomSiteUrl = resolveUrl(randomSite, filtered[randomIndex] || null);

  const rootEl = document.createElement('div');
  rootEl.className = 'neat-webring';

  const template = processTemplate(
    config,
    prevUrl,
    nextUrl,
    prevSiteName,
    nextSiteName,
    randomSiteUrl,
    utmSource
  );

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  rootEl.innerHTML = template.trim();
  if (darkMode === "true") {
    rootEl.classList.add("dark-mode");
  }
  rootEl.appendChild(styleEl);

  window.parent.postMessage(
    {
      "content": rootEl.outerHTML
    },
    siteOrigin
  );

};

window.addEventListener("message", (evt) => {
    webring_init(evt.data);
});
