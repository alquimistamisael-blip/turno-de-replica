ctLoadSection({
  label: 'trama-loader.js',
  source: 'content/trama-y-drama.json',
  gridId: 'lt-grid',
  detailPage: 'trama-detalle.html',
  cardClass: 'td-card',
  imageClass: 'td-card-img',
  imageFallback: '#DCD3C4',
  badgeClass: 'td-badge trama',
  filter: function (entry) { return CT_CATEGORIES.trama.indexOf(entry.eyebrow) !== -1; },
  render: function (entry, config) {
    return ctBuildCard(entry, config);
  }
});
