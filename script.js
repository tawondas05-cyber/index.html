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

  localStorage.setItem(
    "seikoCredits",
    credits
  );

  updateCredits();

  return true;
}

// ===============================
// ORIENTATION
// ===============================

document.querySelectorAll(".orientation-btn").forEach(button => {
  button.addEventListener("click", () => {

    document.querySelectorAll(".orientation-btn")
      .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    orientation = button.dataset.value;
  });
});

// ===============================
// IMAGE UPLOAD
// ===============================

$("images").addEventListener("change", function () {

  const preview = $("preview");

  preview.innerHTML = "";

  [...this.files].forEach(file => {

    const reader = new FileReader();

    reader.onload = event => {

      const img = document.createElement("img");

      img.src = event.target.result;

      preview.appendChild(img);
    };

    reader.readAsDataURL(file);
  });
});

// ===============================
// GENERATE PROMPT
// ===============================

$("generatePrompt").addEventListener("click", () => {

  // 5 kredit setiap generate
  if (!useCredits(5)) {
    return;
  }

  const prompt = createPrompt();

  $("promptOutput").value = prompt;

  createDesign(prompt);
});

// ===============================
// CREATE PROMPT
// ===============================

function createPrompt() {

  const title =
    $("title").value || "Desain promosi";

  const subtitle =
    $("subtitle").value || "";

  const description =
    $("description").value || "";

  const slogan =
    $("slogan").value || "";

  const business =
    $("business").value || "";

  const whatsapp =
    $("whatsapp").value || "";

  const instagram =
    $("instagram").value || "";

  const address =
    $("address").value || "";

  const size =
    $("size").value || "Ukuran belum ditentukan";

  const colors =
    $("colors").value || "Warna bebas";

  const theme =
    $("theme").value;

  const instructions =
    $("instructions").value || "";

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

Spesifikasi:
Ukuran: ${size}
Orientasi: ${orientation}
Warna dominan: ${colors}
Tema: ${theme}

Instruksi tambahan:
${instructions}

Arahan desain:
- Buat layout yang rapi dan profesional
- Judul utama harus mudah dibaca
- Gunakan hierarki visual yang jelas
- Sesuaikan desain dengan ukuran yang diberikan
- Gunakan warna yang harmonis
- Sisakan ruang yang cukup
- Pastikan informasi penting mudah dibaca
- Cocok untuk kebutuhan cetak
`;
}

// ===============================
// CREATE DESIGN PREVIEW
// ===============================

function createDesign(prompt) {

  const title =
    $("title").value || "DESAIN SEIKO STUDIO";

  const description =
    $("description").value ||
    "Preview desain hasil AI akan muncul di area ini.";

  $("designResult").innerHTML = `
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
        ${escapeHTML($("whatsapp").value || "")}

        ${
          $("instagram").value
            ? " • " + escapeHTML($("instagram").value)
            : ""
        }
      </div>

    </div>
  `;
}

// ===============================
// REVISION
// ===============================

$("revisionBtn").addEventListener("click", () => {

  const revision =
    $("revision").value.trim();

  if (!revision) {
    alert("Tulis instruksi revisi terlebih dahulu.");
    return;
  }

  if (!useCredits(5)) {
    return;
  }

  version++;

  const currentPrompt =
    $("promptOutput").value;

  $("promptOutput").value =
    currentPrompt +
    `

REVISI VERSI ${version}:
${revision}`;

  createDesign(
    $("promptOutput").value
  );

  $("revision").value = "";
});

// ===============================
// SAVE DRAFT
// ===============================

$("saveBtn").addEventListener("click", () => {

  const data = {

    title: $("title").value,

    subtitle: $("subtitle").value,

    description: $("description").value,

    slogan: $("slogan").value,

    business: $("business").value,

    whatsapp: $("whatsapp").value,

    instagram: $("instagram").value,

    tiktok: $("tiktok").value,

    youtube: $("youtube").value,

    address: $("address").value,

    size: $("size").value,

    colors: $("colors").value,

    theme: $("theme").value,

    instructions:
      $("instructions").value,

    prompt:
      $("promptOutput").value,

    orientation
  };

  localStorage.setItem(
    "seikoStudioDraft",
    JSON.stringify(data)
  );

  alert(
    "Draft berhasil disimpan di perangkat ini."
  );
});

// ===============================
// LOAD DRAFT
// ===============================

function loadDraft() {

  const saved =
    localStorage.getItem(
      "seikoStudioDraft"
    );

  if (!saved) return;

  try {

    const data =
      JSON.parse(saved);

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

    fields.forEach(field => {

      if (
        $(field) &&
        data[field] !== undefined
      ) {

        $(field).value =
          data[field];
      }

    });

    if (data.orientation) {

      orientation =
        data.orientation;

      document
        .querySelectorAll(
          ".orientation-btn"
        )
        .forEach(btn => {

          btn.classList.toggle(
            "active",
            btn.dataset.value ===
              orientation
          );

        });
    }

  } catch (error) {

    console.log(
      "Draft tidak dapat dibaca."
    );

  }
}

// ===============================
// VISION
// ===============================

$("visionBtn").addEventListener(
  "click",
  () => {

    const file =
      $("vision").files[0];

    if (!file) {

      alert(
        "Pilih gambar terlebih dahulu."
      );

      return;
    }

    $("visionStatus").textContent =
      "✓ Gambar diterima. Pada versi AI nanti gambar akan dianalisis otomatis.";

  }
);

// ===============================
// AUDIO RECORDING
// ===============================

$("recordBtn").addEventListener(
  "click",
  async () => {

    if (!mediaRecorder) {

      try {

        const stream =
          await navigator.mediaDevices
            .getUserMedia({
              audio: true
            });

        mediaRecorder =
          new MediaRecorder(stream);

        audioChunks = [];

        mediaRecorder.ondataavailable =
          event => {

            audioChunks.push(
              event.data
            );

          };

        mediaRecorder.onstop =
          () => {

            const audioBlob =
              new Blob(
                audioChunks,
                {
                  type:
                    "audio/webm"
                }
              );

            const audioUrl =
              URL.createObjectURL(
                audioBlob
              );

            const audio =
              document.createElement(
                "audio"
              );

            audio.controls = true;

            audio.src =
              audioUrl;

            $("recordStatus")
              .innerHTML = "";

            $("recordStatus")
              .appendChild(
                audio
              );

            mediaRecorder =
              null;

          };

        mediaRecorder.start();

        $("recordBtn")
          .textContent =
          "⏹️ Stop Rekaman";

        $("recordStatus")
          .textContent =
          "Sedang merekam...";

      } catch (error) {

        alert(
          "Izin mikrofon diperlukan untuk menggunakan fitur rekaman."
        );

      }

    } else {

      mediaRecorder.stop();

      $("recordBtn")
        .textContent =
        "🎙️ Mulai Rekam";

      $("recordStatus")
        .textContent =
        "Rekaman selesai.";

    }

  }
);

// ===============================
// EXPORT SVG
// ===============================

$("downloadBtn").addEventListener(
  "click",
  () => {

    const title =
      $("title").value ||
      "seiko-studio-design";

    const description =
      $("description").value ||
      "";

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
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `${title.replace(
        /[^a-z0-9]/gi,
        "-"
      )}.svg`;

    link.click();

    URL.revokeObjectURL(
      url
    );

  }
);

// ===============================
// SECURITY HELPERS
// ===============================

function escapeHTML(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );
}

function escapeXML(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&apos;"
    );
}

// ===============================
// START
// ===============================

loadDraft();

updateCredits();const $ = (id) => document.getElementById(id);

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

  localStorage.setItem(
    "seikoCredits",
    credits
  );

  updateCredits();

  return true;
}

// ===============================
// ORIENTATION
// ===============================

document.querySelectorAll(".orientation-btn").forEach(button => {
  button.addEventListener("click", () => {

    document.querySelectorAll(".orientation-btn")
      .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    orientation = button.dataset.value;
  });
});

// ===============================
// IMAGE UPLOAD
// ===============================

$("images").addEventListener("change", function () {

  const preview = $("preview");

  preview.innerHTML = "";

  [...this.files].forEach(file => {

    const reader = new FileReader();

    reader.onload = event => {

      const img = document.createElement("img");

      img.src = event.target.result;

      preview.appendChild(img);
    };

    reader.readAsDataURL(file);
  });
});

// ===============================
// GENERATE PROMPT
// ===============================

$("generatePrompt").addEventListener("click", () => {

  // 5 kredit setiap generate
  if (!useCredits(5)) {
    return;
  }

  const prompt = createPrompt();

  $("promptOutput").value = prompt;

  createDesign(prompt);
});

// ===============================
// CREATE PROMPT
// ===============================

function createPrompt() {

  const title =
    $("title").value || "Desain promosi";

  const subtitle =
    $("subtitle").value || "";

  const description =
    $("description").value || "";

  const slogan =
    $("slogan").value || "";

  const business =
    $("business").value || "";

  const whatsapp =
    $("whatsapp").value || "";

  const instagram =
    $("instagram").value || "";

  const address =
    $("address").value || "";

  const size =
    $("size").value || "Ukuran belum ditentukan";

  const colors =
    $("colors").value || "Warna bebas";

  const theme =
    $("theme").value;

  const instructions =
    $("instructions").value || "";

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

Spesifikasi:
Ukuran: ${size}
Orientasi: ${orientation}
Warna dominan: ${colors}
Tema: ${theme}

Instruksi tambahan:
${instructions}

Arahan desain:
- Buat layout yang rapi dan profesional
- Judul utama harus mudah dibaca
- Gunakan hierarki visual yang jelas
- Sesuaikan desain dengan ukuran yang diberikan
- Gunakan warna yang harmonis
- Sisakan ruang yang cukup
- Pastikan informasi penting mudah dibaca
- Cocok untuk kebutuhan cetak
`;
}

