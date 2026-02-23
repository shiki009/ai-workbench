// Image generation worker using diffusers.js / ONNX Runtime Web
// Falls back gracefully if WebGPU is not available

let pipeline = null;

async function checkWebGPU() {
  if (!navigator.gpu) return false;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

self.addEventListener('message', async (e) => {
  const { type, data } = e.data;

  if (type === 'load-model') {
    try {
      const hasWebGPU = await checkWebGPU();

      if (!hasWebGPU) {
        self.postMessage({
          type: 'error',
          data: { message: 'WebGPU not available. Image generation requires WebGPU support.' },
        });
        return;
      }

      // Dynamic import for diffusers (may not be installed)
      const { StableDiffusionPipeline } = await import('@huggingface/transformers');

      self.postMessage({
        type: 'download-progress',
        data: { file: 'model', progress: 0, loaded: 0, total: 100 },
      });

      pipeline = await StableDiffusionPipeline.from_pretrained(data.modelId, {
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
    if (!pipeline) {
      self.postMessage({ type: 'error', data: { message: 'Model not loaded' } });
      return;
    }
    try {
      self.postMessage({ type: 'inference-start', data: {} });

      const result = await pipeline(data.prompt, {
        num_inference_steps: data.steps || 20,
        guidance_scale: data.guidanceScale || 7.5,
        callback: (step, totalSteps) => {
          self.postMessage({
            type: 'inference-progress',
            data: { step, totalSteps, progress: step / totalSteps },
          });
        },
      });

      // Convert to transferable ImageData or blob
      const imageData = result.images[0];
      self.postMessage({
        type: 'inference-complete',
        data: { result: imageData },
      });
    } catch (err) {
      self.postMessage({ type: 'error', data: { message: err.message } });
    }
  }
});
