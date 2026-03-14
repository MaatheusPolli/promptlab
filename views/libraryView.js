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
      ? '<div class="empty-state">Nenhum prompt salvo ainda.</div>'
      : '';

    prompts.forEach(p => {
      const item = document.createElement('div');
      item.className = 'lib-item';
      item.innerHTML = `
        <div class="lib-item-content">
          <h4>${p.title || 'Untitled Prompt'}</h4>
          <p>${p.userPrompt.substring(0, 100)}${p.userPrompt.length > 100 ? '...' : ''}</p>
          <div class="lib-tags">
            ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="lib-item-actions">
          <button class="btn-small btn-load" data-id="${p.id}">Carregar</button>
          <button class="btn-small btn-delete" data-id="${p.id}" style="background: var(--danger-color); color: white;">Deletar</button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  getSearchTerm() {
    return document.getElementById('lib-search').value.toLowerCase();
  }
}
