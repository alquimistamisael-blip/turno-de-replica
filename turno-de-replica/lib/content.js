const SECTION_KEYS = new Set([
  'club-de-la-trama-y-el-drama',
  'ecos-de-papel',
  'el-corcho',
  'legal',
  'museo-literario',
  'taller-escritura',
  'trama-y-drama'
]);

function assertSection(section) {
  if (!SECTION_KEYS.has(section)) {
    var error = new Error('Sección no válida');
    error.statusCode = 400;
    throw error;
  }
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    var error = new Error('El contenido debe ser un objeto JSON');
    error.statusCode = 400;
    throw error;
  }
  return payload;
}

module.exports = { assertSection, normalizePayload };
