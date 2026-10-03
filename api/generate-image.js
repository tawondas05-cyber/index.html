// ============================================================
// SEIKO STUDIO — UNIVERSAL AI IMAGE BACKEND
// VERCEL SERVERLESS FUNCTION
// ============================================================

export default async function handler(req, res) {

  // ----------------------------------------------------------
  // CORS
  // ----------------------------------------------------------

  res.setHeader(
    'Access-Control-Allow-Origin',
    '*'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed.'
    });
  }


  // ----------------------------------------------------------
  // REQUEST
  // ----------------------------------------------------------

  try {

    const body = req.body || {};

    const provider =
      String(body.provider || '').trim();

    const model =
      String(body.model || '').trim();

    const prompt =
      String(body.prompt || '').trim();

    const images =
      Array.isArray(body.images)
        ? body.images
        : [];

    const mode =
      String(body.mode || 'Text→Image');

    const designData =
      body.designData || {};


    if (!prompt) {

      return res.status(400).json({
        success: false,
        error: 'Prompt kosong.'
      });

    }


    // --------------------------------------------------------
    // LOCAL PREVIEW
    // --------------------------------------------------------

    if (
      provider === 'Local Preview' ||
      model === 'local-preview'
    ) {

      const svg =
        createLocalPreviewSVG(
          prompt,
          designData
        );

      const dataUrl =
        `data:image/svg+xml;base64,${Buffer
          .from(svg, 'utf8')
          .toString('base64')}`;

      return res.status(200).json({

        success: true,

        provider:
          'Local Preview',

        model:
          'local-preview',

        imageUrl:
          dataUrl,

        dataUrl:
          dataUrl,

        promptUsed:
          prompt

      });

    }


    // --------------------------------------------------------
    // GOOGLE GEMINI
    // --------------------------------------------------------

    if (
      provider ===
        'Gemini / Nano Banana 2 Lite' ||
      provider ===
        'Gemini / Nano Banana 2' ||
      provider ===
        'Gemini / Nano Banana Pro'
    ) {

      return await generateWithGemini({

        req,
        res,
        prompt,
        images,
        mode,
        designData,
        provider,
        model

      });

    }


    // --------------------------------------------------------
    // OPENAI
    // --------------------------------------------------------

    if (
      provider === 'GPT Image'
    ) {

      return await generateWithOpenAI({

        req,
        res,
        prompt,
        images,
        mode,
        designData,
        provider,
        model

      });

    }


    // --------------------------------------------------------
    // HUGGING FACE
    // --------------------------------------------------------

    if (
      provider === 'Hugging Face'
    ) {

      return await generateWithHuggingFace({

        req,
        res,
        prompt,
        images,
        mode,
        designData,
        provider,
        model

      });

    }


    // --------------------------------------------------------
    // REPLICATE
    // --------------------------------------------------------

    if (
      provider === 'Replicate'
    ) {

      return await generateWithReplicate({

        req,
        res,
        prompt,
        images,
        mode,
        designData,
        provider,
        model

      });

    }


    // --------------------------------------------------------
    // FAL.AI
    // --------------------------------------------------------

    if (
      provider === 'fal.ai'
    ) {

      return await generateWithFal({

        req,
        res,
        prompt,
        images,
        mode,
        designData,
        provider,
        model

      });

    }


    // --------------------------------------------------------
    // FLUX
    // --------------------------------------------------------

    if (
      provider === 'FLUX'
    ) {

      return await generateWithFlux({

        req,
        res,
        prompt,
        images,
        mode,
        designData,
        provider,
        model

      });

    }


    // --------------------------------------------------------
    // FLUX KONTEXT
    // --------------------------------------------------------

    if (
      provider === 'FLUX Kontext'
    ) {

      return await generateWithFluxKontext({

        req,
        res,
        prompt,
        images,
        mode,
        designData,
        provider,
        model

      });

    }


    // --------------------------------------------------------
    // STABILITY
    // --------------------------------------------------------

    if (
      provider === 'Stable Image' ||
      provider === 'Stable Diffusion'
    ) {

      return await generateWithStability({

        req,
        res,
        prompt,
        images,
        mode,
        designData,
        provider,
        model

      });

    }


    // --------------------------------------------------------
    // OTHER DIRECT PROVIDERS
    // --------------------------------------------------------

    if (
      provider === 'Ideogram' ||
      provider === 'Leonardo AI' ||
      provider === 'Adobe Firefly' ||
      provider === 'Amazon Bedrock' ||
      provider === 'Azure AI Foundry'
    ) {

      return res.status(501).json({

        success: false,

        error:
          `${provider} sudah tersedia di AI Engine, ` +
          `tetapi API credential/provider endpoint belum dikonfigurasi ` +
          `di Vercel Environment Variables. ` +
          `Gunakan provider yang sudah dikonfigurasi atau isi API credential ${provider}.`

      });

    }


    // --------------------------------------------------------
    // CUSTOM API
    // --------------------------------------------------------

    if (
      provider === 'Custom API'
    ) {

      return await generateWithCustomAPI({

        req,
        res,
        prompt,
        images,
        mode,
        designData,
        provider,
        model

      });

    }


    return res.status(400).json({

      success: false,

      error:
        `Provider "${provider}" belum dikenali backend.`

    });


  } catch (error) {

    console.error(
      'SEIKO STUDIO BACKEND ERROR:',
      error
    );

    return res.status(500).json({

      success: false,

      error:
        cleanError(
          error?.message ||
          'Terjadi kesalahan pada server.'
        )

    });

  }

}


