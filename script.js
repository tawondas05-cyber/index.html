document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // STATE
  // =========================

  const state = {
    product: "banner",
    orientation: "landscape",
    colorMode: "CMYK",
    size: "",
    color: "blue",
    theme: "modern"
  };


  // =========================
  // PRODUCT
  // =========================

  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach(card => {

    card.addEventListener("click", () => {

      productCards.forEach(item => {
        item.classList.remove("active");
      });

      card.classList.add("active");

      state.product = card.dataset.product;

    });

  });


  // =========================
  // ORIENTATION
  // =========================

  const orientationButtons =
    document.querySelectorAll(".option-button");

  orientationButtons.forEach(button => {

    button.addEventListener("click", () => {

      orientationButtons.forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      state.orientation =
        button.dataset.orientation;

    });

  });


  // =========================
  // COLOR MODE
  // =========================

  const colorModeButtons =
    document.querySelectorAll(".color-mode-button");

  colorModeButtons.forEach(button => {

    button.addEventListener("click", () => {

      colorModeButtons.forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      state.colorMode =
        button.dataset.colorMode;

    });

  });


  // =========================
  // SIZE
  // =========================

  const sizeInput =
    document.getElementById("designSize");

  if (sizeInput) {

    sizeInput.addEventListener("input", () => {

      state.size = sizeInput.value;

    });

  }


  // =========================
  // COLOR
  // =========================

  const mainColor =
    document.getElementById("mainColor");

  if (mainColor) {

    mainColor.addEventListener("change", () => {

      state.color = mainColor.value;

    });

  }


  // =========================
  // THEME
  // =========================

  const designTheme =
    document.getElementById("designTheme");

  if (designTheme) {

    designTheme.addEventListener("change", () => {

      state.theme = designTheme.value;

    });

  }


  // =========================
  // CONTINUE BUTTON
  // =========================

  const continueButton =
    document.getElementById("continueButton");

  if (continueButton) {

    continueButton.addEventListener("click", () => {

      state.size =
        sizeInput ? sizeInput.value.trim() : "";

      state.color =
        mainColor ? mainColor.value : "blue";

      state.theme =
        designTheme ? designTheme.value : "modern";


      if (!state.size) {

        alert(
          "Silakan masukkan ukuran desain terlebih dahulu."
        );

        if (sizeInput) {
          sizeInput.focus();
        }

        return;
      }


      // Simpan konfigurasi
      localStorage.setItem(
        "seikoStudioConfig",
        JSON.stringify(state)
      );


      alert(
        "Pengaturan desain tersimpan.\n\n" +
        "Produk: " + getProductName(state.product) + "\n" +
        "Ukuran: " + state.size + "\n" +
        "Orientasi: " + capitalize(state.orientation) + "\n" +
        "Mode warna: " + state.colorMode + "\n" +
        "Tema: " + getThemeName(state.theme)
      );

    });

  }


  // =========================
  // PRODUCT NAME
  // =========================

  function getProductName(product) {

    const names = {

      banner: "Banner / Spanduk",

      poster: "Poster",

      idcard: "ID Card",

      businesscard: "Kartu Nama",

      flyer: "Flyer",

      brochure: "Brosur",

      sticker: "Stiker",

      certificate: "Sertifikat",

      shirt: "Kaos",

      social: "Sosial Media",

      custom: "Custom"

    };

    return names[product] || "Custom";

  }


  // =========================
  // THEME NAME
  // =========================

  function getThemeName(theme) {

    const names = {

      modern: "Modern",

      professional: "Profesional",

      minimalist: "Minimalis",

      elegant: "Elegan",

      bold: "Bold / Berani",

      colorful: "Colorful",

      islamic: "Islami",

      corporate: "Corporate"

    };

    return names[theme] || "Modern";

  }


  // =========================
  // CAPITALIZE
  // =========================

  function capitalize(value) {

    if (!value) return "";

    return value.charAt(0).toUpperCase()
      + value.slice(1);

  }


  // =========================
  // LOAD SAVED CONFIG
  // =========================

  const saved =
    localStorage.getItem("seikoStudioConfig");

  if (saved) {

    try {

      const config = JSON.parse(saved);

      if (config.product) {

        state.product = config.product;

        productCards.forEach(card => {

          card.classList.toggle(
            "active",
            card.dataset.product === config.product
          );

        });

      }


      if (config.orientation) {

        state.orientation =
          config.orientation;

        orientationButtons.forEach(button => {

          button.classList.toggle(
            "active",
            button.dataset.orientation ===
            config.orientation
          );

        });

      }


      if (config.colorMode) {

        state.colorMode =
          config.colorMode;

        colorModeButtons.forEach(button => {

          button.classList.toggle(
            "active",
            button.dataset.colorMode ===
            config.colorMode
          );

        });

      }


      if (sizeInput && config.size) {
        sizeInput.value = config.size;
      }


      if (mainColor && config.color) {
        mainColor.value = config.color;
      }


      if (designTheme && config.theme) {
        designTheme.value = config.theme;
      }

    } catch (error) {

      console.warn(
        "Konfigurasi lama tidak dapat dibaca."
      );

    }

  }

});
