// Lean Movement Prototype - Force-based, no speed cap
// One fighter, lean-driven movement, arena only
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
  arena: { radius: 350 }
};

async function loadTuning() {
  try {
    const res = await fetch('/tuning.json?' + Date.now());
    tuning = await res.json();
    console.log('Tuning loaded:', tuning);
  } catch (e) {
    console.warn('Using default tuning');
  }
}

// Fighter class - lean-driven movement (force-based)
class Fighter {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    
    this.baseRadius = 25;
    this.upperRadius = 15;
    this.color = color;
    
    // Lean state
    this.leanX = 0;
    this.leanY = 0;
  }
  
  update(inputX, inputY) {
    const lean = tuning.lean || {};
    const move = tuning.movement || {};
    
    // NORMALIZED PARAMS (0-100 scale, 50 = sensible default)
    // These map to ranges that produce reasonable physics
    const maxLean = lean.maxLean ?? 20;
    const leanSpeed = 0.02 + ((lean.leanSpeed ?? 50) / 100) * 0.18;      // 50 → 0.11
    const moveForce = 0.005 + ((lean.moveForce ?? 50) / 100) * 0.045;   // 50 → 0.0275
    const friction = 0.85 + ((lean.friction ?? 50) / 100) * 0.14;       // 50 → 0.92
    const deadzone = (move.deadzone ?? 10) / 100;
    const curve = 1 + ((move.curve ?? 15) / 100) * 2;                   // 15 → 1.3
    
    // Process input with deadzone and curve
    let mag = Math.sqrt(inputX * inputX + inputY * inputY);
    if (mag < deadzone) {
      inputX = 0;
      inputY = 0;
      mag = 0;
    } else if (mag > 0) {
      const remapped = Math.min(1, (mag - deadzone) / (1 - deadzone));
      const curved = Math.pow(remapped, curve);
      const scale = curved / mag;
      inputX *= scale;
      inputY *= scale;
    }
    
    // Target lean from input
    const targetLeanX = inputX * maxLean;
    const targetLeanY = inputY * maxLean;
    
    // Lean approaches target (smoothed)
    this.leanX += (targetLeanX - this.leanX) * leanSpeed;
    this.leanY += (targetLeanY - this.leanY) * leanSpeed;
    
    // FORCE-BASED: Lean creates force on base
    const forceX = this.leanX * moveForce;
    const forceY = this.leanY * moveForce;
    
    // Apply force to velocity
    this.vx += forceX;
    this.vy += forceY;
    
    // Apply friction (velocity decay)
    this.vx *= friction;
    this.vy *= friction;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
  }
  
  // External force (for hits, throws, etc - same system)
  applyForce(fx, fy) {
    this.vx += fx;
    this.vy += fy;
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
      
      // Remove velocity into wall
      const dot = this.vx * nx + this.vy * ny;
      if (dot > 0) {
        this.vx -= nx * dot;
        this.vy -= ny * dot;
      }
    }
  }
  
  draw(ctx) {
    const upperX = this.x + this.leanX;
    const upperY = this.y + this.leanY;
    
    // Connection line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(upperX, upperY);
    ctx.stroke();
    
    // Base circle (feet)
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Upper body
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(upperX, upperY, this.upperRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }
}

// Input handling
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function getInput() {
  let x = 0, y = 0;
  
  // Keyboard
  if (keys['w'] || keys['arrowup']) y -= 1;
  if (keys['s'] || keys['arrowdown']) y += 1;
  if (keys['a'] || keys['arrowleft']) x -= 1;
  if (keys['d'] || keys['arrowright']) x += 1;
  
  // Normalize diagonal
  const mag = Math.sqrt(x * x + y * y);
  if (mag > 1) { x /= mag; y /= mag; }
  
  // Gamepad (overrides keyboard if present)
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

// Game state
let player;

function init() {
  player = new Fighter(CX, CY, '#00ff88');
}

function update() {
  const input = getInput();
  player.update(input.x, input.y);
  player.constrainToArena();
}

function draw() {
  const arenaRadius = tuning.arena?.radius || 350;
  const lean = tuning.lean || {};
  
  // Calculate terminal velocity for display
  const moveForce = 0.005 + ((lean.moveForce ?? 50) / 100) * 0.045;
  const friction = 0.85 + ((lean.friction ?? 50) / 100) * 0.14;
  const maxForce = (lean.maxLean ?? 20) * moveForce;
  const terminalV = maxForce / (1 - friction);
  
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);
  
  // Arena ring
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(CX, CY, arenaRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Player
  player.draw(ctx);
  
  // Debug info
  const speed = Math.sqrt(player.vx*player.vx + player.vy*player.vy);
  ctx.fillStyle = '#666';
  ctx.font = '12px monospace';
  ctx.fillText(`lean: (${player.leanX.toFixed(1)}, ${player.leanY.toFixed(1)})`, 10, 20);
  ctx.fillText(`vel: (${player.vx.toFixed(2)}, ${player.vy.toFixed(2)})`, 10, 35);
  ctx.fillText(`speed: ${speed.toFixed(1)} / ${terminalV.toFixed(1)} (terminal)`, 10, 50);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Start
loadTuning().then(() => {
  init();
  loop();
  // Reload tuning periodically
  setInterval(loadTuning, 2000);
});
