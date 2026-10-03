"use strict";

/*
  SEIKO STUDIO
  /api/generate-image.js

  Provider:
  - Gemini Nano Banana 2
  - Gemini Nano Banana 2 Lite
  - Gemini Nano Banana Pro
  - OpenAI GPT Image 2
  - Hugging Face FLUX
  - Hugging Face Qwen Image
  - Hugging Face FLUX Kontext
  - Replicate FLUX
  - Replicate Kontext
  - fal.ai
  - Ideogram
  - Leonardo
  - Stability AI
  - Adobe Firefly
  - Azure OpenAI
  - AWS Bedrock
  - Custom API
  - Local Preview

  Tidak ada fake output.
*/

const PROVIDERS = {
    GEMINI_2: "gemini-nano-banana-2",
    GEMINI_2_LITE: "gemini-nano-banana-2-lite",
    GEMINI_PRO: "gemini-nano-banana-pro",

    OPENAI: "openai-gpt-image-2",

    HF_FLUX: "huggingface-flux",
    HF_QWEN: "huggingface-qwen-image",
    HF_KONTEXT: "huggingface-kontext",

    REPLICATE_FLUX: "replicate-flux",
    REPLICATE_KONTEXT: "replicate-kontext",

    FAL: "fal-flux",

    IDEOGRAM: "ideogram",
    LEONARDO: "leonardo",
    STABILITY: "stability-ai",

    FIREFLY: "adobe-firefly",
    AZURE: "azure-openai",
    BEDROCK: "aws-bedrock",

    CUSTOM: "custom-api",
    LOCAL: "local-preview"
};

/* =========================================================
   HTTP
========================================================= */

function cors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, body) {
    cors(res);

    res.status(status).json(body);
}

function getBody(req) {
    return req.body || {};
}

/* =========================================================
   ERROR
========================================================= */

class ProviderError extends Error {
    constructor(message, status = 500, provider = "") {
        super(message);
        this.status = status;
        this.provider = provider;
    }
}

async function readResponse(response) {
    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = {
            raw: text
        };
    }

    if (!response.ok) {
        let message =
            data?.error?.message ||
            data?.error ||
            data?.message ||
            data?.detail ||
            data?.raw ||
            `Provider HTTP ${response.status}`;

        if (response.status === 401) {
            message =
                "API key provider tidak valid atau tidak memiliki izin.";
        }

        if (response.status === 403) {
            message =
                "Provider menolak request. Periksa API key, permission, billing, atau endpoint.";
        }

        if (response.status === 429) {
            message =
                "Quota / rate limit provider tercapai.";
        }

        throw new ProviderError(
            String(message),
            response.status
        );
    }

    return data;
}

/* =========================================================
   MAIN HANDLER
========================================================= */

