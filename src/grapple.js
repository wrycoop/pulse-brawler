// grapple.js - Hammer throw grapple system

import { tuning } from './tuning.js';

// Grapple state
export const grapple = {
  active: false,
  victimIdx: -1,
  holdFrames: 0,
  angularVel: 0,
  targetAngle: 0,
  logCounter: 0
};

export function resetGrapple() {
  grapple.active = false;
  grapple.victimIdx = -1;
  grapple.holdFrames = 0;
  grapple.angularVel = 0;
  grapple.targetAngle = 0;
}

export function updateGrapple(player, dummies, input, held) {
  const grp = tuning.grapple || {};
  const grappleRange = grp.range ?? 80;
  const holdThreshold = grp.holdFrames ?? 10;
  const tetherLength = grp.tetherLength ?? 60;
  
  const heldIdx = held.sq ? 0 : held.tri ? 1 : held.cir ? 2 : -1;
  
  if (grapple.active) {
    // Check if still holding the grappled target's button
    const stillHolding = (grapple.victimIdx === 0 && held.sq) ||
                         (grapple.victimIdx === 1 && held.tri) ||
                         (grapple.victimIdx === 2 && held.cir);
    
    if (!stillHolding) {
      // Release
      grapple.active = false;
      grapple.victimIdx = -1;
      grapple.holdFrames = 0;
      return false; // Released
    }
    
    // Continue grapple - HAMMER THROW with torque/inertia
    const victim = dummies[grapple.victimIdx];
    
    // Calculate torque from stick
    const tangentX = -Math.sin(grapple.targetAngle);
    const tangentY = Math.cos(grapple.targetAngle);
    const torqueInput = -(input.x * tangentX + input.y * tangentY);
    
    // spinForce: 0-100, higher = easier to spin up
    const torqueStrength = (grp.spinForce ?? 50) / 50000;
    const mass = (100 - (grp.spinForce ?? 50)) / 20;
    const angularAccel = (torqueInput * torqueStrength) / (1 + mass * 0.1);
    
    grapple.angularVel += angularAccel;
    
    // spinDrag: 0-100, higher = spin persists longer
    const angularDrag = 0.97 + ((grp.spinDrag ?? 50) / 100) * 0.025;
    grapple.angularVel *= angularDrag;
    
    // Update angle
    grapple.targetAngle += grapple.angularVel;
    
    // Position victim on tether
    victim.x = player.x + Math.cos(grapple.targetAngle) * tetherLength;
    victim.y = player.y + Math.sin(grapple.targetAngle) * tetherLength;
    
    // Set victim velocity (for release)
    const tangentSpeed = grapple.angularVel * tetherLength;
    const throwMult = 0.5 + ((grp.throwForce ?? 50) / 100) * 1.0;
    victim.vx = tangentX * tangentSpeed * 60 * throwMult;
    victim.vy = tangentY * tangentSpeed * 60 * throwMult;
    
    // Visual: Player leans in stick direction
    const maxLean = tuning.lean?.maxLean ?? 20;
    const pullDir = { x: Math.cos(grapple.targetAngle), y: Math.sin(grapple.targetAngle) };
    const playerLeanAmount = Math.min(Math.abs(grapple.angularVel) * 400, maxLean);
    
    const inputMag = Math.sqrt(input.x * input.x + input.y * input.y);
    if (inputMag > 0.1) {
      player.leanX = input.x * playerLeanAmount / inputMag;
      player.leanY = input.y * playerLeanAmount / inputMag;
    } else {
      player.leanX = -pullDir.x * playerLeanAmount;
      player.leanY = -pullDir.y * playerLeanAmount;
    }
    
    // Victim leans outward
    const victimLeanAmount = Math.min(Math.abs(grapple.angularVel) * 500, maxLean);
    victim.leanX = pullDir.x * victimLeanAmount;
    victim.leanY = pullDir.y * victimLeanAmount;
    
    // Logging
    grapple.logCounter++;
    if (grapple.logCounter % 30 === 0) {
      const msg = `angVel:${grapple.angularVel.toFixed(4)} playerLean:(${player.leanX.toFixed(1)},${player.leanY.toFixed(1)})`;
      fetch('/console', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: 'log', args: [msg] }) }).catch(() => {});
    }
    
    return true; // Still grappling
  } else {
    // Not grappling - check for initiation
    if (heldIdx >= 0) {
      grapple.holdFrames++;
      
      if (grapple.holdFrames >= holdThreshold) {
        const target = dummies[heldIdx];
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < grappleRange + player.baseRadius + target.baseRadius) {
          grapple.active = true;
          grapple.victimIdx = heldIdx;
          grapple.targetAngle = Math.atan2(dy, dx);
          grapple.angularVel = 0;
          return true;
        }
      }
    } else {
      grapple.holdFrames = 0;
    }
    
    return false;
  }
}

export function isHoldingForGrapple(holdThreshold) {
  return grapple.holdFrames >= (holdThreshold || tuning.grapple?.holdFrames || 10);
}

export function drawGrappleTether(ctx, player, dummies) {
  if (!grapple.active) return;
  
  const victim = dummies[grapple.victimIdx];
  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(victim.x, victim.y);
  ctx.stroke();
  ctx.setLineDash([]);
}
