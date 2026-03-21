export class ABTestView {
  constructor() {
    this.container = document.getElementById('view-container');
    this.template = document.getElementById('tpl-ab-test');
  }

  render() {
    this.container.innerHTML = '';
    const clone = this.template.content.cloneNode(true);
    this.container.appendChild(clone);
    this.setupParamListeners();
  }

  setupParamListeners() {
    ['a', 'b'].forEach(side => {
      const input = document.getElementById(`temp-${side}`);
      const val = document.getElementById(`val-temp-${side}`);
      input?.addEventListener('input', (e) => {
        val.textContent = e.target.value;
      });
    });
  }

  getABData() {
    return {
      A: {
        userPrompt: document.getElementById('prompt-a').value,
        temperature: parseFloat(document.getElementById('temp-a').value),
        topK: 10 // default
      },
      B: {
        userPrompt: document.getElementById('prompt-b').value,
        temperature: parseFloat(document.getElementById('temp-b').value),
        topK: 10 // default
      }
    };
  }

  showResults(resA, resB, diff) {
    document.getElementById('res-a').textContent = resA.output;
    document.getElementById('res-b').textContent = resB.output;
    
    const diffContainer = document.getElementById('diff-view');
    const diffContent = document.getElementById('diff-content');
    
    diffContainer.classList.remove('hidden');
    diffContent.innerHTML = diff.map(part => {
      return `<span class="word-${part.status}">${part.word}</span>`;
    }).join(' ');
  }

  showLoading(isLoading) {
    const loading = document.getElementById('ab-loading');
    if (isLoading) {
      loading.classList.remove('hidden');
    } else {
      loading.classList.add('hidden');
    }
  }
}
