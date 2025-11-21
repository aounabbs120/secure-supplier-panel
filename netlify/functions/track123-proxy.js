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

    // The API expects an ARRAY of tracking objects.
    const payload = [{
      tracking_number: tracking_number,
      courier_code: courier_code,
    }];

    const track123Response = await fetch('https://api.track123.com/v1/trackings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Track123-Api-Key': apiKey,
      },
      // --- THE ONLY CHANGE IS HERE: We now send the 'payload' array ---
      body: JSON.stringify(payload), 
    });
    
    const responseData = await track123Response.json();

    if (!track123Response.ok) {
        throw new Error(responseData.meta.message || 'Unknown error from tracking service.');
    }
    
    // The response for a single creation is NOT an array, so we take the first element.
    const singleTrackingResult = responseData.data[0];

    // We modify the response to send back just the single object, not the array.
    const finalResponse = {
        meta: responseData.meta,
        data: singleTrackingResult
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalResponse),
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