// corcho-loader.js — configura las tarjetas de anuncios del Corcho.
ctLoadSection({
  label: 'corcho-loader.js',
  source: 'content/el-corcho.json',
  gridId: 'corcho-grid',
  detailPage: 'corcho-detalle.html',
  render: buildCard
});

function buildCard(entry) {
    var a = document.createElement('a');
    a.className = 'corcho-card';
    a.href = 'corcho-detalle.html?i=' + entry._index;
    a.style.cssText = 'text-decoration:none;color:inherit;display:block;';

    var tag = document.createElement('span');
    tag.className = 'corcho-tag';
    tag.textContent = entry.category || '';
    a.appendChild(tag);

    var h3 = document.createElement('h3');
    h3.textContent = entry.title || '';
    a.appendChild(h3);

    var p = document.createElement('p');
    p.textContent = entry.message || '';
    a.appendChild(p);

    var meta = document.createElement('div');
    meta.className = 'corcho-meta';
    var span1 = document.createElement('span');
    span1.textContent = entry.author || '';
    var span2 = document.createElement('span');
    span2.textContent = ctFormatDate(entry.date);
    meta.appendChild(span1);
    meta.appendChild(span2);
    a.appendChild(meta);

    return a;
}
