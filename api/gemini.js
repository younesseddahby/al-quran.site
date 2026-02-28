import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { history, system } = body;
    let apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    
    // Clean up the key (remove quotes, spaces)
    if (apiKey) {
      apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
    }
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.includes('your_gemini_api_key_here') || apiKey === '<your_api_key>') {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: history,
        config: { 
            systemInstruction: system
        }
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let hasContent = false;
          for await (const chunk of responseStream) {
            if (chunk.text) {
              hasContent = true;
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
          
          if (!hasContent) {
            // If the stream finished but we got no text, it might be a safety block
            controller.enqueue(new TextEncoder().encode("I apologize, but I cannot provide a response to that query."));
          }
          
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    let statusCode = 500;
    let errorMessage = error.message;
    
    try {
        // The error message from Gemini is sometimes a stringified JSON object inside a stringified JSON object
        let parsed = error.message;
        if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch(e) {}
        }
        
        if (parsed && parsed.error && typeof parsed.error.message === 'string') {
             try { 
                 const innerParsed = JSON.parse(parsed.error.message);
                 if (innerParsed.error) {
                     parsed = innerParsed;
                 }
             } catch(e) {}
        }

        if (parsed && parsed.error) {
            if (parsed.error.code) statusCode = parsed.error.code;
            if (parsed.error.message) errorMessage = parsed.error.message;
        }
    } catch (e) {
        if (error.status) statusCode = error.status;
    }

    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
