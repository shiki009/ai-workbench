export class OPFSStore {
  constructor() {
    this.root = null;
    this.supported = false;
  }

  async init() {
    try {
      this.root = await navigator.storage.getDirectory();
      this.supported = true;
    } catch (e) {
      console.warn('OPFS not supported:', e.message);
      this.supported = false;
    }
  }

  async writeFile(path, data) {
    if (!this.supported) return false;
    try {
      const parts = path.split('/');
      let dir = this.root;
      for (let i = 0; i < parts.length - 1; i++) {
        dir = await dir.getDirectoryHandle(parts[i], { create: true });
      }
      const fileHandle = await dir.getFileHandle(parts[parts.length - 1], { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
      return true;
    } catch (e) {
      console.error('OPFS write error:', e);
      return false;
    }
  }

  async readFile(path) {
    if (!this.supported) return null;
    try {
      const parts = path.split('/');
      let dir = this.root;
      for (let i = 0; i < parts.length - 1; i++) {
        dir = await dir.getDirectoryHandle(parts[i]);
      }
      const fileHandle = await dir.getFileHandle(parts[parts.length - 1]);
      const file = await fileHandle.getFile();
      return file;
    } catch (e) {
      return null;
    }
  }

  async deleteFile(path) {
    if (!this.supported) return false;
    try {
      const parts = path.split('/');
      let dir = this.root;
      for (let i = 0; i < parts.length - 1; i++) {
        dir = await dir.getDirectoryHandle(parts[i]);
      }
      await dir.removeEntry(parts[parts.length - 1]);
      return true;
    } catch (e) {
      return false;
    }
  }

  async exists(path) {
    const file = await this.readFile(path);
    return file !== null;
  }

  async getSize(path) {
    const file = await this.readFile(path);
    return file ? file.size : 0;
  }
}
