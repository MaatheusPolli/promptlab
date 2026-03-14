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
    const evalPrompt = `
You previously responded to this prompt:
"${originalPrompt}"

Your response was:
"${output}"

Rate your own response on a scale of 1–10 based on:
- Accuracy and correctness
- Completeness
- Clarity and structure
- Following the original instructions

Return ONLY a JSON object:
{ "score": <1-10>, "reasoning": "<one sentence why>" }
`;

    try {
      // Use low temperature for more consistent evaluation
      const result = await this.aiService.runRawPrompt(evalPrompt, { temperature: 0.1 });
      
      // Try to extract JSON from result (in case AI adds noise)
      const jsonMatch = result.match(/\{.*\}/s);
      const jsonStr = jsonMatch ? jsonMatch[0] : result;
      
      const parsed = JSON.parse(jsonStr);
      return {
        score: Number(parsed.score) || null,
        reasoning: parsed.reasoning || 'No reasoning provided'
      };
    } catch (error) {
      console.error('Self-evaluation failed:', error);
      return { score: null, reasoning: `Evaluation error: ${error.message}` };
    }
  }
}
