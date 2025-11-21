// File: netlify/functions/track123-proxy.js

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { tracking_number, courier_code } = JSON.parse(event.body);
    const apiKey = process.env.TRACK123_API_KEY;

    // --- Added input validation logging ---
    console.log(`Received request: TN=${tracking_number}, CC=${courier_code}`);

    if (!tracking_number || !courier_code) {
      throw new Error("Tracking number and courier code are required.");
    }
    if (!apiKey) {
      console.error("FATAL: TRACK123_API_KEY environment variable not found.");
      throw new Error("Shipping service is not configured correctly on the server.");
    }

    const track123Response = await fetch('https://api.track123.com/v1/trackings/create', {
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
    
    // --- New Robust Error Handling ---
    // We get the raw text first to avoid JSON parsing errors
    const responseText = await track123Response.text();
    console.log(`Track123 Response Status: ${track123Response.status}`);
    console.log(`Track123 Raw Response Body: ${responseText}`);

    if (!track123Response.ok) {
        // Try to parse as JSON, but have a fallback
        try {
            const errorJson = JSON.parse(responseText);
            throw new Error(errorJson.meta.message || 'Unknown error from tracking service.');
        } catch (e) {
            // If the response wasn't JSON, throw the raw text
            throw new Error(`Tracking service returned a non-JSON error: ${responseText}`);
        }
    }
    
    // Success: Return the valid JSON we received
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: responseText, // responseText is already a valid JSON string
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