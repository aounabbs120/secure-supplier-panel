// File: netlify/functions/track123-proxy.js

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { tracking_number, courier_code } = JSON.parse(event.body);
    const apiKey = process.env.TRACK123_API_KEY;

    if (!tracking_number || !courier_code) {
      throw new Error("Tracking number and courier code are required.");
    }
    if (!apiKey) {
      console.error("FATAL: TRACK123_API_KEY environment variable not found.");
      throw new Error("Shipping service is not configured correctly on the server.");
    }

    // --- THE ONLY CHANGE IS ON THIS LINE ---
    // Using the standard REST endpoint for creating a resource.
    const track123Response = await fetch('https://api.track123.com/v1/trackings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Track123-Api-Key': apiKey,
      },
      body: JSON.stringify({
        tracking_number: tracking_number,
        courier_code: courier_code,
      }),
    });
    
    const responseText = await track123Response.text();

    if (!track123Response.ok) {
        try {
            const errorJson = JSON.parse(responseText);
            throw new Error(errorJson.meta.message || 'Unknown error from tracking service.');
        } catch (e) {
            throw new Error(`Tracking service returned a non-JSON error: ${responseText}`);
        }
    }
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: responseText,
    };

  } catch (error) {
    console.error("Netlify Function CRASH:", error.message);
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};