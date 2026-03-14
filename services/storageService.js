export class StorageService {
  constructor() {
    this.dbName = 'PromptLabDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store: prompts
        if (!db.objectStoreNames.contains('prompts')) {
          const promptStore = db.createObjectStore('prompts', { keyPath: 'id' });
          promptStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          promptStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }

        // Store: runs
        if (!db.objectStoreNames.contains('runs')) {
          const runStore = db.createObjectStore('runs', { keyPath: 'id' });
          runStore.createIndex('timestamp', 'timestamp', { unique: false });
          runStore.createIndex('promptId', 'promptId', { unique: false });
        }

        // Store: ab_tests
        if (!db.objectStoreNames.contains('ab_tests')) {
          const abStore = db.createObjectStore('ab_tests', { keyPath: 'id' });
          abStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async savePrompt(prompt) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['prompts'], 'readwrite');
      const store = transaction.objectStore(transaction.objectStoreNames[0]);
      const request = store.put({
        ...prompt,
        updatedAt: new Date(),
        createdAt: prompt.createdAt || new Date()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPrompts() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['prompts'], 'readonly');
      const store = transaction.objectStore('prompts');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePrompt(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['prompts'], 'readwrite');
      const store = transaction.objectStore('prompts');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveRun(run) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['runs'], 'readwrite');
      const store = transaction.objectStore('runs');
      const request = store.add({
        id: crypto.randomUUID(),
        ...run,
        timestamp: new Date()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getRunsByPromptId(promptId) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['runs'], 'readonly');
      const store = transaction.objectStore('runs');
      const index = store.index('promptId');
      const request = index.getAll(IDBKeyRange.only(promptId));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveABTest(testData) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ab_tests'], 'readwrite');
      const store = transaction.objectStore('ab_tests');
      const request = store.add({
        id: crypto.randomUUID(),
        ...testData,
        timestamp: new Date()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getABTests(limit = 20) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['ab_tests'], 'readonly');
      const store = transaction.objectStore('ab_tests');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      const results = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}
