const { getDatabase } = require('../lib/db');
const { requireAdmin } = require('../lib/auth');
const { assertSection, normalizePayload } = require('../lib/content');

function sendError(res, error) {
  var status = error.statusCode || 500;
  res.status(status).json({ error: status === 500 ? 'Error interno' : error.message });
}

module.exports = async function contentHandler(req, res) {
  try {
    var section = req.query.section;
    assertSection(section);

    if (req.method === 'GET') {
      var sql = getDatabase();
      var rows = await sql`
        SELECT payload
        FROM content_documents
        WHERE section = ${section}
      `;
      if (!rows.length) return res.status(404).json({ error: 'Contenido no encontrado' });
      return res.status(200).json(rows[0].payload);
    }

    if (req.method !== 'PUT') {
      res.setHeader('Allow', 'GET, PUT');
      return res.status(405).json({ error: 'Método no permitido' });
    }

    requireAdmin(req);
    var payload = normalizePayload(req.body);
  var sql = getDatabase();
    await sql`
      INSERT INTO content_documents (section, payload, updated_at)
      VALUES (${section}, ${JSON.stringify(payload)}::jsonb, NOW())
      ON CONFLICT (section)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `;
    return res.status(200).json({ section: section, updated: true });
  } catch (error) {
    return sendError(res, error);
  }
};
