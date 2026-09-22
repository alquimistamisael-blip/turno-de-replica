const { v2: cloudinary } = require('cloudinary');
const { requireAdmin } = require('../lib/auth');

module.exports = function cloudinarySignatureHandler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Método no permitido' });
    }

    requireAdmin(req);
    var cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    var apiKey = process.env.CLOUDINARY_API_KEY;
    var apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Cloudinary no está configurado' });
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    var timestamp = Math.floor(Date.now() / 1000);
    var folder = (req.body && req.body.folder) || 'turno-de-replica';
    if (!/^[a-zA-Z0-9/_-]{1,80}$/.test(folder)) {
      return res.status(400).json({ error: 'Carpeta de Cloudinary no válida' });
    }
    var signature = cloudinary.utils.api_sign_request({ folder: folder, timestamp: timestamp }, apiSecret);

    return res.status(200).json({
      apiKey: apiKey,
      cloudName: cloudName,
      folder: folder,
      signature: signature,
      timestamp: timestamp
    });
  } catch (error) {
    var status = error.statusCode || 500;
    return res.status(status).json({ error: status === 500 ? 'Error interno' : error.message });
  }
};
