import { getConfig, getNsfwPref, setNsfwPref } from "../embed/util.js";

const settingsPath = new URL('../settings.txt', import.meta.url).href;
const nsfwBase = new URL('../nsfw/', import.meta.url).href;
const utm = "?utm_source=nh_webring&utm_medium=web";
const REDIRECT_DELAY_MS = 2000;

const container = document.getElementById('go-content');

function renderSpinner(webringName) {
  container.innerHTML = `
    ${webringName ? `<p class="go-entering">You are now entering</p><h1>${webringName}</h1>` : ''}
    <div class="go-spinner"></div>
    <p class="go-status">Exploring the ring&hellip;</p>
  `;
}

function renderNoSites(webringName) {
  container.innerHTML = `
    <h1>${webringName}</h1>
    <p class="no-sites-msg">
      No websites in this ring are currently available because of your
      preference to hide NSFW content.
    </p>
    <div class="nsfw-pref-row">
      <label>
        <input type="checkbox" id="nsfw-pref-toggle" checked>
        Never show NSFW websites
      </label>
    </div>
  `;
  document.getElementById('nsfw-pref-toggle').addEventListener('change', (e) => {
    setNsfwPref(e.target.checked);
    if (!e.target.checked) {
      go(webringName, allSites);
    }
  });
}

function pickRandom(sites) {
  return sites[Math.floor(Math.random() * sites.length)];
}

let allSites = [];

function go(webringName, sites) {
  const hideNsfw = getNsfwPref();
  const candidates = hideNsfw ? sites.filter(s => !s.nsfw) : sites;

  if (!candidates.length) {
    renderNoSites(webringName);
    return;
  }

  const site = pickRandom(candidates);

  if (site.nsfw) {
    setTimeout(() => location.replace(`${nsfwBase}?url=${encodeURIComponent(site.link + utm)}`), REDIRECT_DELAY_MS);
  } else {
    setTimeout(() => location.replace(site.link + utm), REDIRECT_DELAY_MS);
  }
}

(async () => {
  renderSpinner('');

  const settings = await getConfig(settingsPath);
  if (!settings || settings.length < 2) return;

  const config = settings.shift();
  allSites = settings.filter(s => s && s.link);

  document.title = config.webringName;
  renderSpinner(config.webringName);

  go(config.webringName, allSites);
})();
