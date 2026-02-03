// BRAWLER PROTOTYPE v3 - Pixi.js 2D (No physics engine, clean and simple)

// Auto-reload when tuning is saved
new BroadcastChannel('brawler-tuning').onmessage = (e) => { if (e.data === 'reload') location.reload(); };

// Remote console logging - sends browser console to server
(function() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    function sendToServer(level, args) {
        try {
            fetch('/console', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, args: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)) })
            }).catch(() => {});
        } catch (e) {}
    }
    
    console.log = function(...args) { originalLog.apply(console, args); sendToServer('log', args); };
    console.warn = function(...args) { originalWarn.apply(console, args); sendToServer('warn', args); };
    console.error = function(...args) { originalError.apply(console, args); sendToServer('error', args); };
})();

// Sound effects using Web Audio API
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    // Punchy hit sound
    hit() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        const t = ctx.currentTime;
        
        // Low punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
        
        // Noise burst for impact
        const noise = ctx.createBufferSource();
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        noise.connect(noiseGain).connect(ctx.destination);
        noise.start(t);
    }
    
    // Whoosh for whiff
    whiff() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        const t = ctx.currentTime;
        
        const noise = ctx.createBufferSource();
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.exponentialRampToValueAtTime(400, t + 0.15);
        filter.Q.value = 2;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        
        noise.connect(filter).connect(gain).connect(ctx.destination);
        noise.start(t);
    }
    
    // Thud for block
    block() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    }
    
    // Sharp ping for parry
    parry() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
        
        // Metallic overtone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1760, t);
        gain2.gain.setValueAtTime(0.1, t);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc2.connect(gain2).connect(ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.1);
    }
    
    // Dizzy/stars sound
    dizzy() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        const t = ctx.currentTime;
        
        // Descending "bwoop"
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
        
        // Warble
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(400, t + 0.1);
        osc2.frequency.setValueAtTime(500, t + 0.2);
        osc2.frequency.setValueAtTime(350, t + 0.3);
        gain2.gain.setValueAtTime(0.15, t + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc2.connect(gain2).connect(ctx.destination);
        osc2.start(t + 0.1);
        osc2.stop(t + 0.4);
    }
    
    // Ring out / fall off
    ringOut() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
    }
    
    // Throw whoosh
    throw() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx;
        const t = ctx.currentTime;
        
        // Noise-based whoosh using filtered noise
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        // Bandpass filter for whoosh character
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(200, t + 0.25);
        filter.Q.value = 1;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        
        noise.connect(filter).connect(gain).connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.3);
    }
}

const sfx = new SoundFX();

class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    clone() {
        return new Vec2(this.x, this.y);
    }
    
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }
    
    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    
    static fromAngle(angle) {
        return new Vec2(Math.cos(angle), Math.sin(angle));
    }
}

class Dummy {
    constructor(game, label, pos, color) {
        this.game = game;
        this.label = label;
        this.position = pos.clone();
        this.initialPosition = pos.clone();
        this.velocity = new Vec2(0, 0);
        this.radius = 25;
        this.color = color;
        this.knockbackDamping = 0.95;
        
        // Pixi container
        this.container = new PIXI.Container();
        this.container.x = this.position.x;
        this.container.y = this.position.y;
        
        // Body (circle)
        this.body = new PIXI.Graphics();
        this.body.beginFill(color);
        this.body.drawCircle(0, 0, this.radius);
        this.body.endFill();
        this.container.addChild(this.body);
        
        // Label text (centered in circle)
        this.labelText = new PIXI.Text(label, {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 5,
            align: 'center'
        });
        this.labelText.anchor.set(0.5, 0.5);
        this.container.addChild(this.labelText);
        
        // Flash state
        this.flashTimer = 0;
        this.originalColor = color;
        
        // Respawn state
        this.isRespawning = false;
        this.respawnTimer = 0;
        
        // Dizzy state (stunned from finisher)
        this.isDizzy = false;
        this.dizzyTimer = 0;
        this.dizzyMeter = 0; // Accumulates from hits
        this.dizzyMeterTimer = 0; // Timeout - if this hits 0, meter resets
        
        // Training dummy settings (SF6-style)
        this.dummySettings = {
            guard: 'none',           // 'none' | 'blockAll' | 'parryAll' — defensive behavior
            hitReaction: 'punishCounter',  // 'normal' | 'counterHit' | 'punishCounter' — when hit lands
        };
        
        // Block/parry state (set by dummy mode or by actual defensive input)
        this.isBlocking = false;
        this.isParrying = false;
        this.parryWindowTimer = 0;
        this.blockstunTimer = 0;
        this.parrySuccessTimer = 0; // Gold flash after landing a parry
        
        // Grapple state
        this.isGrappled = false; // Being grappled by someone
        this.grappledBy = null; // Who is grappling us
        this.escapeMeter = 0; // Mash-out progress (0-1)
        this.lastEscapeButtons = {}; // Track button states for mash detection
        
        this.game.world.addChild(this.container);
    }
    
    applyDizzy() {
        sfx.dizzy();
        this.isDizzy = true;
        this.dizzyMeter = 0; // Reset meter when going dizzy
        this.dizzyTimer = this.game.tuning.combo?.dizzyFrames ?? 180; // 3 seconds at 60fps
        console.log(`${this.label} is DIZZY!`);
    }
    
    // Add to dizzy meter from a hit. Returns true if this triggered dizzy.
    addDizzyDamage(amount) {
        if (this.isDizzy) return false; // Already dizzy
        
        this.dizzyMeter += amount;
        // Reset timeout timer on each hit
        this.dizzyMeterTimer = this.game.tuning.combo?.dizzyTimeout ?? 120; // 2 seconds at 60fps
        
        const threshold = this.game.tuning.combo?.dizzyThreshold ?? 100;
        console.log(`${this.label} dizzyMeter: ${this.dizzyMeter.toFixed(0)}/${threshold} (${this.dizzyMeterTimer}f window)`);
        
        if (this.dizzyMeter >= threshold) {
            // Set random tip direction before applying dizzy
            this.dizzyTipAngle = Math.random() * Math.PI * 2;
            this.dizzyTipVel = new Vec2(0, 0);
            this.applyDizzy();
            return true;
        }
        return false;
    }
    
    breakFreeFromGrapple() {
        if (!this.isGrappled || !this.grappledBy) return;
        
        const grappler = this.grappledBy;
        const escapeForce = this.game.tuning.grapple?.escapeForce ?? 400;
        
        // Mutual knockback - both get pushed apart
        const dx = this.position.x - grappler.position.x;
        const dy = this.position.y - grappler.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;
        
        // Push victim away from grappler
        this.velocity.x = nx * escapeForce;
        this.velocity.y = ny * escapeForce;
        
        // Push grappler away from victim
        grappler.velocity.x = -nx * escapeForce;
        grappler.velocity.y = -ny * escapeForce;
        
        // Reset grapple states
        grappler.isGrappling = false;
        grappler.grapplingTarget = null;
        grappler.grappleAngularVel = 0;
        this.isGrappled = false;
        this.grappledBy = null;
        this.escapeMeter = 0;
        
        sfx.parry(); // Reuse parry sound for break free
        console.log(`${this.label} BROKE FREE from grapple!`);
    }
    
    // Check if attack is blocked/parried, return guard result
    // Returns: 'hit' | 'blocked' | 'parried'
    checkGuard() {
        if (this.isDizzy) return 'hit';  // Can't defend while dizzy
        if (this.isParrying) return 'parried';
        if (this.isBlocking) return 'blocked';
        return 'hit';
    }
    
    // Get the hit reaction type (for damage bonuses, hitstun, etc.)
    getHitReaction() {
        return this.dummySettings.hitReaction || 'normal';
    }
    
    applyBlockstun(duration = 0.3) {
        this.blockstunTimer = duration;
        this.isBlocking = true;  // Stay in block during blockstun
        console.log(`${this.label} BLOCKED!`);
    }
    
    applyKnockback(direction, force) {
        const knockback = direction.clone().normalize().multiply(force);
        // If dizzy, apply knockback to tip velocity (so it doesn't get overwritten)
        if (this.isDizzy && this.dizzyTipVel) {
            this.dizzyTipVel.add(knockback);
        } else {
            this.velocity.add(knockback);
        }
        // No velocity cap - let tuning control distance
    }
    
    flash() {
        this.flashTimer = 0.1;
        this.body.clear();
        this.body.beginFill(0xffffff);
        this.body.drawCircle(0, 0, this.radius);
        this.body.endFill();
    }
    
    update(dt) {
        // Handle respawning
        if (this.isRespawning) {
            this.respawnTimer--;
            if (this.respawnTimer <= 0) {
                // Respawn
                this.isRespawning = false;
                this.position = this.initialPosition.clone();
                this.velocity = new Vec2(0, 0);
                // Clear dizzy state
                this.isDizzy = false;
                this.dizzyTimer = 0;
                this.dizzyMeter = 0;
                this.dizzyTipVel = null;
                this.container.rotation = 0;
                this.container.visible = true;
                console.log(`${this.label} respawned!`);
            }
            return; // Skip rest of update while respawning
        }
        
        // Update flash
        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
            if (this.flashTimer <= 0) {
                this.body.clear();
                this.body.beginFill(this.originalColor);
                this.body.drawCircle(0, 0, this.radius);
                this.body.endFill();
            }
        }
        
        // Update dizzy state (frame-based) - tipping mechanics
        if (this.isDizzy) {
            this.dizzyTimer--;
            
            // Apply tipping movement (dummies can't counter, just stumble)
            const tipForce = this.game.tuning.combo?.dizzyTipForce ?? 400;
            const tipDirX = Math.cos(this.dizzyTipAngle || 0);
            const tipDirY = Math.sin(this.dizzyTipAngle || 0);
            
            if (!this.dizzyTipVel) {
                this.dizzyTipVel = new Vec2(0, 0);
            }
            
            // Constant tip acceleration
            this.dizzyTipVel.x += tipDirX * tipForce * dt;
            this.dizzyTipVel.y += tipDirY * tipForce * dt;
            
            // Max speed cap
            const maxSpeed = 200; // Dummies stumble slower
            const currentSpeed = Math.sqrt(this.dizzyTipVel.x ** 2 + this.dizzyTipVel.y ** 2);
            if (currentSpeed > maxSpeed) {
                this.dizzyTipVel.x *= maxSpeed / currentSpeed;
                this.dizzyTipVel.y *= maxSpeed / currentSpeed;
            }
            
            // Apply as velocity
            this.velocity.x = this.dizzyTipVel.x;
            this.velocity.y = this.dizzyTipVel.y;
            
            // Visual wobble
            const tipSpeed = currentSpeed;
            this.container.rotation = Math.sin(this.dizzyTimer * 0.3) * 0.3 * (tipSpeed / 100 + 0.5);
            
            if (this.dizzyTimer <= 0) {
                this.isDizzy = false;
                this.container.rotation = 0;
                this.dizzyMeter = 0;
                this.dizzyTipVel = null;
                console.log(`${this.label} recovered from dizzy`);
            }
        }
        
        // Dizzy meter timeout (when not already dizzy)
        // If no hits within timeout window, meter resets
        if (!this.isDizzy && this.dizzyMeter > 0) {
            if (this.dizzyMeterTimer > 0) {
                this.dizzyMeterTimer--;
            } else {
                // Timeout - reset meter
                this.dizzyMeter = 0;
            }
        }
        
        // Update blockstun (frame-based)
        if (this.blockstunTimer > 0) {
            this.blockstunTimer--;
        }
        
        // Update parry window (frame-based)
        if (this.parryWindowTimer > 0) {
            this.parryWindowTimer--;
            if (this.parryWindowTimer <= 0) {
                this.isParrying = false;
            }
        }
        
        // Update parry success timer (gold flash after landing parry) (frame-based)
        if (this.parrySuccessTimer > 0) {
            this.parrySuccessTimer--;
        }
        
