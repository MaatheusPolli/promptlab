export class SelfEvalService {
  constructor(aiService) {
    this.aiService = aiService;
  }

  /**
   * Triggers a self-evaluation of the AI output.
   */
  async selfEvaluate(originalPrompt, output) {
    const evalPrompt = `Critique a resposta abaixo para o comando: "${originalPrompt.substring(0, 100)}"
    Resposta: "${output.substring(0, 300)}"
    
    Dê nota 1 a 10 e uma justificativa.
    Responda apenas JSON: {"score": nota, "reasoning": "texto"}`;

    try {
      const rawResult = await this.aiService.runRawPrompt(evalPrompt, { temperature: 0.2, topK: 3 });
      
      const jsonMatch = rawResult.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            score: Math.min(10, Math.max(1, Number(parsed.score) || 5)),
            reasoning: `(Análise IA) ${parsed.reasoning || 'Avaliação concluída.'}`
          };
        } catch (e) {}
      }

      const scoreMatch = rawResult.match(/\b([1-9]|10)\b/);
      if (scoreMatch) {
        return {
          score: Number(scoreMatch[0]),
          reasoning: "(Análise IA) Nota interpretada do texto."
        };
      }

      return this.heuristicFallback(output, "Formato Inválido");

    } catch (error) {
      return this.heuristicFallback(output, "Limite de Cota");
    }
  }

  /**
   * Heurística dinâmica que gera justificativas variadas baseadas no conteúdo.
   */
  heuristicFallback(output, reason) {
    const words = output.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const lexicalVariety = wordCount > 0 ? uniqueWords / wordCount : 0;
    
    let score = 4.5;
    let observations = [];
    
    // Análise de Volume
    if (wordCount > 80) {
      score += 2;
      observations.push("conteúdo denso");
    } else if (wordCount > 30) {
      score += 1;
      observations.push("tamanho adequado");
    } else {
      score -= 1;
      observations.push("resposta concisa");
    }
    
    // Análise de Variedade
    if (lexicalVariety > 0.7) {
      score += 1.5;
      observations.push("vocabulário rico");
    } else if (lexicalVariety < 0.4) {
      score -= 1;
      observations.push("muitas repetições");
    }

    // Análise de Estrutura
    if (output.includes('```')) {
      score += 1.5;
      observations.push("presença de código");
    }
    if (output.includes('•') || output.includes('- ')) {
      score += 0.5;
      observations.push("boa formatação");
    }

    // Jitter para evitar notas idênticas
    const jitter = (output.length % 5) / 10;
    score += jitter;

    const finalScore = Math.min(10, Math.max(1, Math.round(score * 10) / 10));
    const desc = observations.join(", ");

    return {
      score: finalScore,
      reasoning: `(Análise Técnica) Nota ${finalScore}/10 baseada em: ${desc}. [Motivo original: ${reason}]`
    };
  }

}
