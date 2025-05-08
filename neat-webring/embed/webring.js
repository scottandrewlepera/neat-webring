(() => {

  const id = "neat-webring-frame";
  if (document.getElementById(id) !== null) return;
  const script = document.currentScript;
  const scriptUrl = new URL(document.currentScript.src);
  const scriptOrigin = scriptUrl.origin;
  let scriptPath = scriptUrl.pathname.slice(0, scriptUrl.pathname.lastIndexOf('/'));
  const siteOrigin = location.origin;
  const iframeInitialHeight = "50px";

  const iframe = document.createElement('iframe');
  iframe.id = id;
  iframe.src = `${scriptOrigin}${scriptPath}/webring.html`;
  iframe.style.height = iframeInitialHeight;
  iframe.style.width = "100%";
  iframe.style.border = "0";
  
  window.addEventListener("message", (evt) => {
    if (evt.origin === scriptOrigin) {
      iframe.style.height = `${evt.data.height + 2}px`;
    }
  });

  iframe.addEventListener("load", () => {
    const bgcolor = window.getComputedStyle(iframe.parentElement).backgroundColor;
    const darkMode = script.dataset.darkMode;
    iframe.contentWindow.postMessage(
        { siteUrl: location.href, siteOrigin, bgcolor, darkMode }, scriptOrigin
    );
  });

  script.parentNode.insertBefore(iframe, script.nextSibling);

})();