        // Dummy guard behavior (disabled while grappled)
        if (this.isGrappled) {
            this.isBlocking = false;
            this.isParrying = false;
            
            // AI mash-out: build escape meter over time
            const escapeRate = this.game.tuning.grapple?.escapeRate ?? 0.01;
            const escapeDecay = this.game.tuning.grapple?.escapeDecay ?? 0.005;
            // Random mashing simulation
            if (Math.random() < 0.3) { // 30% chance per frame to "mash"
                this.escapeMeter += escapeRate;
            }
            this.escapeMeter -= escapeDecay; // Decay
            this.escapeMeter = Math.max(0, Math.min(1, this.escapeMeter));
            
            // Break free when meter fills
            if (this.escapeMeter >= 1) {
                this.breakFreeFromGrapple();
            }
        } else if (this.dummySettings.guard === 'blockAll') {
            this.isBlocking = true;
            this.isParrying = false;
        } else if (this.dummySettings.guard === 'parryAll') {
            this.isBlocking = false;
            this.isParrying = true;
        } else {
            // 'none' - no auto-guard
            if (this.blockstunTimer <= 0) {
                this.isBlocking = false;
            }
            this.isParrying = false;
        }
        
        // Skip movement if grappled (position controlled by grappler)
        if (this.isGrappled) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        } else {
            // Apply damping
            this.velocity.multiply(this.knockbackDamping);
            
            // Update position
            this.position.add(this.velocity.clone().multiply(dt));
        }
        
        // Check if fallen off platform (center crosses edge)
        const bounds = this.game.arenaBounds;
        
        if (this.position.x > bounds.right ||
            this.position.x < bounds.left ||
            this.position.y > bounds.bottom ||
            this.position.y < bounds.top) {
            
            // Fallen off - start respawn timer
            sfx.ringOut();
            console.log(`${this.label} fell off platform! Respawning in 2s...`);
            this.isRespawning = true;
            this.respawnTimer = 120;
            this.container.visible = false;
            return;
        }
        
        // Safety: Check for NaN
        if (isNaN(this.position.x) || isNaN(this.position.y)) {
            console.error(`${this.label} position is NaN! Resetting.`);
            this.position = this.initialPosition.clone();
            this.velocity = new Vec2(0, 0);
        }
    if (isNaN(this.velocity.x) || isNaN(this.velocity.y)) {
      this.velocity = new Vec2(0, 0);
    }
        
        // Update sprite position
        this.container.x = this.position.x;
        this.container.y = this.position.y;
        
        // Visual feedback for states (priority: flash > dizzy > parry > block > blockstun > normal)
        // Skip color update if flashing (flash handles its own color)
        if (this.flashTimer <= 0) {
            this.body.clear();
            if (this.isGrappled) {
                this.body.beginFill(0xff4444); // Red = grappled (disadvantage, being held)
            } else if (this.isDizzy) {
                this.body.beginFill(0xffaa00); // Orange = dizzy
            } else if (this.parrySuccessTimer > 0) {
                this.body.beginFill(0xffd700); // Gold = parry success (advantage)
            } else if (this.isParrying) {
                this.body.beginFill(0x00ffff); // Cyan = parry window active
            } else if (this.isBlocking && this.blockstunTimer > 0) {
                this.body.beginFill(0x6688cc); // Muted blue = blockstun (slight disadvantage)
            } else if (this.isBlocking) {
                this.body.beginFill(0x4488ff); // Blue = blocking
            } else {
                this.body.beginFill(this.originalColor); // Normal
            }
            this.body.drawCircle(0, 0, this.radius);
            this.body.endFill();
        }
    }
}

class Player {
    constructor(game, tuning) {
        this.game = game;
        this.tuning = tuning;
        this.position = new Vec2(0, 0);
        this.velocity = new Vec2(0, 0);
        this.radius = 25;
        this.lastAttackTime = 0;
        this.isAttacking = false;
        this.attackLockTimer = 0;
        this.attackStartupTimer = 0;
        this.comboCount = 0;
        this.comboResetTimer = 0;
        
        // Pixi container
        this.container = new PIXI.Container();
        this.container.x = this.position.x;
        this.container.y = this.position.y;
        
        // Body (circle)
        this.body = new PIXI.Graphics();
        this.body.beginFill(0x00ff88);
        this.body.drawCircle(0, 0, this.radius);
        this.body.endFill();
        this.container.addChild(this.body);
        
        // X symbol
        this.labelText = new PIXI.Text('X', {
            fontFamily: 'Arial',
            fontSize: 28,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'center'
        });
        this.labelText.anchor.set(0.5, 0.5);
        this.container.addChild(this.labelText);
        
        // Strike range visualization
        this.rangeViz = new PIXI.Graphics();
        this.rangeViz.lineStyle(2, 0xffff00, 0);
        this.rangeViz.drawCircle(0, 0, this.strikeRange);
        this.container.addChild(this.rangeViz);
        
        this.strikeTimer = 0;
        
        // ORIENTATION - which way the fighter is facing
        this.facing = 0; // radians, 0 = right, PI/2 = down, PI = left, -PI/2 = up
        this.facingSpeed = 8; // how fast facing rotates toward target (radians/sec)
        
        // Facing indicator (line showing direction)
        this.facingViz = new PIXI.Graphics();
        this.container.addChild(this.facingViz);
        this.drawFacingIndicator();
        
        // Limb visualization
        this.limb = new PIXI.Graphics();
        this.container.addChild(this.limb);
        this.limbTimer = 0;
        this.limbType = null;
        
        // Respawn state
        this.isRespawning = false;
        this.respawnTimer = 0;
        
        // Limb animation state
        this.limbAnimation = {
            active: false,
            type: null,
            elapsed: 0,
            duration: 0,
            startAngle: 0,
            endAngle: 0,
            length: 0,
            direction: null,
            hitDummies: new Set(), // Track which dummies were hit this animation
            parried: false // Track if attack was parried (shows red limb)
        };
        
        // Whiff tracking - whiffs = finisher treatment (no cancel)
        this.lastAttackHit = true; // Start true so first attack can combo
        this.pendingWhiffCheck = false; // For animated attacks, check after animation
        
        // Block/Parry state
        this.isBlocking = false;
        this.isParrying = false;
        this.parryWindow = 0; // Timer for parry active frames
        this.blockHeld = false; // Track if block button is held
        this.blockReleaseTime = 0; // When block was released
        this.parrySuccessTimer = 0; // Gold state after landing a parry
        this.blockstunTimer = 0; // Recovery after blocking an attack
        
        // Grapple state
        this.isGrappling = false; // Actively grappling someone
        this.spinRotations = 0; // Track rotations in spin state
        this.wasInSpinState = false; // Track spin state transitions
        this.grapplingTarget = null; // Who we're grappling
        this.grappleButton = null; // Which button initiated grapple (for release detection)
        this.buttonHoldTime = {}; // Track hold duration per button
        
    // Dizzy state (e.g., from spin timeout)
    this.isDizzy = false;
    this.dizzyTimer = 0;
    this.dizzyMeter = 0; // Accumulates from hits
    this.dizzyMeterTimer = 0; // Timeout - if this hits 0, meter resets
        // Hammer toss physics
        this.grappleAngle = 0; // Current angle of victim around player (radians)
        this.grappleAngularVel = 0; // Angular velocity (radians/sec)
        this.lastStickAngle = null; // For detecting stick rotation
        
        this.game.world.addChild(this.container);
    }
    
    // Tuning getters - all values from tuning.json
    get speed() { return this.tuning.movement.playerSpeed; }
    get strikeRange() { return this.tuning.arena.strikeRange; }
    
    get jabForce() { return this.tuning.attacks.jab.force; }
    get hookForce() { return this.tuning.attacks.hook.force; }
    get kickForce() { return this.tuning.attacks.kick.force; }
    
    get jabAngle() { return this.tuning.attacks.jab.angle; }
    get hookAngle() { return this.tuning.attacks.hook.angle; }
    get kickAngle() { return this.tuning.attacks.kick.angle; }
    
    get jabReach() { return this.tuning.attacks.jab.reach; }
    get hookReach() { return this.tuning.attacks.hook.reach; }
    get kickReach() { return this.tuning.attacks.kick.reach; }
    
    get hookSweepStart() { return this.tuning.attacks.hook.sweepStart; }
    get hookSweepEnd() { return this.tuning.attacks.hook.sweepEnd; }
    // Frame-based timing (60fps, 1 frame = 1/60 second)
    get hookSweepFrames() { return this.tuning.attacks.hook.sweepFrames ?? 6; }
    get startupFrames() { return this.tuning.timing.startupFrames ?? 6; }
    get activeFrames() { return this.tuning.timing.activeFrames ?? 6; }
    get recoveryFrames() { return this.tuning.timing.recoveryFrames ?? 12; }
    get finisherRecoveryFrames() { return this.tuning.timing.finisherRecoveryFrames ?? 24; }
    get cooldownFrames() { return this.tuning.timing.cooldownFrames ?? 9; }
    
    get finisherForceMultiplier() { return this.tuning.combo.finisherForceMultiplier; }
    get comboResetFrames() { return this.tuning.combo.comboResetFrames ?? 60; }
    get dizzyFrames() { return this.tuning.combo.dizzyFrames ?? 180; }
    get dizzyKnockbackMultiplier() { return this.tuning.combo.dizzyKnockbackMultiplier || 3; }
    
    // Draw facing direction indicator
    drawFacingIndicator() {
        this.facingViz.clear();
        // Draw a line showing facing direction
        this.facingViz.lineStyle(3, 0xffff00, 0.8); // Yellow line
        this.facingViz.moveTo(0, 0);
        const indicatorLength = this.radius * 1.2;
        this.facingViz.lineTo(
            Math.cos(this.facing) * indicatorLength,
            Math.sin(this.facing) * indicatorLength
        );
        // Draw small triangle at end (arrowhead)
        const arrowSize = 8;
        const arrowAngle = this.facing;
        const tipX = Math.cos(arrowAngle) * indicatorLength;
        const tipY = Math.sin(arrowAngle) * indicatorLength;
        this.facingViz.beginFill(0xffff00, 0.8);
        this.facingViz.moveTo(tipX, tipY);
        this.facingViz.lineTo(
            tipX - Math.cos(arrowAngle - 0.5) * arrowSize,
            tipY - Math.sin(arrowAngle - 0.5) * arrowSize
        );
        this.facingViz.lineTo(
            tipX - Math.cos(arrowAngle + 0.5) * arrowSize,
            tipY - Math.sin(arrowAngle + 0.5) * arrowSize
        );
        this.facingViz.closePath();
        this.facingViz.endFill();
    }
    
    // Update facing direction toward target angle
    updateFacing(targetAngle, dt) {
        // Calculate shortest rotation direction
        let angleDiff = targetAngle - this.facing;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Rotate toward target at facingSpeed
        const maxRotation = this.facingSpeed * dt;
        if (Math.abs(angleDiff) < maxRotation) {
            this.facing = targetAngle;
        } else {
            this.facing += Math.sign(angleDiff) * maxRotation;
        }
        
        // Normalize facing to -PI to PI
        while (this.facing > Math.PI) this.facing -= 2 * Math.PI;
        while (this.facing < -Math.PI) this.facing += 2 * Math.PI;
        
        // Redraw indicator
        this.drawFacingIndicator();
    }
    
    // Add to dizzy meter from a hit. Returns true if this triggered dizzy.
    addDizzyDamage(amount) {
        if (this.isDizzy) return false; // Already dizzy
        
        this.dizzyMeter += amount;
        // Reset timeout timer on each hit
        this.dizzyMeterTimer = this.tuning.combo?.dizzyTimeout ?? 120; // 2 seconds at 60fps
        
        const threshold = this.tuning.combo?.dizzyThreshold ?? 100;
        console.log(`Player dizzyMeter: ${this.dizzyMeter.toFixed(0)}/${threshold} (${this.dizzyMeterTimer}f window)`);
        
        if (this.dizzyMeter >= threshold) {
            this.isDizzy = true;
            this.dizzyMeter = 0;
            this.dizzyMeterTimer = 0;
            this.dizzyTimer = this.dizzyFrames;
            // Set random tip direction
            this.dizzyTipAngle = Math.random() * Math.PI * 2;
            this.dizzyTipVel = new Vec2(0, 0); // Current tip velocity
            sfx.dizzy();
            console.log('Player is DIZZY! Tip direction: ' + (this.dizzyTipAngle * 180 / Math.PI).toFixed(0) + '°');
            return true;
        }
        return false;
    }
    
