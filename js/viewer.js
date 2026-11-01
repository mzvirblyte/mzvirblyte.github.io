// Zoomable map viewer: any element with data-viewer opens #map-viewer showing its data-src.
// Elements that share a data-group can be stepped through with the ‹ › buttons or arrow keys.
// Zoom and pan come from the Panzoom library, loaded in index.html.
(function () {
  var dialog = document.getElementById('map-viewer');
  var stage = dialog.querySelector('.viewer-stage');
  var img = stage.querySelector('img');
  var nameEl = dialog.querySelector('.viewer-name');
  var subEl = dialog.querySelector('.viewer-title em');
  var pz = Panzoom(img, { maxScale: 5, minScale: 1, step: 0.4, cursor: 'grab' });
  var group = [];
  var index = 0;

  function show(i) {
    index = (i + group.length) % group.length;
    var t = group[index];
    img.src = t.dataset.src;
    img.alt = t.dataset.alt || '';
    nameEl.textContent = t.dataset.title || '';
    subEl.textContent = t.dataset.sub || '';
    pz.reset({ animate: false });
  }

  function open(trigger) {
    var name = trigger.dataset.group;
    var all = name
      ? Array.prototype.slice.call(document.querySelectorAll('[data-viewer][data-group="' + name + '"]'))
      : [trigger];
    // The same image can have two triggers (big image + thumbnail): keep one per image
    var seen = {};
    group = all.filter(function (t) {
      if (seen[t.dataset.src]) return false;
      return (seen[t.dataset.src] = true);
    });
    dialog.classList.toggle('is-group', group.length > 1);
    show(group.map(function (t) { return t.dataset.src; }).indexOf(trigger.dataset.src));
    dialog.showModal();
  }

  document.querySelectorAll('[data-viewer]').forEach(function (trigger) {
    trigger.addEventListener('click', function () { open(trigger); });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(trigger); }
    });
  });

  stage.addEventListener('wheel', pz.zoomWithWheel);

  dialog.querySelectorAll('[data-zoom]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = btn.dataset.zoom;
      if (action === 'in') pz.zoomIn();
      else if (action === 'out') pz.zoomOut();
      else if (action === 'reset') pz.reset();
      else if (action === 'prev') show(index - 1);
      else if (action === 'next') show(index + 1);
      else dialog.close();
    });
  });

  dialog.addEventListener('keydown', function (e) {
    if (group.length < 2) return;
    if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });

  // Clicking the dark area outside the viewer closes it
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });
})();
