import { STORAGE } from '../constants.js';

export class PreferencesStore {
  constructor() {
    this._key = STORAGE.PREFS_KEY;
  }

  get(key, defaultValue = null) {
    try {
      const data = JSON.parse(localStorage.getItem(this._key) || '{}');
      return key in data ? data[key] : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      const data = JSON.parse(localStorage.getItem(this._key) || '{}');
      data[key] = value;
      localStorage.setItem(this._key, JSON.stringify(data));
    } catch (e) {
      console.warn('PreferencesStore write error:', e);
    }
  }

  remove(key) {
    try {
      const data = JSON.parse(localStorage.getItem(this._key) || '{}');
      delete data[key];
      localStorage.setItem(this._key, JSON.stringify(data));
    } catch (e) {
      console.warn('PreferencesStore remove error:', e);
    }
  }

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this._key) || '{}');
    } catch {
      return {};
    }
  }

  clear() {
    localStorage.removeItem(this._key);
  }
}