    update(dt, input) {
        // Handle respawning
        if (this.isRespawning) {
            this.respawnTimer--;
            if (this.respawnTimer <= 0) {
                // Respawn
                this.isRespawning = false;
                this.position = new Vec2(0, 0);
                this.velocity = new Vec2(0, 0);
                // Clear dizzy state
                this.isDizzy = false;
                this.dizzyTimer = 0;
                this.dizzyMeter = 0;
                this.dizzyTipVel = null;
                this.container.rotation = 0;
                this.container.visible = true;
                console.log('Player respawned!');
            }
            return; // Skip rest of update while respawning
        }
        
        // Update attack timers (frame-based, decrement by 1 per frame)
        if (this.attackStartupTimer > 0) {
            this.attackStartupTimer--;
        }
        
        if (this.attackLockTimer > 0) {
            this.attackLockTimer--;
            if (this.attackLockTimer <= 0) {
                this.isAttacking = false;
            }
        }
        
        // Combo reset timer (frames)
        if (this.comboResetTimer > 0) {
            this.comboResetTimer--;
            if (this.comboResetTimer <= 0) {
                this.comboCount = 0;
            }
        }
        
        // Dizzy state update - tipping mechanics
        if (this.isDizzy) {
            this.dizzyTimer--;
            
            // Visual wobble (mild rotation based on tip velocity)
            const tipSpeed = this.dizzyTipVel ? Math.sqrt(this.dizzyTipVel.x ** 2 + this.dizzyTipVel.y ** 2) : 0;
            this.container.rotation = Math.sin(this.dizzyTimer * 0.3) * 0.3 * (tipSpeed / 100 + 0.5);
            
            if (this.dizzyTimer <= 0) {
                this.isDizzy = false;
                this.container.rotation = 0;
                this.dizzyMeter = 0;
                this.dizzyTipVel = null;
                console.log('Player recovered from dizzy');
            }
        }
        
        // Dizzy meter timeout (when not already dizzy)
        // If no hits within timeout window, meter resets
        if (!this.isDizzy && this.dizzyMeter > 0) {
            if (this.dizzyMeterTimer > 0) {
                this.dizzyMeterTimer--;
            } else {
                // Timeout - reset meter
                this.dizzyMeter = 0;
            }
        }
        
        // Parry window timer (frames)
        if (this.parryWindow > 0) {
            this.parryWindow--;
            if (this.parryWindow <= 0) {
                this.isParrying = false;
            }
        }
        
        // Parry success timer (gold state after landing parry)
        if (this.parrySuccessTimer > 0) {
            this.parrySuccessTimer--;
        }
        
        // Blockstun timer (frames)
        if (this.blockstunTimer > 0) {
            this.blockstunTimer--;
        }
        
        // Movement (only if not attacking, not in hitstun, not blocking, and not in spin-grapple)
        // Note: grappling below spin threshold still allows stick movement (handled in grapple code)
        const inSpinGrapple = this.isGrappling && Math.abs(this.grappleAngularVel || 0) >= (this.tuning?.grapple?.velocityThreshold ?? 5);
        if (!this.isAttacking && this.attackLockTimer <= 0 && !this.isBlocking && !inSpinGrapple) {
            if (this.isGrappling) {
                // Grappling below threshold - movement handled by grapple code, zero out velocity here
                this.velocity.x = 0;
                this.velocity.y = 0;
            } else if (this.isDizzy) {
                // DIZZY MOVEMENT - tipping mechanics
                // Constant tip force in random direction
                const tipForce = this.tuning.combo?.dizzyTipForce ?? 400;
                const tipDirX = Math.cos(this.dizzyTipAngle);
                const tipDirY = Math.sin(this.dizzyTipAngle);
                
                // Initialize tip velocity if needed
                if (!this.dizzyTipVel) {
                    this.dizzyTipVel = new Vec2(0, 0);
                }
                
                // Apply tip force (constant acceleration toward tip direction)
                this.dizzyTipVel.x += tipDirX * tipForce * dt;
                this.dizzyTipVel.y += tipDirY * tipForce * dt;
                
                // Player input also accelerates (can counter or amplify tip)
                const inputForce = this.tuning.combo?.dizzyInputForce ?? 500;
                this.dizzyTipVel.x += input.leftStick.x * inputForce * dt;
                this.dizzyTipVel.y += input.leftStick.y * inputForce * dt;
                
                // Max speed cap (erratic, not fast)
                const maxSpeed = this.speed * 0.8; // 80% of normal max
                const currentSpeed = Math.sqrt(this.dizzyTipVel.x ** 2 + this.dizzyTipVel.y ** 2);
                if (currentSpeed > maxSpeed) {
                    this.dizzyTipVel.x *= maxSpeed / currentSpeed;
                    this.dizzyTipVel.y *= maxSpeed / currentSpeed;
                }
                
                // Apply tip velocity as movement
                this.velocity.x = this.dizzyTipVel.x;
                this.velocity.y = this.dizzyTipVel.y;
            } else {
                const moveX = input.leftStick.x;
                const moveY = input.leftStick.y;
                this.velocity.x = moveX * this.speed;
                this.velocity.y = moveY * this.speed;
            }
        } else if (inSpinGrapple) {
            // Spin grapple - no velocity, position handled by grapple code
            this.velocity.x = 0;
            this.velocity.y = 0;
        } else if (this.isBlocking) {
            // Stop movement while blocking
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
        // Note: when attackLockTimer > 0 but not blocking, velocity persists (knockback)
        
        // UPDATE FACING - face the centroid of other fighters (keeping eyes on the fight)
        // Facing is handled by game loop which has access to all fighters
        
        this.position.add(this.velocity.clone().multiply(dt));
        
        // Check if fallen off platform (center crosses edge)
        const bounds = this.game.arenaBounds;
        
        if (this.position.x > bounds.right ||
            this.position.x < bounds.left ||
            this.position.y > bounds.bottom ||
            this.position.y < bounds.top) {
            
            // Player fell off - start respawn timer
            console.log('Player fell off platform! Respawning in 2s...');
            this.isRespawning = true;
            this.respawnTimer = 120;
            this.container.visible = false;
            return;
        }
        
        // Update sprite
        this.container.x = this.position.x;
        this.container.y = this.position.y;
        
        // Visual feedback for states
        // Priority: grappling > stun > parry success > parry trigger > parry window > blockstun > block > attack > normal
        this.body.clear();
        if (this.isGrappling) {
            // Check if above velocity threshold (spin mode)
            const absVel = Math.abs(this.grappleAngularVel || 0);
            const threshold = this.tuning?.grapple?.velocityThreshold ?? 4;
            if (absVel >= threshold) {
                this.body.beginFill(0x00ffff); // Cyan = spinning fast (rotate stick mode)
            } else {
                this.body.beginFill(0xffd700); // Gold = grappling (building momentum)
            }
        } else if (this.attackLockTimer > 0 && !this.limbAnimation.active) {
            this.body.beginFill(0xff4444); // Red = stunned (got parried / hitstun)
        } else if (this.parrySuccessTimer > 0) {
            this.body.beginFill(0xffd700); // Gold = parry success (advantage)
        } else if (this.isParrying && this.parryWindow > 0.1) {
            this.body.beginFill(0xffffff); // White flash = parry just triggered (event)
        } else if (this.isParrying) {
            this.body.beginFill(0x00ffff); // Cyan = parry window active
        } else if (this.blockstunTimer > 0) {
            this.body.beginFill(0x6688cc); // Muted blue = blockstun (slight disadvantage)
        } else if (this.isBlocking) {
            this.body.beginFill(0x4488ff); // Blue = holding block
        } else if (this.limbAnimation.active) {
            this.body.beginFill(0xffaa00); // Orange = attacking
        } else {
            this.body.beginFill(0x00ff88); // Green = neutral (can act)
        }
        this.body.drawCircle(0, 0, this.radius);
        this.body.endFill();
        
        // Update range viz
        if (this.strikeTimer > 0) {
            this.strikeTimer -= dt;
            const progress = Math.max(0, this.strikeTimer / 0.15);
            this.rangeViz.alpha = 0.4 * progress;
        } else {
            this.rangeViz.alpha = 0;
        }
        
        // Update limb animation
        if (this.limbAnimation.active) {
            this.limbAnimation.elapsed += dt;
            
            if (this.limbAnimation.elapsed >= this.limbAnimation.duration) {
                // Animation complete - check for whiff
                if (this.pendingWhiffCheck) {
                    this.pendingWhiffCheck = false;
                    // lastAttackHit was set during animation if any hit landed
                    if (!this.lastAttackHit) {
                        sfx.whiff();
                        console.log(`${this.limbAnimation.type.toUpperCase()} WHIFF - NO CANCEL!`);
                        this.comboCount = 0; // Whiff = combo broken
                    }
                }
                this.limbAnimation.active = false;
                this.limbAnimation.hitDummies.clear();
                this.limb.clear();
            } else {
                // Update visual limb position
                const progress = this.limbAnimation.elapsed / this.limbAnimation.duration;
                this.updateAnimatedLimb(progress);
            }
        } else if (this.limbTimer > 0) {
            // Static limb display (for instant attacks like jabs)
            this.limbTimer -= dt;
            if (this.limbTimer <= 0) {
                this.limb.clear();
            }
        }
    }
    
    performAttack(targetDummy, allDummies) {
        // Can't attack while grappling
        if (this.isGrappling) return false;
        
        const now = Date.now() / 1000;
        
        // Check if we're past startup frames
        const pastStartup = this.attackStartupTimer <= 0;
        
        // Check if we're in interruptible window
    const startupDurationFrames = this.startupFrames;
    const recoveryDurationFrames = this.recoveryFrames;
        const inInterruptWindow = this.isAttacking && this.attackLockTimer > 0 && this.attackLockTimer <= recoveryDurationFrames && pastStartup;
        
        // WHIFF = FINISHER: If last attack missed, no cancel allowed
        // Must wait for full recovery (like a finisher)
        const canCancel = inInterruptWindow && this.lastAttackHit;
        
        // If not in combo window and still in cooldown, can't attack
        if (!canCancel && now - this.lastAttackTime < this.cooldownFrames / 60) {
            return false;
        }
        
        // If attacking and NOT in cancel window, can't combo
        if (this.isAttacking && !canCancel) {
            return false;
        }
        
        const distance = this.position.distanceTo(targetDummy.position);
        
        // Calculate attack type based on STICK direction relative to target (not velocity)
        const toTarget = targetDummy.position.clone().sub(this.position.clone()).normalize();
        
        // Use raw stick input, not character velocity
        const stickInput = this.game.input.leftStick;
        let moveDir = new Vec2(stickInput.x, stickInput.y);
        if (moveDir.length() < 0.3) {
            // No stick input - default to toward target (jab)
            moveDir = toTarget.clone();
        } else {
            moveDir.normalize();
        }
        
        const dot = moveDir.dot(toTarget);
        const cross = moveDir.x * toTarget.y - moveDir.y * toTarget.x;
        
        // Get direction thresholds from tuning (with defaults)
        const jabThreshold = this.tuning.inputDirections?.jabThreshold ?? 0.5;
        const kickThreshold = this.tuning.inputDirections?.kickThreshold ?? -0.5;
        
        let attackType = 'neutral';
        let force = 250;
        let hookDirection = 1;
        let limbLength = this.strikeRange;
        
        if (dot > jabThreshold) {
            // Jab - towards target (step forward)
            attackType = 'jab';
            force = this.jabForce;
            limbLength = this.strikeRange * this.jabReach;
            // Step forward (tunable distance and frames)
            const jabStepDist = this.tuning.attacks?.jab?.stepDistance ?? 20;
            const jabStepFrames = this.tuning.attacks?.jab?.stepFrames ?? 6;
            const jabStepSpeed = jabStepDist * 60 / jabStepFrames; // Convert frames to pixels/second
            this.velocity.x = toTarget.x * jabStepSpeed;
            this.velocity.y = toTarget.y * jabStepSpeed;
        } else if (dot < kickThreshold) {
            // Push kick - toward target (step forward)
            attackType = 'push_kick';
            force = this.kickForce;
            limbLength = this.strikeRange * this.kickReach;
            // Step forward (tunable distance and frames)
            const kickStepDist = this.tuning.attacks?.kick?.stepDistance ?? 30;
            const kickStepFrames = this.tuning.attacks?.kick?.stepFrames ?? 9;
            const kickStepSpeed = kickStepDist * 60 / kickStepFrames; // Convert frames to pixels/second
            this.velocity.x = toTarget.x * kickStepSpeed;
            this.velocity.y = toTarget.y * kickStepSpeed;
        } else {
            // Hook - diagonal forward+lateral (step forward and sideways)
            attackType = 'hook';
            force = this.hookForce;
            limbLength = this.strikeRange * this.hookReach;
            hookDirection = cross > 0 ? -1 : 1; // Flipped: step right = right hook
            // Step diagonally (tunable distance, frames, and lateral blend)
            const hookStepDist = this.tuning.attacks?.hook?.stepDistance ?? 15;
            const hookStepFrames = this.tuning.attacks?.hook?.stepFrames ?? 6;
            const hookStepSpeed = hookStepDist * 60 / hookStepFrames; // Convert frames to pixels/second
            const hookStepLateral = this.tuning.attacks?.hook?.stepLateral ?? 0.5;
            const lateralDir = new Vec2(-toTarget.y, toTarget.x).multiply(cross > 0 ? -1 : 1);
            const forwardDir = toTarget.clone();
            this.velocity.x = (forwardDir.x * (1 - hookStepLateral) + lateralDir.x * hookStepLateral) * hookStepSpeed;
            this.velocity.y = (forwardDir.y * (1 - hookStepLateral) + lateralDir.y * hookStepLateral) * hookStepSpeed;
        }
        
        // Finisher = 3rd hit in combo (gets force bonus + causes dizzy)
        // Push kick = no cancel frames but NOT a finisher (no bonus, no dizzy)
        const isFinisher = this.comboCount === 2; // 3rd hit (0-indexed: 0, 1, 2)
        const noCancel = attackType === 'push_kick' || isFinisher; // Can't interrupt these
        
        // Apply finisher bonus (NOT to push kick)
        if (isFinisher) {
            force *= this.finisherForceMultiplier;
        }
        
        // Update combo count
        if (canCancel) {
            this.comboCount++;
        } else {
            this.comboCount = 1; // First hit (fresh combo)
            this.lastAttackHit = true; // Reset for new combo
        }
        
        // For animated attacks, defer combo reset until hit detection
        // For instant attacks (jab), reset immediately after finisher
        const isAnimated = attackType === 'hook' || attackType === 'push_kick';
        if (!isAnimated && this.comboCount >= 3) {
            this.comboCount = 0;
        }
        
        // Reset combo if no follow-up (frame-based)
        this.comboResetTimer = this.comboResetFrames;
        
        // Lock movement during attack (noCancel attacks have longer recovery - big commitment)
        this.isAttacking = true;
        this.attackStartupTimer = this.startupFrames;
        const recoveryFrames = noCancel ? this.finisherRecoveryFrames : this.recoveryFrames;
        this.attackLockTimer = this.startupFrames + recoveryFrames;
        
        this.showStrikeViz();
        
        // Animated vs instant attack (isAnimated already defined above)
        let hitAny = false;
        
        if (isAnimated) {
            // Start limb animation for hooks and kicks
            const baseAngle = Math.atan2(toTarget.y, toTarget.x);
            
            if (attackType === 'hook') {
                // Convert sweep angles to radians
                const startAngleDeg = this.hookSweepStart * (Math.PI / 180);
                const endAngleDeg = this.hookSweepEnd * (Math.PI / 180);
                const sweepDir = -hookDirection;
                
                this.limbAnimation.active = true;
                this.limbAnimation.type = 'hook';
                this.limbAnimation.elapsed = 0;
                this.limbAnimation.duration = this.hookSweepFrames / 60; // Convert frames to seconds
                this.limbAnimation.startAngle = baseAngle + startAngleDeg * sweepDir;
                this.limbAnimation.endAngle = baseAngle + endAngleDeg * sweepDir;
                this.limbAnimation.length = limbLength;
                this.limbAnimation.hitDummies.clear();
                this.limbAnimation.isFinisher = isFinisher;
                this.limbAnimation.parried = false; // Reset parried state
            } else if (attackType === 'push_kick') {
                // Kick thrusts forward (no sweep)
                this.limbAnimation.active = true;
                this.limbAnimation.type = 'push_kick';
                this.limbAnimation.elapsed = 0;
                this.limbAnimation.duration = (this.tuning.attacks?.kick?.stepFrames ?? 9) / 60; // Convert frames to seconds
                this.limbAnimation.startAngle = baseAngle;
                this.limbAnimation.endAngle = baseAngle; // No rotation, just extends
                this.limbAnimation.length = limbLength;
                this.limbAnimation.hitDummies.clear();
                this.limbAnimation.isFinisher = isFinisher;
                this.limbAnimation.parried = false; // Reset parried state
            }
            
            // Animation will handle collision checks and apply knockback
            hitAny = true; // Assume animation will handle hits
        } else {
            // Instant attack (jabs) - show static limb
            this.showLimb(attackType, toTarget, distance, hookDirection);
        }
        
        // For instant attacks (jabs), check collision immediately
        if (!isAnimated) {
            allDummies.forEach(dummy => {
            if (dummy.isRespawning) return; // Skip respawning dummies
            
            // Calculate knockback direction for this specific dummy
            const toDummy = dummy.position.clone().sub(this.position.clone());
            const distToDummy = toDummy.length();
            toDummy.normalize();
            
            // Jab instant collision - cone check
            if (distToDummy <= limbLength + dummy.radius) {
                const angleToTarget = Math.acos(Math.max(-1, Math.min(1, toTarget.dot(toDummy))));
                const coneAngle = Math.PI / 4; // 45° cone
                
                if (angleToTarget <= coneAngle) {
                    // Check guard first
                    const guardResult = dummy.checkGuard();
                    
                    const knockbackAngleRad = this.jabAngle * (Math.PI / 180);
                    const baseAngle = Math.atan2(toDummy.y, toDummy.x);
                    const finalAngle = baseAngle + knockbackAngleRad;
                    const knockbackDir = new Vec2(Math.cos(finalAngle), Math.sin(finalAngle));
                    
                    if (guardResult === 'parried') {
                        // PARRIED - attacker gets stunned + knockback, defender can punish
                        sfx.parry();
                        // Per-attack parry settings
                        const attackTuning = this.tuning.attacks[attackType === 'push_kick' ? 'kick' : attackType];
                        const parryKnockback = attackTuning?.parryKnockback ?? 400;
                        const parryAngle = (attackTuning?.parryAngle ?? 0) * (Math.PI / 180); // degrees to radians
                        const parryStunFrames = attackTuning?.parryStunFrames ?? 30;
                        
                        const awayDir = new Vec2(
                            this.position.x - dummy.position.x,
                            this.position.y - dummy.position.y
                        ).normalize();
                        
                        // Rotate away direction by parryAngle (0=back, 90=side, 180=forward)
                        const knockbackDir = new Vec2(
                            awayDir.x * Math.cos(parryAngle) - awayDir.y * Math.sin(parryAngle),
                            awayDir.x * Math.sin(parryAngle) + awayDir.y * Math.cos(parryAngle)
                        );
                        
                        this.velocity.x = knockbackDir.x * parryKnockback;
                        this.velocity.y = knockbackDir.y * parryKnockback;
                        
                        // Defender steps towards attacker on successful parry
                        const parryStep = this.tuning.combat?.parryStep ?? 0;
                        if (parryStep > 0) {
                            const toAttacker = new Vec2(
                                this.position.x - dummy.position.x,
                                this.position.y - dummy.position.y
                            ).normalize();
                            dummy.position.x += toAttacker.x * parryStep;
                            dummy.position.y += toAttacker.y * parryStep;
                        }
                        
                        // Defender gets parry success state (gold, advantage)
                        dummy.parrySuccessTimer = parryStunFrames; // Lasts as long as attacker is stunned
                        
                        console.log(`${attackType.toUpperCase()} PARRIED! Knockback: vel=(${this.velocity.x.toFixed(0)}, ${this.velocity.y.toFixed(0)})`);
                        this.isAttacking = false;
                        this.attackLockTimer = parryStunFrames;
                    } else if (guardResult === 'blocked') {
                        // BLOCKED - knockback from tuning, step retention from tuning
                        sfx.block();
                        const blockMult = attackType === 'jab' ? (this.tuning.attacks.jab.blockKnockback ?? 0.2) :
                                         attackType === 'push_kick' ? (this.tuning.attacks.kick.blockKnockback ?? 1.0) : 0.2;
                        if (attackType === 'jab') {
                            const stepRetain = this.tuning.attacks.jab.blockStepRetain ?? 0;
                            this.velocity.x *= stepRetain;
                            this.velocity.y *= stepRetain;
                        }
                        dummy.applyKnockback(knockbackDir, force * blockMult);
                        dummy.applyBlockstun(this.tuning.combat?.blockstunFrames ?? 9);
                        hitAny = true;
                        console.log(`${attackType.toUpperCase()} BLOCKED by ${dummy.label}`);
                    } else {
                        // HIT LANDED - check hit reaction type
                        sfx.hit();
                        const hitReaction = dummy.getHitReaction();
                        const dizzyMult = dummy.isDizzy ? this.dizzyKnockbackMultiplier : 1;
                        dummy.applyKnockback(knockbackDir, force * dizzyMult);
                        dummy.flash();
                        
                        // Apply dizzy damage based on attack type (new meter system)
                        const dizzyAmounts = {
                            'jab': this.tuning.attacks?.jab?.dizzyAmount ?? 35,
                            'hook': this.tuning.attacks?.hook?.dizzyAmount ?? 35,
                            'push_kick': this.tuning.attacks?.kick?.dizzyAmount ?? 0
                        };
                        const dizzyAmount = dizzyAmounts[attackType] ?? 0;
                        if (dizzyAmount > 0) {
                            dummy.addDizzyDamage(dizzyAmount);
                        }
                        
                        hitAny = true;
                        
                        const reactionText = hitReaction !== 'normal' ? ` ${hitReaction.toUpperCase()}!` : '';
                        const comboText = this.comboCount > 1 ? ` [COMBO ${this.comboCount}]` : '';
                        console.log(`${attackType.toUpperCase()} HIT → ${dummy.label}${reactionText}${comboText}`);
                    }
                }
            }
            });
        } // End if (!isAnimated)
        
        if (!hitAny && !isAnimated) {
            const comboText = this.comboCount > 1 ? ` [COMBO ${this.comboCount}${isFinisher ? ' FINISHER' : ''}]` : '';
            sfx.whiff();
            console.log(`${attackType.toUpperCase()} WHIFF${comboText} - NO CANCEL!`);
        }
        
        // Track hit/miss for combo cancel eligibility
        if (!isAnimated) {
            // Instant attacks (jabs) - set immediately
            this.lastAttackHit = hitAny;
            // Whiff = combo broken
            if (!hitAny) {
                this.comboCount = 0;
            }
        } else {
            // Animated attacks (hooks, kicks) - will be set when animation completes
            this.pendingWhiffCheck = true;
            this.lastAttackHit = false; // Assume miss until proven otherwise
        }
        
        // No-cancel attacks and whiffs have longer recovery
        const isWhiffOrNoCancel = noCancel || !hitAny;
        this.lastAttackTime = isWhiffOrNoCancel ? now + this.cooldownFrames / 60 : now;
        return hitAny;
    }
    
    showLimb(attackType, direction, distance, hookDir = 1) {
        this.limbTimer = 0.15; // 150ms duration
        this.limb.clear();
        
        // Fixed limb length based on attack type (use tunable values)
        let limbLength = this.strikeRange;
        if (attackType === 'jab') {
            limbLength = this.strikeRange * this.jabReach;
        } else if (attackType === 'push_kick') {
            limbLength = this.strikeRange * this.kickReach;
        } else if (attackType === 'hook') {
            limbLength = this.strikeRange * this.hookReach;
        }
        
        // Calculate end point (fixed length)
        const endX = direction.x * limbLength;
        const endY = direction.y * limbLength;
        
        if (attackType === 'jab') {
            // Simple straight line
            this.limb.lineStyle(4, 0xffffff, 1);
            this.limb.moveTo(0, 0);
            this.limb.lineTo(endX, endY);
        } else if (attackType === 'push_kick') {
            // Longer, thicker line
            this.limb.lineStyle(8, 0xffaa00, 1);
            this.limb.moveTo(0, 0);
            this.limb.lineTo(endX, endY);
        } else if (attackType === 'hook') {
            // SWEEPING SLAP - draw arc of straight lines showing the sweep path
            this.limb.lineStyle(5, 0xffff00, 1);
            
            // Draw multiple positions of the straight arm as it sweeps
            // Sweep direction: step left = sweep left-to-right, step right = sweep right-to-left
            const baseAngle = Math.atan2(direction.y, direction.x);
            
            // Convert tunable degrees to radians
            const startAngleDeg = this.hookSweepStart * (Math.PI / 180);
            const endAngleDeg = this.hookSweepEnd * (Math.PI / 180);
            
            // hookDir: 1 = stepping right, -1 = stepping left
            // We want: step left (-1) → sweep left to right (positive angle change)
            //          step right (1) → sweep right to left (negative angle change)
            const sweepDir = -hookDir; // Flip it
            const startAngle = baseAngle + startAngleDeg * sweepDir;
            const endAngle = baseAngle + endAngleDeg * sweepDir;
            
            for (let i = 0; i <= 5; i++) {
                const t = i / 5;
                const angle = startAngle + (endAngle - startAngle) * t;
                const alpha = 0.2 + (0.8 * t); // Fade in as it sweeps
                
                const limbEndX = Math.cos(angle) * limbLength;
                const limbEndY = Math.sin(angle) * limbLength;
                
                this.limb.lineStyle(5, 0xffff00, alpha);
                this.limb.moveTo(0, 0);
                this.limb.lineTo(limbEndX, limbEndY);
            }
        }
    }
    
    showStrikeViz() {
        this.strikeTimer = 0.15;
    }
    
    updateAnimatedLimb(progress) {
        if (this.limbAnimation.type === 'push_kick') {
        }
        this.limb.clear();
        
        const anim = this.limbAnimation;
        const currentAngle = anim.startAngle + (anim.endAngle - anim.startAngle) * progress;
        
        // Draw current limb position
        const endX = Math.cos(currentAngle) * anim.length;
        const endY = Math.sin(currentAngle) * anim.length;
        
        // Red limb if parried, otherwise yellow/orange based on attack type
        const color = anim.parried ? 0xff4444 : (anim.type === 'hook' ? 0xffff00 : 0xffaa00);
        const thickness = anim.type === 'hook' ? 5 : 8;
        
        this.limb.lineStyle(thickness, color, 1);
        this.limb.moveTo(0, 0);
        this.limb.lineTo(endX, endY);
        
        // Optional: draw trail for hooks
        if (anim.type === 'hook' && progress > 0.2) {
            for (let i = 0; i < 3; i++) {
                const trailProgress = progress - (i + 1) * 0.15;
                if (trailProgress > 0) {
                    const trailAngle = anim.startAngle + (anim.endAngle - anim.startAngle) * trailProgress;
                    const trailX = Math.cos(trailAngle) * anim.length;
                    const trailY = Math.sin(trailAngle) * anim.length;
                    const alpha = 0.3 - i * 0.1;
                    
                    this.limb.lineStyle(thickness, color, alpha);
                    this.limb.moveTo(0, 0);
                    this.limb.lineTo(trailX, trailY);
                }
            }
        }
    }
    
    checkAnimatedLimbCollision(allDummies) {
        const anim = this.limbAnimation;
        
        // Skip collision checks if attack was parried
        if (anim.parried) return;
        
        const progress = anim.elapsed / anim.duration;
        const currentAngle = anim.startAngle + (anim.endAngle - anim.startAngle) * progress;
        
        // Line from player position to limb end
        const limbEndX = this.position.x + Math.cos(currentAngle) * anim.length;
        const limbEndY = this.position.y + Math.sin(currentAngle) * anim.length;
        
        allDummies.forEach(dummy => {
            if (dummy.isRespawning || anim.hitDummies.has(dummy)) return;
            
            // Line-circle intersection test
            const hit = this.lineCircleIntersection(
                this.position.x, this.position.y,
                limbEndX, limbEndY,
                dummy.position.x, dummy.position.y,
                dummy.radius
            );
            
            if (hit) {
                // First hit on this dummy
                anim.hitDummies.add(dummy);
                
                // Check guard first
                const guardResult = dummy.checkGuard();
                
                const toDummy = new Vec2(
                    dummy.position.x - this.position.x,
                    dummy.position.y - this.position.y
                ).normalize();
                
                let force = anim.type === 'hook' ? this.hookForce : this.kickForce;
                const angle = anim.type === 'hook' ? this.hookAngle : this.kickAngle;
                
                // Use stored finisher state for force multiplier (NOT push kick)
                if (anim.isFinisher && anim.type !== 'push_kick') {
                    force *= this.finisherForceMultiplier;
                }
                
                let knockbackDir;
                if (anim.type === 'hook' && angle === 90) {
                    const sweepDir = anim.endAngle > anim.startAngle ? 1 : -1;
                    knockbackDir = new Vec2(-toDummy.y * sweepDir, toDummy.x * sweepDir);
                } else {
                    const knockbackAngleRad = angle * (Math.PI / 180);
                    const baseAngle = Math.atan2(toDummy.y, toDummy.x);
                    const finalAngle = baseAngle + knockbackAngleRad;
                    knockbackDir = new Vec2(Math.cos(finalAngle), Math.sin(finalAngle));
                }
                
                if (guardResult === 'parried') {
                    sfx.parry();
                    // Don't clear limb immediately - let animation finish for visual feedback
                    // Mark as parried so no more collision checks, but keep drawing
                    this.limbAnimation.parried = true;
                    this.isAttacking = false;
                    
                    // Per-attack parry settings (frame-based)
                    const attackKey = anim.type === 'push_kick' ? 'kick' : anim.type;
                    const attackTuning = this.tuning.attacks[attackKey];
                    const parryKnockback = attackTuning?.parryKnockback ?? 400;
                    let parryAngle = (attackTuning?.parryAngle ?? 0) * (Math.PI / 180); // degrees to radians
                    const parryStunFrames = attackTuning?.parryStunFrames ?? 30;
                    this.attackLockTimer = parryStunFrames;
                    
                    const awayDir = new Vec2(
                        this.position.x - dummy.position.x,
                        this.position.y - dummy.position.y
                    ).normalize();
                    
                    // For hooks, use sweep direction to determine angle sign
                    if (anim.type === 'hook') {
                        const sweepDir = anim.endAngle > anim.startAngle ? 1 : -1;
                        parryAngle *= sweepDir;
                    }
                    
                    // Rotate away direction by parryAngle (0=back, 90=side, 180=forward)
                    const knockbackDir = new Vec2(
                        awayDir.x * Math.cos(parryAngle) - awayDir.y * Math.sin(parryAngle),
                        awayDir.x * Math.sin(parryAngle) + awayDir.y * Math.cos(parryAngle)
                    );
                    
                    this.velocity.x = knockbackDir.x * parryKnockback;
                    this.velocity.y = knockbackDir.y * parryKnockback;
                    
                    // Defender steps towards attacker on successful parry
                    const parryStep = this.tuning.combat?.parryStep ?? 0;
                    if (parryStep > 0) {
                        const toAttacker = new Vec2(
                            this.position.x - dummy.position.x,
                            this.position.y - dummy.position.y
                        ).normalize();
                        dummy.position.x += toAttacker.x * parryStep;
                        dummy.position.y += toAttacker.y * parryStep;
                    }
                    
                    // Defender gets parry success state (gold, advantage)
                    dummy.parrySuccessTimer = parryStunFrames; // Lasts as long as attacker is stunned
                    
                    console.log(`${anim.type.toUpperCase()} PARRIED! Knockback: vel=(${this.velocity.x.toFixed(0)}, ${this.velocity.y.toFixed(0)})`);
                } else if (guardResult === 'blocked') {
                    sfx.block();
                    const blockMult = anim.type === 'hook' ? (this.tuning.attacks.hook.blockKnockback ?? 1.0) :
                                     anim.type === 'push_kick' ? (this.tuning.attacks.kick.blockKnockback ?? 1.0) : 0.2;
                    dummy.applyKnockback(knockbackDir, force * blockMult);
                    dummy.applyBlockstun(this.tuning.combat?.blockstunFrames ?? 9);
                    this.lastAttackHit = true;
                    console.log(`${anim.type.toUpperCase()} BLOCKED by ${dummy.label}`);
                } else {
                    // HIT LANDED
                    sfx.hit();
                    const hitReaction = dummy.getHitReaction();
                    const dizzyMult = dummy.isDizzy ? this.dizzyKnockbackMultiplier : 1;
                    this.lastAttackHit = true;
                    dummy.applyKnockback(knockbackDir, force * dizzyMult);
                    dummy.flash();
                    
                    // Apply dizzy damage based on attack type (new meter system)
                    const attackKey = anim.type === 'push_kick' ? 'kick' : anim.type;
                    const dizzyAmount = this.tuning.attacks?.[attackKey]?.dizzyAmount ?? 0;
                    if (dizzyAmount > 0) {
                        dummy.addDizzyDamage(dizzyAmount);
                    }
                    
                    const reactionText = hitReaction !== 'normal' ? ` ${hitReaction.toUpperCase()}!` : '';
                    const comboText = this.comboCount > 0 ? ` [COMBO ${this.comboCount}]` : '';
                    console.log(`${anim.type.toUpperCase()} HIT → ${dummy.label}${reactionText}${comboText}`);
                }
            }
        });
    }
    
    lineCircleIntersection(x1, y1, x2, y2, cx, cy, r) {
        // Vector from line start to circle center
        const dx = cx - x1;
        const dy = cy - y1;
        
        // Line direction vector
        const lx = x2 - x1;
        const ly = y2 - y1;
        const len = Math.sqrt(lx * lx + ly * ly);
        
        if (len === 0) return false;
        
        // Normalized direction
        const nx = lx / len;
        const ny = ly / len;
        
        // Project circle center onto line
        const t = Math.max(0, Math.min(len, dx * nx + dy * ny));
        
        // Closest point on line
        const closestX = x1 + nx * t;
        const closestY = y1 + ny * t;
        
        // Distance from circle center to closest point
        const distX = cx - closestX;
        const distY = cy - closestY;
        const dist = Math.sqrt(distX * distX + distY * distY);
        
        return dist <= r;
    }
}

class BrawlerGame {
    static async create() {
        // Load tuning first (with timeout for network issues)
        let tuning;
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch('/tuning.json?' + Date.now(), { signal: controller.signal });
            clearTimeout(timeout);
            tuning = await res.json();
            console.log('Tuning loaded from server');
        } catch (e) {
            console.warn('Failed to load tuning.json, using defaults:', e.message);
            tuning = BrawlerGame.defaultTuning();
        }
        return new BrawlerGame(tuning);
    }
    
