/**
 * SEIKO STUDIO — Backend AI Image Generation Serverless Endpoint
 * Vercel Serverless Function: /api/generate-image
 */

export default async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Gunakan HTTP POST.'
    });
  }

  try {
    const { provider, prompt, images = [], mode = 'Text -> Image', revisionContext = '' } = req.body;

    // Validation: Prompt tidak boleh kosong
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Prompt AI tidak boleh kosong.'
      });
    }

    const finalPrompt = prompt.trim();

    // -------------------------------------------------------------
    // PROVIDER: GEMINI (Nano Banana 2 / Nano Banana Pro)
    // -------------------------------------------------------------
    if (provider === 'Gemini / Nano Banana 2' || provider === 'Gemini / Nano Banana Pro') {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(503).json({
          success: false,
          error: 'Provider Gemini belum dikonfigurasi di server. Silakan set GEMINI_API_KEY pada Vercel Environment Variables.'
        });
      }

      // Pemilihan Model Gemini resmi
      const modelName = provider === 'Gemini / Nano Banana Pro' 
        ? 'gemini-3.1-flash-image' 
        : 'gemini-2.5-flash-image';

      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      // Menyusun parts request (Multimodal: Prompt + Reference Images)
      const parts = [];

      // Masukkan teks prompt
      let fullTextPrompt = finalPrompt;
      if (revisionContext) {
        fullTextPrompt = `[REVISION CONTEXT]: ${revisionContext}\n\n[FINAL REVISED DESIGN PROMPT]: ${finalPrompt}`;
      }
      parts.push({ text: fullTextPrompt });

      // Jika ada reference image (Image -> Image / Edit Image)
      if (Array.isArray(images) && images.length > 0) {
        for (const imgData of images) {
          if (typeof imgData === 'string' && imgData.includes('base64,')) {
            const matches = imgData.match(/^data:(image\/\w+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              parts.push({
                inline_data: {
                  mime_type: matches[1],
                  data: matches[2]
                }
              });
            }
          }
        }
      }

      const requestBody = {
        contents: [{ parts }],
        generationConfig: {
          response_modalities: ["image", "text"]
        }
      };

      const response = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errMessage = responseData.error?.message || `Google Gemini API Error (${response.status})`;
        return res.status(response.status).json({
          success: false,
          error: errMessage
        });
      }

      // Parsing response Gemini image
      let imageUrl = null;
      let returnedText = null;

      const candidates = responseData.candidates || [];
      if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inline_data && part.inline_data.data) {
            const mime = part.inline_data.mime_type || 'image/png';
            imageUrl = `data:${mime};base64,${part.inline_data.data}`;
          } else if (part.text) {
            returnedText = part.text;
          }
        }
      }

      if (!imageUrl) {
        return res.status(502).json({
          success: false,
          error: returnedText || 'Gemini API tidak mengembalikan data gambar. Pastikan prompt valid.'
        });
      }

      return res.status(200).json({
        success: true,
        provider: provider,
        imageUrl: imageUrl,
        promptUsed: finalPrompt,
        mimeType: 'image/png'
      });
    }

    // -------------------------------------------------------------
    // PROVIDER LAIN (Not Connected Status)
    // -------------------------------------------------------------
    const unsupportedProviders = ['GPT Image', 'Leonardo AI', 'Ideogram', 'Custom API'];
    if (unsupportedProviders.includes(provider)) {
      return res.status(503).json({
        success: false,
        error: `Provider "${provider}" berstatus [Not Connected]. Backend API Key untuk provider ini belum dikonfigurasi.`
      });
    }

    // Local Preview Fallback untuk pengujian lokal tanpa AI
    if (provider === 'Local Preview') {
      return res.status(400).json({
        success: false,
        error: 'Mode Local Preview bukan merupakan Generative AI. Pilih provider "Gemini / Nano Banana 2" untuk menggunakan AI aktif.'
      });
    }

    return res.status(400).json({
      success: false,
      error: `Provider "${provider}" tidak dikenal.`
    });

  } catch (error) {
    console.error('Serverless Execution Error:', error);
    return res.status(500).json({
      success: false,
      error: `Internal Server Error: ${error.message || 'Gagal memproses request'}`
    });
  }
}
