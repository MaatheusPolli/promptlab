export class LibraryController {
  constructor(view, storageService, editorController) {
    this.view = view;
    this.storageService = storageService;
    this.editorController = editorController;
  }

  async init() {
    const prompts = await this.storageService.getPrompts();
    this.view.render(prompts);
    this.setupEventListeners();
    this.updateTagSuggestions(prompts);
  }

  updateTagSuggestions(prompts) {
    const allTags = prompts.flatMap(p => p.tags);
    const uniqueTags = [...new Set(allTags)].sort();
    this.view.renderSuggestions(uniqueTags);
  }

  setupEventListeners() {
    document.getElementById('lib-search')?.addEventListener('input', () => this.handleSearch());
    
    // Delegate clicks for dynamic buttons
    document.getElementById('lib-list')?.addEventListener('click', (e) => {
      const target = e.target;
      const id = target.getAttribute('data-id');
      
      if (target.classList.contains('btn-load')) {
        this.handleLoadPrompt(id);
      } else if (target.classList.contains('btn-delete')) {
        this.handleDeletePrompt(id);
      }
    });
  }

  async handleSearch() {
    const term = this.view.getSearchTerm();
    const allPrompts = await this.storageService.getPrompts();
    
    const filtered = allPrompts.filter(p => {
      return p.title.toLowerCase().includes(term) || 
             p.tags.some(t => t.toLowerCase().includes(term));
    });
    
    this.view.renderPrompts(filtered);
  }

  async handleLoadPrompt(id) {
    const prompts = await this.storageService.getPrompts();
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    // Switch to editor view first
    document.getElementById('nav-single').click();
    
    // Fill editor (wait for render)
    setTimeout(() => {
      document.getElementById('system-prompt').value = prompt.systemPrompt || '';
      document.getElementById('user-prompt').value = prompt.userPrompt || '';
      document.getElementById('param-temp').value = prompt.parameters.temperature;
      document.getElementById('param-topk').value = prompt.parameters.topK;
      
      // Trigger input events to update displays
      document.getElementById('param-temp').dispatchEvent(new Event('input'));
      document.getElementById('param-topk').dispatchEvent(new Event('input'));
    }, 50);
  }

  async handleDeletePrompt(id) {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) return;
    
    try {
      await this.storageService.deletePrompt(id);
      this.init(); // re-render
    } catch (error) {
      alert(`Erro ao deletar: ${error.message}`);
    }
  }
}
