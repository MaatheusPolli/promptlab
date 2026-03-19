export class AIService {
  constructor() {
    this.session = null;
    this.abortController = null;
  }

  /**
   * Checks if Chrome AI APIs are available and provides instructions if not.
   * @returns {Promise<string[] | null>} Array of error messages or null if OK.
   */
  async checkRequirements() {
    const errors = [];

    // Unified AI API detection (matching working project: codereview-ai-master)
    const languageModel = window.ai?.languageModel || 
                         window.ai?.assistant || 
                         window.aiPrompt || 
                         window.model ||
                         window.chrome?.ai?.languageModel ||
                         navigator.ai?.languageModel ||
                         self.LanguageModel;

    if (!window.chrome) {
      errors.push("⚠️ Este recurso só funciona no Google Chrome ou Chrome Canary (versão recente).");
    }

    if (!window.isSecureContext) {
      errors.push("⚠️ O recurso de IA requer um contexto seguro (HTTPS ou localhost).");
    }

    if (!languageModel) {
      errors.push("❌ <strong>Acesso à IA bloqueado pelo Google.</strong>");
      errors.push("<br><strong>Como resolver:</strong>");
      errors.push("1. <strong>Mude de Perfil:</strong> Crie um novo perfil no Chrome (clique na sua foto -> Adicionar) e use-o <strong>sem fazer login</strong> em nenhuma conta.");
      errors.push("2. <strong>Conta Workspace:</strong> Se você usa e-mail de empresa ou faculdade, o administrador bloqueou este recurso.");
      errors.push("3. <strong>Idade:</strong> O Gemini Nano é desativado para contas de menores de 18 anos.");
      errors.push("4. <strong>Atividade na Web:</strong> Certifique-se que 'Atividade na Web e em Apps' está ligada em <a href='https://myactivity.google.com/activitycontrols' target='_blank'>myactivity.google.com</a>.");
      
      return errors;
    }

    // Alias the correct one to window.ai.languageModel for internal use if needed
    if (!window.ai) window.ai = {};
    if (!window.ai.languageModel) {
        window.ai.languageModel = languageModel;
    }

    try {
        const availability = await window.ai.languageModel.availability({ expectedOutputLanguage: 'en' });
        if (availability === 'unavailable' || availability === 'no') {
          errors.push("⚠️ O seu dispositivo não suporta modelos de linguagem nativos de IA.");
        } else if (availability === 'downloading') {
          errors.push("⚠️ O modelo de linguagem de IA está sendo baixado. Por favor, aguarde e tente novamente.");
        } else if (availability === 'after-download') {
          errors.push("⚠️ O modelo precisa ser baixado. Abra o console do Chrome para acompanhar se solicitado.");
        }
    } catch (e) {
        errors.push("❌ Erro ao inicializar a API de IA. Verifique as configurações do navegador.");
    }

    return errors.length > 0 ? errors : null;
  }

  /**
   * Runs a prompt with full parameter control and retry logic.
   * @param {Object} config
   * @param {string} config.systemPrompt
   * @param {string} config.userPrompt
   * @param {number} config.temperature
   * @param {number} config.topK
   * @returns {Promise<{output: string, responseTimeMs: number}>}
   */
  async runPrompt({ systemPrompt, userPrompt, temperature, topK }) {
    let lastError = null;
    const maxRetries = 2;
    const fallbackMessage = "Não foi possível gerar uma resposta no momento. Por favor, tente novamente.";

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const session = await window.ai.languageModel.create({
          systemPrompt,
          temperature,
          topK,
          expectedOutputLanguage: 'en'
        });

        const start = performance.now();
        try {
          const output = await session.prompt(userPrompt);
          const responseTimeMs = Math.round(performance.now() - start);
          return { output, responseTimeMs };
        } finally {
          session.destroy();
        }
      } catch (error) {
        lastError = error;
      }
    }

    return { 
      output: fallbackMessage, 
      responseTimeMs: 0,
      error: lastError?.message 
    };
  }

  /**
   * Runs a raw prompt with retry logic.
   * @param {string} text 
   * @param {Object} options 
   * @returns {Promise<string>}
   */
  async runRawPrompt(text, options = {}) {
    const maxRetries = 2;
    const fallbackMessage = "Não foi possível processar a solicitação interna.";

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const session = await window.ai.languageModel.create({
          ...options,
          expectedOutputLanguage: 'en'
        });
        try {
          return await session.prompt(text);
        } finally {
          session.destroy();
        }
      } catch (error) {
        // Silently retry
      }
    }

    return fallbackMessage;
  }

  /**
   * Helper to get model default params.
   */
  async getDefaults() {
    if (!window.ai?.languageModel) return { temperature: 0.7, topK: 3 };
    try {
      return await window.ai.languageModel.capabilities();
    } catch (e) {
      return { temperature: 0.7, topK: 3 };
    }
  }
}
