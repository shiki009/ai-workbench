import { pipeline, env, TextStreamer } from '@huggingface/transformers';

env.allowLocalModels = false;

let generator = null;

self.addEventListener('message', async (e) => {
  const { type, data } = e.data;

  if (type === 'load-model') {
    try {
      generator = await pipeline(data.task, data.modelId, {
        dtype: data.quantized ? 'q4f16' : 'fp32',
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
    if (!generator) {
      self.postMessage({ type: 'error', data: { message: 'Model not loaded' } });
      return;
    }
    try {
      self.postMessage({ type: 'inference-start', data: {} });

      const messages = [
        { role: 'user', content: data.prompt },
      ];

      let fullText = '';
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        callback_function: (text) => {
          fullText += text;
          self.postMessage({
            type: 'inference-progress',
            data: { token: text, fullText },
          });
        },
      });

      await generator(messages, {
        max_new_tokens: data.maxTokens || 256,
        temperature: data.temperature || 0.7,
        do_sample: true,
        streamer,
      });

      self.postMessage({
        type: 'inference-complete',
        data: { result: fullText },
      });
    } catch (err) {
      self.postMessage({ type: 'error', data: { message: err.message } });
    }
  }
});
