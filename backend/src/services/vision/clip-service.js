import { env } from '../../config/env.js';

let extractorPromise;
async function extractor() {
  if (!extractorPromise) {
    const { pipeline, env: transformersEnv } = await import('@huggingface/transformers');
    transformersEnv.allowLocalModels = false;
    extractorPromise = pipeline('image-feature-extraction', env.visionModel, { dtype: 'q8' });
  }
  return extractorPromise;
}
function cosineSimilarity(a, b) {
  let dot = 0; let aMagnitude = 0; let bMagnitude = 0;
  for (let i = 0; i < a.length; i += 1) { dot += a[i] * b[i]; aMagnitude += a[i] ** 2; bMagnitude += b[i] ** 2; }
  return dot / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
}
export async function compareImages(pickupUrl, returnUrl) {
  if (env.visionMode === 'mock') return { similarityScore: 0.94, provider: 'mock-test-only', rawResult: { mode: 'mock' } };
  const model = await extractor();
  const [pickup, returned] = await Promise.all([model(pickupUrl, { pooling: 'mean', normalize: true }), model(returnUrl, { pooling: 'mean', normalize: true })]);
  return { similarityScore: Math.max(0, Math.min(1, cosineSimilarity(pickup.data, returned.data))), provider: env.visionModel, rawResult: { model: env.visionModel, method: 'cosine_similarity' } };
}
export async function warmVisionModel() { await extractor(); }
