# Turno de Réplica

Sitio editorial estático con una capa dinámica opcional para contenido y multimedia.

- **Frontend y build:** Eleventy.
- **API:** funciones serverless de Vercel en `api/`.
- **Base de datos:** Neon PostgreSQL mediante `@neondatabase/serverless`.
- **Imágenes:** Cloudinary mediante firmas generadas en servidor.
- **Fallback:** si Neon no está disponible, el frontend sigue usando los JSON de `content/`.

## Requisitos

- Node.js 18 o superior.
- Una cuenta de [Neon](https://neon.tech/).
- Una cuenta de [Cloudinary](https://cloudinary.com/).
- Una cuenta de [Vercel](https://vercel.com/).
- Git instalado.

## Instalación local

```bash
npm ci
cp .env.example .env
npm run build
```

El build se genera en `_site/`. No subas `.env`, `node_modules/` ni `_site/` al repositorio.

Para ejecutar frontend y funciones localmente con Vercel:

```bash
npx vercel login
npm run dev
```

Vercel mostrará una URL local, normalmente `http://localhost:3000`.

## Configurar Neon

1. Crea un proyecto en Neon.
2. Copia la cadena de conexión con SSL desde el panel **Connect**.
3. Añádela como `DATABASE_URL` en `.env` local y como variable de entorno en Vercel.
4. Ejecuta el esquema en el SQL Editor de Neon:

```sql
CREATE TABLE IF NOT EXISTS content_documents (
  section TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_documents_updated_at_idx
  ON content_documents (updated_at DESC);
```

También puedes usar el archivo `db/schema.sql`.

Para importar el contenido inicial desde `content/*.json` y el documento activo de Ecos de Papel:

```bash
npm run db:sync
```

Este comando crea la tabla si no existe y actualiza cada documento mediante `upsert`. Las secciones admitidas son:

- `club-de-la-trama-y-el-drama`
- `ecos-de-papel`
- `el-corcho`
- `legal`
- `museo-literario`
- `taller-escritura`
- `trama-y-drama`

## Configurar Cloudinary

1. Crea o abre un producto en Cloudinary.
2. En **Dashboard**, copia el `Cloud name` y el `API Key`.
3. Copia el `API Secret` solo a las variables privadas de Vercel y `.env` local.
4. Configura estas variables:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

El navegador nunca recibe `CLOUDINARY_API_SECRET`. Primero solicita una firma a `POST /api/cloudinary-signature` y después sube directamente a Cloudinary.

Ejemplo de solicitud de firma:

```bash
curl -X POST http://localhost:3000/api/cloudinary-signature \
  -H "Authorization: Bearer $CONTENT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"folder":"turno-de-replica"}'
```

La respuesta contiene `cloudName`, `apiKey`, `timestamp`, `signature` y `folder`. Usa esos valores en el endpoint de subida firmado de Cloudinary.

## Variables de entorno

Crea `.env` a partir de `.env.example`:

```env
DATABASE_URL=postgresql://...
CONTENT_ADMIN_TOKEN=un-token-largo-y-aleatorio
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

`CONTENT_ADMIN_TOKEN` protege las operaciones de escritura. Genera uno nuevo para cada entorno y no lo publiques en el frontend.

En Vercel, añade las variables desde **Project Settings > Environment Variables** para `Production`, `Preview` y `Development` según corresponda.

## API

### Leer contenido

```http
GET /api/content?section=trama-y-drama
```

Respuesta:

```json
{
  "entries": []
}
```

Las lecturas son públicas. El frontend llama a esta API automáticamente para las secciones conocidas y vuelve al JSON local si la API responde con error.

### Reemplazar un documento

```http
PUT /api/content?section=trama-y-drama
Authorization: Bearer <CONTENT_ADMIN_TOKEN>
Content-Type: application/json
```

Ejemplo:

```bash
curl -X PUT "https://tu-proyecto.vercel.app/api/content?section=trama-y-drama" \
  -H "Authorization: Bearer $CONTENT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @content/trama-y-drama.json
```

La operación reemplaza el documento completo de esa sección. Haz una copia del JSON antes de actualizarlo.

### Generar una firma de Cloudinary

```http
POST /api/cloudinary-signature
Authorization: Bearer <CONTENT_ADMIN_TOKEN>
Content-Type: application/json
```

Cuerpo opcional:

```json
{"folder":"turno-de-replica"}
```

## Despliegue en Vercel

### Primera publicación

1. Sube el proyecto a un repositorio Git.
2. En Vercel, selecciona **Add New > Project**.
3. Importa el repositorio.
4. Comprueba estos valores:
   - **Framework Preset:** `Other`.
   - **Build Command:** `npm run build`.
   - **Output Directory:** `_site`.
5. Añade todas las variables de entorno indicadas arriba.
6. Pulsa **Deploy**.
7. Comprueba una página pública y después `GET /api/content?section=trama-y-drama`.

La configuración equivalente está en `vercel.json`.

## Publicar actualizaciones de código

```bash
git pull origin main
npm ci
npm run build
git add .
git commit -m "Describe el cambio"
git push origin main
```

Cada push a la rama conectada crea un nuevo despliegue en Vercel. Las ramas o pull requests generan previews si están habilitados en el proyecto.

Antes de hacer push:

```bash
npm ci
npm run build
find api lib scripts -name '*.js' -print0 | xargs -0 -n1 node --check
git diff --check
```

## Publicar actualizaciones de contenido

Hay dos formas:

1. Editar el JSON local, revisar el cambio y ejecutar `npm run db:sync`. La fuente activa de Ecos de Papel es `ecos-de-papel.json` en la raíz; `content/ecos-de-papel.json` se conserva como contenido auxiliar.
2. En producción, enviar el JSON actualizado mediante `PUT /api/content` con `CONTENT_ADMIN_TOKEN`.

La base de datos es la fuente dinámica cuando responde correctamente. Los JSON versionados siguen siendo el respaldo y permiten reconstruir el contenido si Neon se restaura desde una copia.

## Estructura relevante

```text
api/
  cloudinary-signature.js   Firma subidas privadas
  content.js                Lectura y escritura de documentos
content/
  *.json                    Contenido de respaldo y semillas
 db/
  schema.sql                Esquema Neon
lib/
  auth.js                   Autorización de escritura
  content.js                Validación de secciones
  db.js                     Conexión Neon
scripts/
  sync-content.js           Importación de JSON a Neon
_includes/
  site-header.liquid        Cabecera compartida
  site-footer.liquid        Footer compartido
.eleventy.js                Build y copia de assets
vercel.json                 Configuración de Vercel
```

## Seguridad y operación

- No guardes secretos en Git, HTML, JavaScript del navegador ni archivos JSON públicos.
- Usa un `CONTENT_ADMIN_TOKEN` largo y rótalo si aparece en logs o historial.
- Limita las carpetas permitidas de Cloudinary si el proyecto crece.
- Revisa los logs de Vercel después de cambiar variables de entorno.
- Exporta periódicamente los documentos de Neon o conserva los JSON versionados.
- El endpoint `PUT` sustituye documentos completos; para edición colaborativa futura conviene crear una tabla por entrada con historial de versiones.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm ci` | Instalar dependencias exactas |
| `npm run build` | Generar `_site/` |
| `npm run dev` | Ejecutar Vercel localmente |
| `npm run db:sync` | Sincronizar `content/*.json` con Neon |
