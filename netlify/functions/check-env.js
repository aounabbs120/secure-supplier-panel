// File: netlify/functions/check-env.js

exports.handler = async () => {
  const apiKey = process.env.TRACK123_API_KEY;

  if (apiKey && apiKey.length > 5) {
    // If the key exists and has a reasonable length
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'SUCCESS',
        message: 'Environment variable is set correctly!',
        apiKeyExists: true,
      }),
    };
  } else {
    // If the key is missing or empty
    return {
      statusCode: 404, // Use 404 to indicate 'Not Found'
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ERROR',
        message: 'The TRACK123_API_KEY environment variable is missing or empty on the server.',
        apiKeyExists: false,
      }),
    };
  }
};