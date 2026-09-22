// taller-loader.js — configuración de las tarjetas del Taller de Escritura.
ctLoadSection({
  label: 'taller-loader.js',
  source: 'content/taller-escritura.json',
  gridId: 'tl-destacados',
  detailPage: 'taller-detalle.html',
  cardClass: 'tl-card',
  imageClass: 'tl-card-img',
  badgeClass: 'td-badge trama',
  descriptionClass: 'tl-desc',
  render: function (entry, config) {
    return ctBuildCard(entry, config);
  }
});