// ============================================================
// GEMINI
// ============================================================

async function generateWithGemini({
  res,
  prompt,
  images,
  designData,
  provider,
  model
}) {

  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {

    return res.status(500).json({

      success: false,

      error:
        'GEMINI_API_KEY belum dipasang di Vercel.'

    });

  }


  let geminiModel =
    'gemini-3.1-flash-image';


  if (
    provider ===
    'Gemini / Nano Banana 2 Lite'
  ) {

    geminiModel =
      'gemini-3.1-flash-lite-image';

  }


  if (
    provider ===
    'Gemini / Nano Banana Pro'
  ) {

    geminiModel =
      'gemini-3-pro-image';

  }


  const input = [];


  // ----------------------------------------------------------
  // REFERENCE IMAGES
  // ----------------------------------------------------------

  for (
    const image of images.slice(0, 14)
  ) {

    if (
      !image ||
      !image.dataUrl
    ) {
      continue;
    }


    const parsed =
      parseDataUrl(
        image.dataUrl
      );


    if (!parsed) {
      continue;
    }


    input.push({

      type: 'image',

      data:
        parsed.base64,

      mime_type:
        parsed.mimeType

    });

  }


  // ----------------------------------------------------------
  // TEXT
  // ----------------------------------------------------------

  const finalPrompt =
    buildFinalPrompt(
      prompt,
      designData
    );


  input.push({

    type: 'text',

    text:
      finalPrompt

  });


  const imageSize =
    getGeminiImageSize(
      designData,
      geminiModel
    );


  const requestBody = {

    model:
      geminiModel,

    input:
      input,

    response_format: {

      type:
        'image',

      image_size:
        imageSize

    }

  };


  const response =
    await fetch(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {

        method:
          'POST',

        headers: {

          'Content-Type':
            'application/json',

          'x-goog-api-key':
            apiKey

        },

        body:
          JSON.stringify(
            requestBody
          )

      }
    );


  const raw =
    await response.text();


  let data;

  try {

    data =
      JSON.parse(raw);

  } catch {

    throw new Error(
      `Gemini mengembalikan respons tidak valid. HTTP ${response.status}.`
    );

  }


  if (!response.ok) {

    throw new Error(
      formatProviderError(
        'Gemini',
        data,
        response.status
      )
    );

  }


  const imageBase64 =
    extractGeminiImage(
      data
    );


  if (!imageBase64) {

    throw new Error(
      'Gemini berhasil merespons tetapi tidak mengirim image output.'
    );

  }


  const mimeType =
    extractGeminiMimeType(
      data
    ) ||
    'image/png';


  const dataUrl =
    `data:${mimeType};base64,${imageBase64}`;


  return res.status(200).json({

    success: true,

    provider:
      provider,

    model:
      geminiModel,

    imageUrl:
      dataUrl,

    dataUrl:
      dataUrl,

    promptUsed:
      finalPrompt

  });

}


