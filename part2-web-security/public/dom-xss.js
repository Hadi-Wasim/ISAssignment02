(function () {
  var el = document.getElementById('bio');
  var raw = decodeURIComponent((location.hash || '').slice(1));
  if (window.APP_MODE === 'safe') el.textContent = raw;
  else el.innerHTML = raw;
})();
