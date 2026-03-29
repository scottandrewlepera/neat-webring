export async function getConfig(path) {
  let text;
  await fetch(path)
    .then(async response => {
      text = await response.text();
    }).catch(reason => {
      console.error(`Config error with ${path}`, reason);
      return;
    });
  return jsyaml.loadAll(text);
}

export async function getStyles(path) {
  let text;
  await fetch(path)
    .then(async response => {
      text = await response.text();
    }).catch(reason => {
      console.error(`Config error with ${path}`, reason);
      return;
    });
  return text;
}

const NSFW_PREF_KEY = 'neat-webring-hide-nsfw';

export function getNsfwPref() {
  return localStorage.getItem(NSFW_PREF_KEY) === 'true';
}

export function setNsfwPref(value) {
  if (value) {
    localStorage.setItem(NSFW_PREF_KEY, 'true');
  } else {
    localStorage.removeItem(NSFW_PREF_KEY);
  }
}
