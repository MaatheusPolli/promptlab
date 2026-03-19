export class EditorView {
  constructor() {
    this.container = document.getElementById('view-container');
    this.template = document.getElementById('tpl-editor');
  }

  render() {
    this.container.innerHTML = '';
    const clone = this.template.content.cloneNode(true);
    this.container.appendChild(clone);

    // Initial state
    this.setupParamListeners();
    this.setupVariableDetection();
  }

  setupVariableDetection() {
    const userPrompt = document.getElementById('user-prompt');
    const systemPrompt = document.getElementById('system-prompt');
    
    const detect = () => {
      const text = (systemPrompt.value + ' ' + userPrompt.value);
      const variables = [...new Set(text.match(/{{(.*?)}}/g) || [])];
      this.renderVariableFields(variables.map(v => v.replace(/{{|}}/g, '')));
    };

    userPrompt?.addEventListener('input', detect);
    systemPrompt?.addEventListener('input', detect);
  }

  renderVariableFields(vars) {
    const container = document.getElementById('variables-container');
    const fields = document.getElementById('variables-fields');
    
    // Atualiza também o informativo de mapeamento no painel de Batch
    this.updateBatchMapping(vars);

    if (vars.length === 0) {
      container.classList.add('hidden');
      return;
    }
    // ... rest of method
  }

  updateBatchMapping(vars) {
    const batchInput = document.getElementById('batch-input');
    if (!batchInput) return;

    const mappingLabel = document.querySelector('.batch-body label');
    if (vars.length > 0) {
      mappingLabel.innerHTML = `Dados (Ordem do CSV: ${vars.map((v, i) => `<strong>Col ${i+1}: ${v}</strong>`).join(', ')})`;
    } else {
      mappingLabel.textContent = 'Dados (Formato CSV: valor1, valor2...)';
    }
  }

    container.classList.remove('hidden');
    
    // Preserve existing values if possible
    const currentValues = {};
    fields.querySelectorAll('input').forEach(input => {
      currentValues[input.name] = input.value;
    });

    fields.innerHTML = vars.map(v => `
      <div class="var-field">
        <label title="Variável detectada no prompt">${v}</label>
        <input type="text" name="${v}" value="${currentValues[v] || ''}" placeholder="Preencher ${v}...">
      </div>
    `).join('');
  }

  getVariables() {
    const values = {};
    document.querySelectorAll('#variables-fields input').forEach(input => {
      values[input.name] = input.value;
    });
    return values;
  }

  toggleBatchContainer() {
    const container = document.getElementById('batch-container');
    container.classList.toggle('hidden');
  }

  getBatchData() {
    const input = document.getElementById('batch-input').value;
    if (!input.trim()) return [];
    
    return input.split('\n')
      .map(line => line.split(',').map(v => v.trim()))
      .filter(line => line.length > 0 && line[0] !== '');
  }

  updateBatchProgress(current, total) {
    const progress = document.getElementById('batch-progress');
    const curSpan = document.getElementById('batch-current');
    const totSpan = document.getElementById('batch-total');
    
    progress.classList.remove('hidden');
    curSpan.textContent = current;
    totSpan.textContent = total;
  }

  setupParamListeners() {
    const tempInput = document.getElementById('param-temp');
    const topkInput = document.getElementById('param-topk');
    const tempVal = document.getElementById('val-temp');
    const topkVal = document.getElementById('val-topk');

    tempInput?.addEventListener('input', (e) => {
      tempVal.textContent = e.target.value;
    });

    topkInput?.addEventListener('input', (e) => {
      topkVal.textContent = e.target.value;
    });
  }

  getEditorData() {
    return {
      systemPrompt: document.getElementById('system-prompt').value,
      userPrompt: document.getElementById('user-prompt').value,
      temperature: parseFloat(document.getElementById('param-temp').value),
      topK: parseInt(document.getElementById('param-topk').value)
    };
  }

  showBatchResults(results, varNames) {
    const output = document.getElementById('response-output');
    
    const tableHeader = `
      <thead>
        <tr>
          ${varNames.map(v => `<th>${v}</th>`).join('')}
          <th>Resposta (Resumo)</th>
          <th>Ação</th>
        </tr>
      </thead>
    `;

    const tableRows = results.map((res, index) => `
      <tr>
        ${res.input.map(val => `<td>${val}</td>`).join('')}
        <td class="text-truncate">${this.escapeHtml(res.output.substring(0, 50))}...</td>
        <td>
          <button class="btn-small btn-view-detail" data-index="${index}">Ver Full</button>
        </td>
      </tr>
    `).join('');

    output.innerHTML = `
      <div class="batch-results-wrapper">
        <h4>📊 Relatório de Execução em Lote</h4>
        <div class="table-scroll">
          <table class="batch-table">
            ${tableHeader}
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>
    `;

    // Armazenar resultados para visualização detalhada
    this.lastBatchResults = results;
  }

  showOutput(text) {
    const output = document.getElementById('response-output');
    
    // Simple Markdown code block parser
    const formatted = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'javascript';
      return `<pre class="line-numbers"><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>`;
    });

    output.innerHTML = `
      <div class="response-text">${formatted}</div>
      <div class="individual-export-actions">
        <button id="btn-export-json" class="btn-export"><span>📄</span> Export JSON</button>
        <button id="btn-export-md" class="btn-export"><span>📝</span> Export Markdown</button>
      </div>
    `;
    
    // Trigger Prism highlight
    if (window.Prism) {
      window.Prism.highlightAllUnder(output);
    }

    document.getElementById('btn-self-eval').disabled = false;
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  showLoading(isLoading) {
    const indicator = document.getElementById('loading-indicator');
    if (isLoading) {
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  }

  updateMetrics(metrics) {
    document.getElementById('m-time').textContent = metrics.responseTimeMs || '-';
    document.getElementById('m-tokens').textContent = (metrics.inputTokenEstimate + metrics.outputTokenEstimate) || '-';
    document.getElementById('m-consistency').textContent = metrics.consistencyScore || '-';
    document.getElementById('m-eval').textContent = metrics.selfEvalScore || '-';
  }

  showError(msg) {
    const output = document.getElementById('response-output');
    output.innerHTML = `<div class="error-msg" style="color: var(--danger-color)">${msg}</div>`;
  }
}