module.exports = async function handler(req, res) {
    cors(res);

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "POST") {
        return json(res, 405, {
            error: "Method not allowed."
        });
    }

    try {
        const body = getBody(req);

        const provider =
            String(body.provider || "").trim();

        const prompt =
            String(body.prompt || "").trim();

        const images =
            Array.isArray(body.images)
                ? body.images
                : [];

        const mode =
            body.mode ||
            "text-to-image";

        const designData =
            body.designData ||
            {};

        if (!provider) {
            throw new ProviderError(
                "Provider AI belum dipilih.",
                400
            );
        }

        if (!prompt) {
            throw new ProviderError(
                "Prompt kosong.",
                400
            );
        }

        /*
          Ini adalah prompt final yang benar-benar dikirim.
          Tidak ada penambahan otomatis ke prompt user.
        */
        const finalPrompt = buildFinalPrompt(
            prompt,
            designData,
            mode
        );

        let result;

        switch (provider) {

            case PROVIDERS.GEMINI_2:
                result = await generateGemini({
                    model: "gemini-3.1-flash-image",
                    prompt: finalPrompt,
                    images,
                    designData
                });
                break;

            case PROVIDERS.GEMINI_2_LITE:
                result = await generateGemini({
                    model: "gemini-3.1-flash-lite",
                    prompt: finalPrompt,
                    images,
                    designData
                });
                break;

            case PROVIDERS.GEMINI_PRO:
                result = await generateGemini({
                    model: "gemini-3-pro-image",
                    prompt: finalPrompt,
                    images,
                    designData
                });
                break;

            case PROVIDERS.OPENAI:
                result = await generateOpenAI({
                    prompt: finalPrompt,
                    images,
                    mode,
                    designData
                });
                break;

            case PROVIDERS.HF_FLUX:
                result = await generateHuggingFace({
                    model: "black-forest-labs/FLUX.1-dev",
                    prompt: finalPrompt,
                    images,
                    designData
                });
                break;

            case PROVIDERS.HF_QWEN:
                result = await generateHuggingFace({
                    model: "Qwen/Qwen-Image",
                    prompt: finalPrompt,
                    images,
                    designData
                });
                break;

            case PROVIDERS.HF_KONTEXT:
                result = await generateHuggingFace({
                    model: "black-forest-labs/FLUX.1-Kontext-dev",
                    prompt: finalPrompt,
                    images,
                    designData
                });
                break;

            case PROVIDERS.REPLICATE_FLUX:
                result = await generateReplicate({
                    model:
                        process.env.REPLICATE_FLUX_MODEL ||
                        "black-forest-labs/flux-schnell",
                    prompt: finalPrompt,
                    images,
                    designData
                });
                break;

            case PROVIDERS.REPLICATE_KONTEXT:
                result = await generateReplicate({
                    model:
                        process.env.REPLICATE_KONTEXT_MODEL ||
                        "black-forest-labs/flux-kontext-pro",
                    prompt: finalPrompt,
                    images,
                    designData
                });
                break;

            case PROVIDERS.FAL:
                result = await generateGenericProvider({
                    provider,
                    apiUrl: process.env.FAL_API_URL,
                    apiKey: process.env.FAL_KEY,
                    prompt: finalPrompt,
                    images,
                    designData,
                    authType: "key"
                });
                break;

            case PROVIDERS.IDEOGRAM:
                result = await generateGenericProvider({
                    provider,
                    apiUrl: process.env.IDEOGRAM_API_URL,
                    apiKey: process.env.IDEOGRAM_API_KEY,
                    prompt: finalPrompt,
                    images,
                    designData,
                    authType: "bearer"
                });
                break;

            case PROVIDERS.LEONARDO:
                result = await generateGenericProvider({
                    provider,
                    apiUrl: process.env.LEONARDO_API_URL,
                    apiKey: process.env.LEONARDO_API_KEY,
                    prompt: finalPrompt,
                    images,
                    designData,
                    authType: "bearer"
                });
                break;

            case PROVIDERS.STABILITY:
                result = await generateGenericProvider({
                    provider,
                    apiUrl: process.env.STABILITY_API_URL,
                    apiKey: process.env.STABILITY_API_KEY,
                    prompt: finalPrompt,
                    images,
                    designData,
                    authType: "bearer"
                });
                break;

            case PROVIDERS.FIREFLY:
                result = await generateGenericProvider({
                    provider,
                    apiUrl: process.env.ADOBE_FIREFLY_API_URL,
                    apiKey: process.env.ADOBE_FIREFLY_API_KEY,
                    prompt: finalPrompt,
                    images,
                    designData,
                    authType: "bearer"
                });
                break;

            case PROVIDERS.AZURE:
                result = await generateAzure({
                    prompt: finalPrompt,
                    images,
                    designData
                });
                break;

            case PROVIDERS.BEDROCK:
                throw new ProviderError(
                    "AWS Bedrock memerlukan konfigurasi AWS server-side. Set AWS credentials/role dan endpoint adapter Bedrock terlebih dahulu.",
                    501,
                    provider
                );

            case PROVIDERS.CUSTOM:
                result = await generateGenericProvider({
                    provider,
                    apiUrl: process.env.CUSTOM_IMAGE_API_URL,
                    apiKey: process.env.CUSTOM_IMAGE_API_KEY,
                    prompt: finalPrompt,
                    images,
                    designData,
                    authType: "bearer"
                });
                break;

            case PROVIDERS.LOCAL:
                throw new ProviderError(
                    "Local Preview tidak melakukan AI generation. Pilih provider AI yang memiliki API.",
                    400,
                    provider
                );

            default:
                throw new ProviderError(
                    `Provider "${provider}" belum dikenali.`,
                    400,
                    provider
                );
        }

        return json(res, 200, {
            ok: true,
            provider,
            imageUrl: result.imageUrl,
            dataUrl: result.dataUrl,
            b64_json: result.b64_json,
            mimeType: result.mimeType || "image/png",

            /*
              EXACT PROMPT USED:
              finalPrompt adalah prompt yang benar-benar dikirim.
            */
            promptUsed: finalPrompt
        });

    } catch (error) {
        console.error("[SEIKO STUDIO]", error);

        return json(
            res,
            error.status || 500,
            {
                ok: false,
                provider:
                    error.provider ||
                    getBody(req)?.provider ||
                    "",
                error:
                    error.message ||
                    "Unknown server error."
            }
        );
    }
};