// ===============================
// CREATE DESIGN PREVIEW
// ===============================

function createDesign(prompt) {

  const title =
    $("title").value || "DESAIN SEIKO STUDIO";

  const description =
    $("description").value ||
    "Preview desain hasil AI akan muncul di area ini.";

  $("designResult").innerHTML = `
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
        ${escapeHTML($("whatsapp").value || "")}

        ${
          $("instagram").value
            ? " • " + escapeHTML($("instagram").value)
            : ""
        }
      </div>

    </div>
  `;
}

// ===============================
// REVISION
// ===============================

$("revisionBtn").addEventListener("click", () => {

  const revision =
    $("revision").value.trim();

  if (!revision) {
    alert("Tulis instruksi revisi terlebih dahulu.");
    return;
  }

  if (!useCredits(5)) {
    return;
  }

  version++;

  const currentPrompt =
    $("promptOutput").value;

  $("promptOutput").value =
    currentPrompt +
    `

REVISI VERSI ${version}:
${revision}`;

  createDesign(
    $("promptOutput").value
  );

  $("revision").value = "";
});

// ===============================
// SAVE DRAFT
// ===============================

$("saveBtn").addEventListener("click", () => {

  const data = {

    title: $("title").value,

    subtitle: $("subtitle").value,

    description: $("description").value,

    slogan: $("slogan").value,

    business: $("business").value,

    whatsapp: $("whatsapp").value,

    instagram: $("instagram").value,

    tiktok: $("tiktok").value,

    youtube: $("youtube").value,

    address: $("address").value,

    size: $("size").value,

    colors: $("colors").value,

    theme: $("theme").value,

    instructions:
      $("instructions").value,

    prompt:
      $("promptOutput").value,

    orientation
  };

  localStorage.setItem(
    "seikoStudioDraft",
    JSON.stringify(data)
  );

  alert(
    "Draft berhasil disimpan di perangkat ini."
  );
});

