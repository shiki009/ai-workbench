import { eventBus } from '../events.js';
import { EVENTS, TOOL_TYPES } from '../constants.js';
import { getModelConfig } from './ModelRegistry.js';

export class AIManager {
  constructor() {
    this.workers = new Map();
    this.modelStatus = new Map();
  }

  getWorker(toolType) {
    if (this.workers.has(toolType)) {
      return this.workers.get(toolType);
    }

    let worker;
    switch (toolType) {
      case TOOL_TYPES.IMAGE_CLASSIFIER:
        worker = new Worker(
          new URL('./worker-image-classify.js', import.meta.url),
          { type: 'module' }
        );
        break;
      case TOOL_TYPES.TEXT_GENERATOR:
        worker = new Worker(
          new URL('./worker-text-generate.js', import.meta.url),
          { type: 'module' }
        );
        break;
      case TOOL_TYPES.IMAGE_GENERATOR:
        worker = new Worker(
          new URL('./worker-image-generate.js', import.meta.url),
          { type: 'module' }
        );
        break;
      default:
        throw new Error(`Unknown tool type: ${toolType}`);
    }

    this.workers.set(toolType, worker);
    this._setupWorkerListeners(worker, toolType);
    return worker;
  }

  _setupWorkerListeners(worker, toolType) {
    worker.addEventListener('message', (e) => {
      const { type, data } = e.data;
      switch (type) {
        case 'download-progress':
          this.modelStatus.set(toolType, 'downloading');
          eventBus.emit(EVENTS.MODEL_DOWNLOAD_PROGRESS, { toolType, ...data });
          break;
        case 'model-ready':
          this.modelStatus.set(toolType, 'ready');
          eventBus.emit(EVENTS.MODEL_READY, { toolType });
          break;
        case 'inference-start':
          eventBus.emit(EVENTS.INFERENCE_START, { toolType });
          break;
        case 'inference-progress':
          eventBus.emit(EVENTS.INFERENCE_PROGRESS, { toolType, ...data });
          break;
        case 'inference-complete':
          eventBus.emit(EVENTS.INFERENCE_COMPLETE, { toolType, ...data });
          break;
        case 'error':
          console.error(`Worker error [${toolType}]:`, data.message);
          break;
      }
    });

    worker.addEventListener('error', (e) => {
      console.error(`Worker error [${toolType}]:`, e);
    });
  }

  async loadModel(toolType) {
    const config = getModelConfig(toolType);
    if (!config) throw new Error(`No model config for: ${toolType}`);

    const worker = this.getWorker(toolType);
    this.modelStatus.set(toolType, 'loading');
    eventBus.emit(EVENTS.MODEL_DOWNLOAD_START, { toolType, config });

    worker.postMessage({ type: 'load-model', data: { modelId: config.modelId, task: config.task, quantized: config.quantized } });
  }

  async runInference(toolType, input) {
    const worker = this.getWorker(toolType);
    return new Promise((resolve) => {
      const handler = (e) => {
        if (e.data.type === 'inference-complete') {
          worker.removeEventListener('message', handler);
          resolve(e.data.data);
        }
      };
      worker.addEventListener('message', handler);
      worker.postMessage({ type: 'run-inference', data: input });
    });
  }

  terminateWorker(toolType) {
    const worker = this.workers.get(toolType);
    if (worker) {
      worker.terminate();
      this.workers.delete(toolType);
      this.modelStatus.delete(toolType);
    }
  }

  getStatus(toolType) {
    return this.modelStatus.get(toolType) || 'idle';
  }
}
