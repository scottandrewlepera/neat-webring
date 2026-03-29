import { getConfig, getNsfwPref, setNsfwPref } from "../embed/util.js";

const settingsPath = new URL('../settings.txt', import.meta.url).href;
const homeUrl = new URL('../home/', import.meta.url).href;

const params = new URL(location.href).searchParams;
const destUrl = params.get('url');

const btnContinue = document.getElementById('btn-continue');
const btnElsewhere = document.getElementById('btn-elsewhere');
const prefCheckbox = document.getElementById('pref-checkbox');
const errorMsg = document.getElementById('error-msg');

prefCheckbox.checked = getNsfwPref();

if (!destUrl) {
  location.replace(homeUrl);
}

async function getNonNsfwSites() {
  const settings = await getConfig(settingsPath);
  if (!settings || settings.length < 2) return [];
  settings.shift(); // remove config block
  return settings.filter(site => site && site.link && !site.nsfw);
}

function pickRandom(sites) {
  if (!sites.length) return null;
  return sites[Math.floor(Math.random() * sites.length)];
}

async function goElsewhere() {
  const sites = await getNonNsfwSites();
  const site = pickRandom(sites);
  if (site) {
    location.href = site.link;
  } else {
    errorMsg.style.display = 'block';
    setTimeout(() => location.replace(homeUrl), 3000);
  }
}

btnContinue.addEventListener('click', () => {
  location.href = destUrl;
});

btnElsewhere.addEventListener('click', goElsewhere);

prefCheckbox.addEventListener('change', async () => {
  setNsfwPref(prefCheckbox.checked);
  if (prefCheckbox.checked) {
    await goElsewhere();
  }
});
