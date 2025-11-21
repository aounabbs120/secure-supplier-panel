// File: netlify/functions/track123-proxy.js

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the tracking info sent from the browser
    const { tracking_number, courier_code } = JSON.parse(event.body);
    if (!tracking_number || !courier_code) {
      throw new Error("Tracking number and courier code are required.");
    }

    // Securely get the API key from the Netlify environment variables
    const apiKey = process.env.TRACK123_API_KEY;
    if (!apiKey) {
      throw new Error("API key is not configured on the server.");
    }

    // Make the call to the actual Track123 API from Netlify's server
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

    // If Track123 returned an error, pass it back
    if (!track123Response.ok) {
      throw new Error(responseData.meta.message || 'Track123 API error.');
    }

    // Send the successful response from Track123 back to the browser
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    // Send any other errors back to the browser
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};