* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #f5f7fb;
  --card: #ffffff;
  --text: #172033;
  --muted: #718096;
  --line: #e5e9f2;
  --primary: #3157ff;
  --primary-dark: #2444d8;
  --soft: #eef2ff;
  --success: #16a36a;
  --radius: 20px;
  --shadow: 0 12px 35px rgba(20, 35, 70, .08);
}

html {
  scroll-behavior: smooth;
}

body {
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  background:
    radial-gradient(
      circle at top right,
      #e9edff 0,
      transparent 35%
    ),
    var(--bg);

  color: var(--text);
  line-height: 1.5;
}


/* =====================================================
   TOP BAR
===================================================== */

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;

  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 14px 5%;

  background: rgba(255, 255, 255, .92);
  backdrop-filter: blur(18px);

  border-bottom: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 43px;
  height: 43px;

  display: grid;
  place-items: center;

  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      #3157ff,
      #6d5dfc
    );

  color: white;
  font-size: 21px;
  font-weight: 900;

  box-shadow:
    0 8px 20px rgba(49, 87, 255, .25);
}

.brand h1 {
  font-size: 18px;
  line-height: 1.1;
}

.brand span {
  display: block;

  margin-top: 3px;

  font-size: 11px;
  color: var(--muted);
  font-weight: 600;
}

.credit-box {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 8px 12px;

  border: 1px solid var(--line);
  border-radius: 999px;

  background: white;

  font-size: 12px;
}

.credit-box span {
  color: var(--muted);
}

.credit-box strong {
  color: var(--primary);
}


/* =====================================================
   CONTAINER
===================================================== */

.container {
  width: min(1120px, 92%);
  margin: auto;
}


/* =====================================================
   HERO
===================================================== */

.hero {
  padding: 70px 0 45px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;

  padding: 7px 13px;

  border-radius: 999px;

  background: var(--soft);
  color: var(--primary);

  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
}

.hero h2 {
  margin-top: 18px;

  font-size:
    clamp(38px, 7vw, 72px);

  line-height: .98;

  letter-spacing: -.055em;
}

.hero h2 span {
  color: var(--primary);
}

.hero p {
  max-width: 650px;

  margin: 22px auto 0;

  color: var(--muted);

  font-size: 16px;
}


/* =====================================================
   CARD
===================================================== */

.card {
  display: flex;
  gap: 25px;

  margin-bottom: 22px;
  padding: 28px;

  background: var(--card);

  border: 1px solid var(--line);
  border-radius: var(--radius);

  box-shadow: var(--shadow);
}

.section-number {
  flex: 0 0 42px;

  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  border-radius: 13px;

  background: #f0f3f9;

  color: var(--primary);

  font-size: 13px;
  font-weight: 900;
}

.section-content {
  flex: 1;
  min-width: 0;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 15px;

  margin-bottom: 24px;
}

.section-title h3,
.design-header h3 {
  font-size: 21px;
  letter-spacing: -.025em;
}

.section-title p,
.design-header p {
  margin-top: 5px;

  color: var(--muted);
  font-size: 13px;
}


/* =====================================================
   PRODUCT
===================================================== */

.product-grid {
  display: grid;

  grid-template-columns:
    repeat(auto-fit, minmax(145px, 1fr));

  gap: 12px;
}

.product-btn {
  min-height: 110px;

  padding: 15px;

  text-align: left;

  border: 1px solid var(--line);
  border-radius: 15px;

  background: white;

  cursor: pointer;

  transition:
    .2s ease;
}

.product-btn:hover {
  transform: translateY(-2px);

  border-color: #b8c4ff;

  box-shadow:
    0 8px 20px rgba(49, 87, 255, .08);
}

.product-btn.active {
  border-color: var(--primary);

  background:
    linear-gradient(
      145deg,
      #f0f3ff,
      #ffffff
    );

  box-shadow:
    inset 0 0 0 1px var(--primary);
}

.product-icon {
  display: block;

  margin-bottom: 12px;

  color: var(--primary);

  font-size: 22px;
  font-weight: 900;
}

.product-btn strong {
  display: block;
  font-size: 14px;
}

.product-btn small {
  display: block;

  margin-top: 3px;

  color: var(--muted);

  font-size: 11px;
}


/* =====================================================
   FORM
===================================================== */

.field-label,
.field label,
.design-brief-result label,
.revision-box label {
  display: block;

  margin-bottom: 8px;

  font-size: 12px;
  font-weight: 800;
}

.large-input,
.field input,
.field select,
.revision-row input {

  width: 100%;

  border: 1px solid var(--line);
  border-radius: 12px;

  background: #fbfcff;

  color: var(--text);

  outline: none;

  transition: .2s ease;
}

.large-input {
  min-height: 145px;

  padding: 15px;

  resize: vertical;

  font: inherit;
}

.field input,
.field select,
.revision-row input {
  height: 47px;

  padding: 0 13px;

  font: inherit;
  font-size: 13px;
}

