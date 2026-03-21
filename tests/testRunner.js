// Comprehensive Test Hub for PromptLab
// Covers UI Scenarios, Storage, Metrics, and AI Integration

const assert = {
  equal: (a, b, msg) => {
    if (a !== b) throw new Error(`${msg}: Expected ${b}, got ${a}`);
    console.log(`✅ PASS: ${msg}`);
  },
  ok: (val, msg) => {
    if (!val) throw new Error(`${msg}: Expected truthy, got ${val}`);
    console.log(`✅ PASS: ${msg}`);
  }
};

export class TestRunner {
  constructor(metricsService, storageService) {
    this.metrics = metricsService;
    this.storage = storageService;
  }

  async runAll() {
    const outputDiv = this.createTestUI();
    console.group('🧪 PromptLab Test Hub');

    try {
      await this.testUnitMetrics();
      await this.testUnitStorage();
      await this.testUIScenarios(outputDiv);
      
      outputDiv.innerHTML = '<h3 style="color: #10b981">🎉 Todos os testes passaram!</h3><p>Verifique o console para detalhes técnicos.</p>';
    } catch (error) {
      console.error('❌ FALHA NOS TESTES:', error);
      outputDiv.innerHTML = `<h3 style="color: #ef4444">❌ Falha no Teste</h3><p style="color: #f1f5f9">${error.message}</p>`;
      outputDiv.style.borderColor = '#ef4444';
    }
    console.groupEnd();
  }

  createTestUI() {
    const existing = document.getElementById('test-hub-ui');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.id = 'test-hub-ui';
    div.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; width: 300px;
      background: #151c2e; padding: 1.5rem; border: 2px solid #6366f1;
      border-radius: 12px; color: #f1f5f9; z-index: 10000;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-family: sans-serif;
    `;
    div.innerHTML = '<h3>🧪 Test Hub Ativo</h3><p id="test-status">Executando suíte completa...</p>';
    document.body.appendChild(div);
    return div;
  }

  async testUnitMetrics() {
    console.group('Módulo: Métricas');
    assert.equal(this.metrics.estimateTokens('PromptLab Test'), 4, 'Token estimate check');
    assert.equal(this.metrics.computeConsistencyScore(['A', 'A', 'A']), 100, 'Consistency identical');
    console.groupEnd();
  }

  async testUnitStorage() {
    console.group('Módulo: Storage');
    const id = 'test-' + Date.now();
    await this.storage.savePrompt({ id, title: 'Test', userPrompt: 'test', systemPrompt: '', tags: [], parameters: {} });
    const prompts = await this.storage.getPrompts();
    assert.ok(prompts.find(p => p.id === id), 'Save and retrieval');
    await this.storage.deletePrompt(id);
    console.groupEnd();
  }

  async testUIScenarios(ui) {
    console.group('Cenários de Interface');
    const status = ui.querySelector('#test-status');

    // 1. Single Run Scenario
    status.innerText = 'Cenário 1: Execução Simples...';
    await this.simulateSingleRun();
    
    // 2. Variables Scenario
    status.innerText = 'Cenário 2: Injeção de Variáveis...';
    await this.simulateVariableInjection();

    // 3. Batch Scenario
    status.innerText = 'Cenário 3: Execução em Lote...';
    await this.simulateBatchRun();

    // 4. A/B Test Scenario
    status.innerText = 'Cenário 4: Teste A/B...';
    await this.simulateABTest();

    console.groupEnd();
  }

  async simulateSingleRun() {
    // Navigate to Single Run
    document.getElementById('nav-single').click();
    const userPrompt = document.getElementById('user-prompt');
    const runBtn = document.getElementById('btn-run');
    
    userPrompt.value = 'Teste de sanidade da UI';
    runBtn.click();
    
    await this.waitFor(1000); // Wait for mock AI
    const output = document.getElementById('response-output').innerText;
    assert.ok(output.length > 0, 'Output gerado na tela');
  }

  async simulateVariableInjection() {
    const userPrompt = document.getElementById('user-prompt');
    userPrompt.value = 'Olá {{nome}}, como vai?';
    // Trigger input event for detection
    userPrompt.dispatchEvent(new Event('input'));
    
    await this.waitFor(100);
    const varFields = document.getElementById('variables-fields');
    assert.ok(varFields.querySelector('input[name="nome"]'), 'Campo de variável detectado e renderizado');
    
    varFields.querySelector('input').value = 'Mundo';
    document.getElementById('btn-run').click();
    
    await this.waitFor(1000);
    // Verificaria se o runPrompt foi chamado com o valor processado se tivéssemos spy
  }

  async simulateBatchRun() {
    document.getElementById('btn-batch').click();
    const batchInput = document.getElementById('batch-input');
    batchInput.value = 'João\nMaria\nJosé';
    
    // O controller lida com o resto
    assert.ok(!document.getElementById('batch-container').classList.contains('hidden'), 'Painel Batch visível');
    document.getElementById('btn-close-batch').click();
  }

  async simulateABTest() {
    document.getElementById('nav-ab').click();
    const promptA = document.getElementById('prompt-a');
    const promptB = document.getElementById('prompt-b');
    
    assert.ok(promptA && promptB, 'Inputs de teste A/B presentes');
    
    promptA.value = 'Versão A';
    promptB.value = 'Versão B';
    
    document.getElementById('btn-run-ab').click();
    await this.waitFor(1500);
    
    const resA = document.getElementById('res-a').innerText;
    const resB = document.getElementById('res-b').innerText;
    assert.ok(resA.length > 0 && resB.length > 0, 'Ambas respostas geradas no A/B');
  }

  waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
