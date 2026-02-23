import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;

let classifier = null;

self.addEventListener('message', async (e) => {
  const { type, data } = e.data;

  if (type === 'load-model') {
    try {
      classifier = await pipeline(data.task, data.modelId, {
        dtype: data.quantized ? 'fp16' : 'fp32',
        device: 'wasm',
        progress_callback: (progress) => {
          if (progress.status === 'progress') {
            self.postMessage({
              type: 'download-progress',
              data: {
                file: progress.file,
                progress: progress.progress,
                loaded: progress.loaded,
                total: progress.total,
              },
            });
          }
        },
      });
      self.postMessage({ type: 'model-ready', data: {} });
    } catch (err) {
      self.postMessage({ type: 'error', data: { message: err.message } });
    }
  }

  if (type === 'run-inference') {
    if (!classifier) {
      self.postMessage({ type: 'error', data: { message: 'Model not loaded' } });
      return;
    }
    try {
      self.postMessage({ type: 'inference-start', data: {} });
      const result = await classifier(data.imageData, { topk: 5 });
      self.postMessage({
        type: 'inference-complete',
        data: { result },
      });
    } catch (err) {
      self.postMessage({ type: 'error', data: { message: err.message } });
    }
  }
});
