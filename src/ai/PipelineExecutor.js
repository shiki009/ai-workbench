import { eventBus } from '../events.js';
import { EVENTS } from '../constants.js';

export class PipelineExecutor {
  constructor(aiManager) {
    this.aiManager = aiManager;
    this.connections = [];

    eventBus.on(EVENTS.PIPELINE_CONNECT, ({ from, to }) => {
      this.connections.push({ from, to });
    });

    eventBus.on(EVENTS.PIPELINE_DISCONNECT, ({ from, to }) => {
      this.connections = this.connections.filter(
        (c) => c.from !== from || c.to !== to
      );
    });

    eventBus.on(EVENTS.INFERENCE_COMPLETE, ({ toolType, result }) => {
      this._propagate(toolType, result);
    });
  }

  _propagate(sourceType, result) {
    for (const conn of this.connections) {
      if (conn.from === sourceType) {
        eventBus.emit(EVENTS.PIPELINE_DATA, {
          fromTool: conn.from,
          toTool: conn.to,
          data: result,
        });
      }
    }
  }

  getConnectionsFrom(toolType) {
    return this.connections.filter((c) => c.from === toolType);
  }

  getConnectionsTo(toolType) {
    return this.connections.filter((c) => c.to === toolType);
  }
}
