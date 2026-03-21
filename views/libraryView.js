export class LibraryView {
  constructor() {
    this.container = document.getElementById('view-container');
    this.template = document.getElementById('tpl-library');
  }

  render(prompts = []) {
    this.container.innerHTML = '';
    const clone = this.template.content.cloneNode(true);
    this.container.appendChild(clone);
    this.renderPrompts(prompts);
  }

  renderSuggestions(tags) {
    const datalist = document.getElementById('tag-suggestions');
    if (!datalist) return;
    datalist.innerHTML = tags.map(tag => `<option value="${tag}">`).join('');
  }

  renderPrompts(prompts) {
    const list = document.getElementById('lib-list');
    list.innerHTML = prompts.length === 0 
      ? '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-dim);">Ainda não há prompts salvos na sua biblioteca.</div>'
      : '';

    prompts.forEach(p => {
      const card = document.createElement('div');
      card.className = 'prompt-card';
      card.innerHTML = `
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h4 style="font-weight: 700; color: var(--text-main);">${p.title || 'Sem Título'}</h4>
          <span style="font-size: 0.6rem; color: var(--text-dim); text-transform: uppercase;">${new Date(p.timestamp || Date.now()).toLocaleDateString()}</span>
        </div>
        <div class="card-body" style="flex: 1; overflow: hidden;">
          <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            ${p.userPrompt.substring(0, 150)}${p.userPrompt.length > 150 ? '...' : ''}
          </p>
          <div class="lib-tags" style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.75rem;">
            ${p.tags.map(t => `<span class="tag" style="font-size: 0.6rem; background: rgba(99, 102, 241, 0.1); color: var(--primary-color); padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid rgba(99, 102, 241, 0.2);">${t}</span>`).join('')}
          </div>
        </div>
        <div class="card-footer" style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
          <button class="btn-small btn-load" data-id="${p.id}" style="flex: 1;">📂 Carregar</button>
          <button class="btn-small btn-delete" data-id="${p.id}" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color); border-color: rgba(239, 68, 68, 0.2);">🗑️ Deletar</button>
        </div>
      `;
      list.appendChild(card);
    });
  }

  getSearchTerm() {
    return document.getElementById('lib-search').value.toLowerCase();
  }
}
