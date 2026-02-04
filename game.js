// Lean Movement Prototype - Force-based, no speed cap
// Player + 3 dummies + jab attack
// Tuning from Google Sheet

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const CX = W / 2;
const CY = H / 2;

// Tuning - loaded from Google Sheet via server
let tuning = {
  lean: { maxLean: 20, leanSpeed: 50, moveForce: 50, friction: 50 },
  movement: { deadzone: 10, curve: 15 },
  attack: { range: 80, force: 50, leanForce: 30 },
  arena: { radius: 350 }
};

async function loadTuning() {
  try {
    const res = await fetch('/tuning.json?' + Date.now());
    tuning = await res.json();
  } catch (e) {
    console.warn('Using default tuning');
  }
}

// Fighter class - lean-driven movement (force-based)
class Fighter {
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

// Input handling
const keys = {};
const keysJustPressed = {};
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (!keys[k]) keysJustPressed[k] = true;
  keys[k] = true;
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function getInput() {
  let x = 0, y = 0;
  
  if (keys['w'] || keys['arrowup']) y -= 1;
  if (keys['s'] || keys['arrowdown']) y += 1;
  if (keys['a'] || keys['arrowleft']) x -= 1;
  if (keys['d'] || keys['arrowright']) x += 1;
  
  const mag = Math.sqrt(x * x + y * y);
  if (mag > 1) { x /= mag; y /= mag; }
  
  const gp = navigator.getGamepads()[0];
  if (gp) {
    const gpX = gp.axes[0] || 0;
    const gpY = gp.axes[1] || 0;
    if (Math.abs(gpX) > 0.05 || Math.abs(gpY) > 0.05) {
      x = gpX;
      y = gpY;
    }
  }
  
  return { x, y };
}

function getAttackInput() {
  // Keyboard: I = □, J = △, L = ○
  // Gamepad: Square = □, Triangle = △, Circle = ○
  // Returns both press (just pressed) and hold state
  const pressed = { tri: false, sq: false, cir: false };
  const held = { tri: false, sq: false, cir: false };
  
  if (keysJustPressed['i']) pressed.sq = true;
  if (keysJustPressed['j']) pressed.tri = true;
  if (keysJustPressed['l']) pressed.cir = true;
  
  if (keys['i']) held.sq = true;
  if (keys['j']) held.tri = true;
  if (keys['l']) held.cir = true;
  
  const gp = navigator.getGamepads()[0];
  if (gp) {
    // PS layout: 0=X, 1=O, 2=□, 3=△
    if (gp.buttons[2]?.pressed) { held.sq = true; if (!lastAttacks.sq) pressed.sq = true; }
    if (gp.buttons[3]?.pressed) { held.tri = true; if (!lastAttacks.tri) pressed.tri = true; }
    if (gp.buttons[1]?.pressed) { held.cir = true; if (!lastAttacks.cir) pressed.cir = true; }
  }
  
  return { pressed, held };
}

// Game state
let player;
let dummies = [];
let lastAttacks = { tri: false, sq: false, cir: false };
let attackVisuals = []; // { targetIdx, hit, timer }

// Grapple state
let grapple = {
  active: false,
  victimIdx: -1,
  holdFrames: 0
};

function init() {
  player = new Fighter(CX, CY + 100, '#00ff88', '');
  
  // 3 dummies arranged around center
  const r = 150;
  dummies = [
    new Fighter(CX, CY - r, '#ff6666', 'SQ'),          // Square button
    new Fighter(CX - r * 0.87, CY + r * 0.5, '#6666ff', 'TRI'), // Triangle button
    new Fighter(CX + r * 0.87, CY + r * 0.5, '#ff66ff', 'O'),   // Circle button
  ];
}

function doAttack(targetIdx) {
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
    // Project dummy position onto attack ray
    const toDummyX = dummy.x - player.x;
    const toDummyY = dummy.y - player.y;
    
    // Distance along ray (dot product)
    const alongRay = toDummyX * nx + toDummyY * ny;
    
    // Perpendicular distance from ray
    const perpX = toDummyX - alongRay * nx;
    const perpY = toDummyY - alongRay * ny;
    const perpDist = Math.sqrt(perpX * perpX + perpY * perpY);
    
    // Hit if: within range, in front of player, and close to ray
    const inRange = alongRay > 0 && alongRay < range + player.baseRadius + dummy.baseRadius;
    const onRay = perpDist < dummy.baseRadius + 5; // 5px tolerance
    
    if (inRange && onRay) {
      // Knockback direction is along the ray (from player)
      dummy.applyForce(nx * force, ny * force);
      dummy.applyLeanForce(nx * leanForce, ny * leanForce);
      dummy.hitFlash = 8;
      anyHit = true;
    }
  }
  
  // Store for visual
  attackVisuals.push({ targetIdx, hit: anyHit, timer: 12 });
}

