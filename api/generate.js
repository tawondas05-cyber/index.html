export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const data = req.body || {};

    if (!process.env.POLLINATIONS_API_KEY) {
      return res.status(500).json({
        error: "POLLINATIONS_API_KEY belum tersedia di Vercel."
      });
    }

    const prompt = `
Create a professional graphic design.

Design type:
${data.jenis || "Professional promotional design"}

Main title:
${data.judul || ""}

Subtitle:
${data.subjudul || ""}

Description:
${data.deskripsi || ""}

Slogan / CTA:
${data.slogan || ""}

WhatsApp:
${data.whatsapp || ""}

Instagram:
${data.instagram || ""}

TikTok:
${data.tiktok || ""}

Facebook / YouTube:
${data.social || ""}

Address:
${data.alamat || ""}

Size:
${data.ukuran || ""}

Orientation:
${data.orientasi || "Landscape"}

Color mode:
${data.colorMode || "RGB"}

Resolution:
${data.resolusi || "300 DPI"}

Bleed:
${data.bleed || ""}

Additional instructions:
${data.instruksi || ""}

Revision:
${data.revision || ""}

Create a clean, modern, professional commercial graphic design.
Use strong visual hierarchy, readable typography, balanced spacing,
appropriate colors, and a polished advertising layout.

IMPORTANT:
Do not invent phone numbers, addresses, prices, logos,
social media accounts, or other important business information
that was not provided.

Make the design visually suitable for the requested orientation
and design type.
`;

    const response = await fetch(
      "https://gen.pollinations.ai/v1/images/generations",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.POLLINATIONS_API_KEY}`
        },

        body: JSON.stringify({
          model: "flux",
          prompt: prompt,
          size: "1024x1024"
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          result?.error?.message ||
          result?.error ||
          "Pollinations gagal membuat desain."
      });
    }

    const image = result?.data?.[0];

    if (!image) {
      return res.status(500).json({
        error: "Pollinations tidak mengembalikan gambar."
      });
    }

    if (image.b64_json) {
      return res.status(200).json({
        image_url: `data:image/png;base64,${image.b64_json}`
      });
    }

    if (image.url) {
      return res.status(200).json({
        image_url: image.url
      });
    }

    return res.status(500).json({
      error: "Format gambar dari Pollinations tidak dikenali."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Terjadi kesalahan server."
    });
  }
}
