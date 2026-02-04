// fighter.js - Fighter class with lean-driven movement

import { CX, CY } from './constants.js';
import { tuning } from './tuning.js';

export class Fighter {
  constructor(x, y, color, label) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    
    this.baseRadius = 25;
    this.upperRadius = 15;
    this.color = color;
    this.label = label || '';
    
    this.leanX = 0;
    this.leanY = 0;
    
    this.hitFlash = 0;
  }
  
  update(inputX, inputY) {
    const lean = tuning.lean || {};
    const move = tuning.movement || {};
    
    const maxLean = lean.maxLean ?? 20;
    const leanSpeed = 0.02 + ((lean.leanSpeed ?? 50) / 100) * 0.18;
    const moveForce = 0.005 + ((lean.moveForce ?? 50) / 100) * 0.045;
    const friction = 0.85 + ((lean.friction ?? 50) / 100) * 0.14;
    const deadzone = (move.deadzone ?? 10) / 100;
    const curve = 1 + ((move.curve ?? 15) / 100) * 2;
    
    // Process input
    let mag = Math.sqrt(inputX * inputX + inputY * inputY);
    if (mag < deadzone) {
      inputX = 0;
      inputY = 0;
    } else if (mag > 0) {
      const remapped = Math.min(1, (mag - deadzone) / (1 - deadzone));
      const curved = Math.pow(remapped, curve);
      const scale = curved / mag;
      inputX *= scale;
      inputY *= scale;
    }
    
    // Lean
    const targetLeanX = inputX * maxLean;
    const targetLeanY = inputY * maxLean;
    this.leanX += (targetLeanX - this.leanX) * leanSpeed;
    this.leanY += (targetLeanY - this.leanY) * leanSpeed;
    
    // Force from lean
    const forceX = this.leanX * moveForce;
    const forceY = this.leanY * moveForce;
    this.vx += forceX;
    this.vy += forceY;
    
    // Friction
    this.vx *= friction;
    this.vy *= friction;
    
    // Position
    this.x += this.vx;
    this.y += this.vy;
    
    // Hit flash decay
    if (this.hitFlash > 0) this.hitFlash--;
  }
  
  applyForce(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }
  
  applyLeanForce(lx, ly) {
    this.leanX += lx;
    this.leanY += ly;
  }
  
  constrainToArena() {
    const arenaRadius = tuning.arena?.radius || 350;
    const dx = this.x - CX;
    const dy = this.y - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = arenaRadius - this.baseRadius;
    
    if (dist > maxDist && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;
      this.x = CX + nx * maxDist;
      this.y = CY + ny * maxDist;
      
      const dot = this.vx * nx + this.vy * ny;
      if (dot > 0) {
        this.vx -= nx * dot;
        this.vy -= ny * dot;
      }
    }
  }
  
  isOut() {
    const arenaRadius = tuning.arena?.radius || 350;
    const dx = this.x - CX;
    const dy = this.y - CY;
    return Math.sqrt(dx * dx + dy * dy) > arenaRadius + this.baseRadius;
  }
  
  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.leanX = 0;
    this.leanY = 0;
  }
  
  draw(ctx) {
    const upperX = this.x + this.leanX;
    const upperY = this.y + this.leanY;
    
    const color = this.hitFlash > 0 ? '#ffffff' : this.color;
    
    // Connection line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(upperX, upperY);
    ctx.stroke();
    
    // Base
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Upper
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(upperX, upperY, this.upperRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    if (this.label) {
      ctx.fillStyle = '#000';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, upperX, upperY);
    }
    
    ctx.globalAlpha = 1;
  }
}
