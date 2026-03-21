export class ABTestController {
  constructor(view, aiService, metricsService, storageService) {
    this.view = view;
    this.aiService = aiService;
    this.metricsService = metricsService;
    this.storageService = storageService;
  }

  init() {
    this.view.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('btn-run-ab')?.addEventListener('click', () => this.handleRunAB());
  }

  async handleRunAB() {
    const { A, B } = this.view.getABData();
    if (!A.userPrompt || !B.userPrompt) return;

    const btn = document.getElementById('btn-run-ab');
    btn?.classList.add('loading');
    if (btn) btn.disabled = true;
    this.view.showLoading(true);

    try {
      const [resA, resB] = await Promise.all([
        this.aiService.runPrompt({ ...A, systemPrompt: '' }),
        this.aiService.runPrompt({ ...B, systemPrompt: '' })
      ]);

      const diff = this.metricsService.computeDiff(resA.output, resB.output);
      this.view.showResults(resA, resB, diff);

      // Save to persistence
      await this.storageService.saveABTest({
        configA: A,
        configB: B,
        resultA: resA,
        resultB: resB,
        diff
      });
    } catch (error) {
      alert(`Erro no teste A/B: ${error.message}`);
    } finally {
      this.view.showLoading(false);
      btn?.classList.remove('loading');
      if (btn) btn.disabled = false;
    }
  }
}
