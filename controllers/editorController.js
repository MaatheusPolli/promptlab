import { uiUtils } from '../services/uiUtils.js';

export class EditorController {
  constructor(view, aiService, metricsService, selfEvalService, storageService, metricsView) {
    this.view = view;
    this.aiService = aiService;
    this.metricsService = metricsService;
    this.selfEvalService = selfEvalService;
    this.storageService = storageService;
    this.metricsView = metricsView;
    
    this.currentOutput = null;
    this.currentMetrics = {
      responseTimeMs: 0,
      inputTokenEstimate: 0,
      outputTokenEstimate: 0,
      consistencyScore: null,
      selfEvalScore: null
    };
  }

  init() {
    this.view.render();
    this.setupEventListeners();
    this.refreshChart();
  }

  async refreshChart() {
    const runs = await this.storageService.getLastRuns();
    this.metricsView.init('metrics-chart');
    this.metricsView.draw(runs);
  }

  setupEventListeners() {
    const container = document.getElementById('view-container');
    
    // Static delegates or direct listeners
    document.getElementById('btn-run')?.addEventListener('click', () => this.handleRun());
    document.getElementById('btn-consistency')?.addEventListener('click', () => this.handleConsistencyTest());
    document.getElementById('btn-batch')?.addEventListener('click', () => this.view.toggleBatchContainer());
    
    // Add event listener for container elements (using delegation)
    container.addEventListener('click', (e) => {
      if (e.target.id === 'btn-batch-run') this.handleBatchRun();
      if (e.target.id === 'btn-close-batch') this.view.toggleBatchContainer();
      if (e.target.id === 'btn-export-json') this.handleExport('json');
      if (e.target.id === 'btn-export-md') this.handleExport('markdown');
      
      // Botão Ver Full na tabela de lote
      if (e.target.classList.contains('btn-view-detail')) {
        const index = e.target.dataset.index;
        const result = this.view.lastBatchResults[index];
        this.currentOutput = result.output;
        this.view.showOutput(result.output);
      }
    });

    document.getElementById('btn-self-eval')?.addEventListener('click', () => this.handleSelfEval());
    document.getElementById('save-prompt')?.addEventListener('click', () => this.handleSavePrompt());
    document.getElementById('clear-editor')?.addEventListener('click', () => this.handleClearEditor());
    document.getElementById('copy-response')?.addEventListener('click', () => this.handleCopyResponse());

    // Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const runBtn = document.getElementById('btn-run');
        if (runBtn && !runBtn.disabled) {
          this.handleRun();
        }
      }
    });
  }

  async handleClearEditor() {
    const confirmed = await uiUtils.confirm(
      'Limpar Editor', 
      'Tem certeza que deseja limpar todos os campos do prompt? Esta ação não pode ser desfeita.'
    );
    
    if (confirmed) {
      this.view.clear();
      this.currentOutput = null;
    }
  }

  async handleCopyResponse() {
    if (!this.currentOutput) return;
    try {
      await navigator.clipboard.writeText(this.currentOutput);
      this.view.showCopyFeedback('copy-response');
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  }

  async handleBatchRun() {
    const batchInput = document.getElementById('batch-input');
    const batchData = this.view.getBatchData();
    
    // Validação
    if (batchData.length === 0) {
      batchInput.classList.add('input-error');
      batchInput.placeholder = "⚠️ Por favor, insira dados para o lote (ex: valor1, valor2)";
      setTimeout(() => batchInput.classList.remove('input-error'), 2000);
      return;
    }

    const data = this.view.getEditorData();
    const btn = document.getElementById('btn-batch-run');
    
    // Get variable names from current template
    const text = (data.systemPrompt + ' ' + data.userPrompt);
    const varNames = [...new Set(text.match(/{{(.*?)}}/g) || [])].map(v => v.replace(/{{|}}/g, ''));

    if (varNames.length === 0) {
      alert('Nenhuma variável {{}} encontrada no prompt para preencher com os dados do lote.');
      return;
    }

    btn.classList.add('loading');
    this.view.showLoading(true);
    const results = [];

    try {
      for (let i = 0; i < batchData.length; i++) {
        this.view.updateBatchProgress(i + 1, batchData.length);
        
        const row = batchData[i];
        let processedSystem = data.systemPrompt;
        let processedUser = data.userPrompt;

        // Mapeamento dinâmico: Coluna 1 vai para a primeira variável, Coluna 2 para a segunda, etc.
        varNames.forEach((name, idx) => {
          const val = row[idx] || row[0] || ''; // Fallback para a primeira coluna se houver apenas uma
          const regex = new RegExp(`{{${name}}}`, 'g');
          processedSystem = processedSystem.replace(regex, val);
          processedUser = processedUser.replace(regex, val);
        });

        try {
          const { output, responseTimeMs } = await this.aiService.runPrompt({
            ...data,
            systemPrompt: processedSystem,
            userPrompt: processedUser
          });

          results.push({ input: row, output });
          
          // Save each run
          await this.storageService.saveRun({
            promptId: null,
            promptText: processedUser,
            output,
            metrics: {
              responseTimeMs,
              inputTokenEstimate: this.metricsService.estimateTokens(processedSystem + processedUser),
              outputTokenEstimate: this.metricsService.estimateTokens(output)
            }
          });
        } catch (itemError) {
          console.error(`Erro no item ${i}:`, itemError);
          results.push({ input: row, output: `❌ Erro: ${itemError.message}` });
        }
      }

      // Renderiza a tabela de resultados completa
      this.view.showBatchResults(results, varNames);
      this.refreshChart();
    } catch (error) {
      this.view.showError(`Erro crítico no lote: ${error.message}`);
    } finally {
      this.view.showLoading(false);
      this.view.hideBatchProgress();
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  handleExport(format) {
    if (!this.currentOutput) return;

    const data = this.view.getEditorData();
    const exportData = {
      title: "PromptLab Export",
      systemPrompt: data.systemPrompt,
      userPrompt: data.userPrompt,
      output: this.currentOutput,
      metrics: this.currentMetrics,
      timestamp: new Date().toISOString()
    };

    let blob, filename;

    if (format === 'json') {
      blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      filename = `prompt-export-${Date.now()}.json`;
    } else {
      const content = `# PromptLab Export\n\n## System Prompt\n${data.systemPrompt}\n\n## User Prompt\n${data.userPrompt}\n\n## Output\n${this.currentOutput}\n\n--- \n*Generated via Gemini Nano*`;
      blob = new Blob([content], { type: 'text/markdown' });
      filename = `prompt-export-${Date.now()}.md`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async handleRun() {
    const data = this.view.getEditorData();
    if (!data.userPrompt) return;

    const btn = document.getElementById('btn-run');
    btn?.classList.add('loading');
    this.view.showLoading(true);

    // Process variables
    const vars = this.view.getVariables();
    let processedSystemPrompt = data.systemPrompt;
    let processedUserPrompt = data.userPrompt;

    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedSystemPrompt = processedSystemPrompt.replace(regex, value);
      processedUserPrompt = processedUserPrompt.replace(regex, value);
    }

    try {
      const { output, responseTimeMs } = await this.aiService.runPrompt({
        ...data,
        systemPrompt: processedSystemPrompt,
        userPrompt: processedUserPrompt
      });
      
      this.currentOutput = output;
      this.currentMetrics = {
        responseTimeMs,
        inputTokenEstimate: this.metricsService.estimateTokens(data.systemPrompt + data.userPrompt),
        outputTokenEstimate: this.metricsService.estimateTokens(output),
        consistencyScore: null,
        selfEvalScore: null
      };

      this.view.showOutput(output);
      this.view.updateMetrics(this.currentMetrics);
      
      // Auto-save run to history
      await this.storageService.saveRun({
        promptId: null, // to be updated if saved
        promptText: data.userPrompt,
        output,
        metrics: this.currentMetrics
      });

      // Refresh Chart
      this.refreshChart();

    } catch (error) {
      this.view.showError(`Erro: ${error.message}`);
    } finally {
      this.view.showLoading(false);
      btn?.classList.remove('loading');
    }
  }

  async handleConsistencyTest() {
    const data = this.view.getEditorData();
    if (!data.userPrompt) return;

    const confirmed = await uiUtils.confirm(
      'Teste de Estabilidade',
      'Este teste executará o mesmo prompt 3 vezes para medir a variação. Isso pode levar alguns segundos. Deseja continuar?'
    );

    if (!confirmed) return;

    const btn = document.getElementById('btn-consistency');
    btn?.classList.add('loading');
    this.view.showLoading(true);

    try {
      const outputs = [];
      for (let i = 0; i < 3; i++) {
        const { output } = await this.aiService.runPrompt(data);
        outputs.push(output);
      }

      const score = this.metricsService.computeConsistencyScore(outputs);
      this.currentMetrics.consistencyScore = score;
      
      this.view.showOutput(outputs[outputs.length - 1]);
      this.view.updateMetrics(this.currentMetrics);
    } catch (error) {
      this.view.showError(`Erro no teste de consistência: ${error.message}`);
    } finally {
      this.view.showLoading(false);
      btn?.classList.remove('loading');
    }
  }

  async handleSelfEval() {
    if (!this.currentOutput) return;

    const data = this.view.getEditorData();
    const btn = document.getElementById('btn-self-eval');
    
    btn?.classList.add('loading');
    this.view.showLoading(true);

    // Resetar a métrica visualmente para indicar que uma nova análise começou
    this.currentMetrics.selfEvalScore = null;
    this.view.updateMetrics(this.currentMetrics);

    // Pequena pausa para a API do Chrome respirar entre chamadas consecutivas
    await new Promise(r => setTimeout(r, 500));

    try {
      const { score, reasoning } = await this.selfEvalService.selfEvaluate(data.userPrompt, this.currentOutput);
      this.currentMetrics.selfEvalScore = score;
      this.view.updateMetrics(this.currentMetrics);
      
      // Injetar resultado visualmente em vez de alert
      const outputArea = document.getElementById('response-output');
      const evalHtml = `
        <div class="eval-result">
          <div style="margin-bottom: 0.5rem; font-weight: bold; color: var(--accent-color);">⭐ Auto-Avaliação da IA</div>
          <div>
            <span class="eval-score-badge">${score}/10</span>
            <span class="eval-reasoning">${reasoning}</span>
          </div>
        </div>
      `;
      
      const existingEval = outputArea.querySelector('.eval-result');
      if (existingEval) existingEval.remove();
      outputArea.insertAdjacentHTML('beforeend', evalHtml);

    } catch (error) {
      alert(`Erro na auto-avaliação: ${error.message}`);
    } finally {
      this.view.showLoading(false);
      btn?.classList.remove('loading');
    }
  }

  async handleSavePrompt() {
    const data = this.view.getEditorData();
    if (!data.userPrompt) return;

    const title = prompt('Dê um título para este prompt:');
    if (!title) return;

    const tagsInput = prompt('Tags (separadas por vírgula):');
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

    try {
      const promptObj = {
        id: crypto.randomUUID(),
        title,
        systemPrompt: data.systemPrompt,
        userPrompt: data.userPrompt,
        parameters: {
          temperature: data.temperature,
          topK: data.topK
        },
        tags,
        runCount: 1,
        bestScore: this.currentMetrics.selfEvalScore
      };

      await this.storageService.savePrompt(promptObj);
      alert('Prompt salvo na biblioteca!');
    } catch (error) {
      alert(`Erro ao salvar: ${error.message}`);
    }
  }
}