    static defaultTuning() {
        return {
            dummy: { guard: 'none', hitReaction: 'punishCounter' },
            movement: { playerSpeed: 300, knockbackDamping: 0.95 },
            attacks: {
                jab: { force: 600, reach: 0.9, angle: 0 },
                hook: { force: 600, reach: 0.9, angle: 90, sweepStart: -60, sweepEnd: 60, sweepDuration: 0.1, stepLateral: 0.5 },
                kick: { force: 600, reach: 1.1, angle: 0 }
            },
            timing: { startupMs: 100, activeMs: 100, recoveryMs: 200, finisherRecoveryMs: 400, cooldownMs: 150 },
            combo: { maxChain: 3, finisherForceMultiplier: 1.5, dizzyKnockbackMultiplier: 2.0, dizzyDuration: 1.5, comboResetTime: 1.0 },
            arena: { strikeRange: 120 },
            inputDirections: { jabThreshold: 0.7, kickThreshold: -0.3 }
        };
    }
    
    constructor(tuning) {
        this.tuning = tuning;
        
        // Create Pixi app (locked to 60fps)
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1a1a2e,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        
        // Lock to 60fps for deterministic frame-based timing
        this.app.ticker.maxFPS = 60;
        
        document.getElementById('gameCanvas').appendChild(this.app.view);
        
        // World container (for camera control)
        this.world = new PIXI.Container();
        this.app.stage.addChild(this.world);
        
        // Center camera
        this.world.x = this.app.screen.width / 2;
        this.world.y = this.app.screen.height / 2;
        
        // Arena bounds (relative to world center) - SQUARE
        this.arenaBounds = {
            left: -400,
            right: 400,
            top: -400,
            bottom: 400
        };
        
        this.createArena();
        
        // Player
        this.player = new Player(this, this.tuning);
        
        // Dummies
        this.dummies = [
            new Dummy(this, '□', new Vec2(0, -200), 0xff6b6b),     // Square - Front
            new Dummy(this, '△', new Vec2(-180, 130), 0xffd93d),   // Triangle - Left
            new Dummy(this, '○', new Vec2(180, 130), 0x6bcf7f)     // Circle - Right
        ];
        
        // Apply dummy settings from tuning
        const dummyGuard = this.tuning.dummy?.guard || 'none';
        const dummyHitReaction = this.tuning.dummy?.hitReaction || 'punishCounter';
        this.dummies.forEach(d => {
            d.dummySettings.guard = dummyGuard;
            d.dummySettings.hitReaction = dummyHitReaction;
        });
        console.log(`Dummy: guard=${dummyGuard}, hitReaction=${dummyHitReaction}`);
        
        // Input
        this.input = {
            leftStick: { x: 0, y: 0 },
            buttons: {
                x: false,
                circle: false,
                square: false,
                triangle: false
            }
        };
        this.lastButtons = {
            x: false,
            circle: false,
            square: false,
            triangle: false
        };
        this.gamepadConnected = false;
        
        // Keyboard state
        this.keys = {};
        
        this.setupInput();
        
        // Stats
        this.frameCount = 0;
        this.lastFpsUpdate = Date.now();
        this.lastTime = Date.now();
        
        // Start game loop
        this.app.ticker.add(() => this.update());
        
        // Resize handler
        window.addEventListener('resize', () => this.onResize());
        
        console.log('Brawler Proto v3 - Pixi.js (No physics engine)');
    }
    
