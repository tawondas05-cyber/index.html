const $ = (id) => document.getElementById(id);

let orientation = "Landscape";
let version = 1;
let mediaRecorder = null;
let audioChunks = [];

// ===============================
// AI CREDITS
// ===============================

function getCredits() {
  return Number(localStorage.getItem("seikoCredits") || 100);
}

function updateCredits() {
  const creditElement = document.querySelector(".credits strong");

  if (creditElement) {
    creditElement.textContent = getCredits();
  }
}

function useCredits(amount) {
  let credits = getCredits();

  if (credits < amount) {
    alert("AI Credits kamu sudah habis.");
    return false;
  }

  credits -= amount;

  localStorage.setItem("seikoCredits", credits);
  updateCredits();

  return true;
}

// ===============================
// ORIENTATION
// ===============================

document.querySelectorAll(".orientation-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".orientation-btn")
      .forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");
    orientation = button.dataset.value || "Landscape";
  });
});

// ===============================
// IMAGE UPLOAD
// ===============================

if ($("images")) {
  $("images").addEventListener("change", function () {
    const preview = $("preview");

    if (!preview) return;

    preview.innerHTML = "";

    [...this.files].forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target.result;
        img.alt = file.name;

        preview.appendChild(img);
      };

      reader.readAsDataURL(file);
    });
  });
}

// ===============================
// GENERATE PROMPT
// ===============================

if ($("generatePrompt")) {
  $("generatePrompt").addEventListener("click", () => {
    if (!useCredits(5)) {
      return;
    }

    const prompt = createPrompt();

    if ($("promptOutput")) {
      $("promptOutput").value = prompt;
    }

    createDesign(prompt);
  });
}

// ===============================
// CREATE PROMPT
// ===============================

function getValue(id, fallback = "") {
  const element = $(id);

  if (!element) {
    return fallback;
  }

  return element.value || fallback;
}

function createPrompt() {
  const title = getValue("title", "Desain promosi");
  const subtitle = getValue("subtitle");
  const description = getValue("description");
  const slogan = getValue("slogan");
  const business = getValue("business");
  const whatsapp = getValue("whatsapp");
  const instagram = getValue("instagram");
  const address = getValue("address");
  const size = getValue("size", "Ukuran belum ditentukan");
  const colors = getValue("colors", "Warna bebas");
  const theme = getValue("theme", "Modern");
  const instructions = getValue("instructions");

  return `
BUAT DESAIN PROFESIONAL UNTUK SEIKO STUDIO

Nama usaha:
${business}

Judul utama:
${title}

Subjudul:
${subtitle}

Deskripsi:
${description}

Slogan:
${slogan}

Kontak:
WhatsApp: ${whatsapp}
Instagram: ${instagram}

Alamat:
${address}

SPESIFIKASI DESAIN

Ukuran:
${size}

Orientasi:
${orientation}

Warna dominan:
${colors}

Tema:
${theme}

Instruksi tambahan:
${instructions}

ARAHAN DESAIN

- Buat layout yang rapi dan profesional
- Judul utama harus mudah dibaca
- Gunakan hierarki visual yang jelas
- Sesuaikan desain dengan ukuran yang diberikan
- Gunakan warna yang harmonis
- Sisakan ruang yang cukup
- Pastikan informasi penting mudah dibaca
- Cocok untuk kebutuhan cetak
- Gunakan komposisi visual yang menarik
- Buat desain terlihat modern dan profesional
`;
}

// ===============================
// CREATE DESIGN PREVIEW
// ===============================

function createDesign(prompt) {
  const designResult = $("designResult");

  if (!designResult) {
    return;
  }

  const title = getValue(
    "title",
    "DESAIN SEIKO STUDIO"
  );

  const description = getValue(
    "description",
    "Preview desain hasil AI."
  );

  const whatsapp = getValue("whatsapp");
  const instagram = getValue("instagram");

  let contact = "";

  if (whatsapp) {
    contact += escapeHTML(whatsapp);
  }

  if (instagram) {
    if (contact) {
      contact += " • ";
    }

    contact += escapeHTML(instagram);
  }

  designResult.innerHTML = `
    <div class="mock-design">

      <small>
        SEIKO STUDIO • VERSION
        ${String(version).padStart(2, "0")}
      </small>

      <h2>
        ${escapeHTML(title)}
      </h2>

      <p>
        ${escapeHTML(description)}
      </p>

      <div>
        ${contact}
      </div>

      <div style="
        margin-top:20px;
        padding:12px;
        border-radius:10px;
        background:rgba(255,255,255,.08);
        font-size:13px;
      ">
        ✓ Prompt berhasil dibuat
        <br>
        ✓ Desain siap direvisi
      </div>

    </div>
  `;
}

// ===============================
// REVISION
// ===============================

if ($("revisionBtn")) {
  $("revisionBtn").addEventListener("click", () => {
    const revision = getValue("revision").trim();

    if (!revision) {
      alert("Tulis instruksi revisi terlebih dahulu.");
      return;
    }

    if (!useCredits(5)) {
      return;
    }

    version++;

    const currentPrompt = getValue("promptOutput");

    if ($("promptOutput")) {
      $("promptOutput").value =
        currentPrompt +
        `

REVISI VERSI ${version}:
${revision}`;
    }

    createDesign(
      $("promptOutput")
        ? $("promptOutput").value
        : currentPrompt
    );

    if ($("revision")) {
      $("revision").value = "";
    }
  });
}

// ===============================
// SAVE DRAFT
// ===============================

