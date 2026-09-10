var _paq = window._paq = window._paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="https://matomo.incubateur.anct.gouv.fr/";
  var params = new URLSearchParams((document.currentScript && document.currentScript.src.split('?')[1]) || '');
  var siteId = params.get('siteId') || '27';
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', siteId]);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();