/* =========================================================
   FINAL PROMPT
========================================================= */

function buildFinalPrompt(prompt, designData, mode) {

    /*
      Jangan mengubah isi prompt user.
      Metadata teknis ditambahkan sebagai context terpisah.
    */

    const context = [];

    if (designData.colorMode) {
        context.push(
            `Color workflow: ${designData.colorMode}`
        );
    }

    if (designData.size) {
        context.push(
            `Target size: ${designData.size}`
        );
    }

    if (designData.orientation) {
        context.push(
            `Orientation: ${designData.orientation}`
        );
    }

    if (designData.bleed) {
        context.push(
            `Bleed: ${designData.bleed}`
        );
    }

    if (designData.resolution) {
        context.push(
            `Resolution: ${designData.resolution}`
        );
    }

    if (designData.outputFormat) {
        context.push(
            `Requested output format: ${designData.outputFormat}`
        );
    }

    if (designData.printReady) {
        context.push(
            "Production target: print-ready"
        );
    }

    if (designData.includeBleed) {
        context.push(
            "Include bleed in production composition."
        );
    }

    if (designData.cropMarks) {
        context.push(
            "Account for crop marks."
        );
    }

    if (mode) {
        context.push(
            `Generation mode: ${mode}`
        );
    }

    if (!context.length) {
        return prompt;
    }

    return [
        prompt,
        "",
        "SEIKO STUDIO PRODUCTION CONTEXT:",
        context.join("\n")
    ].join("\n");
}

/* =========================================================
   GEMINI
========================================================= */

async function generateGemini({
    model,
    prompt,
    images,
    designData
}) {
    const apiKey =
        process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new ProviderError(
            "GEMINI_API_KEY belum tersedia di Vercel.",
            500,
            "gemini"
        );
    }

    const input = [];

    /*
      Gemini Interactions API menerima image blocks
      dengan base64 + mime_type.
    */
    for (const image of images.slice(0, 14)) {

        const parsed =
            parseDataUrl(image.dataUrl);

        if (!parsed) continue;

        input.push({
            type: "image",
            mime_type: parsed.mimeType,
            data: parsed.base64
        });
    }

    input.push({
        type: "text",
        text: prompt
    });

    const body = {
        model,
        input,
        response_format: {
            type: "image",
            image_size:
                getGeminiImageSize(
                    designData?.resolution
                )
        }
    };

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify(body)
        }
    );

    const data =
        await readResponse(response);

    const imageResult =
        extractGeminiImage(data);

    if (!imageResult) {
        throw new ProviderError(
            "Gemini selesai tetapi tidak mengembalikan image output.",
            502,
            "gemini"
        );
    }

    return {
        dataUrl:
            `data:${imageResult.mimeType};base64,${imageResult.base64}`,
        mimeType:
            imageResult.mimeType
    };
}

function extractGeminiImage(data) {

    if (data?.output_image?.data) {
        return {
            base64: data.output_image.data,
            mimeType:
                data.output_image.mime_type ||
                "image/png"
        };
    }

    const steps =
        Array.isArray(data?.steps)
            ? data.steps
            : [];

    for (const step of steps) {

        const content =
            Array.isArray(step?.content)
                ? step.content
                : [];

        for (const block of content) {

            if (
                block?.type === "image" &&
                block?.data
            ) {
                return {
                    base64: block.data,
                    mimeType:
                        block.mime_type ||
                        "image/png"
                };
            }
        }
    }

    return null;
}

