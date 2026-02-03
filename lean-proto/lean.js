// lean.js - Lean physics model
// The upper body can offset from the base, creating force that moves the base

class LeanModel {
  constructor() {
    // Current lean state
    this.angle = 0;        // Direction of lean (radians)
    this.magnitude = 0;    // How far upper is offset from base (0 to maxLean)
    
    // Target lean (set by input or external forces)
    this.targetAngle = 0;
    this.targetMagnitude = 0;
  }

  // Set target lean from a direction vector
  setTarget(dx, dy, maxLean) {
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag < 0.001) {
      // No input - lean back to center
      this.targetMagnitude = 0;
    } else {
      this.targetAngle = Math.atan2(dy, dx);
      this.targetMagnitude = Math.min(mag, 1) * maxLean;
    }
  }

  // Update lean toward target, returns force vector to apply to base
  update(tuning) {
    const { maxLean, leanResponse, pullStrength } = tuning;

    // Smoothly approach target
    // For angle, we need to handle wraparound
    if (this.targetMagnitude > 0.01) {
      // Lerp angle toward target (handling wraparound)
      let angleDiff = this.targetAngle - this.angle;
      // Normalize to -PI to PI
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.angle += angleDiff * leanResponse;
    }

    // Lerp magnitude toward target
    this.magnitude += (this.targetMagnitude - this.magnitude) * leanResponse;

    // Calculate force from lean (lean pulls base toward upper body position)
    const forceX = Math.cos(this.angle) * this.magnitude * pullStrength;
    const forceY = Math.sin(this.angle) * this.magnitude * pullStrength;

    return { x: forceX, y: forceY };
  }

  // Get the offset of upper body from base
  getOffset() {
    return {
      x: Math.cos(this.angle) * this.magnitude,
      y: Math.sin(this.angle) * this.magnitude
    };
  }

  // Get normalized lean for external use (0-1)
  getNormalizedMagnitude(maxLean) {
    return this.magnitude / maxLean;
  }
}

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LeanModel };
}
