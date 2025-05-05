import { getConfig } from "../embed/util.js";
(async () => {
  let pathname = new URL(import.meta.url).pathname;
  pathname = pathname.slice(0, pathname.lastIndexOf('/')) + '/';
  const settingsPath = `${pathname}../settings.txt`;
  const settings = await getConfig(settingsPath);
  const config = settings.shift();
  const sites = settings.filter(Boolean);
  
  let list = '';
  sites.forEach(site => {
    list += `<li><a href="${site.link}">${site.name}</a>${(site?.description) ? ` - ${site.description}` : ''}</li>`;
  });

  list = `<ul>${list}</ul>`;

  const html = `
    <div class="neat-webring-home">
      <h1>${config.webringName}</h1>
      ${(config?.owner)? `<p>A webring by ${config.owner}.</p>` : ''}
      ${(config?.description)? `<p>${config.description}</p>` : ''}
      ${list}
      <attr>Powered by <a target="_new" href="https://github.com/scottandrewlepera/neat-webring">Neat Webring!</a></attr>
    </div>
  `;

  document.title = config.webringName;
  document.getElementById("webring-home-content").innerHTML = html;

})();