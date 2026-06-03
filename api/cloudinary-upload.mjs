// Vercel serverless function — generates signed Cloudinary upload parameters
// Frontend sends { file, folder } via POST
// Server uses server-side Cloudinary credentials to generate signature

import crypto from 'crypto';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

function generateSignature(params, timestamp) {
  const toSign = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&') + `&timestamp=${timestamp}`;
  return crypto.createHash('sha1').update(toSign).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: 'Cloudinary not configured' });
  }

  const { folder = 'nabome/uploads', resourceType = 'image' } = req.body || {};

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      folder,
      resource_type: resourceType,
      timestamp,
      upload_preset: undefined, // Not using unsigned preset anymore
    };

    const signature = generateSignature(params, timestamp);

    return res.status(200).json({
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      timestamp,
      signature,
      params,
      uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    });
  } catch (err) {
    console.error('cloudinary-upload error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
