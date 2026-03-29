import { getConfig, getNsfwPref, setNsfwPref } from "../embed/util.js";

const nsfwBase = new URL('../nsfw/', import.meta.url).href;

(async () => {
  let pathname = new URL(import.meta.url).pathname;
  pathname = pathname.slice(0, pathname.lastIndexOf('/')) + '/';
  const settingsPath = `${pathname}../settings.txt`;
  const settings = await getConfig(settingsPath);
  const config = settings.shift();
  const sites = settings.filter(Boolean);

  function buildList(hideNsfw) {
    let list = '';
    sites.forEach(site => {
      const isNsfw = !!site.nsfw;
      const label = `${site?.name ? site.name : site.link}${isNsfw ? ' <span class="nsfw-badge">NSFW</span>' : ''}`;
      const desc = site?.description ? ` - ${site.description}` : '';

      if (isNsfw && hideNsfw) {
        list += `<li><span class="nsfw-disabled" title="NSFW content hidden by your preference">${label}</span>${desc}</li>`;
      } else if (isNsfw) {
        const warnUrl = `${nsfwBase}?url=${encodeURIComponent(site.link)}`;
        list += `<li><a href="${warnUrl}">${label}</a>${desc}</li>`;
      } else {
        list += `<li><a href="${site.link}">${label}</a>${desc}</li>`;
      }
    });
    return `<ul>${list}</ul>`;
  }

  const hasNsfwSites = sites.some(s => s.nsfw);

  function render() {
    const hideNsfw = getNsfwPref();
    const list = buildList(hideNsfw);

    const prefToggle = hasNsfwSites ? `
      <div class="nsfw-pref-row">
        <label>
          <input type="checkbox" id="nsfw-pref-toggle" ${hideNsfw ? 'checked' : ''}>
          Never show NSFW websites
        </label>
      </div>` : '';

    const html = `
      <div class="neat-webring-home">
        <h1>${config.webringName}</h1>
        ${(config?.owner)? `<p>A webring by ${config.owner}.</p>` : ''}
        ${(config?.description)? `<p>${config.description}</p>` : ''}
        ${list}
        ${prefToggle}
        <attr>Powered by <a target="_new" href="https://github.com/scottandrewlepera/neat-webring">Neat Webring!</a></attr>
      </div>
    `;

    document.title = config.webringName;
    document.getElementById("webring-home-content").innerHTML = html;

    if (hasNsfwSites) {
      document.getElementById('nsfw-pref-toggle').addEventListener('change', (e) => {
        setNsfwPref(e.target.checked);
        render();
      });
    }
  }

  render();

})();