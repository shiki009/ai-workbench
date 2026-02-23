import { TOOL_TYPES } from '../constants.js';

export const MODEL_REGISTRY = {
  [TOOL_TYPES.IMAGE_CLASSIFIER]: {
    modelId: 'Xenova/mobilevit-small',
    task: 'image-classification',
    label: 'MobileViT Small',
    size: '~25MB',
    quantized: true,
  },
  [TOOL_TYPES.TEXT_GENERATOR]: {
    modelId: 'HuggingFaceTB/SmolLM2-360M-Instruct',
    task: 'text-generation',
    label: 'SmolLM2 360M',
    size: '~360MB',
    quantized: true,
  },
  [TOOL_TYPES.IMAGE_GENERATOR]: {
    modelId: 'aislamov/stable-diffusion-2-1-base-onnx',
    task: 'image-generation',
    label: 'Stable Diffusion 2.1 (ONNX)',
    size: '~1.6GB',
    quantized: false,
    requiresWebGPU: true,
  },
};

export function getModelConfig(toolType) {
  return MODEL_REGISTRY[toolType] || null;
}
