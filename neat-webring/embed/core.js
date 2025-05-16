import { processTemplate } from "./template.js";
import { getConfig, getStyles } from "./util.js";

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
  const styles = await getStyles('./core.css');

  function normalizeURLs(urls) {
    return urls
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(Boolean);
  }

  let settings = await getConfig(settingsPath);

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

  const siteUrls = settings.filter(Boolean).map(site => site.link || null);
  const urls = normalizeURLs(siteUrls);
  const index = urls.findIndex(loc => siteUrl.startsWith(loc));

  if (index === -1) return;

  config.currentSite = settings[index];

  const filtered = urls.filter(loc => !siteUrl.startsWith(loc));
  const randomIndex = Math.floor(Math.random() * filtered.length);

  const prevIndex = (index - 1 + urls.length) % urls.length;
  const nextIndex = (index + 1) % urls.length;
  const prevUrl = urls[prevIndex];
  const nextUrl = urls[nextIndex];
  const prevSiteName = settings[prevIndex].name || 'Previous site';
  const nextSiteName = settings[nextIndex].name || 'Next site';
  const randomSiteUrl = filtered[randomIndex];

  const rootEl = document.createElement('div');
  rootEl.className = 'neat-webring';

  const template = processTemplate(
    config,
    prevUrl,
    nextUrl,
    prevSiteName,
    nextSiteName,
    randomSiteUrl
  );

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  rootEl.innerHTML = template.trim();
  (darkMode);
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
