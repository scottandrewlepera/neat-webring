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