// ============================================================
// OPENAI
// ============================================================

async function generateWithOpenAI({
  res,
  prompt,
  images,
  designData,
  provider,
  model
}) {

  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {

    return res.status(500).json({

      success: false,

      error:
        'OPENAI_API_KEY belum dipasang di Vercel.'

    });

  }


  const finalPrompt =
    buildFinalPrompt(
      prompt,
      designData
    );


  const hasReference =
    images.length > 0 &&
    images[0]?.dataUrl;


  let endpoint =
    'https://api.openai.com/v1/images/generations';


  let body;


  if (hasReference) {

    endpoint =
      'https://api.openai.com/v1/images/edits';


    const firstImage =
      parseDataUrl(
        images[0].dataUrl
      );


    if (!firstImage) {

      throw new Error(
        'Reference image tidak valid.'
      );

    }


    const binary =
      Buffer.from(
        firstImage.base64,
        'base64'
      );


    const blob =
      new Blob(
        [binary],
        {
          type:
            firstImage.mimeType
        }
      );


    const form =
      new FormData();


    form.append(
      'model',
      'gpt-image-2'
    );


    form.append(
      'prompt',
      finalPrompt
    );


    form.append(
      'image[]',
      blob,
      'reference.png'
    );


    const response =
      await fetch(
        endpoint,
        {

          method:
            'POST',

          headers: {

            Authorization:
              `Bearer ${apiKey}`

          },

          body:
            form

        }
      );


    return await processOpenAIResponse(
      response,
      provider,
      finalPrompt
    );

  }


  body = {

    model:
      'gpt-image-2',

    prompt:
      finalPrompt,

    size:
      getOpenAISize(
        designData
      )

  };


  const response =
    await fetch(
      endpoint,
      {

        method:
          'POST',

        headers: {

          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${apiKey}`

        },

        body:
          JSON.stringify(
            body
          )

      }
    );


  return await processOpenAIResponse(
    response,
    provider,
    finalPrompt
  );

}


// ============================================================
// OPENAI RESPONSE
// ============================================================

async function processOpenAIResponse(
  response,
  provider,
  prompt
) {

  const raw =
    await response.text();


  let data;

  try {

    data =
      JSON.parse(raw);

  } catch {

    throw new Error(
      `OpenAI response tidak valid. HTTP ${response.status}.`
    );

  }


  if (!response.ok) {

    throw new Error(
      formatProviderError(
        'OpenAI',
        data,
        response.status
      )
    );

  }


  const item =
    data?.data?.[0];


  if (!item) {

    throw new Error(
      'OpenAI tidak mengirim hasil gambar.'
    );

  }


  let imageUrl =
    item.url ||
    null;


  if (
    !imageUrl &&
    item.b64_json
  ) {

    imageUrl =
      `data:image/png;base64,${item.b64_json}`;

  }


  if (!imageUrl) {

    throw new Error(
      'OpenAI response tidak berisi image URL/base64.'
    );

  }


  return {

    statusCode:
      200,

    json: {

      success: true,

      provider:
        provider,

      model:
        'gpt-image-2',

      imageUrl:
        imageUrl,

      dataUrl:
        imageUrl,

      promptUsed:
        prompt

    }

  };

}


// ============================================================
// HUGGING FACE
// ============================================================

async function generateWithHuggingFace({
  res,
  prompt,
  images,
  designData,
  provider,
  model
}) {

  const token =
    process.env.HF_TOKEN;


  if (!token) {

    return res.status(500).json({

      success: false,

      error:
        'HF_TOKEN belum dipasang di Vercel.'

    });

  }


  const hfModel =
    process.env.HF_IMAGE_MODEL ||
    'black-forest-labs/FLUX.1-schnell';


  const finalPrompt =
    buildFinalPrompt(
      prompt,
      designData
    );


  const hasImage =
    images.length > 0;


  let endpoint =
    'https://router.huggingface.co/hf-inference/models/' +
    encodeURIComponent(hfModel);


  const parameters =
    getHFParameters(
      designData
    );


  if (hasImage) {

    endpoint =
      'https://router.huggingface.co/hf-inference/models/' +
      encodeURIComponent(
        process.env.HF_IMAGE_TO_IMAGE_MODEL ||
        'black-forest-labs/FLUX.1-Kontext-dev'
      );

  }


  const input =
    hasImage
      ? images[0].dataUrl.split(',')[1]
      : finalPrompt;


  const requestBody =
    hasImage
      ? {

          inputs:
            input,

          parameters: {

            prompt:
              finalPrompt,

            ...parameters

          }

        }
      : {

          inputs:
            input,

          parameters:

            parameters

        };


  const response =
    await fetch(
      endpoint,
      {

        method:
          'POST',

        headers: {

          Authorization:
            `Bearer ${token}`,

          'Content-Type':
            'application/json'

        },

        body:
          JSON.stringify(
            requestBody
          )

      }
    );


  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );


  if (!response.ok) {

    throw new Error(
      `Hugging Face gagal. HTTP ${response.status}: ${buffer.toString('utf8').slice(0, 500)}`
    );

  }


  const mimeType =
    response.headers.get(
      'content-type'
    ) ||
    'image/png';


  const dataUrl =
    `data:${mimeType};base64,${buffer.toString('base64')}`;


  return res.status(200).json({

    success: true,

    provider:
      provider,

    model:
      hfModel,

    imageUrl:
      dataUrl,

    dataUrl:
      dataUrl,

    promptUsed:
      finalPrompt

  });

}


// ============================================================
// REPLICATE
// ============================================================

async function generateWithReplicate({
  res,
  prompt,
  images,
  designData,
  provider
}) {

  const token =
    process.env.REPLICATE_API_TOKEN;


  if (!token) {

    return res.status(500).json({

      success: false,

      error:
        'REPLICATE_API_TOKEN belum dipasang di Vercel.'

    });

  }


  const finalPrompt =
    buildFinalPrompt(
      prompt,
      designData
    );


  const replicateModel =
    process.env.REPLICATE_MODEL ||
    'black-forest-labs/flux-schnell';


  const response =
    await fetch(
      `https://api.replicate.com/v1/models/${replicateModel}/predictions`,
      {

        method:
          'POST',

        headers: {

          Authorization:
            `Bearer ${token}`,

          'Content-Type':
            'application/json',

          Prefer:
            'wait'

        },

        body:
          JSON.stringify({

            input: {

              prompt:
                finalPrompt,

              output_format:
                'png'

            }

          })

      }
    );


  const data =
    await safeJson(
      response
    );


  if (!response.ok) {

    throw new Error(
      formatProviderError(
        'Replicate',
        data,
        response.status
      )
    );

  }


  const output =
    normalizeReplicateOutput(
      data?.output
    );


  if (!output) {

    throw new Error(
      'Replicate belum mengembalikan URL gambar.'
    );

  }


  return res.status(200).json({

    success: true,

    provider:
      provider,

    model:
      replicateModel,

    imageUrl:
      output,

    dataUrl:
      output,

    promptUsed:
      finalPrompt

  });

}


// ============================================================
// FAL.AI
// ============================================================

async function generateWithFal({
  res,
  prompt,
  designData,
  provider
}) {

  const key =
    process.env.FAL_KEY;


  if (!key) {

    return res.status(500).json({

      success: false,

      error:
        'FAL_KEY belum dipasang di Vercel.'

    });

  }


  const finalPrompt =
    buildFinalPrompt(
      prompt,
      designData
    );


  const endpoint =
    process.env.FAL_IMAGE_ENDPOINT ||
    'https://fal.run/fal-ai/flux/schnell';


  const response =
    await fetch(
      endpoint,
      {

        method:
          'POST',

        headers: {

          Authorization:
            `Key ${key}`,

          'Content-Type':
            'application/json'

        },

        body:
          JSON.stringify({

            prompt:
              finalPrompt

          })

      }
    );


  const data =
    await safeJson(
      response
    );


  if (!response.ok) {

    throw new Error(
      formatProviderError(
        'fal.ai',
        data,
        response.status
      )
    );

  }


  const imageUrl =
    findImageUrl(
      data
    );


  if (!imageUrl) {

    throw new Error(
      'fal.ai berhasil merespons tetapi URL gambar tidak ditemukan.'
    );

  }


  return res.status(200).json({

    success: true,

    provider:
      provider,

    model:
      process.env.FAL_IMAGE_ENDPOINT ||
      'fal-ai/flux/schnell',

    imageUrl:
      imageUrl,

    dataUrl:
      imageUrl,

    promptUsed:
      finalPrompt

  });

}


// ============================================================
// FLUX
// ============================================================

async function generateWithFlux({
  res,
  prompt,
  designData,
  provider
}) {

  const key =
    process.env.FAL_KEY;


  if (!key) {

    return res.status(500).json({

      success: false,

      error:
        'FAL_KEY belum dipasang. FLUX menggunakan fal.ai adapter.'

    });

  }


  const finalPrompt =
    buildFinalPrompt(
      prompt,
      designData
    );


  const endpoint =
    process.env.FLUX_ENDPOINT ||
    'https://fal.run/fal-ai/flux/schnell';


  const response =
    await fetch(
      endpoint,
      {

        method:
          'POST',

        headers: {

          Authorization:
            `Key ${key}`,

          'Content-Type':
            'application/json'

        },

        body:
          JSON.stringify({

            prompt:
              finalPrompt

          })

      }
    );


  const data =
    await safeJson(
      response
    );


  if (!response.ok) {

    throw new Error(
      formatProviderError(
        'FLUX',
        data,
        response.status
      )
    );

  }


  const imageUrl =
    findImageUrl(
      data
    );


  if (!imageUrl) {

    throw new Error(
      'FLUX tidak mengembalikan URL gambar.'
    );

  }


  return res.status(200).json({

    success: true,

    provider:
      provider,

    model:
      'FLUX',

    imageUrl:
      imageUrl,

    dataUrl:
      imageUrl,

    promptUsed:
      finalPrompt

  });

}


// ============================================================
// FLUX KONTEXT
// ============================================================

async function generateWithFluxKontext({
  res,
  prompt,
  images,
  designData,
  provider
}) {

  const key =
    process.env.FAL_KEY;


  if (!key) {

    return res.status(500).json({

      success: false,

      error:
        'FAL_KEY belum dipasang. FLUX Kontext menggunakan fal.ai adapter.'

    });

  }


  const finalPrompt =
    buildFinalPrompt(
      prompt,
      designData
    );


  const endpoint =
    process.env.FLUX_KONTEXT_ENDPOINT ||
    'https://fal.run/fal-ai/flux-pro/kontext';


  const body = {

    prompt:
      finalPrompt

  };


  if (
    images.length &&
    images[0]?.dataUrl
  ) {

    body.image_url =
      images[0].dataUrl;

  }


  const response =
    await fetch(
      endpoint,
      {

        method:
          'POST',

        headers: {

          Authorization:
            `Key ${key}`,

          'Content-Type':
            'application/json'

        },

        body:
          JSON.stringify(
            body
          )

      }
    );


  const data =
    await safeJson(
      response
    );


  if (!response.ok) {

    throw new Error(
      formatProviderError(
        'FLUX Kontext',
        data,
        response.status
      )
    );

  }


  const imageUrl =
    findImageUrl(
      data
    );


  if (!imageUrl) {

    throw new Error(
      'FLUX Kontext tidak mengembalikan URL gambar.'
    );

  }


  return res.status(200).json({

    success: true,

    provider:
      provider,

    model:
      'FLUX Kontext',

    imageUrl:
      imageUrl,

    dataUrl:
      imageUrl,

    promptUsed:
      finalPrompt

  });

}


// ============================================================
// STABILITY AI
// ============================================================

async function generateWithStability({
  res,
  prompt,
  images,
  designData,
  provider
}) {

  const key =
    process.env.STABILITY_API_KEY;


  if (!key) {

    return res.status(500).json({

      success: false,

      error:
        'STABILITY_API_KEY belum dipasang di Vercel.'

    });

  }


  const finalPrompt =
    buildFinalPrompt(
      prompt,
      designData
    );


  const endpoint =
    process.env.STABILITY_ENDPOINT ||
    'https://api.stability.ai/v2beta/stable-image/generate/core';


  const form =
    new FormData();


  form.append(
    'prompt',
    finalPrompt
  );


  form.append(
    'output_format',
    'png'
  );


  const response =
    await fetch(
      endpoint,
      {

        method:
          'POST',

        headers: {

          Authorization:
            `Bearer ${key}`,

          Accept:
            'image/*'

        },

        body:
          form

      }
    );


  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );


  if (!response.ok) {

    throw new Error(
      `Stability AI gagal. HTTP ${response.status}: ${buffer.toString('utf8').slice(0, 500)}`
    );

  }


  const mimeType =
    response.headers.get(
      'content-type'
    ) ||
    'image/png';


  const dataUrl =
    `data:${mimeType};base64,${buffer.toString('base64')}`;


  return res.status(200).json({

    success: true,

    provider:
      provider,

    model:
      'stable-image',

    imageUrl:
      dataUrl,

    dataUrl:
      dataUrl,

    promptUsed:
      finalPrompt

  });

}


// ============================================================
// CUSTOM API
// ============================================================

async function generateWithCustomAPI({
  res,
  prompt,
  images,
  designData,
  provider,
  model
}) {

  const endpoint =
    process.env.CUSTOM_IMAGE_API_URL;

  const apiKey =
    process.env.CUSTOM_IMAGE_API_KEY;


  if (!endpoint) {

    return res.status(500).json({

      success: false,

      error:
        'CUSTOM_IMAGE_API_URL belum dipasang di Vercel.'

    });

  }


  const finalPrompt =
    buildFinalPrompt(
      prompt,
      designData
    );


  const response =
    await fetch(
      endpoint,
      {

        method:
          'POST',

        headers: {

          'Content-Type':
            'application/json',

          ...(apiKey
            ? {
                Authorization:
                  `Bearer ${apiKey}`
              }
            : {})

        },

        body:
          JSON.stringify({

            model:
              model ||
              process.env.CUSTOM_IMAGE_MODEL ||
              'custom',

            prompt:
              finalPrompt,

            images:
              images,

            mode:
              'image_generation',

            designData:
              designData

          })

      }
    );


  const data =
    await safeJson(
      response
    );


  if (!response.ok) {

    throw new Error(
      formatProviderError(
        'Custom API',
        data,
        response.status
      )
    );

  }


  const imageUrl =
    data.imageUrl ||
    data.dataUrl ||
    data.url ||
    (
      data.b64_json
        ? `data:image/png;base64,${data.b64_json}`
        : null
    );


  if (!imageUrl) {

    throw new Error(
      'Custom API tidak mengembalikan imageUrl/dataUrl/url/b64_json.'
    );

  }


  return res.status(200).json({

    success: true,

    provider:
      provider,

    model:
      model ||
      'custom',

    imageUrl:
      imageUrl,

    dataUrl:
      imageUrl,

    promptUsed:
      finalPrompt

  });

}


// ============================================================
// FINAL PROMPT
// ============================================================

function buildFinalPrompt(
  prompt,
  designData
) {

  return `${prompt}

PRODUCTION SPECIFICATION:
Color mode: ${designData?.colorMode || 'RGB'}
Size: ${designData?.size || 'Not specified'}
Orientation: ${designData?.orientation || 'Portrait'}
Bleed: ${designData?.bleed || 'Not specified'}
Resolution: ${designData?.resolution || '300 DPI'}
Print-ready: ${designData?.printReady ? 'Yes' : 'No'}
Include bleed: ${designData?.includeBleed ? 'Yes' : 'No'}
Crop marks: ${designData?.cropMarks ? 'Yes' : 'No'}
Output format: ${designData?.outputFormat || 'PNG'}

Create a polished professional finished design.
Preserve all user-provided important information.
Do not invent critical business information.
Keep typography clean, readable and correctly spelled.
Follow the requested composition and visual hierarchy.
Use reference images when provided.
Do not create a rough sketch or wireframe.
Return the finished visual design.`;

}


// ============================================================
// GEMINI IMAGE EXTRACTION
// ============================================================

function extractGeminiImage(
  data
) {

  if (
    data?.output_image?.data
  ) {

    return data.output_image.data;

  }


  if (
    data?.outputImage?.data
  ) {

    return data.outputImage.data;

  }


  const steps =
    Array.isArray(data?.steps)
      ? data.steps
      : [];


  for (
    const step of steps
  ) {

    const content =
      Array.isArray(step?.content)
        ? step.content
        : [];


    for (
      const block of content
    ) {

      if (
        block?.type === 'image' &&
        block?.data
      ) {

        return block.data;

      }

    }

  }


  return null;

}


function extractGeminiMimeType(
  data
) {

  if (
    data?.output_image?.mime_type
  ) {

    return data.output_image.mime_type;

  }


  if (
    data?.outputImage?.mime_type
  ) {

    return data.outputImage.mime_type;

  }


  const steps =
    Array.isArray(data?.steps)
      ? data.steps
      : [];


  for (
    const step of steps
  ) {

    const content =
      Array.isArray(step?.content)
        ? step.content
        : [];


    for (
      const block of content
    ) {

      if (
        block?.type === 'image' &&
        block?.mime_type
      ) {

        return block.mime_type;

      }

    }

  }


  return 'image/png';

}


// ============================================================
// SIZE HELPERS
// ============================================================

function getGeminiImageSize(
  designData,
  model
) {

  const resolution =
    String(
      designData?.resolution || ''
    ).toLowerCase();


  if (
    model ===
    'gemini-3.1-flash-lite-image'
  ) {

    return '1K';

  }


  if (
    resolution.includes('4k')
  ) {

    return '4K';

  }


  if (
    resolution.includes('2k')
  ) {

    return '2K';

  }


  return '1K';

}


function getOpenAISize(
  designData
) {

  const orientation =
    String(
      designData?.orientation || ''
    ).toLowerCase();


  if (
    orientation ===
    'landscape'
  ) {

    return '1536x1024';

  }


  if (
    orientation ===
    'square'
  ) {

    return '1024x1024';

  }


  return '1024x1536';

}


function getHFParameters(
  designData
) {

  const orientation =
    String(
      designData?.orientation || ''
    ).toLowerCase();


  if (
    orientation ===
    'landscape'
  ) {

    return {

      width:
        1536,

      height:
        1024

    };

  }


  if (
    orientation ===
    'square'
  ) {

    return {

      width:
        1024,

      height:
        1024

    };

  }


  return {

    width:
      1024,

    height:
      1536

  };

}


// ============================================================
// DATA URL
// ============================================================

function parseDataUrl(
  dataUrl
) {

  if (
    typeof dataUrl !==
    'string'
  ) {

    return null;

  }


  const match =
    dataUrl.match(
      /^data:([^;]+);base64,(.+)$/s
    );


  if (!match) {

    return null;

  }


  return {

    mimeType:
      match[1],

    base64:
      match[2]

  };

}


// ============================================================
// JSON
// ============================================================

async function safeJson(
  response
) {

  const text =
    await response.text();


  try {

    return JSON.parse(
      text
    );

  } catch {

    return {

      raw:
        text

    };

  }

}


// ============================================================
// REPLICATE OUTPUT
// ============================================================

function normalizeReplicateOutput(
  output
) {

  if (
    typeof output ===
    'string'
  ) {

    return output;

  }


  if (
    Array.isArray(output)
  ) {

    for (
      const item of output
    ) {

      if (
        typeof item ===
        'string'
      ) {

        return item;

      }

    }

  }


  return null;

}


// ============================================================
// FIND IMAGE URL
// ============================================================

function findImageUrl(
  data
) {

  if (
    typeof data ===
    'string' &&
    /^https?:\/\//.test(data)
  ) {

    return data;

  }


  const candidates = [

    data?.images?.[0]?.url,

    data?.image?.url,

    data?.image_url,

    data?.imageUrl,

    data?.output?.[0]?.url,

    data?.output?.[0],

    data?.data?.[0]?.url,

    data?.result?.images?.[0]?.url,

    data?.result?.image?.url

  ];


  for (
    const candidate of candidates
  ) {

    if (
      typeof candidate ===
      'string' &&
      /^https?:\/\//.test(candidate)
    ) {

      return candidate;

    }

  }


  return null;

}


// ============================================================
// PROVIDER ERROR
// ============================================================

function formatProviderError(
  provider,
  data,
  status
) {

  const message =
    data?.error?.message ||
    data?.error ||
    data?.message ||
    data?.detail ||
    data?.raw ||
    `HTTP ${status}`;


  return `${provider}: ${String(message).slice(0, 1200)}`;

}


function cleanError(
  message
) {

  return String(
    message
  )
    .replace(
      /sk-[A-Za-z0-9_-]+/g,
      '[REDACTED]'
    )
    .replace(
      /Bearer\s+[A-Za-z0-9._-]+/gi,
      'Bearer [REDACTED]'
    );

}


// ============================================================
// LOCAL PREVIEW SVG
// ============================================================

function createLocalPreviewSVG(
  prompt,
  designData
) {

  const brand =
    escapeXml(
      designData?.brand ||
      'SEIKO STUDIO'
    );


  const headline =
    escapeXml(
      designData?.headline ||
      'AI DESIGN PREVIEW'
    );


  const info =
    escapeXml(
      designData?.info ||
      'Professional Design Preview'
    );


  const cta =
    escapeXml(
      designData?.cta ||
      'LEARN MORE'
    );


  const mode =
    escapeXml(
      designData?.colorMode ||
      'RGB'
    );


  const promptShort =
    escapeXml(
      prompt
        .replace(/\s+/g, ' ')
        .slice(0, 100)
    );


  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1080"
  height="1350"
  viewBox="0 0 1080 1350"
>

  <defs>

    <linearGradient
      id="bg"
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >

      <stop
        offset="0%"
        stop-color="#0f172a"
      />

      <stop
        offset="55%"
        stop-color="#1d4ed8"
      />

      <stop
        offset="100%"
        stop-color="#020617"
      />

    </linearGradient>

  </defs>


  <rect
    width="1080"
    height="1350"
    fill="url(#bg)"
  />


  <circle
    cx="850"
    cy="240"
    r="260"
    fill="#ffffff"
    opacity=".08"
  />


  <circle
    cx="150"
    cy="1100"
    r="300"
    fill="#10b981"
    opacity=".06"
  />


  <text
    x="80"
    y="110"
    fill="#93c5fd"
    font-family="Arial, sans-serif"
    font-size="26"
    font-weight="700"
  >
    ${brand}
  </text>


  <text
    x="80"
    y="180"
    fill="#64748b"
    font-family="Arial, sans-serif"
    font-size="18"
  >
    ${mode} • SEIKO STUDIO
  </text>


  <text
    x="80"
    y="500"
    fill="#ffffff"
    font-family="Arial, sans-serif"
    font-size="76"
    font-weight="800"
  >
    ${headline}
  </text>


  <foreignObject
    x="80"
    y="580"
    width="800"
    height="250"
  >

    <div
      xmlns="http://www.w3.org/1999/xhtml"
      style="
        color:#cbd5e1;
        font-family:Arial,sans-serif;
        font-size:30px;
        line-height:1.4;
      "
    >
      ${info}
    </div>

  </foreignObject>


  <rect
    x="80"
    y="900"
    width="300"
    height="76"
    rx="14"
    fill="#2563eb"
  />


  <text
    x="230"
    y="949"
    text-anchor="middle"
    fill="#ffffff"
    font-family="Arial, sans-serif"
    font-size="24"
    font-weight="700"
  >
    ${cta}
  </text>


  <text
    x="80"
    y="1240"
    fill="#64748b"
    font-family="monospace"
    font-size="15"
  >
    LOCAL PREVIEW
  </text>


  <text
    x="80"
    y="1270"
    fill="#475569"
    font-family="monospace"
    font-size="13"
  >
    ${promptShort}
  </text>

</svg>
`;

}


function escapeXml(
  value
) {

  return String(
    value
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&apos;'
    );

}
