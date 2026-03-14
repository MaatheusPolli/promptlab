export class MetricsService {
  /**
   * Improved token estimation using Regex patterns for words, punctuation, and spaces.
   * More accurate than simple length / 4.
   * @param {string} text 
   * @returns {number}
   */
  estimateTokens(text) {
    if (!text) return 0;
    
    // Regular expression that matches words, numbers, and punctuation as separate tokens
    // Similar to basic BPE tokenization strategies
    const tokens = text.match(/\w+|[^\w\s]|\s+/g);
    return tokens ? tokens.length : 0;
  }

  /**
   * Computes consistency score across multiple outputs.
   * Uses Jaccard similarity on word sets.
   * @param {string[]} outputs 
   * @returns {number} 0-100 score
   */
  computeConsistencyScore(outputs) {
    if (!outputs || outputs.length < 2) return null;

    const wordSets = outputs.map(o => new Set((o || '').toLowerCase().split(/\s+/).filter(w => w.length > 0)));
    let totalSim = 0;
    let pairs = 0;

    for (let i = 0; i < wordSets.length; i++) {
      for (let j = i + 1; j < wordSets.length; j++) {
        const intersection = new Set([...wordSets[i]].filter(w => wordSets[j].has(w)));
        const union = new Set([...wordSets[i], ...wordSets[j]]);
        
        if (union.size === 0) {
          totalSim += 1; // Both empty = consistent
        } else {
          totalSim += intersection.size / union.size;
        }
        pairs++;
      }
    }

    return pairs === 0 ? 0 : Math.round((totalSim / pairs) * 100);
  }

  /**
   * Computes a word-level diff between two texts.
   * Simple LCS-based diff for the A/B comparison panel.
   * @param {string} textA 
   * @param {string} textB 
   * @returns {Array<{word: string, status: 'same'|'added'|'removed'}>}
   */
  computeDiff(textA, textB) {
    const wordsA = (textA || '').split(/\s+/).filter(w => w.length > 0);
    const wordsB = (textB || '').split(/\s+/).filter(w => w.length > 0);
    
    // Simple diff implementation:
    const result = [];
    let i = 0, j = 0;

    while (i < wordsA.length || j < wordsB.length) {
      if (i < wordsA.length && j < wordsB.length && wordsA[i] === wordsB[j]) {
        result.push({ word: wordsA[i], status: 'same' });
        i++;
        j++;
      } else if (j < wordsB.length && (i === wordsA.length || !wordsA.slice(i).includes(wordsB[j]))) {
        result.push({ word: wordsB[j], status: 'added' });
        j++;
      } else if (i < wordsA.length) {
        result.push({ word: wordsA[i], status: 'removed' });
        i++;
      }
    }

    return result;
  }
}
