import { TOOL_TYPES, COLORS } from '../constants.js';
import { ImageClassifierTool } from './ImageClassifierTool.js';
import { TextGeneratorTool } from './TextGeneratorTool.js';
import { ImageGeneratorTool } from './ImageGeneratorTool.js';
import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

const TOOL_DEFINITIONS = [
  {
    type: TOOL_TYPES.IMAGE_CLASSIFIER,
    label: 'Image Classifier',
    icon: '\u{1F50D}',
    color: 0x00d4ff,
    ToolClass: ImageClassifierTool,
  },
  {
    type: TOOL_TYPES.TEXT_GENERATOR,
    label: 'Text Generator',
    icon: '\u{270D}',
    color: 0x9b59ff,
    ToolClass: TextGeneratorTool,
  },
  {
    type: TOOL_TYPES.IMAGE_GENERATOR,
    label: 'Image Generator',
    icon: '\u{1F3A8}',
    color: 0xff6b9d,
    ToolClass: ImageGeneratorTool,
  },
];

export class ToolRegistry {
  constructor(panelManager, aiManager, storage) {
    this.panelManager = panelManager;
    this.aiManager = aiManager;
    this.storage = storage;
    this.tools = new Map();

    for (const def of TOOL_DEFINITIONS) {
      this.tools.set(def.type, {
        ...def,
        instance: null,
      });
    }

    this._setupEvents();
  }

  _setupEvents() {
    eventBus.on(EVENTS.MODEL_READY, ({ toolType }) => {
      const tool = this.tools.get(toolType);
      if (tool && tool.instance) {
        tool.instance.onModelReady();
      }
    });

    eventBus.on(EVENTS.INFERENCE_COMPLETE, ({ toolType, result }) => {
      const tool = this.tools.get(toolType);
      if (tool && tool.instance) {
        tool.instance.onInferenceComplete(result);
      }
    });
  }

  getAll() {
    return Array.from(this.tools.values());
  }

  activate(toolType) {
    const def = this.tools.get(toolType);
    if (!def) return;

    if (!def.instance) {
      def.instance = new def.ToolClass({
        type: def.type,
        label: def.label,
        panelManager: this.panelManager,
        aiManager: this.aiManager,
        storage: this.storage,
      });
    }

    def.instance.activate();
    eventBus.emit(EVENTS.TOOL_ACTIVATE, { toolType });
  }

  deactivate(toolType) {
    const def = this.tools.get(toolType);
    if (def && def.instance) {
      def.instance.deactivate();
      eventBus.emit(EVENTS.TOOL_DEACTIVATE, { toolType });
    }
  }
}