// ===============================
// LOAD DRAFT
// ===============================

function loadDraft() {

  const saved =
    localStorage.getItem(
      "seikoStudioDraft"
    );

  if (!saved) return;

  try {

    const data =
      JSON.parse(saved);

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

    fields.forEach(field => {

      if (
        $(field) &&
        data[field] !== undefined
      ) {

        $(field).value =
          data[field];
      }

    });

    if (data.orientation) {

      orientation =
        data.orientation;

      document
        .querySelectorAll(
          ".orientation-btn"
        )
        .forEach(btn => {

          btn.classList.toggle(
            "active",
            btn.dataset.value ===
              orientation
          );

        });
    }

  } catch (error) {

    console.log(
      "Draft tidak dapat dibaca."
    );

  }
}

// ===============================
// VISION
// ===============================

$("visionBtn").addEventListener(
  "click",
  () => {

    const file =
      $("vision").files[0];

    if (!file) {

      alert(
        "Pilih gambar terlebih dahulu."
      );

      return;
    }

    $("visionStatus").textContent =
      "✓ Gambar diterima. Pada versi AI nanti gambar akan dianalisis otomatis.";

  }
);

// ===============================
// AUDIO RECORDING
// ===============================

$("recordBtn").addEventListener(
  "click",
  async () => {

    if (!mediaRecorder) {

      try {

        const stream =
          await navigator.mediaDevices
            .getUserMedia({
              audio: true
            });

        mediaRecorder =
          new MediaRecorder(stream);

        audioChunks = [];

        mediaRecorder.ondataavailable =
          event => {

            audioChunks.push(
              event.data
            );

          };

        mediaRecorder.onstop =
          () => {

            const audioBlob =
              new Blob(
                audioChunks,
                {
                  type:
                    "audio/webm"
                }
              );

            const audioUrl =
              URL.createObjectURL(
                audioBlob
              );

            const audio =
              document.createElement(
                "audio"
              );

            audio.controls = true;

            audio.src =
              audioUrl;

            $("recordStatus")
              .innerHTML = "";

            $("recordStatus")
              .appendChild(
                audio
              );

            mediaRecorder =
              null;

          };

        mediaRecorder.start();

        $("recordBtn")
          .textContent =
          "⏹️ Stop Rekaman";

        $("recordStatus")
          .textContent =
          "Sedang merekam...";

      } catch (error) {

        alert(
          "Izin mikrofon diperlukan untuk menggunakan fitur rekaman."
        );

      }

    } else {

      mediaRecorder.stop();

      $("recordBtn")
        .textContent =
        "🎙️ Mulai Rekam";

      $("recordStatus")
        .textContent =
        "Rekaman selesai.";

    }

  }
);

// ===============================
// EXPORT SVG
// ===============================

$("downloadBtn").addEventListener(
  "click",
  () => {

    const title =
      $("title").value ||
      "seiko-studio-design";

    const description =
      $("description").value ||
      "";

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
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `${title.replace(
        /[^a-z0-9]/gi,
        "-"
      )}.svg`;

    link.click();

    URL.revokeObjectURL(
      url
    );

  }
);

// ===============================
// SECURITY HELPERS
// ===============================

function escapeHTML(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );
}

function escapeXML(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&apos;"
    );
}

// ===============================
// START
// ===============================

loadDraft();

updateCredits();
