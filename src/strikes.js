// strikes.js - Attack/jab system

import { tuning } from './tuning.js';

// Attack visuals: { targetIdx, hit, timer }
export let attackVisuals = [];

export function doAttack(player, dummies, targetIdx) {
  const target = dummies[targetIdx];
  const atk = tuning.attack || {};
  const range = atk.range ?? 80;
  const force = (atk.force ?? 50) / 10;
  const leanForce = (atk.leanForce ?? 30) / 10;
  
  // Direction toward intended target
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dist > 0 ? dx / dist : 0;
  const ny = dist > 0 ? dy / dist : 1;
  
  // Check ALL dummies for hits along this ray
  let anyHit = false;
  for (const dummy of dummies) {
    const toDummyX = dummy.x - player.x;
    const toDummyY = dummy.y - player.y;
    
    // Distance along ray
    const alongRay = toDummyX * nx + toDummyY * ny;
    
    // Perpendicular distance from ray
    const perpX = toDummyX - alongRay * nx;
    const perpY = toDummyY - alongRay * ny;
    const perpDist = Math.sqrt(perpX * perpX + perpY * perpY);
    
    // Hit check
    const inRange = alongRay > 0 && alongRay < range + player.baseRadius + dummy.baseRadius;
    const onRay = perpDist < dummy.baseRadius + 5;
    
    if (inRange && onRay) {
      dummy.applyForce(nx * force, ny * force);
      dummy.applyLeanForce(nx * leanForce, ny * leanForce);
      dummy.hitFlash = 8;
      anyHit = true;
    }
  }
  
  attackVisuals.push({ targetIdx, hit: anyHit, timer: 12 });
}

export function updateAttackVisuals() {
  for (let i = attackVisuals.length - 1; i >= 0; i--) {
    attackVisuals[i].timer--;
    if (attackVisuals[i].timer <= 0) attackVisuals.splice(i, 1);
  }
}

export function drawAttackVisuals(ctx, player, dummies) {
  const range = tuning.attack?.range ?? 80;
  
  for (const av of attackVisuals) {
    const target = dummies[av.targetIdx];
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dist > 0 ? dx / dist : 0;
    const ny = dist > 0 ? dy / dist : 1;
    
    const startX = player.x + nx * player.baseRadius;
    const startY = player.y + ny * player.baseRadius;
    const limbLen = Math.min(range, dist - player.baseRadius - target.baseRadius);
    const endX = startX + nx * Math.max(0, limbLen);
    const endY = startY + ny * Math.max(0, limbLen);
    
    ctx.strokeStyle = av.hit ? '#ffff00' : '#888888';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.globalAlpha = av.timer / 12;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