function getGeminiImageSize(resolution) {
    const value =
        String(resolution || "").toLowerCase();

    if (value.includes("600")) return "4K";
    if (value.includes("300")) return "2K";

    return "1K";
}

/* =========================================================
   OPENAI
========================================================= */

async function generateOpenAI({
    prompt,
    images,
    mode,
    designData
}) {
    const apiKey =
        process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new ProviderError(
            "OPENAI_API_KEY belum tersedia di Vercel.",
            500,
            "openai"
        );
    }

    /*
      OpenAI image APIs can differ by model/version.
      We send multipart form data to the image endpoint.
    */

    const hasImages =
        Array.isArray(images) &&
        images.length > 0;

    const form =
        new FormData();

    form.append(
        "model",
        "gpt-image-2"
    );

    form.append(
        "prompt",
        prompt
    );

    form.append(
        "size",
        getOpenAISize(
            designData?.orientation
        )
    );

    form.append(
        "quality",
        "auto"
    );

    if (hasImages) {

        for (const image of images.slice(0, 10)) {

            const parsed =
                parseDataUrl(image.dataUrl);

            if (!parsed) continue;

            const buffer =
                Buffer.from(
                    parsed.base64,
                    "base64"
                );

            const blob =
                new Blob(
                    [buffer],
                    {
                        type:
                            parsed.mimeType
                    }
                );

            form.append(
                "image[]",
                blob,
                sanitizeFilename(
                    image.name ||
                    "reference.png"
                )
            );
        }
    }

    const endpoint =
        hasImages
            ? "https://api.openai.com/v1/images/edits"
            : "https://api.openai.com/v1/images/generations";

    const response =
        await fetch(
            endpoint,
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${apiKey}`
                },
                body: form
            }
        );

    const data =
        await readResponse(response);

    const item =
        data?.data?.[0];

    if (!item) {
        throw new ProviderError(
            "OpenAI tidak mengembalikan image data.",
            502,
            "openai"
        );
    }

    if (item.b64_json) {
        return {
            b64_json: item.b64_json,
            mimeType: "image/png"
        };
    }

    if (item.url) {
        return {
            imageUrl: item.url,
            mimeType: "image/png"
        };
    }

    throw new ProviderError(
        "OpenAI response tidak berisi URL atau b64_json.",
        502,
        "openai"
    );
}

function getOpenAISize(orientation) {

    switch (orientation) {
        case "landscape":
            return "1536x1024";

        case "square":
            return "1024x1024";

        case "portrait":
        default:
            return "1024x1536";
    }
}

/* =========================================================
   HUGGING FACE
========================================================= */

async function generateHuggingFace({
    model,
    prompt,
    images,
    designData
}) {
    const token =
        process.env.HF_TOKEN;

    if (!token) {
        throw new ProviderError(
            "HF_TOKEN belum tersedia di Vercel.",
            500,
            "huggingface"
        );
    }

    const hasReference =
        images.length > 0;

    const endpoint =
        `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(model)}`;

    const body =
        hasReference
            ? {
                inputs:
                    parseDataUrl(
                        images[0].dataUrl
                    )?.base64 || "",
                parameters: {
                    prompt,
                    width:
                        getWidth(
                            designData?.orientation
                        ),
                    height:
                        getHeight(
                            designData?.orientation
                        )
                }
            }
            : {
                inputs: prompt,
                parameters: {
                    width:
                        getWidth(
                            designData?.orientation
                        ),
                    height:
                        getHeight(
                            designData?.orientation
                        )
                }
            };

    const response =
        await fetch(
            endpoint,
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify(body)
            }
        );

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    if (!response.ok) {
        const data =
            await readResponse(response);

        return data;
    }

    if (
        contentType.includes(
            "application/json"
        )
    ) {
        const data =
            await response.json();

        const extracted =
            extractImageFromObject(
                data
            );

        if (extracted) {
            return extracted;
        }

        throw new ProviderError(
            "Hugging Face mengembalikan JSON tanpa image.",
            502,
            "huggingface"
        );
    }

    const arrayBuffer =
        await response.arrayBuffer();

    const buffer =
        Buffer.from(arrayBuffer);

    return {
        dataUrl:
            `data:${contentType || "image/png"};base64,${buffer.toString("base64")}`,
        mimeType:
            contentType || "image/png"
    };
}

/* =========================================================
   REPLICATE
========================================================= */

async function generateReplicate({
    model,
    prompt,
    images,
    designData
}) {
    const token =
        process.env.REPLICATE_API_TOKEN;

    if (!token) {
        throw new ProviderError(
            "REPLICATE_API_TOKEN belum tersedia di Vercel.",
            500,
            "replicate"
        );
    }

    const input = {
        prompt
    };

    if (
        images.length &&
        images[0].dataUrl
    ) {
        input.input_image =
            images[0].dataUrl;
    }

    const response =
        await fetch(
            "https://api.replicate.com/v1/models/" +
            encodeURIComponent(model) +
            "/predictions",
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                    "Content-Type":
                        "application/json",
                    Prefer:
                        "wait=60"
                },
                body:
                    JSON.stringify({
                        input
                    })
            }
        );

    const data =
        await readResponse(response);

    /*
      Sync mode should normally provide output.
      If not, poll prediction.
    */

    if (data?.output) {
        return await extractReplicateOutput(
            data.output
        );
    }

    if (data?.id) {
        return await pollReplicate(
            data.id,
            token
        );
    }

    throw new ProviderError(
        "Replicate tidak mengembalikan output.",
        502,
        "replicate"
    );
}

async function pollReplicate(
    predictionId,
    token
) {
    const maxAttempts = 30;

    for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt++
    ) {
        await sleep(2000);

        const response =
            await fetch(
                `https://api.replicate.com/v1/predictions/${predictionId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await readResponse(response);

        if (data.status === "succeeded") {
            return await extractReplicateOutput(
                data.output
            );
        }

        if (
            data.status === "failed" ||
            data.status === "canceled"
        ) {
            throw new ProviderError(
                data.error ||
                `Replicate prediction ${data.status}.`,
                502,
                "replicate"
            );
        }
    }

    throw new ProviderError(
        "Replicate timeout menunggu hasil image.",
        504,
        "replicate"
    );
}

