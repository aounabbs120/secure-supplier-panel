// File: netlify/functions/track123-proxy.js

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { tracking_number, courier_code } = JSON.parse(event.body);
    if (!tracking_number || !courier_code) {
      throw new Error("Tracking number and courier code are required.");
    }

    const apiKey = process.env.TRACK123_API_KEY;
    if (!apiKey) {
      // This is a server-side error, so we log it for ourselves.
      console.error("FATAL: TRACK123_API_KEY is not set in Netlify environment variables.");
      // We send a generic message to the user for security.
      throw new Error("Shipping service is not configured correctly.");
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

    const responseData = await track123Response.json();

    if (!track123Response.ok) {
      // The error message from Track123 is safe to send to the user.
      throw new Error(responseData.meta.message || 'An unknown error occurred with the tracking service.');
    }

    // Success: Send the data from Track123 back to the browser.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    // This 'catch' block now handles all errors gracefully.
    console.error("Netlify Function Error:", error.message);
    
    // It ALWAYS returns a valid JSON object.
    return {
      statusCode: 400, // Bad Request
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};