.large-input:focus,
.field input:focus,
.field select:focus,
.revision-row input:focus {

  border-color: var(--primary);

  background: white;

  box-shadow:
    0 0 0 4px rgba(49, 87, 255, .08);
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 18px;
}

.field {
  min-width: 0;
}


/* =====================================================
   QUICK TAGS
===================================================== */

.quick-tags {
  display: flex;
  flex-wrap: wrap;

  gap: 8px;

  margin-top: 12px;
}

.quick-tag {
  border: 1px solid var(--line);

  padding: 7px 11px;

  border-radius: 999px;

  background: white;

  color: var(--muted);

  font-size: 11px;
  font-weight: 700;

  cursor: pointer;

  transition: .2s ease;
}

.quick-tag:hover {
  color: var(--primary);

  border-color: #b8c4ff;

  background: var(--soft);
}


/* =====================================================
   PRODUCT OPTIONS
===================================================== */

.product-options {
  margin-top: 25px;

  padding-top: 22px;

  border-top: 1px solid var(--line);
}

.product-option-title {
  margin-bottom: 17px;

  font-size: 13px;
  font-weight: 900;
}


/* =====================================================
   ORIENTATION
===================================================== */

.orientation-buttons {
  display: flex;
  gap: 8px;
}

.orientation-btn {
  flex: 1;

  height: 47px;

  border: 1px solid var(--line);
  border-radius: 12px;

  background: white;

  color: var(--muted);

  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
}

.orientation-btn.active {
  border-color: var(--primary);

  background: var(--soft);

  color: var(--primary);
}


/* =====================================================
   UPLOAD
===================================================== */

.upload-area {
  display: grid;

  grid-template-columns:
    minmax(200px, 280px)
    1fr;

  gap: 15px;
}

.upload-box {

  min-height: 180px;

  display: flex;

  flex-direction: column;

  justify-content: center;
  align-items: center;

  text-align: center;

  padding: 20px;

  border: 2px dashed #ccd4e5;

  border-radius: 17px;

  background: #fafbfe;

  cursor: pointer;

  transition: .2s ease;
}

.upload-box:hover {
  border-color: var(--primary);

  background: var(--soft);
}

.upload-icon {
  width: 48px;
  height: 48px;

  display: grid;
  place-items: center;

  margin-bottom: 10px;

  border-radius: 14px;

  background: var(--soft);

  color: var(--primary);

  font-size: 26px;
}

.upload-box strong {
  font-size: 13px;
}

.upload-box small {
  margin-top: 4px;

  color: var(--muted);

  font-size: 11px;
}

.upload-preview {

  min-height: 180px;

  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;

  gap: 10px;

  padding: 12px;

  border: 1px solid var(--line);

  border-radius: 17px;

  background: #fafbfe;

  overflow: hidden;
}

.empty-preview {
  width: 100%;

  display: grid;
  place-items: center;

  min-height: 150px;

  color: var(--muted);

  font-size: 12px;
}

.preview-image {
  width: 100px;
  height: 100px;

  object-fit: cover;

  border-radius: 12px;

  border: 1px solid var(--line);
}


/* =====================================================
   AI DESIGNER
===================================================== */

.ai-card {
  border-color: #dbe1ff;

  background:
    linear-gradient(
      145deg,
      #ffffff,
      #f7f8ff
    );
}

.ai-status {
  padding: 6px 10px;

  border-radius: 999px;

  background: #eaf9f3;

  color: var(--success);

  font-size: 9px;
  font-weight: 900;

  letter-spacing: .08em;
}

.ai-actions {
  display: flex;
  flex-wrap: wrap;

  gap: 10px;

  margin-bottom: 15px;
}

.primary-btn,
.secondary-btn {

  min-height: 45px;

  padding: 0 17px;

  border-radius: 12px;

  font-size: 12px;
  font-weight: 800;

  cursor: pointer;

  transition: .2s ease;
}

.primary-btn {

  border: none;

  background:
    linear-gradient(
      135deg,
      var(--primary),
      #6c5dfc
    );

  color: white;

  box-shadow:
    0 8px 18px rgba(49, 87, 255, .22);
}

.primary-btn:hover {
  transform: translateY(-1px);

  box-shadow:
    0 11px 24px rgba(49, 87, 255, .28);
}

.secondary-btn {

  border: 1px solid var(--line);

  background: white;

  color: var(--text);
}

.secondary-btn:hover {

  border-color: #b8c4ff;

  color: var(--primary);

  background: var(--soft);
}

.status-message {

  min-height: 20px;

  color: var(--muted);

  font-size: 11px;
}

.design-brief-result {
  margin-top: 14px;
}

.prompt-output {

  min-height: 95px;

  padding: 15px;

  border: 1px solid var(--line);

  border-radius: 13px;

  background: white;

  color: #4b5568;

  font-size: 13px;

  white-space: pre-wrap;
}


/* =====================================================
   DESIGN RESULT
===================================================== */

.design-header {

  display: flex;

  justify-content: space-between;
  align-items: center;

  gap: 20px;

  margin-bottom: 20px;
}

