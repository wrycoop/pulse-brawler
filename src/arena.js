// arena.js - Arena drawing and bounds

import { W, H, CX, CY, ctx } from './constants.js';
import { tuning } from './tuning.js';

export function drawArena() {
  const arenaRadius = tuning.arena?.radius || 350;
  
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);
  
  // Arena circle
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(CX, CY, arenaRadius, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawHint() {
  ctx.fillStyle = '#666';
  ctx.font = '12px monospace';
  ctx.fillText('Left stick = move | Face buttons = attack target | L1 = screenshot', 10, H - 10);
}
