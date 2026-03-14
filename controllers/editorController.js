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
    document.getElementById('btn-batch-run')?.remove(); // Cleanup if exists
    
    // Add event listener for the run batch button (using delegation)
    container.addEventListener('click', (e) => {
      if (e.target.id === 'btn-batch-run') this.handleBatchRun();
      if (e.target.id === 'btn-export-json') this.handleExport('json');
      if (e.target.id === 'btn-export-md') this.handleExport('markdown');
    });

    document.getElementById('btn-self-eval')?.addEventListener('click', () => this.handleSelfEval());
    document.getElementById('save-prompt')?.addEventListener('click', () => this.handleSavePrompt());
  }

  async handleBatchRun() {
    const data = this.view.getEditorData();
    const batchData = this.view.getBatchData();
    if (batchData.length === 0) return;

    // Get variable names from current template
    const text = (data.systemPrompt + ' ' + data.userPrompt);
    const varNames = [...new Set(text.match(/{{(.*?)}}/g) || [])].map(v => v.replace(/{{|}}/g, ''));

    if (varNames.length === 0) {
      alert('Nenhuma variável encontrada no prompt.');
      return;
    }

    this.view.showLoading(true);
    const results = [];

    try {
      for (let i = 0; i < batchData.length; i++) {
        this.view.updateBatchProgress(i + 1, batchData.length);
        
        const row = batchData[i];
        let processedSystem = data.systemPrompt;
        let processedUser = data.userPrompt;

        varNames.forEach((name, idx) => {
          const val = row[idx] || '';
          const regex = new RegExp(`{{${name}}}`, 'g');
          processedSystem = processedSystem.replace(regex, val);
          processedUser = processedUser.replace(regex, val);
        });

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
      }

      // Show summary of last run or a combined view
      this.view.showOutput(`### 📦 Resultados do Lote (${results.length} execuções)\n\nÚltima saída:\n${results[results.length-1].output}`);
      this.refreshChart();
      alert('Execução em lote concluída!');
    } catch (error) {
      this.view.showError(`Erro no lote: ${error.message}`);
    } finally {
      this.view.showLoading(false);
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

    // Process variables
    const vars = this.view.getVariables();
    let processedSystemPrompt = data.systemPrompt;
    let processedUserPrompt = data.userPrompt;

    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedSystemPrompt = processedSystemPrompt.replace(regex, value);
      processedUserPrompt = processedUserPrompt.replace(regex, value);
    }

    this.view.showLoading(true);
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
    }
  }

  async handleConsistencyTest() {
    const data = this.view.getEditorData();
    if (!data.userPrompt) return;

    if (!confirm('Este teste executará o prompt 3 vezes para medir a estabilidade da resposta. Deseja continuar?')) return;

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
    }
  }

  async handleSelfEval() {
    if (!this.currentOutput) return;

    const data = this.view.getEditorData();
    this.view.showLoading(true);
    try {
      const { score, reasoning } = await this.selfEvalService.selfEvaluate(data.userPrompt, this.currentOutput);
      this.currentMetrics.selfEvalScore = score;
      this.view.updateMetrics(this.currentMetrics);
      alert(`Auto-Avaliação: ${score}/10\nMotivo: ${reasoning}`);
    } catch (error) {
      alert(`Erro na auto-avaliação: ${error.message}`);
    } finally {
      this.view.showLoading(false);
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
