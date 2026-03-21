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

  updateBatchMapping(vars) {
    const batchInput = document.getElementById('batch-input');
    if (!batchInput) return;

    const mappingLabel = document.querySelector('.batch-body label');
    if (vars.length > 0) {
      mappingLabel.innerHTML = `Dados (CSV: ${vars.map((v, i) => `<strong>Col ${i+1}: ${v}</strong>`).join(', ')})`;
    } else {
      mappingLabel.textContent = 'Dados (CSV)';
    }
  }

  getVariables() {
    const values = {};
    document.querySelectorAll('#variables-fields input').forEach(input => {
      values[input.name] = input.value;
    });
    return values;
  }

  clear() {
    document.getElementById('system-prompt').value = '';
    document.getElementById('user-prompt').value = '';
    document.getElementById('param-temp').value = 0.7;
    document.getElementById('param-topk').value = 10;
    document.getElementById('val-temp').textContent = '0.7';
    document.getElementById('val-topk').textContent = '10';
    document.getElementById('variables-container').classList.add('hidden');
    document.getElementById('variables-fields').innerHTML = '';
    document.getElementById('response-output').innerHTML = `
      <div class="empty-state" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-dim); flex-direction: column; gap: 1rem;">
          <span class="empty-state-icon">✨</span>
          <p>Aguardando execução...</p>
      </div>
    `;
    this.updateMetrics({
      responseTimeMs: 0,
      inputTokenEstimate: 0,
      outputTokenEstimate: 0,
      consistencyScore: null,
      selfEvalScore: null
    });
    document.getElementById('btn-self-eval').disabled = true;
  }

  showCopyFeedback(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>✅</span> Copiado!';
    btn.classList.add('btn-success');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('btn-success');
    }, 2000);
  }

  toggleBatchContainer() {
    const container = document.getElementById('batch-container');
    container.classList.toggle('hidden');
  }

  getBatchData() {
    const input = document.getElementById('batch-input').value.trim();
    if (!input) return [];
    
    // Detectar variáveis no prompt para decidir como dar parse
    const userPrompt = document.getElementById('user-prompt').value;
    const systemPrompt = document.getElementById('system-prompt').value;
    const text = (systemPrompt + ' ' + userPrompt);
    const varNames = [...new Set(text.match(/{{(.*?)}}/g) || [])];

    // Se houver apenas 1 variável e o input estiver em uma linha com vírgulas
    if (varNames.length === 1 && !input.includes('\n') && input.includes(',')) {
      return input.split(',').map(v => [v.trim()]).filter(v => v[0] !== '');
    }

    // Caso padrão: cada linha é um registro, colunas separadas por vírgula
    return input.split('\n')
      .map(line => line.split(',').map(v => v.trim()))
      .filter(line => line.length > 0 && line[0] !== '');
  }

  hideBatchProgress() {
    const progress = document.getElementById('batch-progress');
    if (progress) progress.classList.add('hidden');
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
    const timeEl = document.getElementById('m-time');
    const tokensEl = document.getElementById('m-tokens');
    const consistencyEl = document.getElementById('m-consistency');
    const evalEl = document.getElementById('m-eval');

    if (timeEl) timeEl.textContent = metrics.responseTimeMs ? `${metrics.responseTimeMs}ms` : '-';
    if (tokensEl) tokensEl.textContent = (metrics.inputTokenEstimate + metrics.outputTokenEstimate) ? `${metrics.inputTokenEstimate + metrics.outputTokenEstimate}` : '-';
    if (consistencyEl) consistencyEl.textContent = metrics.consistencyScore ? `${metrics.consistencyScore}%` : '-';
    if (evalEl) evalEl.textContent = metrics.selfEvalScore ? `${metrics.selfEvalScore}/10` : '-';
  }

  showError(msg) {
    const output = document.getElementById('response-output');
    output.innerHTML = `<div class="error-msg" style="color: var(--danger-color)">${msg}</div>`;
  }
}
