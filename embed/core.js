import { processTemplate } from "./template.js";
import { getConfig } from "./util.js";

async function webring_init(siteData) {
  let {
    siteUrl,
    siteOrigin,
    bgcolor,
    darkMode
  } = siteData;

  const settingsPath = "../settings.txt";

  function reportHeight() {
    window.parent.postMessage(
      {
        "height": document.documentElement.scrollHeight
      },
      siteOrigin
    );
  }

  function normalizeURLs(urls) {
    return urls
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(Boolean);
  }

  let settings = await getConfig(settingsPath);

  if (settings.length === 0) {
    console.error('No settings found in settings.txt file.');
    return;
  }
  const config = settings.shift();
  if (!config?.webringName) {
    console.error('Missing webring settings.');
    return;
  }
 
  if (settings.length === 0) {
    console.error('No sites found in sites.txt file.');
    return;
  }

  const siteUrls = settings.filter(Boolean).map(site => site.link || null);
  const urls = normalizeURLs(siteUrls);
  const index = urls.findIndex(loc => siteUrl.startsWith(loc));

  if (index === -1) return;

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

  rootEl.innerHTML = template.trim();
  (darkMode);
  if (darkMode === "true") {
    rootEl.classList.add("dark-mode");
  }
  document.body.appendChild(rootEl);
  document.body.style.backgroundColor = bgcolor || "white";
  
  reportHeight();

};

window.addEventListener("message", (evt) => {
  webring_init(evt.data);
});