async function extractReplicateOutput(
    output
) {
    if (!output) {
        throw new ProviderError(
            "Replicate output kosong.",
            502,
            "replicate"
        );
    }

    const url =
        Array.isArray(output)
            ? output[0]
            : output;

    if (
        typeof url === "string" &&
        url.startsWith("http")
    ) {
        return {
            imageUrl: url,
            mimeType: "image/png"
        };
    }

    throw new ProviderError(
        "Format output Replicate tidak dikenali.",
        502,
        "replicate"
    );
}

/* =========================================================
   GENERIC PROVIDER
========================================================= */

async function generateGenericProvider({
    provider,
    apiUrl,
    apiKey,
    prompt,
    images,
    designData,
    authType
}) {
    if (!apiUrl) {
        throw new ProviderError(
            `${provider}: API URL belum dikonfigurasi di Vercel.`,
            500,
            provider
        );
    }

    if (!apiKey) {
        throw new ProviderError(
            `${provider}: API key belum dikonfigurasi di Vercel.`,
            500,
            provider
        );
    }

    const payload = {
        prompt,

        images: images.map(image => ({
            name: image.name,
            mimeType: image.mimeType,
            dataUrl: image.dataUrl
        })),

        designData
    };

    const headers = {
        "Content-Type":
            "application/json"
    };

    if (authType === "key") {
        headers.Authorization =
            `Key ${apiKey}`;
    } else {
        headers.Authorization =
            `Bearer ${apiKey}`;
    }

    const response =
        await fetch(
            apiUrl,
            {
                method: "POST",
                headers,
                body:
                    JSON.stringify(payload)
            }
        );

    const data =
        await readResponse(response);

    const result =
        extractImageFromObject(
            data
        );

    if (!result) {
        throw new ProviderError(
            `${provider}: response tidak memiliki imageUrl/dataUrl/b64_json.`,
            502,
            provider
        );
    }

    return result;
}