    createArena() {
        // Floor
        const floor = new PIXI.Graphics();
        floor.beginFill(0x16213e);
        floor.drawRect(
            this.arenaBounds.left,
            this.arenaBounds.top,
            this.arenaBounds.right - this.arenaBounds.left,
            this.arenaBounds.bottom - this.arenaBounds.top
        );
        floor.endFill();
        this.world.addChild(floor);
        
        // Boundary lines
        const bounds = new PIXI.Graphics();
        bounds.lineStyle(3, 0x00ffff, 0.8);
        bounds.drawRect(
            this.arenaBounds.left,
            this.arenaBounds.top,
            this.arenaBounds.right - this.arenaBounds.left,
            this.arenaBounds.bottom - this.arenaBounds.top
        );
        this.world.addChild(bounds);
    }
    
    setupInput() {
        // Keyboard
        window.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', e => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Gamepad events
        window.addEventListener('gamepadconnected', e => {
            console.log('Controller connected:', e.gamepad.id);
            this.gamepadConnected = true;
        });
        window.addEventListener('gamepaddisconnected', e => {
            console.log('Controller disconnected');
            this.gamepadConnected = false;
        });
    }
    
    updateInput() {
        const gamepads = navigator.getGamepads();
        
        // Find the best gamepad - prefer DualSense/DualShock over virtual Xbox controllers
        let gp = null;
        for (let i = 0; i < 4; i++) {
            const pad = gamepads[i];
            if (pad && pad.connected) {
                // Prefer PlayStation controllers (DualSense, DualShock)
                if (pad.id.includes('DualSense') || pad.id.includes('DualShock') || pad.id.includes('Wireless Controller')) {
                    gp = pad;
                    break;
                }
                // Fall back to first available if no PlayStation found
                if (!gp) gp = pad;
            }
        }
        
        // Always read keyboard first
        let kx = 0, ky = 0;
        if (this.keys['a']) kx -= 1;
        if (this.keys['d']) kx += 1;
        if (this.keys['w']) ky -= 1;
        if (this.keys['s']) ky += 1;
        
        const keyboardButtons = {
            x: this.keys['j'] || false,
            circle: this.keys['k'] || false,
            square: this.keys['l'] || false,
            triangle: this.keys['i'] || false,
            l1: this.keys['Shift'] || this.keys['ShiftLeft'] || false,
            l2: this.keys['q'] || false  // Q = test dizzy (keyboard)
        };
        
        if (gp) {
            this.gamepadConnected = true;
            
            // Left stick
            const deadzone = 0.15;
            const lx = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
            const ly = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;
            
            // Combine gamepad + keyboard (either works)
            this.input.leftStick = { 
                x: lx || kx, 
                y: ly || ky 
            };
            
            // PS controller buttons (OR with keyboard)
            // 0 = X/Cross, 1 = Circle, 2 = Square, 3 = Triangle
            // 4 = L1, 5 = R1
            this.input.buttons = {
                x: gp.buttons[0]?.pressed || keyboardButtons.x,
                circle: gp.buttons[1]?.pressed || keyboardButtons.circle,
                square: gp.buttons[2]?.pressed || keyboardButtons.square,
                triangle: gp.buttons[3]?.pressed || keyboardButtons.triangle,
                l1: gp.buttons[4]?.pressed || keyboardButtons.l1,
                r1: gp.buttons[5]?.pressed || keyboardButtons.l1,  // R1 also works
                l2: gp.buttons[6]?.pressed || false  // L2 = test dizzy
            };
        } else {
            this.gamepadConnected = false;
            this.input.leftStick = { x: kx, y: ky };
            this.input.buttons = keyboardButtons;
        }
    }
    
