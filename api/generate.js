export default async function handler(req, res) {
  // ---------------------------------------------------------
  // CORS
  // ---------------------------------------------------------
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ---------------------------------------------------------
  // METHOD
  // ---------------------------------------------------------
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Gunakan POST."
    });
  }

  // ---------------------------------------------------------
  // API KEY
  // ---------------------------------------------------------
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error:
        "GEMINI_API_KEY belum dikonfigurasi di Vercel Environment Variables."
    });
  }

  // ---------------------------------------------------------
  // REQUEST BODY
  // ---------------------------------------------------------
  let body;

  try {
    body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Request body bukan JSON yang valid."
    });
  }

  const {
    prompt,
    mode = "text-to-image",
    model = "gemini-3.1-flash-image",
    images = [],
    aspectRatio = "1:1",
    imageSize = "2K",
    previousPrompt = "",
    revision = ""
  } = body || {};

  // ---------------------------------------------------------
  // VALIDATE PROMPT
  // ---------------------------------------------------------
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: "AI Prompt kosong. Masukkan prompt terlebih dahulu."
    });
  }

  // ---------------------------------------------------------
  // ALLOWED MODELS
  // ---------------------------------------------------------
  const allowedModels = [
    "gemini-3.1-flash-image",
    "gemini-3.1-flash-lite-image",
    "gemini-3-pro-image"
  ];

  if (!allowedModels.includes(model)) {
    return res.status(400).json({
      success: false,
      error: `Model Gemini tidak diizinkan: ${model}`
    });
  }

  // ---------------------------------------------------------
  // LIMIT INPUT IMAGES
  // ---------------------------------------------------------
  if (!Array.isArray(images)) {
    return res.status(400).json({
      success: false,
      error: "Format images harus berupa array."
    });
  }

  if (images.length > 10) {
    return res.status(400).json({
      success: false,
      error: "Maksimal 10 gambar referensi per request."
    });
  }

  // ---------------------------------------------------------
  // BUILD GEMINI INPUT
  // ---------------------------------------------------------
  const input = [];

  // Add uploaded/reference images first.
  for (const image of images) {
    if (!image) continue;

    let mimeType = "image/png";
    let base64Data = "";

    // Format:
    // {
    //   data: "base64...",
    //   mime_type: "image/png"
    // }
    if (typeof image === "object") {
      mimeType =
        image.mime_type ||
        image.mimeType ||
        mimeType;

      base64Data =
        image.data ||
        image.base64 ||
        "";
    }

    // Support data URL:
    // data:image/png;base64,AAAA...
    if (
      typeof base64Data === "string" &&
      base64Data.startsWith("data:")
    ) {
      const match = base64Data.match(
        /^data:([^;]+);base64,(.+)$/
      );

      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    if (!base64Data) {
      continue;
    }

    // Basic image validation
    const supportedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp"
    ];

    if (!supportedMimeTypes.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        error:
          `Format gambar tidak didukung: ${mimeType}. ` +
          "Gunakan PNG, JPEG, atau WebP."
      });
    }

    input.push({
      type: "image",
      mime_type: mimeType,
      data: base64Data
    });
  }

  // ---------------------------------------------------------
  // BUILD TEXT PROMPT
  // ---------------------------------------------------------
  let finalPrompt = prompt.trim();

  if (mode === "image-to-image") {
    finalPrompt =
      `Use the provided reference image(s) as visual input.\n\n` +
      finalPrompt;
  }

  if (mode === "edit-image") {
    finalPrompt =
      `Edit the provided image according to the following instruction. ` +
      `Preserve elements that are not explicitly requested to change.\n\n` +
      finalPrompt;
  }

  if (previousPrompt && revision) {
    finalPrompt =
      `Previous design prompt:\n${previousPrompt}\n\n` +
      `Revision instruction:\n${revision}\n\n` +
      `Create the revised design while maintaining the visual intent ` +
      `and relevant elements of the previous design.`;
  }

  input.push({
    type: "text",
    text: finalPrompt
  });

  // ---------------------------------------------------------
  // RESPONSE FORMAT
  // ---------------------------------------------------------
  const responseFormat = {
    type: "image",
    aspect_ratio: aspectRatio,
    image_size: imageSize
  };

  // ---------------------------------------------------------
  // GEMINI API REQUEST
  // ---------------------------------------------------------
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/interactions";

  let geminiResponse;

  try {
    geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        model,
        input,
        response_format: responseFormat
      })
    });
  } catch (error) {
    console.error("Gemini network error:", error);

    return res.status(502).json({
      success: false,
      error:
        "Tidak dapat terhubung ke Gemini API.",
      details: error?.message || "Network error"
    });
  }

  // ---------------------------------------------------------
  // READ RESPONSE
  // ---------------------------------------------------------
  let result;

  try {
    result = await geminiResponse.json();
  } catch (error) {
    return res.status(502).json({
      success: false,
      error:
        "Gemini mengembalikan response yang tidak dapat dibaca."
    });
  }

  // ---------------------------------------------------------
  // HANDLE GEMINI ERROR
  // ---------------------------------------------------------
  if (!geminiResponse.ok) {
    console.error(
      "Gemini API error:",
      JSON.stringify(result)
    );

    const errorMessage =
      result?.error?.message ||
      result?.message ||
      "Gemini API request gagal.";

    const status = geminiResponse.status;

    if (status === 401 || status === 403) {
      return res.status(status).json({
        success: false,
        error:
          "API key Gemini tidak valid atau tidak memiliki akses ke model ini.",
        provider: "Gemini"
      });
    }

    if (status === 429) {
      return res.status(429).json({
        success: false,
        error:
          "Quota atau rate limit Gemini tercapai. Periksa quota/billing project Gemini API.",
        provider: "Gemini"
      });
    }

    if (status === 400) {
      return res.status(400).json({
        success: false,
        error:
          `Gemini menolak request: ${errorMessage}`,
        provider: "Gemini"
      });
    }

    return res.status(502).json({
      success: false,
      error:
        `Gemini API error: ${errorMessage}`,
      provider: "Gemini"
    });
  }

  // ---------------------------------------------------------
  // EXTRACT IMAGE
  // ---------------------------------------------------------
  let imageData = null;
  let imageMimeType = "image/png";

  // Current Gemini Interactions API convenience property.
  if (
    result?.output_image?.data
  ) {
    imageData = result.output_image.data;

    imageMimeType =
      result.output_image.mime_type ||
      result.output_image.mimeType ||
      "image/png";
  }

  // ---------------------------------------------------------
  // FALLBACK: SEARCH STEPS
  // ---------------------------------------------------------
  if (!imageData && Array.isArray(result?.steps)) {
    for (const step of result.steps) {
      if (
        step?.type !== "model_output" ||
        !Array.isArray(step.content)
      ) {
        continue;
      }

      for (const content of step.content) {
        if (
          content?.type === "image" &&
          content?.data
        ) {
          imageData = content.data;

          imageMimeType =
            content.mime_type ||
            content.mimeType ||
            "image/png";

          break;
        }
      }

      if (imageData) break;
    }
  }

  // ---------------------------------------------------------
  // NO IMAGE
  // ---------------------------------------------------------
  if (!imageData) {
    console.error(
      "Gemini response did not contain image:",
      JSON.stringify(result)
    );

    return res.status(502).json({
      success: false,
      error:
        "Gemini berhasil merespons, tetapi tidak mengembalikan gambar."
    });
  }

  // ---------------------------------------------------------
  // RETURN RESULT TO FRONTEND
  // ---------------------------------------------------------
  return res.status(200).json({
    success: true,

    provider: "Gemini",

    model,

    mode,

    prompt: prompt.trim(),

    image: {
      mimeType: imageMimeType,
      base64: imageData,
      dataUrl:
        `data:${imageMimeType};base64,${imageData}`
    },

    interactionId:
      result?.id ||
      result?.interaction_id ||
      null,

    createdAt:
      new Date().toISOString()
  });
}
