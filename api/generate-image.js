export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method tidak diizinkan. Gunakan POST."
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "OPENAI_API_KEY belum tersedia di Vercel."
    });
  }

  let body;

  try {
    body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;
  } catch {
    return res.status(400).json({
      success: false,
      error: "Request JSON tidak valid."
    });
  }

  const prompt =
    typeof body?.prompt === "string"
      ? body.prompt.trim()
      : "";

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "AI Prompt kosong."
    });
  }

  const model =
    typeof body?.model === "string" &&
    body.model.startsWith("gpt-image")
      ? body.model
      : "gpt-image-2";

  const size =
    typeof body?.size === "string"
      ? body.size
      : "1024x1024";

  const quality =
    typeof body?.quality === "string"
      ? body.quality
      : "medium";

  const requestBody = {
    model,
    prompt,
    size,
    quality,
    output_format: "png"
  };

  let response;

  try {
    response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      }
    );
  } catch (error) {
    console.error("OpenAI connection error:", error);

    return res.status(502).json({
      success: false,
      error: "Tidak dapat terhubung ke OpenAI API."
    });
  }

  let result;

  try {
    result = await response.json();
  } catch {
    return res.status(502).json({
      success: false,
      error: "Response OpenAI tidak dapat dibaca."
    });
  }

  if (!response.ok) {
    console.error(
      "OpenAI API error:",
      JSON.stringify(result)
    );

    const message =
      result?.error?.message ||
      "OpenAI API request gagal.";

    if (response.status === 401) {
      return res.status(401).json({
        success: false,
        error:
          "OPENAI_API_KEY tidak valid atau sudah dicabut."
      });
    }

    if (response.status === 403) {
      return res.status(403).json({
        success: false,
        error:
          "API key tidak memiliki akses ke image generation."
      });
    }

    if (response.status === 429) {
      return res.status(429).json({
        success: false,
        error:
          "Quota atau billing OpenAI tidak mencukupi."
      });
    }

    return res.status(response.status).json({
      success: false,
      error: message
    });
  }

  const image =
    Array.isArray(result?.data)
      ? result.data[0]
      : null;

  if (!image) {
    return res.status(502).json({
      success: false,
      error:
        "OpenAI merespons tetapi tidak memberikan gambar."
    });
  }

  if (image.b64_json) {
    return res.status(200).json({
      success: true,
      provider: "OpenAI",
      model,
      prompt,
      mimeType: "image/png",
      imageBase64: image.b64_json,
      dataUrl:
        `data:image/png;base64,${image.b64_json}`
    });
  }

  if (image.url) {
    return res.status(200).json({
      success: true,
      provider: "OpenAI",
      model,
      prompt,
      mimeType: "image/png",
      imageUrl: image.url
    });
  }

  return res.status(502).json({
    success: false,
    error:
      "Format gambar dari OpenAI tidak dikenali."
  });
}