.version-label {

  display: flex;
  align-items: center;

  gap: 7px;

  padding: 7px 10px;

  border-radius: 9px;

  background: #f0f3f9;
}

.version-label span {

  color: var(--muted);

  font-size: 9px;
  font-weight: 800;
}

.version-label strong {

  color: var(--primary);

  font-size: 12px;
}

.design-result {

  min-height: 450px;

  display: grid;
  place-items: center;

  padding: 20px;

  border: 1px solid var(--line);

  border-radius: 18px;

  background:
    linear-gradient(
      45deg,
      #f5f6fa 25%,
      transparent 25%
    ),
    linear-gradient(
      -45deg,
      #f5f6fa 25%,
      transparent 25%
    ),
    linear-gradient(
      45deg,
      transparent 75%,
      #f5f6fa 75%
    ),
    linear-gradient(
      -45deg,
      transparent 75%,
      #f5f6fa 75%
    );

  background-size: 22px 22px;
  background-position:
    0 0,
    0 11px,
    11px -11px,
    -11px 0;

  overflow: auto;
}

.design-placeholder {
  text-align: center;

  padding: 40px;
}

.placeholder-icon {

  width: 65px;
  height: 65px;

  display: grid;
  place-items: center;

  margin: 0 auto 15px;

  border-radius: 20px;

  background: var(--soft);

  color: var(--primary);

  font-size: 30px;
}

.design-placeholder h4 {
  font-size: 16px;
}

.design-placeholder p {

  margin-top: 6px;

  color: var(--muted);

  font-size: 12px;
}


/* =====================================================
   REVISION
===================================================== */

.revision-box {

  margin-top: 20px;
}

.revision-row {

  display: flex;

  gap: 9px;
}

.revision-row input {
  flex: 1;
}

.revision-row .secondary-btn {
  flex-shrink: 0;
}


/* =====================================================
   DESIGN ACTIONS
===================================================== */

.design-actions {

  display: flex;
  justify-content: flex-end;

  gap: 10px;

  margin-top: 15px;
}


/* =====================================================
   PREPRESS
===================================================== */

.prepress-grid {

  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 12px;
}

.check-item {

  display: flex;

  gap: 10px;

  padding: 13px;

  border: 1px solid var(--line);

  border-radius: 13px;

  background: #fbfcff;
}

.check-icon {

  width: 25px;
  height: 25px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: #eaf9f3;

  color: var(--success);

  font-size: 12px;
  font-weight: 900;
}

.check-item strong {

  display: block;

  font-size: 11px;
}

.check-item small {

  display: block;

  margin-top: 3px;

  color: var(--muted);

  font-size: 9px;
}


/* =====================================================
   FOOTER
===================================================== */

footer {

  display: flex;

  justify-content: center;
  align-items: center;

  gap: 10px;

  flex-wrap: wrap;

  padding: 40px 0 60px;

  color: var(--muted);

  font-size: 11px;
}

footer strong {
  color: var(--text);
}

footer small {
  width: 100%;
  text-align: center;
}


/* =====================================================
   RESPONSIVE TABLET
===================================================== */

@media (max-width: 850px) {

  .card {
    padding: 22px;
  }

  .prepress-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

}


/* =====================================================
   RESPONSIVE MOBILE
===================================================== */

@media (max-width: 650px) {

  .topbar {
    padding: 11px 4%;
  }

  .brand h1 {
    font-size: 15px;
  }

  .brand span {
    font-size: 9px;
  }

  .brand-logo {
    width: 38px;
    height: 38px;
  }

  .credit-box {
    padding: 7px 9px;
  }

  .hero {
    padding: 50px 0 30px;
  }

  .hero h2 {
    font-size: 42px;
  }

  .hero p {
    font-size: 14px;
  }

  .card {

    display: block;

    padding: 18px;

    border-radius: 17px;
  }

  .section-number {

    margin-bottom: 15px;
  }

  .section-title h3,
  .design-header h3 {
    font-size: 18px;
  }

  .product-grid {

    grid-template-columns:
      repeat(2, 1fr);

  }

  .product-btn {
    min-height: 105px;
  }

  .form-grid {

    grid-template-columns: 1fr;

  }

  .upload-area {

    grid-template-columns: 1fr;

  }

  .upload-box {
    min-height: 150px;
  }

  .upload-preview {
    min-height: 130px;
  }

  .ai-actions {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }

  .design-result {
    min-height: 330px;
    padding: 10px;
  }

  .design-header {
    align-items: flex-start;
  }

  .revision-row {
    flex-direction: column;
  }

  .revision-row input {
    min-height: 45px;
  }

  .design-actions {
    flex-direction: column;
  }

  .prepress-grid {
    grid-template-columns: 1fr;
  }

}


/* =====================================================
   VERY SMALL SCREEN
===================================================== */

@media (max-width: 390px) {

  .hero h2 {
    font-size: 36px;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .credit-box span {
    display: none;
  }

}
