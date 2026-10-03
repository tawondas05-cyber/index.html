export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY belum tersedia di Vercel."
      });
    }

    const prompt = `
Buat desain grafis profesional berdasarkan data berikut.

Jenis desain: ${data.jenis || ""}
Judul utama: ${data.judul || ""}
Subjudul: ${data.subjudul || ""}
Deskripsi: ${data.deskripsi || ""}
Slogan / CTA: ${data.slogan || ""}

WhatsApp: ${data.whatsapp || ""}
Instagram: ${data.instagram || ""}
TikTok: ${data.tiktok || ""}
Facebook / YouTube: ${data.social || ""}
Alamat: ${data.alamat || ""}

Ukuran: ${data.ukuran || ""}
Orientasi: ${data.orientasi || "Landscape"}
Color mode: ${data.colorMode || "RGB"}
Resolusi: ${data.resolusi || "300 DPI"}
Bleed: ${data.bleed || ""}

Instruksi tambahan:
${data.instruksi || ""}

Buat komposisi yang profesional, bersih, modern, mudah dibaca,
dengan hierarki visual yang jelas.

Jangan membuat nomor telepon, alamat, logo, harga, atau informasi
bisnis penting yang tidak diberikan pengguna.
`;

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: prompt,
          size: "1024x1024",
          quality: "medium"
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: result?.error?.message || "OpenAI gagal membuat desain."
      });
    }

    const image = result?.data?.[0];

    if (!image) {
      return res.status(500).json({
        error: "OpenAI tidak mengembalikan gambar."
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
      error: "Format gambar tidak dikenali."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Terjadi kesalahan server."
    });
  }
        }
