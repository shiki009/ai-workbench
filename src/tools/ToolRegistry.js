import { TOOL_TYPES, EVENTS } from '../constants.js';
import { ImageClassifierTool } from './ImageClassifierTool.js';
import { TextGeneratorTool } from './TextGeneratorTool.js';
import { ImageGeneratorTool } from './ImageGeneratorTool.js';
import { eventBus } from '../events.js';

const TOOL_DEFINITIONS = [
  {
    type: TOOL_TYPES.IMAGE_CLASSIFIER,
    label: 'Image Classifier',
    icon: '\u{1F50D}',
    description: 'Classify images with MobileViT',
    cssColor: 'rgba(0, 212, 255, 0.15)',
    ToolClass: ImageClassifierTool,
  },
  {
    type: TOOL_TYPES.TEXT_GENERATOR,
    label: 'Text Generator',
    icon: '\u{270D}\u{FE0F}',
    description: 'Generate text with SmolLM2',
    cssColor: 'rgba(155, 89, 255, 0.15)',
    ToolClass: TextGeneratorTool,
  },
  {
    type: TOOL_TYPES.IMAGE_GENERATOR,
    label: 'Image Generator',
    icon: '\u{1F3A8}',
    description: 'Create images with Stable Diffusion',
    cssColor: 'rgba(255, 107, 157, 0.15)',
    ToolClass: ImageGeneratorTool,
  },
];

export class ToolRegistry {
  constructor(workspace, aiManager, storage) {
    this.workspace = workspace;
    this.aiManager = aiManager;
    this.storage = storage;
    this.tools = new Map();

    for (const def of TOOL_DEFINITIONS) {
      this.tools.set(def.type, { ...def, instance: null });
    }

    this._setupEvents();
  }

  _setupEvents() {
    eventBus.on(EVENTS.TOOL_ACTIVATE, ({ toolType }) => {
      this.activate(toolType);
    });

    eventBus.on(EVENTS.TOOL_DEACTIVATE, ({ toolType }) => {
      this.deactivate(toolType);
    });
  }

  getDefinitions() {
    return Array.from(this.tools.values());
  }

  activate(toolType) {
    const def = this.tools.get(toolType);
    if (!def) return;

    if (!def.instance) {
      def.instance = new def.ToolClass({
        type: def.type,
        label: def.label,
        icon: def.icon,
        workspace: this.workspace,
        aiManager: this.aiManager,
        storage: this.storage,
      });
    }

    def.instance.activate();
  }

  deactivate(toolType) {
    const def = this.tools.get(toolType);
    if (def && def.instance) {
      def.instance.deactivate();
      def.instance = null;
    }
  }
}
