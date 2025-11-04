// netlify/functions/get-config.js

// This is the main function that runs when your website calls it.
exports.handler = async function(event, context) {
  
  // We are creating a package of keys to send back to the website.
  // process.env is the secure "safe" where Netlify stores your keys.
  const configData = {
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
    cloudinaryCloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME,
    cloudinaryUploadPreset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    googleVisionApiKey: process.env.VITE_GOOGLE_VISION_API_KEY
  };

  // We send the package of keys back to the website.
  return {
    statusCode: 200, // This means "Everything is OK!"
    body: JSON.stringify(configData) // We convert the data to a string to send it over the internet.
  };
};