    handleAttacks() {
        const btns = this.input.buttons;
        const lastBtns = this.lastButtons;
        
        // L2 = Test dizzy (for tuning)
        const l2Pressed = btns.l2;
        const l2WasPressed = lastBtns.l2 || false;
        if (l2Pressed && !l2WasPressed && !this.player.isDizzy) {
            // Trigger dizzy for testing
            this.player.isDizzy = true;
            this.player.dizzyTimer = this.player.dizzyFrames;
            this.player.dizzyTipAngle = Math.random() * Math.PI * 2;
            this.player.dizzyTipVel = new Vec2(0, 0);
            sfx.dizzy();
            console.log('TEST DIZZY triggered! Tip: ' + (this.player.dizzyTipAngle * 180 / Math.PI).toFixed(0) + '°');
        }
        
        // Handle block/parry (L1)
        const blockPressed = btns.l1;
        const blockWasPressed = lastBtns.l1 || false;
        
        if (blockPressed && !this.player.isAttacking && !this.player.isGrappling) {
            // Holding block (not during grapple)
            this.player.isBlocking = true;
            this.player.isParrying = false;
            this.player.blockHeld = true;
        } else if (!blockPressed && blockWasPressed && !this.player.isAttacking && !this.player.isGrappling) {
            // Just released block → parry window (not during grapple)
            this.player.isBlocking = false;
            this.player.isParrying = true;
            this.player.parryWindow = 9; // 9 frames (~150ms) parry window on release
            this.player.blockHeld = false;
            sfx.parry(); // Audio feedback for parry attempt
            console.log('PARRY WINDOW ACTIVE');
        } else if (!blockPressed && !this.player.blockHeld) {
            // Not blocking
            if (this.player.parryWindow <= 0) {
                this.player.isParrying = false;
            }
            this.player.isBlocking = false;
        }
        
        // Check collision for active animated limbs
        if (this.player.limbAnimation.active) {
            this.player.checkAnimatedLimbCollision(this.dummies);
        }
        
        // Handle active grapple (hammer toss physics)
        if (this.player.isGrappling && this.player.grapplingTarget) {
            const target = this.player.grapplingTarget;
            const dt = 1/60; // Approximate frame time
            const grappleTuning = this.tuning.grapple || {};
            
            // Get stick input
            const stickX = this.input.leftStick.x;
            const stickY = this.input.leftStick.y;
            const stickMag = Math.sqrt(stickX * stickX + stickY * stickY);
            
            // Calculate angular velocity and position
            const angularAccel = grappleTuning.angularAccel ?? 8;
            const angularDrag = grappleTuning.angularDrag ?? 2;
            const velocityThreshold = grappleTuning.velocityThreshold ?? 4;
            const grappleMoveSpeed = grappleTuning.grappleMoveSpeed ?? 0.3;
            
            const absVel = Math.abs(this.player.grappleAngularVel);
            const aboveThreshold = absVel >= velocityThreshold;
            
            // Check if stick is pulling back (away from victim)
            const toVictimX = Math.cos(this.player.grappleAngle);
            const toVictimY = Math.sin(this.player.grappleAngle);
            const stickDotVictim = stickX * toVictimX + stickY * toVictimY;
            // GRADIENT MODEL: Force scales with "awayness" (no binary push/pull)
            // stickDotVictim: -1 = pointing away (full pull), +1 = pointing toward (no pull)
            // Map to force multiplier: away = 1.0, toward = 0.0
            const awayness = Math.max(0, -stickDotVictim); // 0 when toward, 1 when away
            
            // Debug logging (every 30 frames)
            this.player.grappleDebugFrame = (this.player.grappleDebugFrame || 0) + 1;
            if (this.player.grappleDebugFrame % 30 === 0) {
                const mode = aboveThreshold ? 'SPIN' : (stickMag > 0.3 ? `PULL(${(awayness * 100).toFixed(0)}%)` : 'IDLE');
                console.log(`[GRAPPLE] mode=${mode} vel=${this.player.grappleAngularVel.toFixed(1)} absVel=${absVel.toFixed(1)} thresh=${velocityThreshold}`);
            }
            
            if (aboveThreshold) {
                // ABOVE THRESHOLD: No stick translation, only back drift + spin maintenance
                const backDrift = grappleTuning.backDrift ?? 0.5;
                const backDriftAngle = (grappleTuning.backDriftAngle ?? 90) * (Math.PI / 180); // degrees to radians
                // Calculate drift direction - perpendicular, in spin direction
                // Player orbits same direction as victim but in smaller circle (counterbalance)
                const baseAwayAngle = this.player.grappleAngle + Math.PI; // opposite of victim direction
                const spinSign = Math.sign(this.player.grappleAngularVel);
                // Drift perpendicular, IN the direction of spin (not opposite)
                const driftAngle = baseAwayAngle + spinSign * backDriftAngle;
                const driftX = Math.cos(driftAngle);
                const driftY = Math.sin(driftAngle);
                // Apply backdrift (only in spin state, skip for sharedFulcrum)
                if ((grappleTuning.grappleSystem ?? 'playerCentered') !== 'sharedFulcrum') {
                    this.player.position.x += driftX * backDrift * 2;
                    this.player.position.y += driftY * backDrift * 2;
                }
                
                if (stickMag > 0.3) {
                    const stickAngle = Math.atan2(stickY, stickX);
                    if (this.player.lastStickAngle !== null) {
                        let angleDelta = stickAngle - this.player.lastStickAngle;
                        while (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
                        while (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;
                        
                        const spinDir = Math.sign(this.player.grappleAngularVel);
                        const rotDir = Math.sign(angleDelta);
                        
                        if (rotDir === spinDir && Math.abs(angleDelta) > 0.05) {
                            this.player.grappleAngularVel += spinDir * angularAccel * 0.5 * dt;
                        }
                    }
                    this.player.lastStickAngle = stickAngle;
                } else {
                    this.player.lastStickAngle = null;
                }
            } else if (stickMag > 0.3) {
                // BELOW THRESHOLD: Gradient pull - lateral input determines spin, awayness scales force
                
                // Player moves with stick (uniform speed in all directions)
                // Skip for sharedFulcrum - player movement handled separately there
                if ((grappleTuning.grappleSystem ?? 'playerCentered') !== 'sharedFulcrum') {
                    this.player.position.x += stickX * grappleMoveSpeed * 60 * dt;
                    this.player.position.y += stickY * grappleMoveSpeed * 60 * dt;
                }
                
                // Passive drift: victim trails behind like dragging dead weight with friction
                // Cross product gives lateral movement relative to victim direction
                const lateralMovement = stickX * (-toVictimY) + stickY * toVictimX;
                const passiveDrift = grappleTuning.passiveDrift ?? 1;
                const driftFriction = grappleTuning.driftFriction ?? 0.8;
                
                // Calculate desired drift, apply friction to limit speed
                const driftForce = -lateralMovement * passiveDrift * 0.05;
                // Clamp drift to prevent whipping (friction limits max drift per frame)
                const maxDrift = (1 - driftFriction) * 0.2; // Higher friction = lower max drift
                const clampedDrift = Math.max(-maxDrift, Math.min(maxDrift, driftForce));
                this.player.grappleAngle += clampedDrift;
                
                // No backdrift in grapple state - only in spin state
                
                // Lateral component determines rotation direction
                // Cross product negated so: stick-right = victim swings left (opposite)
                const cross = -(Math.cos(this.player.grappleAngle) * stickY - Math.sin(this.player.grappleAngle) * stickX);
                
                // No-rotation dead zones: pure forward/back = no spin force
                const forwardDeadZone = grappleTuning.forwardDeadZone ?? 0.85;
                const backDeadZone = grappleTuning.backDeadZone ?? 0.85;
                const inForwardZone = stickDotVictim > forwardDeadZone;  // pointing toward victim
                const inBackZone = stickDotVictim < -backDeadZone;       // pointing away from victim
                const inDeadZone = inForwardZone || inBackZone;
                
                // Force = lateral * (base + awayness bonus)
                // Base ensures some rotation even when pointing perpendicular
                // Awayness bonus rewards pulling back while steering
                const baseMultiplier = 0.3;
                const awayBonus = 0.7 * awayness;
                // Note: no * dt here - angularAccel is per-frame in 60fps system
                const rotationForce = inDeadZone ? 0 : cross * (baseMultiplier + awayBonus) * angularAccel * 0.1;
                
                // Apply rotation
                this.player.grappleAngularVel += rotationForce;
                
                this.player.lastStickAngle = null; // Reset for rotation detection
            } else {
                this.player.lastStickAngle = null;
            }
            
            // Apply angular drag (reduced in spin state - momentum is conserved)
            const effectiveDrag = aboveThreshold ? angularDrag * 0.1 : angularDrag; // 90% less drag in spin
            this.player.grappleAngularVel *= (1 - effectiveDrag * dt);
            
            // Update angle
            const prevAngle = this.player.grappleAngle;
            this.player.grappleAngle += this.player.grappleAngularVel * dt;
            
            // Track spin rotations (only counts in spin state)
            if (aboveThreshold) {
                if (!this.player.wasInSpinState) {
                    // Just entered spin state - reset rotation counter
                    this.player.spinRotations = 0;
                    this.player.wasInSpinState = true;
                }
                // Accumulate rotations (in full rotations, not radians)
                this.player.spinRotations += Math.abs(this.player.grappleAngle - prevAngle) / (2 * Math.PI);
                
                // Check for spin timeout
                const maxSpins = grappleTuning.maxSpins ?? 3;
                if (this.player.spinRotations >= maxSpins) {
                    // SPIN FAIL - grappler dizzy, victim put down gently
                    console.log(`SPIN TIMEOUT! ${this.player.spinRotations.toFixed(1)} rotations - grappler dizzy!`);
                    
                    // Grappler gets dizzy
                    this.player.isDizzy = true;
                    this.player.dizzyTimer = this.tuning.combo?.dizzyFrames ?? 180;
                    sfx.dizzy();
                    
                    // Victim put down gently (small knockback)
                    const gentleForce = 200;
                    const awayX = Math.cos(this.player.grappleAngle);
                    const awayY = Math.sin(this.player.grappleAngle);
                    target.velocity.x = awayX * gentleForce;
                    target.velocity.y = awayY * gentleForce;
                    
                    // Release grapple
                    target.isGrappled = false;
                    target.grappledBy = null;
                    target.escapeMeter = 0;
                    this.player.isGrappling = false;
                    this.player.grapplingTarget = null;
                    this.player.grappleButton = null;
                    this.player.grappleAngularVel = 0;
                    this.player.spinRotations = 0;
                    this.player.wasInSpinState = false;
                }
            } else {
                this.player.wasInSpinState = false;
            }
            
            // Hold distance increases with velocity (centrifuge effect)
            const currentAbsVel = Math.abs(this.player.grappleAngularVel);
            const minDist = grappleTuning.holdDistanceMin ?? 50;
            const maxDist = grappleTuning.holdDistanceMax ?? 120;
            const velFactor = Math.min(1, currentAbsVel / velocityThreshold);
            const holdDist = minDist + (maxDist - minDist) * velFactor;
            
            // Position based on grapple system
            const grappleSystem = grappleTuning.grappleSystem ?? 'playerCentered';
            
            if (grappleSystem === 'sharedFulcrum') {
                // CHAIN PHYSICS - Your movement creates torque
                // Like swinging a ball on a chain: you PULL, chain goes taut, ball swings.
                
                const chainLength = grappleTuning.holdDistanceMin ?? 60;
                const pullStrength = grappleTuning.springStiffness ?? 10;     // How much your pull translates to torque
                const victimMass = grappleTuning.victimMass ?? 1.5;           // Inertia
                const chainDamping = grappleTuning.springDamping ?? 0.98;     // Momentum retention (higher = less loss)
                const playerGrappleSpeed = grappleTuning.grappleMoveSpeed ?? 4;
                
                // Initialize if not set
                if (this.player.victimAngularVel === undefined) {
                    this.player.victimAngularVel = 0;
                }
                
                // PLAYER MOVEMENT - you move with stick
                const moveX = stickX * playerGrappleSpeed;
                const moveY = stickY * playerGrappleSpeed;
                this.player.position.x += moveX;
                this.player.position.y += moveY;
                
                // Current chain direction (player to victim)
                const chainX = Math.cos(this.player.grappleAngle);
                const chainY = Math.sin(this.player.grappleAngle);
                
                // YOUR MOVEMENT creates TORQUE
                // Torque = cross product of chain direction and your movement
                // If you move perpendicular to chain, max torque (spinning)
                // If you move along chain, no torque (pulling in/out)
                const moveMag = Math.sqrt(moveX * moveX + moveY * moveY);
                if (moveMag > 0.1) {
                    // Cross product: chain × movement = torque direction
                    // chainX * moveY - chainY * moveX = perpendicular component
                    const torqueFromMovement = (chainX * moveY - chainY * moveX) * pullStrength / victimMass;
                    
                    // Your pulling (movement away from victim) amplifies torque
                    // Dot product: how much you're pulling back
                    const pullAmount = -(chainX * moveX + chainY * moveY); // negative = pulling back
                    const pullBonus = Math.max(0, pullAmount) * 0.5; // bonus torque when pulling
                    
                    this.player.victimAngularVel += (torqueFromMovement * (1 + pullBonus)) * dt * 60;
                }
                
                // Apply damping (very light - preserve momentum)
                this.player.victimAngularVel *= chainDamping;
                
                // Update angle
                this.player.grappleAngle += this.player.victimAngularVel * dt;
                
                // Position victim at end of chain
                target.position.x = this.player.position.x + Math.cos(this.player.grappleAngle) * chainLength;
                target.position.y = this.player.position.y + Math.sin(this.player.grappleAngle) * chainLength;
                
                // Sync angular vel for throw calculation
                this.player.grappleAngularVel = this.player.victimAngularVel;
                
            } else {
                // PLAYER CENTERED: Victim orbits around fixed player position
                target.position.x = this.player.position.x + Math.cos(this.player.grappleAngle) * holdDist;
                target.position.y = this.player.position.y + Math.sin(this.player.grappleAngle) * holdDist;
            }
            
            target.container.x = target.position.x;
            target.container.y = target.position.y;
            
            // Sync player container
            this.player.container.x = this.player.position.x;
            this.player.container.y = this.player.position.y;
            
            // Debug: log positions (every 30 frames)
            if (this.player.grappleDebugFrame % 30 === 0) {
                const sys = grappleTuning.grappleSystem ?? 'playerCentered';
                const anchorX = this.player.grappleAnchorX ?? this.player.position.x;
                const anchorY = this.player.grappleAnchorY ?? this.player.position.y;
                const pDist = Math.sqrt((this.player.position.x - anchorX) ** 2 + (this.player.position.y - anchorY) ** 2);
                const vDist = Math.sqrt((target.position.x - anchorX) ** 2 + (target.position.y - anchorY) ** 2);
                console.log(`[POS] sys=${sys} velF=${velFactor.toFixed(2)} pDist=${pDist.toFixed(0)} vDist=${vDist.toFixed(0)} hold=${holdDist.toFixed(0)}`);
            }
            
            // Check if grapple button was released → throw
            const grappleBtn = this.player.grappleButton;
            if (grappleBtn && !btns[grappleBtn]) {
                // Throw in tangent direction (direction of travel)
                const throwForce = grappleTuning.throwForce ?? 1000;
                const tangentX = -Math.sin(this.player.grappleAngle) * Math.sign(this.player.grappleAngularVel);
                const tangentY = Math.cos(this.player.grappleAngle) * Math.sign(this.player.grappleAngularVel);
                
                // Add velocity based on angular momentum
                const spinBonus = Math.min(absVel / velocityThreshold, 2); // Up to 2x bonus
                target.velocity.x = tangentX * throwForce * (0.5 + spinBonus * 0.5);
                target.velocity.y = tangentY * throwForce * (0.5 + spinBonus * 0.5);
                
                // Release grapple
                target.isGrappled = false;
                target.grappledBy = null;
                target.escapeMeter = 0;
                this.player.isGrappling = false;
                this.player.grapplingTarget = null;
                this.player.grappleButton = null;
                this.player.grappleAngularVel = 0;
                this.player.spinRotations = 0;
                this.player.wasInSpinState = false;
                
                sfx.throw();
                console.log(`THROW! Spin bonus: ${spinBonus.toFixed(2)}x`);
            }
        }
        
        // Track button hold times for grapple detection (frame-based)
        const buttonMap = { square: 0, triangle: 1, circle: 2, x: 3 };
        const grappleHoldFrames = this.tuning.grapple?.holdFrames ?? 30;
        const grappleRange = this.tuning.grapple?.range ?? 60;
        
        for (const [btnName, dummyIndex] of Object.entries(buttonMap)) {
            const currentHoldFrames = this.player.buttonHoldTime[btnName] || 0;
            
            if (btns[btnName]) {
                // Button held - increment hold time (unless marked as used with -1)
                if (currentHoldFrames >= 0) {
                    this.player.buttonHoldTime[btnName] = currentHoldFrames + 1; // 1 frame
                }
                
                // Check for grapple initiation
                if (!this.player.isGrappling && 
                    !this.player.isBlocking && 
                    !this.player.isAttacking &&
                    currentHoldFrames >= 0 &&
                    this.player.buttonHoldTime[btnName] >= grappleHoldFrames) {
                    
                    const target = this.dummies[dummyIndex];
                    if (!target.isRespawning && !target.isGrappled) {
                        // Check range
                        const dx = target.position.x - this.player.position.x;
                        const dy = target.position.y - this.player.position.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        // Grapple range = just outside collision (touching distance)
                        const touchDist = this.player.radius + target.radius;
                        if (dist <= touchDist + grappleRange) {
                            // Initiate grapple!
                            this.player.isGrappling = true;
                            this.player.grapplingTarget = target;
                            this.player.grappleButton = btnName;
                            this.player.buttonHoldTime[btnName] = -1;
                            
                            // Initialize hammer toss - angle from player to target
                            const dx = target.position.x - this.player.position.x;
                            const dy = target.position.y - this.player.position.y;
                            this.player.grappleAngle = Math.atan2(dy, dx);
                            this.player.grappleAngularVel = 0;
                            
                            // Anchor point for shared fulcrum mode
                            this.player.grappleAnchorX = this.player.position.x;
                            this.player.grappleAnchorY = this.player.position.y;
                            
                            target.isGrappled = true;
                            target.grappledBy = this.player;
                            target.velocity.x = 0;
                            target.velocity.y = 0;
                            console.log(`GRAPPLE! Grabbed ${target.label}`);
                        }
                    }
                }
            } else {
                // Button released
                const holdTime = this.player.buttonHoldTime[btnName] || 0;
                // Attack on release IF: holdTime > 0 (was pressed), not -1 (grapple succeeded), and not in other states
                if (holdTime > 0 && 
                    !this.player.isBlocking && 
                    !this.player.isParrying &&
                    !this.player.isGrappling) {
                    // Release without successful grapple = attack
                    const target = this.dummies[dummyIndex];
                    if (!target.isRespawning) {
                        this.player.performAttack(target, this.dummies);
                    }
                }
                // Reset hold time (allows next grapple after release)
                this.player.buttonHoldTime[btnName] = 0;
            }
        }
        
        // Store button state for next frame
        this.lastButtons = {
            x: btns.x,
            circle: btns.circle,
            square: btns.square,
            triangle: btns.triangle,
            l1: btns.l1
        };
    }
    
    update() {
        // Fixed 60fps timestep (1 frame = 1/60 second)
        const FRAME_TIME = 1 / 60;
        
        this.frameCount++;
        this.updateInput();
        this.player.update(FRAME_TIME, this.input);
        
        // UPDATE PLAYER FACING - face weighted centroid (closer = more attention)
        if (!this.player.isRespawning && !this.player.isGrappling) {
            // Calculate distance-weighted centroid of all dummies
            // Closer fighters pull attention more (weight = 1 / distance²)
            let weightedX = 0, weightedY = 0, totalWeight = 0;
            this.dummies.forEach(d => {
                if (!d.isRespawning) {
                    const dx = d.position.x - this.player.position.x;
                    const dy = d.position.y - this.player.position.y;
                    const distSq = dx * dx + dy * dy;
                    const minDist = 50; // Prevent division by tiny numbers
                    const weight = 1 / Math.max(distSq, minDist * minDist);
                    weightedX += d.position.x * weight;
                    weightedY += d.position.y * weight;
                    totalWeight += weight;
                }
            });
            if (totalWeight > 0) {
                const focusX = weightedX / totalWeight;
                const focusY = weightedY / totalWeight;
                // Face toward weighted focus point
                const dx = focusX - this.player.position.x;
                const dy = focusY - this.player.position.y;
                const targetFacing = Math.atan2(dy, dx);
                this.player.updateFacing(targetFacing, FRAME_TIME);
            }
        }
        
        this.handleAttacks();
        
        this.dummies.forEach(dummy => {
            dummy.update(FRAME_TIME);
        });
        
        // Resolve fighter collisions (no overlapping)
        this.resolveFighterCollisions();
        
        this.updateUI();
    }
    
    resolveFighterCollisions() {
        // Collect all fighters (player + dummies that aren't respawning)
        const fighters = [];
        if (!this.player.isRespawning) {
            fighters.push({ obj: this.player, pos: this.player.position, radius: this.player.radius });
        }
        this.dummies.forEach(d => {
            if (!d.isRespawning) {
                fighters.push({ obj: d, pos: d.position, radius: d.radius });
            }
        });
        
        // Check all pairs
        for (let i = 0; i < fighters.length; i++) {
            for (let j = i + 1; j < fighters.length; j++) {
                const a = fighters[i];
                const b = fighters[j];
                
                // Skip collision for grapple pairs
                if ((a.obj.isGrappling && a.obj.grapplingTarget === b.obj) ||
                    (b.obj.isGrappling && b.obj.grapplingTarget === a.obj) ||
                    (a.obj.isGrappled && a.obj.grappledBy === b.obj) ||
                    (b.obj.isGrappled && b.obj.grappledBy === a.obj)) {
                    continue;
                }
                
                const dx = b.pos.x - a.pos.x;
                const dy = b.pos.y - a.pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = a.radius + b.radius;
                
                if (dist < minDist && dist > 0) {
                    // Overlap - push apart
                    const overlap = minDist - dist;
                    const nx = dx / dist; // Normal from a to b
                    const ny = dy / dist;
                    
                    // Split 50/50 for now (can adjust based on states later)
                    const pushA = overlap * 0.5;
                    const pushB = overlap * 0.5;
                    
                    a.pos.x -= nx * pushA;
                    a.pos.y -= ny * pushA;
                    b.pos.x += nx * pushB;
                    b.pos.y += ny * pushB;
                    
                    // Sync visual containers
                    a.obj.container.x = a.pos.x;
                    a.obj.container.y = a.pos.y;
                    b.obj.container.x = b.pos.x;
                    b.obj.container.y = b.pos.y;
                }
            }
        }
    }
    
    updateUI() {
        const controllerEl = document.getElementById('controller');
        if (this.gamepadConnected) {
            controllerEl.textContent = '✓ Controller: Connected';
            controllerEl.classList.add('connected');
        } else {
            controllerEl.textContent = '✗ Controller: Disconnected (use WASD + IJKL)';
            controllerEl.classList.remove('connected');
        }
        
        const playerPosEl = document.getElementById('playerPos');
        const comboText = this.player.comboCount > 0 ? ` | COMBO: ${this.player.comboCount}` : '';
        playerPosEl.textContent = `Player: (${this.player.position.x.toFixed(0)}, ${this.player.position.y.toFixed(0)})${comboText}`;
        
        // FPS
        const now = Date.now();
        if (now - this.lastFpsUpdate > 1000) {
            document.getElementById('fps').textContent = `FPS: ${this.frameCount}`;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }
    
    onResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.world.x = this.app.screen.width / 2;
        this.world.y = this.app.screen.height / 2;
    }
    
    // Populate the in-game tuning panel from tuning object
    populateTuningPanel() {
        const t = this.tuning;
        if (!t) {
            console.error('No tuning loaded!');
            return;
        }
        console.log('Populating panel with:', t);
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };
        
        // Timing
        setVal('startupMs', t.timing.startupMs);
        setVal('activeMs', t.timing.activeMs);
        setVal('recoveryMs', t.timing.recoveryMs);
        setVal('finisherRecoveryMs', t.timing.finisherRecoveryMs);
        setVal('cooldownMs', t.timing.cooldownMs);
        
        // Forces & angles
        setVal('jabForce', t.attacks.jab.force);
        setVal('jabAngle', t.attacks.jab.angle);
        setVal('hookForce', t.attacks.hook.force);
        setVal('hookAngle', t.attacks.hook.angle);
        setVal('kickForce', t.attacks.kick.force);
        setVal('kickAngle', t.attacks.kick.angle);
        
        // Reach
        setVal('jabReach', t.attacks.jab.reach);
        setVal('hookReach', t.attacks.hook.reach);
        setVal('kickReach', t.attacks.kick.reach);
        
        // Hook sweep
        setVal('hookSweepStart', t.attacks.hook.sweepStart);
        setVal('hookSweepEnd', t.attacks.hook.sweepEnd);
        setVal('hookSweepDuration', t.attacks.hook.sweepDuration);
        
        // Other
        setVal('damping', t.movement.knockbackDamping);
        setVal('finisherMult', t.combo.finisherForceMultiplier);
        
        console.log('Tuning panel populated from tuning.json');
    }
    
    // Apply values from panel to tuning object (live update)
    applyTuningPanel() {
        const t = this.tuning;
        const getVal = (id, fallback) => {
            const el = document.getElementById(id);
            return el ? parseFloat(el.value) : fallback;
        };
        
        // Timing
        t.timing.startupMs = getVal('startupMs', t.timing.startupMs);
        t.timing.activeMs = getVal('activeMs', t.timing.activeMs);
        t.timing.recoveryMs = getVal('recoveryMs', t.timing.recoveryMs);
        t.timing.finisherRecoveryMs = getVal('finisherRecoveryMs', t.timing.finisherRecoveryMs);
        t.timing.cooldownMs = getVal('cooldownMs', t.timing.cooldownMs);
        
        // Forces & angles
        t.attacks.jab.force = getVal('jabForce', t.attacks.jab.force);
        t.attacks.jab.angle = getVal('jabAngle', t.attacks.jab.angle);
        t.attacks.hook.force = getVal('hookForce', t.attacks.hook.force);
        t.attacks.hook.angle = getVal('hookAngle', t.attacks.hook.angle);
        t.attacks.kick.force = getVal('kickForce', t.attacks.kick.force);
        t.attacks.kick.angle = getVal('kickAngle', t.attacks.kick.angle);
        
        // Reach
        t.attacks.jab.reach = getVal('jabReach', t.attacks.jab.reach);
        t.attacks.hook.reach = getVal('hookReach', t.attacks.hook.reach);
        t.attacks.kick.reach = getVal('kickReach', t.attacks.kick.reach);
        
        // Hook sweep
        t.attacks.hook.sweepStart = getVal('hookSweepStart', t.attacks.hook.sweepStart);
        t.attacks.hook.sweepEnd = getVal('hookSweepEnd', t.attacks.hook.sweepEnd);
        t.attacks.hook.sweepDuration = getVal('hookSweepDuration', t.attacks.hook.sweepDuration);
        
        // Other
        t.movement.knockbackDamping = getVal('damping', t.movement.knockbackDamping);
        t.combo.finisherForceMultiplier = getVal('finisherMult', t.combo.finisherForceMultiplier);
        
        // Update dummies
        this.dummies.forEach(dummy => {
            dummy.knockbackDamping = t.movement.knockbackDamping;
        });
        
        console.log('Tuning applied!');
    }
    
    // Save tuning to server
    async saveTuning() {
        this.applyTuningPanel(); // Apply first
        try {
            const res = await fetch('/tuning.json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.tuning, null, 2)
            });
            if (res.ok) {
                console.log('Tuning saved to tuning.json!');
                alert('Saved!');
            } else {
                console.error('Save failed');
                alert('Save failed');
            }
        } catch (e) {
            console.error('Save error:', e);
            alert('Save error: ' + e.message);
        }
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
    window.game = await BrawlerGame.create();
    window.game.populateTuningPanel();
});
