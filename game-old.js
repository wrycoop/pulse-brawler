// BRAWLER PROTOTYPE - Strike Mechanics Sandbox
// Three.js top-down arena with PS4/PS5 controller support

class BrawlerGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Camera setup - top-down fixed view
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspectRatio = width / height;
        
        this.camera = new THREE.OrthographicCamera(
            -20 * aspectRatio, 20 * aspectRatio, 20, -20, 0.1, 1000
        );
        this.camera.position.set(0, 25, 0);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        const canvas = document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        // Arena
        this.arena = {
            width: 40,
            height: 40,
            color: 0x16213e
        };
        this.createArena();

        // Player
        this.player = {
            position: new THREE.Vector3(0, 0.5, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            speed: 8,
            radius: 0.6,
            mesh: null,
            targetDummy: null,
            lastAttackTime: 0,
            attackCooldown: 0.3,
            strikeRange: 3.5,
            strikeRangeVisualization: null,
            isStriking: false,
            strikeTimer: 0
        };
        this.createPlayer();

        // Dummies
        this.dummies = [];
        this.createDummies();

        // Controller
        this.gamepad = {
            connected: false,
            index: null,
            state: {
                leftStick: { x: 0, y: 0 },
                buttons: {}
            }
        };

        // Input
        this.keys = {};
        this.setupInputListeners();

        // Time tracking
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastFpsUpdate = 0;

        // Effect particles for hits
        this.particles = [];

        window.addEventListener('resize', () => this.onWindowResize());
    }

    createArena() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(this.arena.width, this.arena.height);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: this.arena.color,
            metalness: 0.3,
            roughness: 0.7
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);

        // Boundary lines
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
        const points = [
            new THREE.Vector3(-this.arena.width / 2, 0.1, -this.arena.height / 2),
            new THREE.Vector3(this.arena.width / 2, 0.1, -this.arena.height / 2),
            new THREE.Vector3(this.arena.width / 2, 0.1, this.arena.height / 2),
            new THREE.Vector3(-this.arena.width / 2, 0.1, this.arena.height / 2),
            new THREE.Vector3(-this.arena.width / 2, 0.1, -this.arena.height / 2)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const boundary = new THREE.Line(geometry, lineMaterial);
        this.scene.add(boundary);
    }

    createPlayer() {
        const geometry = new THREE.ConeGeometry(0.6, 1.2, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00aa00,
            metalness: 0.5,
            roughness: 0.3
        });
        this.player.mesh = new THREE.Mesh(geometry, material);
        this.player.mesh.position.copy(this.player.position);
        this.scene.add(this.player.mesh);

        // Create strike range visualization (circle)
        const rangeGeometry = new THREE.CircleGeometry(this.player.strikeRange, 32);
        const rangeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        this.player.strikeRangeVisualization = new THREE.Mesh(rangeGeometry, rangeMaterial);
        this.player.strikeRangeVisualization.position.copy(this.player.position);
        this.player.strikeRangeVisualization.position.y = 0.05;
        this.player.strikeRangeVisualization.rotation.x = -Math.PI / 2;
        this.scene.add(this.player.strikeRangeVisualization);
    }

    createDummies() {
        const positions = [
            new THREE.Vector3(0, 0, -12),      // Front - Square
            new THREE.Vector3(-10, 0, 8),      // Bottom-left - Triangle
            new THREE.Vector3(10, 0, 8)        // Bottom-right - Circle
        ];

        const labels = ['□', '△', '○'];  // PS button symbols: Square, Triangle, Circle
        const colors = [0xff6b6b, 0xffd93d, 0x6bcf7f];

        positions.forEach((pos, idx) => {
            const dummy = {
                label: labels[idx],
                position: pos.clone(),
                initialPosition: pos.clone(),
                velocity: new THREE.Vector3(0, 0, 0),
                radius: 0.5,
                mesh: null,
                health: 1.0,
                knockbackDamping: 0.88,  // Slower damping = longer knockback slides
                collisionRadius: 0.5
            };

            // Geometry - simple cube/box
            const geometry = new THREE.BoxGeometry(0.8, 1.2, 0.8);
            const material = new THREE.MeshStandardMaterial({
                color: colors[idx],
                emissive: colors[idx],
                emissiveIntensity: 0.3,
                metalness: 0.4,
                roughness: 0.6
            });
            dummy.mesh = new THREE.Mesh(geometry, material);
            dummy.mesh.position.copy(dummy.position);
            this.scene.add(dummy.mesh);

            // Add label text
            this.addDummyLabel(dummy, labels[idx]);

            this.dummies.push(dummy);
        });
    }

    addDummyLabel(dummy, label) {
        // Use actual PS button symbols directly
        const textLabel = label;
        
        // Create canvas texture with large, readable text
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Set background to transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw text with HIGH VISIBILITY settings
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 20;  // Thicker outline
        ctx.font = 'bold 600px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw thick outline for clarity
        ctx.strokeText(textLabel, 512, 512);
        ctx.strokeText(textLabel, 512, 512);  // Double stroke for more visibility
        
        // Then filled text on top
        ctx.fillStyle = '#ffffff';
        ctx.fillText(textLabel, 512, 512);
        
        // Create texture and material with proper settings
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        
        const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,  // Visible from both sides
            emissive: 0x999999,      // Self-lit for visibility
            emissiveIntensity: 0.5
        });
        
        // Larger plane for better visibility
        const geometry = new THREE.PlaneGeometry(2.5, 2.5);
        const sprite = new THREE.Mesh(geometry, material);
        sprite.position.copy(dummy.position);
        sprite.position.y += 1.0;  // Slightly lower to sit on top of dummy
        sprite.rotation.x = -Math.PI / 2;  // Face camera (top-down)
        sprite.renderOrder = 100;  // Render on top
        
        this.scene.add(sprite);
        
        // Store reference to label mesh on dummy for updates
        dummy.labelMesh = sprite;
    }

    setupInputListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Gamepad connection
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad);
            this.gamepad.connected = true;
            this.gamepad.index = e.gamepad.index;
        });
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Gamepad disconnected');
            this.gamepad.connected = false;
            this.gamepad.index = null;
        });
    }

    updateGamepadInput() {
        if (!this.gamepad.connected || this.gamepad.index === null) {
            return;
        }

        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepad.index];

        if (!gp) return;

        // Left stick for movement
        const deadzone = 0.15;
        const stickX = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
        const stickY = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

        this.gamepad.state.leftStick = { x: stickX, y: stickY };

        // Face buttons (Square=0, X=1, Circle=2, Triangle=3)
        this.gamepad.state.buttons = {
            x: gp.buttons[0]?.pressed || false,        // X/Cross
            circle: gp.buttons[1]?.pressed || false,    // Circle
            square: gp.buttons[2]?.pressed || false,    // Square
            triangle: gp.buttons[3]?.pressed || false   // Triangle
        };
    }

    updatePlayerMovement() {
        const input = new THREE.Vector3(0, 0, 0);

        // Gamepad input
        if (this.gamepad.connected) {
            input.x += this.gamepad.state.leftStick.x;
            input.z += this.gamepad.state.leftStick.y;
        }

        // Keyboard input (WASD)
        if (this.keys['w']) input.z -= 1;
        if (this.keys['s']) input.z += 1;
        if (this.keys['a']) input.x -= 1;
        if (this.keys['d']) input.x += 1;

        if (input.length() > 0) {
            input.normalize();
            this.player.velocity.lerp(
                input.multiplyScalar(this.player.speed),
                0.15
            );
        } else {
            this.player.velocity.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        }

        // Update position
        this.player.position.add(this.player.velocity.clone().multiplyScalar(0.016));

        // Clamp to arena
        const margin = this.player.radius;
        const halfW = this.arena.width / 2 - margin;
        const halfH = this.arena.height / 2 - margin;
        this.player.position.x = Math.max(-halfW, Math.min(halfW, this.player.position.x));
        this.player.position.z = Math.max(-halfH, Math.min(halfH, this.player.position.z));

        this.player.mesh.position.copy(this.player.position);
        
        // Update strike range visualization position
        if (this.player.strikeRangeVisualization) {
            this.player.strikeRangeVisualization.position.copy(this.player.position);
            this.player.strikeRangeVisualization.position.y = 0.05;
        }
        
        // Rotate player to face movement direction
        if (this.player.velocity.length() > 0.1) {
            const angle = Math.atan2(this.player.velocity.x, this.player.velocity.z);
            this.player.mesh.rotation.y = angle;
        }
    }

    handleAttacks() {
        const now = Date.now() / 1000;
        const buttons = this.gamepad.state.buttons;

        // Determine which button was pressed
        // Correct mapping: Square=0(front), Triangle=1(bottom-left), Circle=2(bottom-right)
        let targetIdx = -1;
        if (buttons.square) targetIdx = 0;
        else if (buttons.triangle) targetIdx = 1;  // Fixed: was 2
        else if (buttons.circle) targetIdx = 2;    // Fixed: was 1

        if (targetIdx === -1 || now - this.player.lastAttackTime < this.player.attackCooldown) {
            return;
        }

        const dummy = this.dummies[targetIdx];
        this.performAttack(dummy);
        this.player.lastAttackTime = now;
    }

    performAttack(dummy) {
        // Check distance to target - ENFORCE RANGE LIMIT
        const distanceToTarget = this.player.position.distanceTo(dummy.position);
        
        if (distanceToTarget > this.player.strikeRange) {
            // Target is out of range - no effect
            console.log(`Out of range! Distance: ${distanceToTarget.toFixed(1)} > ${this.player.strikeRange}`);
            // Show brief strike range visualization to indicate miss
            this.showStrikeRangeVisual();
            return;
        }

        // Direction from player to dummy
        const toTarget = new THREE.Vector3()
            .subVectors(dummy.position, this.player.position)
            .normalize();

        // Player's current movement direction
        const moveDir = this.player.velocity.clone();
        if (moveDir.length() < 0.1) {
            // No movement, default to facing dummy
            moveDir.copy(toTarget);
        } else {
            moveDir.normalize();
        }

        // Calculate attack type based on direction relative to target
        let attackType = 'neutral';
        let knockbackForce = 8;
        let knockbackDir = toTarget.clone();

        const dotProduct = moveDir.dot(toTarget);
        const crossProduct = moveDir.x * toTarget.z - moveDir.z * toTarget.x;

        if (dotProduct > 0.5) {
            // Moving towards target = Jab (fastest, combos well)
            attackType = 'jab';
            knockbackForce = 7;  // Moderate knockback for combo setup
            knockbackDir = toTarget.clone().multiplyScalar(1.0);
        } else if (dotProduct < -0.5) {
            // Moving away from target = Push Kick (most power, ends combos)
            attackType = 'push_kick';
            knockbackForce = 14;  // Heavy knockback
            knockbackDir = toTarget.clone().multiplyScalar(1.2);
        } else if (Math.abs(crossProduct) > 0.5) {
            // Left/Right = Hooks (lateral knockback)
            attackType = 'hook';
            knockbackForce = 10;  // Strong lateral force
            const hookDir = crossProduct > 0 ? 1 : -1;
            knockbackDir = new THREE.Vector3(-toTarget.z, 0, toTarget.x).multiplyScalar(hookDir * 1.0);
        }

        // Apply knockback
        const knockback = knockbackDir.normalize().multiplyScalar(knockbackForce);
        dummy.velocity.add(knockback);
        
        // Safety: Cap velocity magnitude to prevent physics explosions
        const maxVelocity = 50;
        if (dummy.velocity.length() > maxVelocity) {
            dummy.velocity.normalize().multiplyScalar(maxVelocity);
            console.warn(`Capped ${dummy.label} velocity to ${maxVelocity}`);
        }

        // Visual feedback - flash and particle
        this.createHitEffect(dummy.position, attackType);
        this.flashDummy(dummy);
        this.showStrikeRangeVisual();

        console.log(`${attackType.toUpperCase()} to ${dummy.label}! (Distance: ${distanceToTarget.toFixed(1)})`);
    }

    showStrikeRangeVisual() {
        // Briefly flash the strike range to show feedback
        this.player.isStriking = true;
        this.player.strikeTimer = 0.15; // 150ms duration
    }

    flashDummy(dummy) {
        // Simple flash effect - store reference to avoid dangling callbacks
        if (!dummy.mesh || !dummy.mesh.material || !dummy.mesh.material.emissive) {
            console.warn(`Cannot flash ${dummy.label}: mesh or material missing`);
            return;
        }
        
        // Store mesh and material references
        const mesh = dummy.mesh;
        const material = dummy.mesh.material;
        const originalEmissive = material.emissive.getHex();
        
        // Flash white
        material.emissive.setHex(0xffffff);
        material.needsUpdate = true;
        
        // Create a safe callback that checks if mesh still exists
        const resetColor = () => {
            if (mesh && mesh.material && mesh.material.emissive && mesh.parent) {
                mesh.material.emissive.setHex(originalEmissive);
                mesh.material.needsUpdate = true;
            }
        };
        
        setTimeout(resetColor, 100);
    }

    createHitEffect(position, attackType) {
        // Particle burst on hit
        const count = attackType === 'push_kick' ? 12 : 8;
        const color = attackType === 'jab' ? 0xff6b6b : 
                      attackType === 'push_kick' ? 0xff9500 : 0xffff00;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 8 + Math.random() * 4;
            const particle = {
                position: position.clone(),
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    2,
                    Math.sin(angle) * speed
                ),
                life: 0.5,
                maxLife: 0.5
            };
            this.particles.push(particle);
        }
    }

    updateDummies() {
        this.dummies.forEach((dummy, idx) => {
            // Apply velocity (knockback damping)
            dummy.velocity.multiplyScalar(dummy.knockbackDamping);

            // Update position
            dummy.position.add(dummy.velocity.clone().multiplyScalar(0.016));
            
            // DEBUG: Check for NaN positions
            if (isNaN(dummy.position.x) || isNaN(dummy.position.y) || isNaN(dummy.position.z)) {
                console.error(`DUMMY ${idx} (${dummy.label}) POSITION IS NaN!`, {
                    position: dummy.position,
                    velocity: dummy.velocity
                });
            }
            
            // DEBUG: Check mesh existence and scene attachment
            if (!dummy.mesh) {
                console.error(`DUMMY ${idx} (${dummy.label}) MESH IS NULL!`);
            } else if (!dummy.mesh.parent) {
                console.error(`DUMMY ${idx} (${dummy.label}) MESH REMOVED FROM SCENE!`);
                // Re-add to scene if missing
                this.scene.add(dummy.mesh);
                console.log(`Re-added dummy ${idx} mesh to scene`);
            }
            
            if (dummy.labelMesh && !dummy.labelMesh.parent) {
                console.error(`DUMMY ${idx} (${dummy.label}) LABEL MESH REMOVED FROM SCENE!`);
                // Re-add label to scene if missing
                this.scene.add(dummy.labelMesh);
                console.log(`Re-added dummy ${idx} label to scene`);
            }

            // Clamp to arena - STRICT BOUNDARY ENFORCEMENT
            const margin = dummy.radius;
            const halfW = this.arena.width / 2 - margin;
            const halfH = this.arena.height / 2 - margin;
            
            let hitBoundary = false;
            
            // Check X boundaries
            if (dummy.position.x > halfW) {
                dummy.position.x = halfW;
                dummy.velocity.x = 0; // Stop horizontal velocity on wall hit
                hitBoundary = true;
            } else if (dummy.position.x < -halfW) {
                dummy.position.x = -halfW;
                dummy.velocity.x = 0;
                hitBoundary = true;
            }
            
            // Check Z boundaries
            if (dummy.position.z > halfH) {
                dummy.position.z = halfH;
                dummy.velocity.z = 0; // Stop vertical velocity on wall hit
                hitBoundary = true;
            } else if (dummy.position.z < -halfH) {
                dummy.position.z = -halfH;
                dummy.velocity.z = 0;
                hitBoundary = true;
            }

            // Safety: Validate position before updating mesh
            if (isNaN(dummy.position.x) || isNaN(dummy.position.y) || isNaN(dummy.position.z)) {
                console.error(`CRITICAL: ${dummy.label} position is NaN! Resetting to initial.`);
                dummy.position.copy(dummy.initialPosition);
                dummy.velocity.set(0, 0, 0);
            }
            
            dummy.mesh.position.copy(dummy.position);
            
            // Update label position with dummy
            if (dummy.labelMesh) {
                dummy.labelMesh.position.copy(dummy.position);
                dummy.labelMesh.position.y += 1.5;
            }
        });
    }

    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.life -= 0.016;
            if (p.life <= 0) return false;

            p.position.add(p.velocity.clone().multiplyScalar(0.016));
            p.velocity.y -= 9.8 * 0.016; // Gravity

            return true;
        });
    }

    updateStrikeRangeVisualization() {
        if (!this.player.strikeRangeVisualization) return;

        if (this.player.isStriking) {
            this.player.strikeTimer -= 0.016;
            if (this.player.strikeTimer <= 0) {
                this.player.isStriking = false;
                this.player.strikeRangeVisualization.material.opacity = 0;
            } else {
                // Fade in/out based on timer
                const progress = this.player.strikeTimer / 0.15;
                this.player.strikeRangeVisualization.material.opacity = Math.max(0, 0.4 * progress);
            }
        }
    }

    updateUI() {
        const controllerEl = document.getElementById('controller');
        if (this.gamepad.connected) {
            controllerEl.textContent = '✓ Controller: Connected';
            controllerEl.classList.add('connected');
        } else {
            controllerEl.textContent = '✗ Controller: Disconnected';
            controllerEl.classList.remove('connected');
        }

        const playerPosEl = document.getElementById('playerPos');
        playerPosEl.textContent = `Player: (${this.player.position.x.toFixed(1)}, ${this.player.position.z.toFixed(1)})`;

        // FPS counter
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFpsUpdate > 1000) {
            document.getElementById('fps').textContent = `FPS: ${this.frameCount}`;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }

    update() {
        this.updateGamepadInput();
        this.updatePlayerMovement();
        this.handleAttacks();
        this.updateDummies();
        this.updateParticles();
        this.updateStrikeRangeVisualization();
        this.updateUI();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspectRatio = width / height;

        this.camera.left = -20 * aspectRatio;
        this.camera.right = 20 * aspectRatio;
        this.camera.top = 20;
        this.camera.bottom = -20;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    const game = new BrawlerGame();
    game.animate();
    console.log('Brawler Proto initialized. Connect a PS4/PS5 controller and press buttons to attack!');
});
