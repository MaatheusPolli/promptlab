export class SelfEvalService {
  constructor(aiService) {
    this.aiService = aiService;
  }

  /**
   * Triggers a self-evaluation of the AI output.
   * @param {string} originalPrompt 
   * @param {string} output 
   * @returns {Promise<{score: number, reasoning: string}>}
   */
  async selfEvaluate(originalPrompt, output) {
    const evalPrompt = `### TAREFA: Avalie sua própria resposta anterior.
  PROMPT ORIGINAL: "${originalPrompt}"
  SUA RESPOSTA: "${output}"

  ### CRITÉRIOS (1-10):
  1. Precisão: A informação está correta?
  2. Completude: Respondeu tudo o que foi pedido?
  3. Estrutura: O texto está bem organizado?

  ### FORMATO DE RESPOSTA OBRIGATÓRIO (JSON APENAS):
  { "score": <número>, "reasoning": "<uma frase curta em português>" }`;

    try {
      const rawResult = await this.aiService.runRawPrompt(evalPrompt, { temperature: 0.1 });
      console.log('Self-Eval Raw Response:', rawResult);

      // Extração Ultra-Robusta: Ignora qualquer texto antes ou depois do objeto JSON
      const firstBrace = rawResult.indexOf('{');
      const lastBrace = rawResult.lastIndexOf('}');

      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('A IA não retornou um formato de dados válido.');
      }

      const jsonStr = rawResult.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr);

      return {
        score: Math.min(10, Math.max(0, Number(parsed.score) || 0)),
        reasoning: parsed.reasoning || 'O modelo não forneceu uma justificativa válida.'
      };
    } catch (error) {
      console.error('Self-evaluation failed:', error);
      // Fallback amigável em caso de falha de parsing
      return { 
        score: 0, 
        reasoning: `Não foi possível analisar a nota. A IA respondeu: "${rawResult?.substring(0, 50)}..."` 
      };
    }
  }

}
