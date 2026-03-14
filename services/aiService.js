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

    if (!window.chrome) {
      errors.push("⚠️ Este recurso só funciona no Google Chrome ou Chrome Canary (versão recente).");
    }

    if (!window.ai?.languageModel) {
      errors.push("⚠️ As APIs nativas de IA (window.ai.languageModel) não estão ativas.");
      errors.push("Ative as seguintes flags em chrome://flags/:");
      errors.push("- Prompt API for Gemini Nano (#prompt-api-for-gemini-nano)");
      errors.push("- Optimization Guide On-Device Model (#optimization-guide-on-device-model - set to 'Enabled BypassPrefRequirement')");
      return errors;
    }

    const availability = await window.ai.languageModel.availability();
    if (availability === 'unavailable') {
      errors.push("⚠️ O seu dispositivo não suporta modelos de linguagem nativos de IA.");
    } else if (availability === 'downloading') {
      errors.push("⚠️ O modelo de linguagem de IA está sendo baixado. Por favor, aguarde e tente novamente.");
    } else if (availability === 'after-download') {
      errors.push("⚠️ O modelo precisa ser baixado. Abra o console do Chrome para acompanhar se solicitado.");
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
          topK
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
        console.warn(`Tentativa ${i + 1} falhou:`, error);
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
        const session = await window.ai.languageModel.create(options);
        try {
          return await session.prompt(text);
        } finally {
          session.destroy();
        }
      } catch (error) {
        console.warn(`Tentativa interna ${i + 1} falhou:`, error);
      }
    }

    return fallbackMessage;
  }

  /**
   * Helper to get model default params.
   */
  async getDefaults() {
    if (!window.ai?.languageModel) return { temperature: 0.7, topK: 3 };
    return await window.ai.languageModel.capabilities();
  }
}
