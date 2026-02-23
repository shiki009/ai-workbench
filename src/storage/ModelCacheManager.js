import { OPFSStore } from './OPFSStore.js';

export class ModelCacheManager {
  constructor(opfsStore) {
    this.opfs = opfsStore;
    this._cacheStatus = new Map();
  }

  async isModelCached(modelId) {
    // First check transformers.js Cache API (uses Cache Storage by default)
    try {
      const cache = await caches.open('transformers-cache');
      const keys = await cache.keys();
      const hasModel = keys.some((req) => req.url.includes(modelId));
      if (hasModel) {
        this._cacheStatus.set(modelId, 'cached');
        return true;
      }
    } catch {
      // Cache API not available
    }

    // Fallback: check OPFS
    if (this.opfs.supported) {
      const exists = await this.opfs.exists(`models/${modelId}/config.json`);
      if (exists) {
        this._cacheStatus.set(modelId, 'cached-opfs');
        return true;
      }
    }

    return false;
  }

  getCacheStatus(modelId) {
    return this._cacheStatus.get(modelId) || 'not-cached';
  }

  async clearModelCache(modelId) {
    try {
      const cache = await caches.open('transformers-cache');
      const keys = await cache.keys();
      for (const req of keys) {
        if (req.url.includes(modelId)) {
          await cache.delete(req);
        }
      }
    } catch {
      // Ignore
    }

    if (this.opfs.supported) {
      await this.opfs.deleteFile(`models/${modelId}`);
    }

    this._cacheStatus.delete(modelId);
  }

  async estimateCacheSize() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentUsed: estimate.usage && estimate.quota
          ? ((estimate.usage / estimate.quota) * 100).toFixed(1)
          : 0,
      };
    }
    return { used: 0, quota: 0, percentUsed: 0 };
  }
}
