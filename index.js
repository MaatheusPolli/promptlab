import { AIService } from './services/aiService.js';
import { StorageService } from './services/storageService.js';
import { MetricsService } from './services/metricsService.js';
import { SelfEvalService } from './services/selfEvalService.js';

import { EditorView } from './views/editorView.js';
import { ABTestView } from './views/abTestView.js';
import { LibraryView } from './views/libraryView.js';
import { MetricsView } from './views/metricsView.js';

import { EditorController } from './controllers/editorController.js';
import { ABTestController } from './controllers/abTestController.js';
import { LibraryController } from './controllers/libraryController.js';

(async function main() {
  // Services
  const aiService = new AIService();
  const storageService = new StorageService();
  const metricsService = new MetricsService();
  const selfEvalService = new SelfEvalService(aiService);

  // Views
  const editorView = new EditorView();
  const abTestView = new ABTestView();
  const libraryView = new LibraryView();
  const metricsView = new MetricsView();

  // Check Requirements
  const errors = await aiService.checkRequirements();
  if (errors) {
    const notice = document.getElementById('setup-notice');
    notice.innerHTML = `
      <h2>⚠️ Requisitos Não Atendidos</h2>
      <ul style="text-align: left; list-style: none; padding: 0;">
        ${errors.map(e => `<li style="margin-bottom: 0.5rem;">${e}</li>`).join('')}
      </ul>
      <p style="margin-top: 2rem;">Consulte o README para instruções detalhadas de configuração.</p>
    `;
    return;
  }

  // Controllers
  const editorController = new EditorController(editorView, aiService, metricsService, selfEvalService, storageService, metricsView);
  const abTestController = new ABTestController(abTestView, aiService, metricsService, storageService);
  const libraryController = new LibraryController(libraryView, storageService, editorController);

  // Navigation Logic
  const navButtons = {
    'nav-single': () => {
      editorController.init();
    },
    'nav-ab': () => abTestController.init(),
    'nav-library': () => libraryController.init()
  };

  Object.keys(navButtons).forEach(id => {
    document.getElementById(id).addEventListener('click', (e) => {
      // Update UI active state
      Object.keys(navButtons).forEach(btnId => document.getElementById(btnId).classList.remove('active'));
      e.target.classList.add('active');
      
      // Load view
      navButtons[id]();
    });
  });

  // Export Library
  document.getElementById('export-library').addEventListener('click', async () => {
    try {
      await storageService.init(); // Garante que a DB está aberta
      const prompts = await storageService.getPrompts();
      
      if (!prompts || prompts.length === 0) {
        alert('Sua biblioteca está vazia. Salve alguns prompts antes de exportar!');
        return;
      }

      const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptlab-library-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Falha na exportação:', err);
      alert('Erro ao exportar biblioteca. Tente novamente.');
    }
  });

  // Check for Test Mode
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('test') === 'true') {
    console.log('🧪 Test Mode Detected');
    import('./tests/testRunner.js').then(async ({ TestRunner }) => {
      const runner = new TestRunner(metricsService, storageService);
      await runner.runAll();
    }).catch(err => console.error('Failed to load tests:', err));
  }

  // Start with default view
  navButtons['nav-single']();

  console.log('PromptLab initialized successfully');
})();
