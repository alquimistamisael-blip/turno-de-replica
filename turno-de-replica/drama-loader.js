ctLoadSection({
  label: 'drama-loader.js',
  source: 'content/trama-y-drama.json',
  gridId: 'lt-grid',
  detailPage: 'drama-detalle.html',
  cardClass: 'td-card',
  imageClass: 'td-card-img',
  imageFallback: '#E7B8C4',
  badgeClass: 'td-badge drama',
  filter: function (entry) { return CT_CATEGORIES.drama.indexOf(entry.eyebrow) !== -1; },
  render: function (entry, config) {
    return ctBuildCard(entry, config);
  }
});
