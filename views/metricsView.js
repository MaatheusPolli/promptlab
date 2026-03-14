export class MetricsView {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Resize to fit container
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  /**
   * Draws a bar chart showing the last 10 runs.
   * @param {Array} runs 
   */
  draw(runs) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    if (runs.length === 0) return;

    const last10 = runs.slice(-10);
    const maxTime = Math.max(...last10.map(r => r.metrics.responseTimeMs), 1000);
    const barWidth = (w - 40) / last10.length;
    
    last10.forEach((run, i) => {
      const score = run.metrics.selfEvalScore;
      const latency = run.metrics.responseTimeMs;
      let color = '#6366f1'; // default primary

      if (score !== null) {
        if (score >= 7) color = '#22c55e'; // green
        else if (score >= 4) color = '#f59e0b'; // yellow
        else color = '#ef4444'; // red
      } else {
        // Fallback para latência
        if (latency < 500) color = '#22c55e';
        else if (latency < 1500) color = '#f59e0b';
        else color = '#ef4444';
      }

      const barHeight = (latency / maxTime) * (h - 40);
      const x = 30 + i * barWidth;
      const y = h - 20 - barHeight;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth - 10, barHeight);

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i + 1, x + (barWidth - 10) / 2, h - 5);
    });

    // Axis
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.lineTo(25, h - 20);
    ctx.lineTo(w, h - 20);
    ctx.stroke();
  }
}
