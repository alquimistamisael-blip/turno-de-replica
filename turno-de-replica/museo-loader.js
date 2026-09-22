// museo-loader.js — configuración de las tarjetas del Museo Literario.
ctLoadSection({
  label: 'museo-loader.js',
  source: 'content/museo-literario.json',
  gridId: 'ml-recientes',
  detailPage: 'museo-detalle.html',
  cardClass: 'tl-card',
  imageClass: 'tl-card-img',
  badgeClass: 'td-badge trama',
  descriptionClass: 'tl-desc',
  render: function (entry, config) {
    return ctBuildCard(entry, config);
  }
});