/* =========================================================
   AZURE OPENAI
========================================================= */

async function generateAzure({
    prompt,
    images,
    designData
}) {
    const endpoint =
        process.env.AZURE_OPENAI_ENDPOINT;

    const apiKey =
        process.env.AZURE_OPENAI_API_KEY;

    const deployment =
        process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT;

    const apiVersion =
        process.env.AZURE_OPENAI_API_VERSION ||
        "2025-04-01-preview";

    if (
        !endpoint ||
        !apiKey ||
        !deployment
    ) {
        throw new ProviderError(
            "Azure OpenAI belum dikonfigurasi lengkap.",
            500,
            "azure-openai"
        );
    }

    const url =
        endpoint.replace(/\/$/, "") +
        `/openai/deployments/${encodeURIComponent(deployment)}/images/generations?api-version=${encodeURIComponent(apiVersion)}`;

    const response =
        await fetch(
            url,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    "api-key":
                        apiKey
                },
                body:
                    JSON.stringify({
                        prompt,
                        size:
                            getOpenAISize(
                                designData?.orientation
                            )
                    })
            }
        );

    const data =
        await readResponse(response);

    const item =
        data?.data?.[0];

    if (item?.b64_json) {
        return {
            b64_json:
                item.b64_json,
            mimeType:
                "image/png"
        };
    }

    if (item?.url) {
        return {
            imageUrl:
                item.url,
            mimeType:
                "image/png"
        };
    }

    throw new ProviderError(
        "Azure OpenAI tidak mengembalikan image.",
        502,
        "azure-openai"
    );
}

/* =========================================================
   IMAGE HELPERS
========================================================= */

function parseDataUrl(dataUrl) {
    if (
        typeof dataUrl !== "string"
    ) {
        return null;
    }

    const match =
        dataUrl.match(
            /^data:([^;,]+)(?:;charset=[^;,]+)?;base64,(.+)$/s
        );

    if (!match) {
        return null;
    }

    return {
        mimeType: match[1],
        base64: match[2]
    };
}

function extractImageFromObject(
    data
) {
    if (!data) return null;

    if (
        typeof data === "string" &&
        data.startsWith("http")
    ) {
        return {
            imageUrl: data,
            mimeType: "image/png"
        };
    }

    if (data.imageUrl) {
        return {
            imageUrl:
                data.imageUrl,
            mimeType:
                data.mimeType ||
                "image/png"
        };
    }

    if (data.url) {
        return {
            imageUrl:
                data.url,
            mimeType:
                data.mimeType ||
                "image/png"
        };
    }

    if (data.dataUrl) {
        return {
            dataUrl:
                data.dataUrl,
            mimeType:
                data.mimeType ||
                detectMimeFromDataUrl(
                    data.dataUrl
                ) ||
                "image/png"
        };
    }

    if (data.b64_json) {
        return {
            b64_json:
                data.b64_json,
            mimeType:
                data.mimeType ||
                "image/png"
        };
    }

    if (data.base64) {
        return {
            b64_json:
                data.base64,
            mimeType:
                data.mimeType ||
                "image/png"
        };
    }

    if (data.output) {
        return extractImageFromObject(
            Array.isArray(data.output)
                ? data.output[0]
                : data.output
        );
    }

    if (data.data) {
        if (Array.isArray(data.data)) {
            return extractImageFromObject(
                data.data[0]
            );
        }

        return extractImageFromObject(
            data.data
        );
    }

    return null;
}

function detectMimeFromDataUrl(
    dataUrl
) {
    const match =
        String(dataUrl || "").match(
            /^data:([^;,]+)/
        );

    return match
        ? match[1]
        : null;
}

function sanitizeFilename(
    name
) {
    return String(name || "image.png")
        .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getWidth(orientation) {
    if (orientation === "landscape") {
        return 1536;
    }

    return 1024;
}

function getHeight(orientation) {
    if (orientation === "landscape") {
        return 1024;
    }

    if (orientation === "square") {
        return 1024;
    }

    return 1536;
}

function sleep(ms) {
    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );
}