if ($("saveBtn")) {
  $("saveBtn").addEventListener("click", () => {
    const data = {
      title: getValue("title"),
      subtitle: getValue("subtitle"),
      description: getValue("description"),
      slogan: getValue("slogan"),
      business: getValue("business"),
      whatsapp: getValue("whatsapp"),
      instagram: getValue("instagram"),
      tiktok: getValue("tiktok"),
      youtube: getValue("youtube"),
      address: getValue("address"),
      size: getValue("size"),
      colors: getValue("colors"),
      theme: getValue("theme"),
      instructions: getValue("instructions"),
      prompt: getValue("promptOutput"),
      orientation: orientation
    };

    localStorage.setItem(
      "seikoStudioDraft",
      JSON.stringify(data)
    );

    alert(
      "Draft berhasil disimpan di perangkat ini."
    );
  });
}

// ===============================
// LOAD DRAFT
// ===============================

function loadDraft() {
  const saved = localStorage.getItem(
    "seikoStudioDraft"
  );

  if (!saved) {
    return;
  }

  try {
    const data = JSON.parse(saved);

    const fields = [
      "title",
      "subtitle",
      "description",
      "slogan",
      "business",
      "whatsapp",
      "instagram",
      "tiktok",
      "youtube",
      "address",
      "size",
      "colors",
      "theme",
      "instructions",
      "promptOutput"
    ];

    fields.forEach((field) => {
      if (
        $(field) &&
        data[field] !== undefined
      ) {
        $(field).value = data[field];
      }
    });

    if (data.orientation) {
      orientation = data.orientation;

      document
        .querySelectorAll(".orientation-btn")
        .forEach((btn) => {
          btn.classList.toggle(
            "active",
            btn.dataset.value === orientation
          );
        });
    }
  } catch (error) {
    console.log(
      "Draft tidak dapat dibaca.",
      error
    );
  }
}

// ===============================
// VISION
// ===============================

if ($("visionBtn")) {
  $("visionBtn").addEventListener(
    "click",
    () => {
      const visionInput = $("vision");

      if (!visionInput) {
        return;
      }

      const file = visionInput.files[0];

      if (!file) {
        alert(
          "Pilih gambar terlebih dahulu."
        );
        return;
      }

      if ($("visionStatus")) {
        $("visionStatus").textContent =
          "✓ Gambar diterima. Siap digunakan untuk analisis desain.";
      }
    }
  );
}

// ===============================
// AUDIO RECORDING
// ===============================

if ($("recordBtn")) {
  $("recordBtn").addEventListener(
    "click",
    async () => {

      if (!mediaRecorder) {
        try {
          if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
          ) {
            alert(
              "Browser ini tidak mendukung rekaman mikrofon."
            );
            return;
          }

          const stream =
            await navigator.mediaDevices.getUserMedia({
              audio: true
            });

          mediaRecorder =
            new MediaRecorder(stream);

          audioChunks = [];

          mediaRecorder.ondataavailable =
            (event) => {
              audioChunks.push(
                event.data
              );
            };

          mediaRecorder.onstop = () => {
            const audioBlob =
              new Blob(
                audioChunks,
                {
                  type: "audio/webm"
                }
              );

            const audioUrl =
              URL.createObjectURL(
                audioBlob
              );

            if ($("recordStatus")) {
              $("recordStatus").innerHTML = "";

              const audio =
                document.createElement(
                  "audio"
                );

              audio.controls = true;
              audio.src = audioUrl;

              $("recordStatus")
                .appendChild(audio);
            }

            stream
              .getTracks()
              .forEach((track) =>
                track.stop()
              );

            mediaRecorder = null;
          };

          mediaRecorder.start();

          $("recordBtn").textContent =
            "⏹️ Stop Rekaman";

          if ($("recordStatus")) {
            $("recordStatus").textContent =
              "Sedang merekam...";
          }

        } catch (error) {
          alert(
            "Izin mikrofon diperlukan untuk menggunakan fitur rekaman."
          );
        }

      } else {
        mediaRecorder.stop();

        $("recordBtn").textContent =
          "🎙️ Mulai Rekam";

        if ($("recordStatus")) {
          $("recordStatus").textContent =
            "Rekaman selesai.";
        }
      }
    }
  );
}

// ===============================
// EXPORT SVG
// ===============================

if ($("downloadBtn")) {
  $("downloadBtn").addEventListener(
    "click",
    () => {

      const title = getValue(
        "title",
        "seiko-studio-design"
      );

      const description = getValue(
        "description"
      );

      const safeFileName =
        title
          .replace(
            /[^a-z0-9]/gi,
            "-"
          )
          .replace(
            /-+/g,
            "-"
          );

      const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1600"
  height="900"
  viewBox="0 0 1600 900">

  <rect
    width="1600"
    height="900"
    fill="#111111"/>

  <text
    x="100"
    y="130"
    fill="#aaaaaa"
    font-size="28"
    font-family="Arial">
    SEIKO STUDIO
  </text>

  <text
    x="100"
    y="350"
    fill="white"
    font-size="100"
    font-weight="bold"
    font-family="Arial">
    ${escapeXML(title)}
  </text>

  <text
    x="100"
    y="440"
    fill="#dddddd"
    font-size="36"
    font-family="Arial">
    ${escapeXML(description)}
  </text>

</svg>
`;

      const blob =
        new Blob(
          [svg],
          {
            type:
              "image/svg+xml"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${safeFileName || "seiko-studio-design"}.svg`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }
  );
}

// ===============================
// SECURITY HELPERS
// ===============================

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

// ===============================
// START
// ===============================

loadDraft();
updateCredits();
