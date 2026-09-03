// Server-only. Reads OPENAI_API_KEY from process.env directly — never import this
// file from client-bundled code (anything under src/ that LittleJetterApp.tsx or
// its dependency graph pulls in). Only api/**/*.ts and scripts/**/*.ts should import it.
const DEFAULT_MODEL = 'gpt-image-2';

export type GenerateImageOptions = {
  prompt: string;
  /** A known-good reference asset's raw bytes, used to steer style/proportions via an image-edit call. */
  referenceImage?: Buffer;
  size?: string;
  quality?: 'low' | 'medium' | 'high';
};

function requireApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it as a server-only environment variable (never VITE_-prefixed, never committed).');
  }
  return apiKey;
}

export async function generateClosetImage(options: GenerateImageOptions): Promise<Buffer> {
  const apiKey = requireApiKey();
  const model = process.env.OPENAI_IMAGE_MODEL ?? DEFAULT_MODEL;
  const size = options.size ?? '1024x1536';

  let response: Response;
  if (options.referenceImage) {
    const form = new FormData();
    form.append('model', model);
    form.append('prompt', options.prompt);
    form.append('size', size);
    form.append('background', 'transparent');
    if (options.quality) form.append('quality', options.quality);
    form.append('image', new Blob([new Uint8Array(options.referenceImage)], { type: 'image/png' }), 'reference.png');
    response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  } else {
    response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: options.prompt,
        size,
        background: 'transparent',
        quality: options.quality ?? 'high',
      }),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI image generation failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
  const first = payload.data?.[0];
  if (first?.b64_json) return Buffer.from(first.b64_json, 'base64');
  if (first?.url) {
    const imageResponse = await fetch(first.url);
    if (!imageResponse.ok) throw new Error(`Failed to download generated image (${imageResponse.status}).`);
    return Buffer.from(await imageResponse.arrayBuffer());
  }
  throw new Error('OpenAI image generation returned no image data.');
}
