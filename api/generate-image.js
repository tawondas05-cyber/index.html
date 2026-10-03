export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      provider,
      model,
      prompt,
      images = [],
      mode = "Text → Image"
    } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt kosong."
      });
    }

    // =========================================================
    // GEMINI / NANO BANANA 2
    // =========================================================

    if (
      provider === "Gemini / Nano Banana 2" ||
      provider === "Gemini / Nano Banana Pro"
    ) {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error:
            "GEMINI_API_KEY belum ditemukan di Vercel Environment Variables."
        });
      }

      const geminiModel =
        provider === "Gemini / Nano Banana Pro"
          ? "gemini-3-pro-image"
          : "gemini-3.1-flash-image";

      const input = [];

      // Tambahkan gambar referensi jika ada
      if (Array.isArray(images)) {
        for (const image of images) {
          if (!image) continue;

          let base64 = "";
          let mimeType = "image/png";

          // Format data:image/png;base64,...
          if (typeof image === "string" && image.startsWith("data:")) {
            const match = image.match(
              /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
            );

            if (match) {
              mimeType = match[1];
              base64 = match[2];
            }
          }

          // Format object
          else if (typeof image === "object") {
            if (image.dataUrl && image.dataUrl.startsWith("data:")) {
              const match = image.dataUrl.match(
                /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
              );

              if (match) {
                mimeType = match[1];
                base64 = match[2];
              }
            } else if (image.base64) {
              base64 = image.base64;
              mimeType = image.mimeType || "image/png";
            }
          }

          if (base64) {
            input.push({
              type: "image",
              mime_type: mimeType,
              data: base64
            });
          }
        }
      }

      // Prompt harus menjadi input terakhir
      input.push({
        type: "text",
        text: prompt.trim()
      });

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            model: geminiModel,
            input,
            response_format: {
              type: "image"
            }
          })
        }
      );

      const rawText = await response.text();

      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        data = {
          raw: rawText
        };
      }

      if (!response.ok) {
        console.error("Gemini API error:", data);

        let message =
          data?.error?.message ||
          data?.message ||
          "Gemini API gagal membuat gambar.";

        if (response.status === 401 || response.status === 403) {
          message =
            "GEMINI_API_KEY ditolak atau tidak memiliki akses ke model image generation.";
        }

        if (response.status === 429) {
          message =
            "Quota Gemini/API rate limit tercapai.";
        }

        return res.status(response.status).json({
          error: message,
          provider,
          model: geminiModel
        });
      }

      // =====================================================
      // CARI IMAGE OUTPUT DARI RESPONSE GEMINI
      // =====================================================

      let imageBase64 = null;
      let imageMimeType = "image/png";

      const steps = Array.isArray(data?.steps)
        ? data.steps
        : [];

      for (const step of steps) {
        const contentBlocks = Array.isArray(step?.content)
          ? step.content
          : [];

        for (const block of contentBlocks) {
          if (block?.type === "image" && block?.data) {
            imageBase64 = block.data;

            if (block.mime_type) {
              imageMimeType = block.mime_type;
            }

            break;
          }
        }

        if (imageBase64) break;
      }

      // Fallback apabila struktur response berbeda
      if (!imageBase64 && Array.isArray(data?.output)) {
        for (const item of data.output) {
          if (item?.type === "image" && item?.data) {
            imageBase64 = item.data;

            if (item.mime_type) {
              imageMimeType = item.mime_type;
            }

            break;
          }
        }
      }

      if (!imageBase64) {
        console.error(
          "Gemini response tanpa image:",
          JSON.stringify(data).slice(0, 5000)
        );

        return res.status(502).json({
          error:
            "Gemini berhasil merespons, tetapi gambar tidak ditemukan pada response."
        });
      }

      const dataUrl =
        `data:${imageMimeType};base64,${imageBase64}`;

      return res.status(200).json({
        success: true,
        provider,
        model: geminiModel,
        imageUrl: dataUrl,
        dataUrl: dataUrl,
        promptUsed: prompt.trim(),
        mode
      });
    }

    // =========================================================
    // OPENAI / GPT IMAGE
    // =========================================================

    if (provider === "GPT Image") {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error:
            "OPENAI_API_KEY belum ditemukan di Vercel Environment Variables."
        });
      }

      const openaiModel = model || "gpt-image-2";

      const response = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: openaiModel,
            prompt: prompt.trim(),
            size: "1024x1024",
            quality: "medium",
            output_format: "png"
          })
        }
      );

      const rawText = await response.text();

      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        data = {
          raw: rawText
        };
      }

      if (!response.ok) {
        console.error("OpenAI API error:", data);

        return res.status(response.status).json({
          error:
            data?.error?.message ||
            "OpenAI gagal membuat gambar."
        });
      }

      const b64 = data?.data?.[0]?.b64_json;

      if (!b64) {
        return res.status(502).json({
          error:
            "OpenAI berhasil merespons, tetapi gambar tidak ditemukan."
        });
      }

      const dataUrl = `data:image/png;base64,${b64}`;

      return res.status(200).json({
        success: true,
        provider,
        model: openaiModel,
        imageUrl: dataUrl,
        dataUrl: dataUrl,
        promptUsed: prompt.trim(),
        mode
      });
    }

    // =========================================================
    // LOCAL PREVIEW
    // =========================================================

    if (provider === "Local Preview") {
      return res.status(200).json({
        success: true,
        provider: "Local Preview",
        imageUrl: null,
        dataUrl: null,
        promptUsed: prompt.trim(),
        message:
          "Local Preview tidak menggunakan AI image generation."
      });
    }

    // =========================================================
    // PROVIDER LAIN BELUM AKTIF
    // =========================================================

    return res.status(400).json({
      error:
        `${provider || "Provider"} belum memiliki backend aktif.`
    });

  } catch (error) {
    console.error("generate-image fatal error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Terjadi kesalahan pada server generate-image."
    });
  }
}