function update() {
  const input = getInput();
  const { pressed, held } = getAttackInput();
  
  const grp = tuning.grapple || {};
  const grappleRange = grp.range ?? 80;
  const holdThreshold = grp.holdFrames ?? 10;
  const spinForce = (grp.spinForce ?? 50) / 1000;    // 0-100 → 0-0.1 (tangent push)
  const tetherLength = grp.tetherLength ?? 60;
  
  // Check for grapple initiation or release
  const heldIdx = held.sq ? 0 : held.tri ? 1 : held.cir ? 2 : -1;
  
  if (grapple.active) {
    // Check if still holding the grappled target's button
    const stillHolding = (grapple.victimIdx === 0 && held.sq) ||
                         (grapple.victimIdx === 1 && held.tri) ||
                         (grapple.victimIdx === 2 && held.cir);
    
    if (!stillHolding) {
      // Release - victim keeps their velocity, just let go
      grapple.active = false;
      grapple.victimIdx = -1;
      grapple.holdFrames = 0;
    } else {
      // Continue grapple - spring physics
      const victim = dummies[grapple.victimIdx];
      
      // Vector from player to victim
      const dx = victim.x - player.x;
      const dy = victim.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.1) return; // Avoid divide by zero
      
      const nx = dx / dist;  // Radial unit vector (outward)
      const ny = dy / dist;
      const tx = -ny;        // Tangent unit vector (CCW)
      const ty = nx;
      
      // 1. Spring force: pull victim toward tether length
      const springStiffness = (grp.springStiffness ?? 50) / 500;  // 0-100 → 0-0.2
      const stretch = dist - tetherLength;
      const springForce = stretch * springStiffness;
      victim.applyForce(-nx * springForce, -ny * springForce);
      
      // 2. Player input → tangential force on victim (spin them)
      const tangentInput = input.x * tx + input.y * ty;  // How much input is tangent
      const tangentForce = tangentInput * spinForce * 10;
      victim.applyForce(tx * tangentForce, ty * tangentForce);
      
      // 3. Dampen victim's radial velocity (keep them orbiting, not flying away)
      const radialVel = victim.vx * nx + victim.vy * ny;
      victim.vx -= nx * radialVel * 0.3;  // Remove 30% of radial velocity
      victim.vy -= ny * radialVel * 0.3;
      
      // 4. Lean responds to centripetal acceleration (lean outward when spinning fast)
      const tangentVel = victim.vx * tx + victim.vy * ty;
      const centrifugalLean = Math.abs(tangentVel) * 0.5;
      victim.leanX = nx * centrifugalLean;
      victim.leanY = ny * centrifugalLean;
    }
  } else {
    // Not grappling - check for initiation
    if (heldIdx >= 0) {
      grapple.holdFrames++;
      
      if (grapple.holdFrames >= holdThreshold) {
        // Check range
        const target = dummies[heldIdx];
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < grappleRange + player.baseRadius + target.baseRadius) {
          // Initiate grapple
          grapple.active = true;
          grapple.victimIdx = heldIdx;
        }
      }
    } else {
      grapple.holdFrames = 0;
    }
    
    // Attack on press (if not starting grapple)
    if (grapple.holdFrames < holdThreshold) {
      if (pressed.sq) doAttack(0);
      if (pressed.tri) doAttack(1);
      if (pressed.cir) doAttack(2);
    }
  }
  
  lastAttacks = { sq: held.sq, tri: held.tri, cir: held.cir };
  
  player.update(input.x, input.y);
  player.constrainToArena();
  
  // Update dummies
  for (let i = 0; i < dummies.length; i++) {
    const d = dummies[i];
    
    // Skip lean/movement update if grappled (we control their lean)
    if (grapple.active && grapple.victimIdx === i) {
      // Still apply friction to velocity
      const friction = 0.85 + ((tuning.lean?.friction ?? 50) / 100) * 0.14;
      d.vx *= friction;
      d.vy *= friction;
      d.x += d.vx;
      d.y += d.vy;
    } else {
      d.update(0, 0); // No input - just physics
    }
    
    if (d.isOut()) {
      console.log('RING OUT!');
      d.respawn();
      // Release grapple if victim rings out
      if (grapple.active && grapple.victimIdx === i) {
        grapple.active = false;
        grapple.victimIdx = -1;
      }
    }
  }
  
  // Fighter collision (all pairs)
  const allFighters = [player, ...dummies];
  for (let i = 0; i < allFighters.length; i++) {
    for (let j = i + 1; j < allFighters.length; j++) {
      const a = allFighters[i];
      const b = allFighters[j];
      
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.baseRadius + b.baseRadius;
      
      if (dist < minDist && dist > 0) {
        // Push apart
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        
        // Move each half the overlap
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;
        
        // Bounce velocities slightly
        const relVel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (relVel > 0) {
          a.vx -= nx * relVel * 0.5;
          a.vy -= ny * relVel * 0.5;
          b.vx += nx * relVel * 0.5;
          b.vy += ny * relVel * 0.5;
          
          // Collision causes lean (destabilize both)
          const collisionLean = (tuning.collision?.leanForce ?? 50) / 20; // 0-100 → 0-5
          const leanImpact = relVel * collisionLean;
          a.applyLeanForce(-nx * leanImpact, -ny * leanImpact);
          b.applyLeanForce(nx * leanImpact, ny * leanImpact);
        }
      }
    }
  }
  
  // Update attack visuals
  for (let i = attackVisuals.length - 1; i >= 0; i--) {
    attackVisuals[i].timer--;
    if (attackVisuals[i].timer <= 0) attackVisuals.splice(i, 1);
  }
  
  // Clear just-pressed
  for (const k in keysJustPressed) delete keysJustPressed[k];
}

function draw() {
  const arenaRadius = tuning.arena?.radius || 350;
  
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);
  
  // Arena
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(CX, CY, arenaRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Dummies
  for (const d of dummies) d.draw(ctx);
  
  // Grapple tether
  if (grapple.active) {
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
  
  // Attack limbs (drawn from player's current position)
  const range = tuning.attack?.range ?? 80;
  for (const av of attackVisuals) {
    const target = dummies[av.targetIdx];
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dist > 0 ? dx / dist : 0;
    const ny = dist > 0 ? dy / dist : 1;
    
    // Limb from player edge, toward target, capped at range
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
  
  // Player
  player.draw(ctx);
  
  // Controls hint
  ctx.fillStyle = '#666';
  ctx.font = '12px monospace';
  ctx.fillText('Left stick = move | Face buttons = attack target', 10, H - 10);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadTuning().then(() => {
  init();
  loop();
  setInterval(loadTuning, 2000);
});
