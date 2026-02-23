import { IndexedDBStore } from './IndexedDBStore.js';
import { OPFSStore } from './OPFSStore.js';
import { PreferencesStore } from './PreferencesStore.js';
import { ModelCacheManager } from './ModelCacheManager.js';
import { STORAGE } from '../constants.js';

export class StorageManager {
  constructor() {
    this.idb = new IndexedDBStore();
    this.opfs = new OPFSStore();
    this.prefs = new PreferencesStore();
    this.modelCache = null;
  }

  async init() {
    await this.idb.init();
    await this.opfs.init();
    this.modelCache = new ModelCacheManager(this.opfs);
  }

  // Workspace
  async saveWorkspace(data) {
    await this.idb.put(STORAGE.STORE_WORKSPACE, { id: 'current', ...data, updatedAt: Date.now() });
  }

  async loadWorkspace() {
    return this.idb.get(STORAGE.STORE_WORKSPACE, 'current');
  }

  // History
  async addHistory(entry) {
    await this.idb.put(STORAGE.STORE_HISTORY, {
      ...entry,
      timestamp: Date.now(),
    });
  }

  async getHistory(toolType = null) {
    const all = await this.idb.getAll(STORAGE.STORE_HISTORY);
    if (toolType) return all.filter((e) => e.toolType === toolType);
    return all;
  }

  // Images
  async saveImage(id, blob) {
    await this.idb.put(STORAGE.STORE_IMAGES, { id, blob, createdAt: Date.now() });
  }

  async getImage(id) {
    return this.idb.get(STORAGE.STORE_IMAGES, id);
  }

  async getAllImages() {
    return this.idb.getAll(STORAGE.STORE_IMAGES);
  }

  // Preferences
  getPref(key, defaultValue) {
    return this.prefs.get(key, defaultValue);
  }

  setPref(key, value) {
    this.prefs.set(key, value);
  }
}
