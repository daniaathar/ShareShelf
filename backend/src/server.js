import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { warmVisionModel } from './services/vision/clip-service.js';

async function start() {
  await prisma.$connect();
  app.listen(env.port, () => console.log(`ShareShelf API listening on http://localhost:${env.port}/api/v1`));
  if (env.visionMode === 'live') warmVisionModel().then(() => console.log('Pretrained CLIP model loaded')).catch((error) => console.warn('CLIP warm-up failed; evidence endpoint will report UNAVAILABLE:', error.message));
}
start().catch((error) => { console.error('API startup failed:', error); process.exit(1); });
