// File: supabase/functions/track123-proxy/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tracking_number, courier_code } = await req.json();
    
    // Securely get the secret API key from Supabase's vault
    const apiKey = Deno.env.get('TRACK123_API_KEY');

    if (!apiKey) {
      console.error("FATAL: TRACK123_API_KEY is not set in Supabase secrets.");
      throw new Error("Shipping service is not configured correctly.");
    }

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
      body: JSON.stringify(payload),
    });

    const responseData = await track123Response.json();

    if (!track123Response.ok) {
        throw new Error(responseData.meta.message || 'Unknown error from tracking service.');
    }
    
    const singleTrackingResult = responseData.data[0];
    const finalResponse = { meta: responseData.meta, data: singleTrackingResult };

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Supabase Function CRASH:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})