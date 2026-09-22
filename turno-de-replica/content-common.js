// content-common.js
// Funciones compartidas por los loaders de todas las secciones (La Trama, El Drama,
// Museo Literario, Taller de Escritura, El Corcho). No hace nada por sí solo.

var CT_CATEGORIES = {
  trama: [
    '📚 Novedades editoriales', '🔮 Lo que viene', '👀 En el radar', '🔥 El fenómeno',
    '✍️ Entre autores', '🏛️ Mundo editorial', '🎬 Del libro a la pantalla',
    '📈 Qué está leyendo todo el mundo', '💌 Próxima parada: librería'
  ],
  drama: [
    '☕ El Salseo Literario', '🔥 Arde BookTok', '👀 ¿Pero qué ha pasado aquí?',
    '⚔️ Guerra de Fandoms', '💀 Opiniones que nadie pidió', '🚩 Red Flags literarias',
    '💚 Green Flags', '🫣 Confesionario lector', '⚖️ Se abre el debate',
    '📢 La sentencia de la semana', '🗣️ ¿Soy la única?'
  ]
};

var CT_API_SOURCES = {
  'content/club-de-la-trama-y-el-drama.json': 'club-de-la-trama-y-el-drama',
  'content/ecos-de-papel.json': 'ecos-de-papel',
  'ecos-de-papel.json': 'ecos-de-papel',
  'content/el-corcho.json': 'el-corcho',
  'content/legal.json': 'legal',
  'content/museo-literario.json': 'museo-literario',
  'content/taller-escritura.json': 'taller-escritura',
  'content/trama-y-drama.json': 'trama-y-drama'
};

function ctFetchJSON(path) {
  var section = CT_API_SOURCES[path];
  var request = section
    ? fetch('/api/content?section=' + encodeURIComponent(section), { cache: 'no-cache' })
    : Promise.reject(new Error('Sin API para ' + path));

  return request
    .then(function (res) {
      if (!res.ok) throw new Error('API no disponible');
      return res.json();
    })
    .catch(function () {
      return fetch(path, { cache: 'no-cache' }).then(function (res) {
        if (!res.ok) throw new Error('No se pudo cargar ' + path);
        return res.json();
      });
    });
}

function ctQueryParam(name) {
  var params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function ctEscapeHtml(str) {
  if (str === undefined || str === null) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Convierte "2026-09-06" o un ISO datetime en algo legible tipo "6 sept 2026".
function ctFormatDate(raw) {
  if (!raw) return '';
  var d = new Date(raw);
  if (isNaN(d.getTime())) return raw; // si no es una fecha reconocible, se muestra tal cual
  var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
}

// Devuelve solo las entradas publicadas, ordenadas por fecha descendente (más reciente primero).
function ctPublishedSorted(entries) {
  return (entries || [])
    .map(function (e, i) { return Object.assign({}, e, { _index: i }); })
    .filter(function (e) { return e.published !== false; }) // por defecto se consideran publicadas
    .sort(function (a, b) {
      var da = a.date ? new Date(a.date).getTime() : 0;
      var db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
}

function ctOnReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
    return;
  }
  callback();
}

function ctLoadSection(config) {
  ctOnReady(function () {
    var grid = document.getElementById(config.gridId);
    if (!grid) return;

    ctFetchJSON(config.source)
      .then(function (data) {
        var entries = ctPublishedSorted(data.entries);
        if (config.filter) entries = entries.filter(config.filter);
        if (!entries.length) return;

        grid.replaceChildren();
        entries.forEach(function (entry) {
          grid.appendChild(config.render(entry, config));
        });
      })
      .catch(function (error) {
        console.warn(config.label + ': usando contenido de respaldo,', error.message);
      });
  });
}

function ctBuildCard(entry, config) {
  var card = document.createElement('a');
  card.className = config.cardClass;
  card.href = config.detailPage + '?i=' + entry._index;
  card.style.cssText = 'text-decoration:none;color:inherit;display:block;';

  if (config.imageClass) {
    var image = document.createElement('div');
    image.className = config.imageClass;
    if (entry.image) {
      image.style.backgroundImage = 'url(' + entry.image + ')';
      image.style.backgroundSize = 'cover';
      image.style.backgroundPosition = 'center';
    } else if (config.imageFallback) {
      image.style.background = config.imageFallback;
    }
    card.appendChild(image);
  }

  var badge = document.createElement('span');
  badge.className = config.badgeClass;
  badge.textContent = entry.eyebrow || '';
  card.appendChild(badge);

  var title = document.createElement('h4');
  title.textContent = entry.title || '';
  card.appendChild(title);

  if (config.descriptionClass) {
    var description = document.createElement('p');
    description.className = config.descriptionClass;
    description.textContent = entry.text || '';
    card.appendChild(description);
  }

  var meta = document.createElement('p');
  meta.className = 'td-meta';
  meta.textContent = [entry.date && ctFormatDate(entry.date), entry.author && 'Por ' + entry.author]
    .filter(Boolean)
    .join(' · ');
  card.appendChild(meta);

  return card;
}
