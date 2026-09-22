const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../lib/db');

const CONTENT_DIR = path.join(__dirname, '..', 'content');

async function syncContent() {
  const sql = getDatabase();
  await sql`
    CREATE TABLE IF NOT EXISTS content_documents (
      section TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const files = fs.readdirSync(CONTENT_DIR).filter(function (file) {
    return file.endsWith('.json') && file !== 'ecos-de-papel.json';
  });
  files.push('../ecos-de-papel.json');

  for (const file of files) {
    const section = path.basename(file, '.json');
    const payload = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
    await sql`
      INSERT INTO content_documents (section, payload, updated_at)
      VALUES (${section}, ${JSON.stringify(payload)}::jsonb, NOW())
      ON CONFLICT (section)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `;
    console.log('Sincronizado:', section);
  }
}

syncContent().catch(function (error) {
  console.error(error.message);
  process.exitCode = 1;
});
