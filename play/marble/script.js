/**
 * Marble Game - Modular Physics Engine
 * Built to be extensible for collisions and shape drawing
 */

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        return mag > 0 ? new Vector2(this.x / mag, this.y / mag) : new Vector2(0, 0);
    }

    subtract(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    distance(vector) {
        return this.subtract(vector).magnitude();
    }
}

class CustomShape {
    constructor(points, color, strokeWidth, moving = false, speed = 1) {
        this.type = 'custom';
        this.points = points.map(p => new Vector2(p.x, p.y));
        this.originalPoints = points.map(p => new Vector2(p.x, p.y));
        this.color = color;
        this.strokeWidth = strokeWidth;
        this.moving = moving;
        this.speed = speed;
        this.velocity = moving ? new Vector2(speed, 0) : new Vector2(0, 0);
        this.id = Math.random().toString(36).substr(2, 9);
        
        // Calculate bounding box
        this.updateBounds();
    }

    updateBounds() {
        if (this.points.length === 0) return;
        
        let minX = this.points[0].x;
        let maxX = this.points[0].x;
        let minY = this.points[0].y;
        let maxY = this.points[0].y;
        
        this.points.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });
        
        this.bounds = {
            minX, maxX, minY, maxY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    }

    update(deltaTime, bounds) {
        if (this.moving) {
            const offset = this.velocity.multiply(deltaTime);
            
            // Move all points
            this.points.forEach(point => {
                point.x += offset.x;
                point.y += offset.y;
            });
            
            this.updateBounds();
            
            // Wrap around horizontally
            if (this.bounds.minX > bounds.width) {
                const wrapOffset = -bounds.width - this.bounds.width;
                this.points.forEach(point => {
                    point.x += wrapOffset;
                });
                this.updateBounds();
            } else if (this.bounds.maxX < 0) {
                const wrapOffset = bounds.width + this.bounds.width;
                this.points.forEach(point => {
                    point.x += wrapOffset;
                });
                this.updateBounds();
            }
        }
    }

    render(ctx) {
        if (this.points.length < 2) return;
        
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw the shape
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        // Close the shape if we have enough points
        if (this.points.length > 2) {
            ctx.closePath();
            ctx.globalAlpha = 0.3;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        ctx.stroke();
        ctx.restore();
    }

    checkCollision(marble) {
        if (!this.bounds) return false;
        
        // Quick bounding box check
        const marbleLeft = marble.position.x - marble.radius;
        const marbleRight = marble.position.x + marble.radius;
        const marbleTop = marble.position.y - marble.radius;
        const marbleBottom = marble.position.y + marble.radius;
        
        if (marbleRight < this.bounds.minX || marbleLeft > this.bounds.maxX ||
            marbleBottom < this.bounds.minY || marbleTop > this.bounds.maxY) {
            return false;
        }
        
        // Check collision with each line segment
        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.points.length];
            
            if (this.pointToLineDistance(marble.position, p1, p2) <= marble.radius) {
                return true;
            }
        }
        
        return false;
    }

    pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) {
            return Math.sqrt(A * A + B * B);
        }
        
        let param = dot / lenSq;
        param = Math.max(0, Math.min(1, param));
        
        const xx = lineStart.x + param * C;
        const yy = lineStart.y + param * D;
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }

    resolveCollision(marble) {
        let closestDistance = Infinity;
        let closestPoint = null;
        let closestNormal = null;
        
        // Find the closest point on the shape to the marble
        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.points.length];
            
            const distance = this.pointToLineDistance(marble.position, p1, p2);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                
                // Calculate closest point on line segment
                const A = marble.position.x - p1.x;
                const B = marble.position.y - p1.y;
                const C = p2.x - p1.x;
                const D = p2.y - p1.y;
                
                const dot = A * C + B * D;
                const lenSq = C * C + D * D;
                
                let param = lenSq === 0 ? 0 : Math.max(0, Math.min(1, dot / lenSq));
                
                closestPoint = new Vector2(
                    p1.x + param * C,
                    p1.y + param * D
                );
                
                // Calculate normal vector
                const normal = marble.position.subtract(closestPoint);
                closestNormal = normal.magnitude() > 0 ? normal.normalize() : new Vector2(0, -1);
            }
        }
        
        if (closestPoint && closestNormal && closestDistance < marble.radius) {
            // Separate marble from shape
            const overlap = marble.radius - closestDistance;
            marble.position.x += closestNormal.x * overlap;
            marble.position.y += closestNormal.y * overlap;
            
            // Enhanced bouncy reflection with more energy
            const dotProduct = marble.velocity.x * closestNormal.x + marble.velocity.y * closestNormal.y;
            const bounciness = 1.1;
            marble.velocity.x -= 2 * dotProduct * closestNormal.x * marble.restitution * bounciness;
            marble.velocity.y -= 2 * dotProduct * closestNormal.y * marble.restitution * bounciness;
            
            // Add some random energy to make bounces more chaotic and fun
            const randomBoost = 0.5;
            marble.velocity.x += (Math.random() - 0.5) * randomBoost;
            marble.velocity.y += (Math.random() - 0.5) * randomBoost;
            
            // Add minimal extra spin when hitting shapes to preserve visibility
            marble.angularVelocity += (Math.random() - 0.5) * 0.02;
        }
    }
}

class Shape {
    constructor(type, x, y, size, color, moving = false, speed = 1) {
        this.type = type;
        this.position = new Vector2(x, y);
        this.size = size;
        this.color = color;
        this.moving = moving;
        this.speed = speed;
        this.velocity = moving ? new Vector2(speed, 0) : new Vector2(0, 0);
        this.id = Math.random().toString(36).substr(2, 9);
        
        // Dynamic shape specific properties
        if (type === 'wave') {
            this.rotation = 0;
            this.rotationSpeed = -2; // Counter-clockwise rotation
        } else if (type === 'bouncer') {
            this.pulsePhase = 0;
            this.lastHitTime = 0;
        } else if (type === 'teleporter') {
            this.pulsePhase = 0;
            this.teleportCooldown = 0;
            this.partnerTeleporter = null; // Will be set to another teleporter if available
        } else if (type === 'blackhole') {
            this.pulsePhase = 0;
            this.absorptionCooldown = 0;
        }
    }

    update(deltaTime, bounds) {
        if (this.moving) {
            this.position = this.position.add(this.velocity.multiply(deltaTime));
            
            // Wrap around horizontally
            if (this.position.x > bounds.width + this.size) {
                this.position.x = -this.size;
            } else if (this.position.x < -this.size) {
                this.position.x = bounds.width + this.size;
            }
        }
        
        // Update dynamic properties
        if (this.type === 'wave') {
            this.rotation += this.rotationSpeed * deltaTime;
        } else if (this.type === 'bouncer') {
            this.pulsePhase += deltaTime * 3;
            this.lastHitTime = Math.max(0, this.lastHitTime - deltaTime);
        } else if (this.type === 'teleporter') {
            this.pulsePhase += deltaTime * 4;
            this.teleportCooldown = Math.max(0, this.teleportCooldown - deltaTime);
        } else if (this.type === 'blackhole') {
            this.pulsePhase += deltaTime * 5;
            this.absorptionCooldown = Math.max(0, this.absorptionCooldown - deltaTime);
        }
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;

        switch (this.type) {
            case 'rectangle':
                ctx.fillRect(this.position.x - this.size/2, this.position.y - this.size/2, this.size, this.size);
                ctx.strokeRect(this.position.x - this.size/2, this.position.y - this.size/2, this.size, this.size);
                break;
            
            case 'circle':
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.size/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'wave':
                this.renderWaveFlipper(ctx);
                break;
                
            case 'bouncer':
                this.renderBouncer(ctx);
                break;
                
            case 'teleporter':
                this.renderTeleporter(ctx);
                break;
                
            case 'blackhole':
                this.renderBlackHole(ctx);
                break;
        }
        
        ctx.restore();
    }

    renderWaveFlipper(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        
        const radius = this.size / 2;
        
        ctx.beginPath();
        ctx.moveTo(-radius, 0);
        ctx.quadraticCurveTo(-radius * 0.7, -radius * 0.8, 0, -radius * 0.6);
        ctx.quadraticCurveTo(radius * 0.7, -radius * 0.4, radius, 0);
        ctx.quadraticCurveTo(radius * 0.7, radius * 0.4, 0, radius * 0.6);
        ctx.quadraticCurveTo(-radius * 0.7, radius * 0.8, -radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(radius * 0.6, -radius * 0.3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    renderBouncer(ctx) {
        const radius = this.size / 2;
        const pulse = Math.sin(this.pulsePhase) * 0.1 + 1;
        const hitGlow = this.lastHitTime > 0 ? this.lastHitTime * 2 : 0;
        
        // Outer glow effect
        if (hitGlow > 0) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff6b6b';
        }
        
        // Main bouncer body
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner energy core
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, radius * 0.3 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }

    renderTeleporter(ctx) {
        const radius = this.size / 2;
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        
        // Portal swirl effect
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        
        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI) / 4 + this.pulsePhase * 0.5);
            ctx.strokeStyle = `hsl(${240 + i * 20}, 70%, 60%)`;
            ctx.lineWidth = 3;
            ctx.globalAlpha = pulse;
            
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.3 + i * 2, 0, Math.PI * 0.5);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Outer ring
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    renderBlackHole(ctx) {
        const radius = this.size / 2;
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8; // Subtle pulsating effect
        
        // Gravitational field visualization (dark rings)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, radius * i * 1.2 * pulse, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        // Outer event horizon (dark gray)
        ctx.fillStyle = '#333333';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#000000';
        
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner black core
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#000000';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, radius * 0.6 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Singularity point (tiny white dot at center)
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }

    checkCollision(marble) {
        const dx = marble.position.x - this.position.x;
        const dy = marble.position.y - this.position.y;
        
        switch (this.type) {
            case 'rectangle':
                return this.checkRectangleCollision(marble, dx, dy);
            case 'circle':
            case 'bouncer':
            case 'teleporter':
                return this.checkCircleCollision(marble, dx, dy);
            case 'wave':
                return this.checkWaveFlipperCollision(marble, dx, dy);
            case 'blackhole':
                return this.checkBlackHoleCollision(marble);
        }
        return false;
    }

    checkRectangleCollision(marble, dx, dy) {
        const halfSize = this.size / 2;
        const closestX = Math.max(-halfSize, Math.min(dx, halfSize));
        const closestY = Math.max(-halfSize, Math.min(dy, halfSize));
        
        const distanceX = dx - closestX;
        const distanceY = dy - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        return distanceSquared < (marble.radius * marble.radius);
    }

    checkCircleCollision(marble, dx, dy) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (marble.radius + this.size / 2);
    }

    checkWaveFlipperCollision(marble, dx, dy) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (marble.radius + this.size / 2 * 1.1);
    }

    checkBlackHoleCollision(marble) {
        const distance = Math.sqrt(
            Math.pow(marble.position.x - this.position.x, 2) +
            Math.pow(marble.position.y - this.position.y, 2)
        );
        return distance < (marble.radius + this.size / 2);
    }

    resolveCollision(marble) {
        switch (this.type) {
            case 'wave':
                this.resolveWaveFlipperCollision(marble);
                break;
            case 'bouncer':
                this.resolveBouncerCollision(marble);
                break;
            case 'teleporter':
                this.resolveTeleporterCollision(marble);
                break;
            case 'blackhole':
                this.resolveBlackHoleCollision(marble);
                break;
            default:
                this.resolveStandardCollision(marble);
                break;
        }
    }

    resolveBouncerCollision(marble) {
        this.lastHitTime = 0.5; // Glow effect duration
        
        const dx = marble.position.x - this.position.x;
        const dy = marble.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const normalX = dx / distance;
        const normalY = dy / distance;
        
        // Super bounce with massive energy boost
        const superBounceForce = 12;
        marble.velocity.x = normalX * superBounceForce;
        marble.velocity.y = normalY * superBounceForce;
        
        // Add random component for chaos
        marble.velocity.x += (Math.random() - 0.5) * 6;
        marble.velocity.y += (Math.random() - 0.5) * 6;
        
        console.log('Super bouncer activated!');
    }

    resolveTeleporterCollision(marble) {
        if (this.teleportCooldown > 0) return;
        
        // Don't teleport if marble is already teleporting
        if (marble.isTeleporting) return;
        
        this.teleportCooldown = 2; // 2 second cooldown
        
        console.log('Teleporter activated! Moving marble to red line...');
    }

    resolveWaveFlipperCollision(marble) {
        const dx = marble.position.x - this.position.x;
        const dy = marble.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        // Calculate the angle of the marble relative to the flipper's center
        const angleToMarble = Math.atan2(dy, dx);
        const flipperAngle = this.rotation;
        
        // Determine if marble is on the "right side" of the flipper (launching side)
        let relativeAngle = angleToMarble - flipperAngle;
        
        // Normalize angle to -π to π
        while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
        while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
        
        // Check if marble is on the right side (positive x relative to flipper orientation)
        const onRightSide = relativeAngle > -Math.PI/2 && relativeAngle < Math.PI/2;
        
        const normalX = dx / distance;
        const normalY = dy / distance;
        
        // Separate marble from shape
        const separationDistance = marble.radius + this.size / 2;
        const overlap = separationDistance - distance;
        if (overlap > 0) {
            marble.position.x += normalX * overlap;
            marble.position.y += normalY * overlap;
        }
        
        if (onRightSide) {
            // Launch marble upward and outward with extra force
            const launchForce = 8; // Strong upward force
            const rotationalBoost = Math.abs(this.rotationSpeed) * 2; // Add rotational energy
            
            marble.velocity.x = normalX * (launchForce + rotationalBoost);
            marble.velocity.y = normalY * (launchForce + rotationalBoost) - 4; // Extra upward component
            
            // Add some randomness for variety
            marble.velocity.x += (Math.random() - 0.5) * 3;
            marble.velocity.y -= Math.random() * 2; // More upward randomness
            
            console.log('Wave flipper launched marble upward!');
        } else {
            // Normal bounce on other sides
            const dotProduct = marble.velocity.x * normalX + marble.velocity.y * normalY;
            const bounciness = 1.1;
            marble.velocity.x -= 2 * dotProduct * normalX * marble.restitution * bounciness;
            marble.velocity.y -= 2 * dotProduct * normalY * marble.restitution * bounciness;
        }
        
        // Add minimal extra spin when hitting shapes to preserve visibility
        marble.angularVelocity += (Math.random() - 0.5) * 0.02;
    }

    resolveBlackHoleCollision(marble) {
        if (this.absorptionCooldown > 0) return;
        
        // Don't absorb if marble is already in black hole state
        if (marble.isInBlackHole) return;
        
        this.absorptionCooldown = 1; // 1 second cooldown
        
        console.log('Black hole collision detected!');
    }

    resolveStandardCollision(marble) {
        const dx = marble.position.x - this.position.x;
        const dy = marble.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const normalX = dx / distance;
        const normalY = dy / distance;
        
        // Calculate separation distance
        let separationDistance;
        switch (this.type) {
            case 'rectangle':
                separationDistance = marble.radius + this.size / 2;
                break;
            case 'circle':
                separationDistance = marble.radius + this.size / 2;
                break;
        }
        
        // Separate marble from shape
        const overlap = separationDistance - distance;
        if (overlap > 0) {
            marble.position.x += normalX * overlap;
            marble.position.y += normalY * overlap;
        }
        
        // Enhanced bouncy reflection with more energy
        const dotProduct = marble.velocity.x * normalX + marble.velocity.y * normalY;
        const bounciness = 1.1; // Extra energy factor for more exciting bounces
        marble.velocity.x -= 2 * dotProduct * normalX * marble.restitution * bounciness;
        marble.velocity.y -= 2 * dotProduct * normalY * marble.restitution * bounciness;
        
        // Add some random energy to make bounces more chaotic and fun
        const randomBoost = 0.5;
        marble.velocity.x += (Math.random() - 0.5) * randomBoost;
        marble.velocity.y += (Math.random() - 0.5) * randomBoost;
        
        // Add minimal extra spin when hitting shapes to preserve visibility
        marble.angularVelocity += (Math.random() - 0.5) * 0.02;
    }
}

class Marble {
    constructor(userData, marbleSize = 15) {
        this.id = userData.uniqueId;
        this.nickname = userData.nickname;
        this.profileUrl = userData.profilePictureUrl;
        
        // Physical properties - standard size
        this.radius = marbleSize;
        this.position = new Vector2(
            Math.random() * (400 - this.radius * 2) + this.radius,
            this.radius
        );
        this.velocity = new Vector2(
            (Math.random() - 0.5) * 6, // Increased horizontal velocity for more action
            0
        );
        this.acceleration = new Vector2(0, 0.4); // Slightly reduced gravity for more air time
        
        // Enhanced bounce properties for more fun
        this.restitution = 0.85 + Math.random() * 0.1; // Much bouncier (0.85-0.95)
        this.friction = 0.995; // Reduced friction so they keep bouncing longer
        
        // Visual properties
        this.image = null;
        this.imageLoaded = false;
        this.loadImage();
        
        // Animation properties - minimal rotation to keep profile pictures visible
        this.rotation = 0;
        this.angularVelocity = (Math.random() - 0.5) * 0.05; // Much slower rotation for visibility
        
        // Green line tracking - once marble passes green line, it can't bounce back above it
        this.hasPassedGreenLine = false;
        
        // Teleportation state
        this.isTeleporting = false;
        this.teleportHoldTime = 0;
        this.teleportMaxHoldTime = 1.5; // Hold for 1.5 seconds
        this.teleportPulsePhase = 0;
        
        // Black hole state
        this.isInBlackHole = false;
        this.blackHolePulsePhase = 0;
        this.blackHoleTimer = 0;
        this.blackHoleDuration = 1.0; // Clear effect after 1 second
    }

    loadImage() {
        this.image = new Image();
        this.image.crossOrigin = 'anonymous';
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.onerror = () => {
            console.warn(`Failed to load image for ${this.nickname}`);
            this.imageLoaded = false;
        };
        this.image.src = this.profileUrl;
    }

    update(deltaTime, bounds, redLineY, redLineEnabled, greenLineY) {
        // Handle teleportation state
        if (this.isTeleporting) {
            this.teleportHoldTime += deltaTime;
            this.teleportPulsePhase += deltaTime * 8; // Fast pulse
            
            // Keep marble stationary during teleportation
            this.velocity.x = 0;
            this.velocity.y = 0;
            
            // Release after hold time
            if (this.teleportHoldTime >= this.teleportMaxHoldTime) {
                this.isTeleporting = false;
                this.teleportHoldTime = 0;
                // Give marble some downward velocity to continue the game
                this.velocity.y = 2;
                this.velocity.x = (Math.random() - 0.5) * 3;
            }
            return; // Skip normal physics while teleporting
        }
        
        // Handle black hole state
        if (this.isInBlackHole) {
            this.blackHolePulsePhase += deltaTime * 6; // Medium pulse speed
            this.blackHoleTimer += deltaTime;
            
            // Clear black hole effect after duration
            if (this.blackHoleTimer >= this.blackHoleDuration) {
                this.isInBlackHole = false;
                this.blackHoleTimer = 0;
                this.blackHolePulsePhase = 0;
                console.log('Black hole effect cleared');
            } else {
                // Keep marble mostly stationary with slight drift
                this.velocity.x *= 0.95;
                this.velocity.y *= 0.95;
                
                // Add slight random movement for effect
                this.velocity.x += (Math.random() - 0.5) * 0.5;
                this.velocity.y += (Math.random() - 0.5) * 0.5;
            }
        }
        
        // Apply physics
        this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Apply friction (less friction = more bouncing)
        this.velocity = this.velocity.multiply(this.friction);
        
        // Update rotation (much slower rotation for better visibility)
        this.rotation += this.angularVelocity * deltaTime;
        
        // Boundary collisions
        this.handleBoundaryCollisions(bounds, redLineY, redLineEnabled, greenLineY);
    }

    teleportToRedLine(redLineY, bounds) {
        // Position marble above red line with some random horizontal position
        this.position.x = Math.random() * (bounds.width - this.radius * 2) + this.radius;
        this.position.y = redLineY - this.radius - 20; // 20 pixels above red line
        
        // Reset physics state
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        // Start teleportation effect
        this.isTeleporting = true;
        this.teleportHoldTime = 0;
        this.teleportPulsePhase = 0;
        
        // Reset green line tracking since we're back at the top
        this.hasPassedGreenLine = false;
    }

    moveToBlackHole(greenLineY, bounds) {
        // Position marble below green line with some random horizontal position
        this.position.x = Math.random() * (bounds.width - this.radius * 2) + this.radius;
        this.position.y = greenLineY + this.radius + 20; // 20 pixels below green line
        
        // Reset physics state
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        // Start black hole effect
        this.isInBlackHole = true;
        this.blackHolePulsePhase = 0;
        this.blackHoleTimer = 0; // Reset timer
        
        // Don't set hasPassedGreenLine here - let the physics engine detect it naturally
        // This ensures the toast and winner detection work properly
    }

    handleBoundaryCollisions(bounds, redLineY, redLineEnabled, greenLineY) {
        // Left wall - more energetic bounce
        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.velocity.x *= -this.restitution;
            // Add some vertical energy on wall bounces for more chaos
            this.velocity.y += (Math.random() - 0.5) * 2;
        }
        
        // Right wall - more energetic bounce
        if (this.position.x + this.radius > bounds.width) {
            this.position.x = bounds.width - this.radius;
            this.velocity.x *= -this.restitution;
            // Add some vertical energy on wall bounces for more chaos
            this.velocity.y += (Math.random() - 0.5) * 2;
        }
        
        // Red line floor (only if enabled) - super bouncy
        if (redLineEnabled && this.position.y + this.radius > redLineY) {
            this.position.y = redLineY - this.radius;
            this.velocity.y *= -this.restitution;
            
            // Add more random horizontal movement for chaos and fun
            this.velocity.x += (Math.random() - 0.5) * 4;
            
            // Add some extra bounce energy randomly
            if (Math.random() < 0.3) {
                this.velocity.y -= Math.random() * 2;
            }
        }
        
        // Green line ceiling (only if marble has passed through it)
        if (this.hasPassedGreenLine && this.position.y - this.radius < greenLineY) {
            this.position.y = greenLineY + this.radius;
            this.velocity.y = Math.abs(this.velocity.y) * 0.3; // Reduced bounce to keep it below
            // Add horizontal movement on green line bounce
            this.velocity.x += (Math.random() - 0.5) * 1;
        }
        
        // Bottom floor (when red line is disabled) - bouncy floor
        if (!redLineEnabled && this.position.y + this.radius > bounds.height) {
            this.position.y = bounds.height - this.radius;
            this.velocity.y *= -this.restitution;
            
            // Add random horizontal movement
            this.velocity.x += (Math.random() - 0.5) * 3;
        }
        
        // Top ceiling (more energetic soft bounce) - only if marble hasn't passed green line
        if (!this.hasPassedGreenLine && this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.velocity.y = Math.abs(this.velocity.y) * 0.7; // More energetic ceiling bounce
            // Add horizontal movement on ceiling bounce
            this.velocity.x += (Math.random() - 0.5) * 2;
        } else if (this.hasPassedGreenLine && this.position.y - this.radius < 0) {
            // If marble somehow gets above screen after passing green line, just stop it at top
            this.position.y = this.radius;
            this.velocity.y = Math.max(0, this.velocity.y); // Only allow downward movement
        }
    }

    render(ctx) {
        ctx.save();
        
        // Draw teleportation pulse effect
        if (this.isTeleporting) {
            const pulseRadius = this.radius + Math.sin(this.teleportPulsePhase) * 10 + 15;
            const pulseAlpha = (Math.sin(this.teleportPulsePhase) + 1) * 0.3;
            
            ctx.globalAlpha = pulseAlpha;
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff4444';
            
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
        
        // Draw black hole pulse effect
        if (this.isInBlackHole) {
            const pulseRadius = this.radius + Math.sin(this.blackHolePulsePhase) * 8 + 12;
            const pulseAlpha = (Math.sin(this.blackHolePulsePhase) + 1) * 0.4;
            
            ctx.globalAlpha = pulseAlpha;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 6;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#000000';
            
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Additional inner dark glow
            ctx.globalAlpha = pulseAlpha * 0.6;
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#333333';
            
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, pulseRadius * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
        
        // Draw marble shadow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.position.x + 2, this.position.y + 2, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        
        // Draw marble background
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw marble border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw profile image if loaded
        if (this.imageLoaded && this.image) {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.rotation);
            
            // Create circular clipping path
            ctx.beginPath();
            ctx.arc(0, 0, this.radius - 2, 0, Math.PI * 2);
            ctx.clip();
            
            // Draw image
            const size = (this.radius - 2) * 2;
            ctx.drawImage(this.image, -size/2, -size/2, size, size);
            
            ctx.restore();
        } else {
            // Fallback: draw nickname initial
            ctx.fillStyle = '#666';
            ctx.font = `${this.radius}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.nickname.charAt(0).toUpperCase(), this.position.x, this.position.y);
        }
        
        ctx.restore();
    }
}

class PhysicsEngine {
    constructor() {
        this.marbles = [];
        this.shapes = [];
        this.gravity = new Vector2(0, 0.5);
        this.bounds = { width: 400, height: 711 };
        this.redLinePosition = 20; // Percentage from top
        this.greenLinePosition = 20; // Percentage from bottom
        this.redLineY = this.bounds.height * (this.redLinePosition / 100);
        this.greenLineY = this.bounds.height * (1 - this.greenLinePosition / 100);
        this.marbleSize = 15; // Standard marble size
        this.redLineEnabled = true; // Controls whether red line acts as a barrier
        
        // Shape settings
        this.shapeSettings = {
            mode: 'preset', // 'preset', 'draw', 'pin'
            type: 'rectangle',
            color: '#4CAF50',
            size: 40,
            moving: true,
            speed: 1,
            strokeWidth: 10,
            drawingSensitivity: 15
        };
        
        // Current drawing state
        this.currentDrawing = {
            points: [],
            isDrawing: false,
            lastPoint: null
        };
        
        // Winner tracking
        this.lastWinner = null;
        this.isRoundActive = true;
    }

    addMarble(userData) {
        const marble = new Marble(userData, this.marbleSize);
        this.marbles.push(marble);
        return marble;
    }

    addShape(x, y) {
        const shape = new Shape(
            this.shapeSettings.type,
            x,
            y,
            this.shapeSettings.size,
            this.shapeSettings.color,
            this.shapeSettings.moving,
            this.shapeSettings.speed
        );
        this.shapes.push(shape);
        
        // Update save button if available
        if (window.marbleGame && window.marbleGame.updateSaveButton) {
            window.marbleGame.updateSaveButton();
        }
        
        return shape;
    }

    startDrawing(x, y) {
        if (this.shapeSettings.mode === 'draw') {
            this.currentDrawing.isDrawing = true;
            this.currentDrawing.points = [{ x, y }];
            this.currentDrawing.lastPoint = { x, y };
        } else if (this.shapeSettings.mode === 'pin') {
            this.addDrawingPoint(x, y);
        }
    }

    addDrawingPoint(x, y) {
        if (this.shapeSettings.mode === 'draw' && this.currentDrawing.isDrawing) {
            // Check if point is far enough from last point (sensitivity)
            if (this.currentDrawing.lastPoint) {
                const distance = Math.sqrt(
                    Math.pow(x - this.currentDrawing.lastPoint.x, 2) + 
                    Math.pow(y - this.currentDrawing.lastPoint.y, 2)
                );
                
                if (distance >= this.shapeSettings.drawingSensitivity) {
                    this.currentDrawing.points.push({ x, y });
                    this.currentDrawing.lastPoint = { x, y };
                }
            }
        } else if (this.shapeSettings.mode === 'pin') {
            this.currentDrawing.points.push({ x, y });
        }
    }

    continueDrawing(x, y) {
        if (this.shapeSettings.mode === 'draw' && this.currentDrawing.isDrawing) {
            this.addDrawingPoint(x, y);
        }
    }

    finishDrawing() {
        if (this.shapeSettings.mode === 'draw') {
            this.currentDrawing.isDrawing = false;
        }
    }

    completeShape() {
        if (this.currentDrawing.points.length >= 3) {
            const customShape = new CustomShape(
                this.currentDrawing.points,
                this.shapeSettings.color,
                this.shapeSettings.strokeWidth,
                this.shapeSettings.moving,
                this.shapeSettings.speed
            );
            this.shapes.push(customShape);
            this.clearCurrentDrawing();
            
            // Update save button if available
            if (window.marbleGame && window.marbleGame.updateSaveButton) {
                window.marbleGame.updateSaveButton();
            }
            
            return customShape;
        }
        return null;
    }

    clearCurrentDrawing() {
        this.currentDrawing.points = [];
        this.currentDrawing.isDrawing = false;
        this.currentDrawing.lastPoint = null;
    }

    clearMarbles() {
        this.marbles = [];
    }

    clearShapes() {
        this.shapes = [];
        this.clearCurrentDrawing();
        
        // Update save button if available
        if (window.marbleGame && window.marbleGame.updateSaveButton) {
            window.marbleGame.updateSaveButton();
        }
    }

    resetMarblesAboveRedLine() {
        // Move all marbles above the red line and reset their green line tracking
        this.marbles.forEach(marble => {
            // Reset green line tracking so they can pass through again
            marble.hasPassedGreenLine = false;
            
            // If marble is below red line, move it above
            if (marble.position.y + marble.radius > this.redLineY) {
                // Place marble randomly above red line with some spacing
                const minY = marble.radius;
                const maxY = this.redLineY - marble.radius;
                const availableHeight = maxY - minY;
                
                if (availableHeight > 0) {
                    marble.position.y = minY + Math.random() * availableHeight;
                    marble.position.x = Math.random() * (this.bounds.width - marble.radius * 2) + marble.radius;
                    
                    // Give them some random velocity for fun
                    marble.velocity.x = (Math.random() - 0.5) * 4;
                    marble.velocity.y = Math.random() * 2; // Small downward velocity
                } else {
                    // If not enough space, just place at top
                    marble.position.y = marble.radius;
                    marble.position.x = Math.random() * (this.bounds.width - marble.radius * 2) + marble.radius;
                    marble.velocity.x = (Math.random() - 0.5) * 4;
                    marble.velocity.y = 0;
                }
            }
        });
    }

    setMarbleSize(size) {
        this.marbleSize = size;
    }

    getMarbleSize() {
        return this.marbleSize;
    }

    setShapeSettings(settings) {
        this.shapeSettings = { ...this.shapeSettings, ...settings };
    }

    getShapeSettings() {
        return this.shapeSettings;
    }

    getCurrentDrawing() {
        return this.currentDrawing;
    }

    setRedLinePosition(percentage) {
        this.redLinePosition = percentage;
        this.redLineY = this.bounds.height * (percentage / 100);
    }

    setGreenLinePosition(percentage) {
        this.greenLinePosition = percentage;
        this.greenLineY = this.bounds.height * (1 - percentage / 100);
    }

    getRedLinePosition() {
        return this.redLinePosition;
    }

    getGreenLinePosition() {
        return this.greenLinePosition;
    }

    enableRedLine() {
        this.redLineEnabled = true;
        // When enabling red line, move all marbles above it
        this.resetMarblesAboveRedLine();
    }

    disableRedLine() {
        this.redLineEnabled = false;
    }

    isRedLineEnabled() {
        return this.redLineEnabled;
    }

    update(deltaTime) {
        // Update shapes
        this.shapes.forEach(shape => {
            shape.update(deltaTime, this.bounds);
        });

        // Update marbles
        this.marbles.forEach(marble => {
            // Handle green line crossing BEFORE marble update to avoid race conditions
            console.log(`DEBUG: Checking marble ${marble.nickname} - Y: ${marble.position.y.toFixed(2)}, Green Line: ${this.greenLineY.toFixed(2)}, HasPassed: ${marble.hasPassedGreenLine}`);
            this.handleGreenLineCrossing(marble);
            
            marble.update(deltaTime, this.bounds, this.redLineY, this.redLineEnabled, this.greenLineY);
            
            // Check collisions with shapes
            this.shapes.forEach(shape => {
                if (shape.checkCollision(marble)) {
                    // Handle teleporter collision specially
                    if (shape.type === 'teleporter' && shape.teleportCooldown <= 0 && !marble.isTeleporting) {
                        marble.teleportToRedLine(this.redLineY, this.bounds);
                        shape.teleportCooldown = 2; // Set cooldown
                        console.log('Teleporter activated! Moving marble to red line...');
                    // Handle black hole collision specially
                    } else if (shape.type === 'blackhole' && shape.absorptionCooldown <= 0 && !marble.isInBlackHole) {
                        // Check if marble hasn't crossed green line yet before moving it
                        const hadNotCrossed = !marble.hasPassedGreenLine;
                        
                        marble.moveToBlackHole(this.greenLineY, this.bounds);
                        shape.absorptionCooldown = 1; // Set cooldown
                        
                        // If marble hadn't crossed before, trigger green line crossing detection
                        if (hadNotCrossed) {
                            this.handleGreenLineCrossing(marble);
                        }
                        
                        console.log('Black hole activated! Moving marble below green line...');
                    } else {
                        shape.resolveCollision(marble);
                    }
                }
            });
        });
    }

    setBounds(width, height) {
        this.bounds.width = width;
        this.bounds.height = height;
        // Recalculate line positions
        this.redLineY = height * (this.redLinePosition / 100);
        this.greenLineY = height * (1 - this.greenLinePosition / 100);
    }

    getMarbleCount() {
        return this.marbles.length;
    }

    getShapeCount() {
        return this.shapes.length;
    }

    getRedLineY() {
        return this.redLineY;
    }

    getGreenLineY() {
        return this.greenLineY;
    }

    isValidShapePosition(x, y) {
        // Check if position is between red and green lines
        return y > this.redLineY && y < this.greenLineY;
    }
    
    showToast(message) {
        console.log(`DEBUG: Showing toast: ${message}`);
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Remove toast after animation completes
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
    
    setWinner(marble) {
        console.log(`DEBUG: Setting winner: ${marble.nickname}`);
        this.lastWinner = marble;
        this.showWinnerMessage(marble);
    }
    
    showWinnerMessage(marble) {
        console.log(`DEBUG: Showing winner message for: ${marble.nickname}`);
        const winnerMessage = document.getElementById('winnerMessage');
        const winnerText = document.getElementById('winnerText');
        
        if (winnerMessage && winnerText) {
            winnerText.textContent = `${marble.nickname} wins! 🎉 (Last one standing)`;
            winnerMessage.style.display = 'block';
            console.log(`DEBUG: Winner message displayed`);
        } else {
            console.log(`DEBUG: Winner message elements not found`);
        }
    }
    
    hideWinnerMessage() {
        const winnerMessage = document.getElementById('winnerMessage');
        winnerMessage.style.display = 'none';
        this.lastWinner = null;
        this.isRoundActive = true;
    }
    
    handleGreenLineCrossing(marble) {
        if (!marble.hasPassedGreenLine && marble.position.y > this.greenLineY) {
            console.log(`DEBUG: ${marble.nickname} is crossing green line at y=${marble.position.y}, greenLineY=${this.greenLineY}`);
            
            // Show toast message - user is out when they cross
            this.showToast(`${marble.nickname} is out!`);
            
            // Mark marble as having passed green line
            marble.hasPassedGreenLine = true;
            
            // Check if only one marble remains above the green line
            const remainingMarbles = this.marbles.filter(m => !m.hasPassedGreenLine);
            console.log(`DEBUG: ${remainingMarbles.length} marbles remaining above green line`);
            
            if (remainingMarbles.length === 1 && this.isRoundActive) {
                // We have a winner - the last marble above the green line
                const winner = remainingMarbles[0];
                this.setWinner(winner);
                console.log(`DEBUG: ${winner.nickname} wins as the last one standing!`);
            } else if (remainingMarbles.length === 0 && this.isRoundActive) {
                // Edge case: all marbles crossed simultaneously
                console.log(`DEBUG: All marbles eliminated - no winner declared`);
            }
            
            console.log(`${marble.nickname} crossed the green line and is out!`);
        }
    }
}

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.redLineY = 0;
        this.greenLineY = 0;
        this.setupCanvas();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Initial line positions
        this.redLineY = this.canvas.height * 0.2;
        this.greenLineY = this.canvas.height * 0.8;
    }

    clear() {
        // Clear with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRedLine(enabled) {
        this.ctx.save();
        
        if (!enabled) {
            this.ctx.globalAlpha = 0.3;
        }
        
        this.ctx.strokeStyle = '#28a745'; // Changed to green to match CSS
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = 'rgba(40, 167, 69, 0.5)'; // Green shadow
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.redLineY);
        this.ctx.lineTo(this.canvas.width, this.redLineY);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawGreenLine() {
        this.ctx.strokeStyle = '#ff4444'; // Changed to red to match CSS
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = 'rgba(255, 68, 68, 0.5)'; // Red shadow
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.greenLineY);
        this.ctx.lineTo(this.canvas.width, this.greenLineY);
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
    }

    drawCurrentDrawing(currentDrawing, settings) {
        if (currentDrawing.points.length === 0) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = settings.color;
        this.ctx.lineWidth = settings.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalAlpha = 0.7;
        
        if (currentDrawing.points.length === 1) {
            // Draw single point
            this.ctx.fillStyle = settings.color;
            this.ctx.beginPath();
            this.ctx.arc(currentDrawing.points[0].x, currentDrawing.points[0].y, settings.strokeWidth / 2, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Draw connected lines
            this.ctx.beginPath();
            this.ctx.moveTo(currentDrawing.points[0].x, currentDrawing.points[0].y);
            
            for (let i = 1; i < currentDrawing.points.length; i++) {
                this.ctx.lineTo(currentDrawing.points[i].x, currentDrawing.points[i].y);
            }
            
            this.ctx.stroke();
            
            // Draw completion hint if enough points
            if (currentDrawing.points.length >= 3) {
                this.ctx.setLineDash([5, 5]);
                this.ctx.globalAlpha = 0.4;
                this.ctx.beginPath();
                this.ctx.moveTo(
                    currentDrawing.points[currentDrawing.points.length - 1].x,
                    currentDrawing.points[currentDrawing.points.length - 1].y
                );
                this.ctx.lineTo(currentDrawing.points[0].x, currentDrawing.points[0].y);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
        
        // Draw points as dots for pin mode
        if (settings.mode === 'pin') {
            this.ctx.fillStyle = settings.color;
            this.ctx.globalAlpha = 0.8;
            currentDrawing.points.forEach(point => {
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
        
        this.ctx.restore();
    }

    render(marbles, shapes, redLineEnabled, currentDrawing, drawingSettings) {
        this.clear();
        this.drawRedLine(redLineEnabled);
        this.drawGreenLine();
        
        // Render shapes
        shapes.forEach(shape => {
            shape.render(this.ctx);
        });
        
        // Render current drawing if in drawing mode
        if (currentDrawing && drawingSettings) {
            this.drawCurrentDrawing(currentDrawing, drawingSettings);
        }
        
        // Render marbles
        marbles.forEach(marble => {
            marble.render(this.ctx);
        });
    }

    updateLinePositions(physicsEngine) {
        this.redLineY = physicsEngine.getRedLineY();
        this.greenLineY = physicsEngine.getGreenLineY();
    }
}

class WebSocketManager {
    constructor(url, onMessage, onStatusChange) {
        this.url = url;
        this.onMessage = onMessage;
        this.onStatusChange = onStatusChange;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.autoReconnect = true;
        this.isManuallyDisconnected = false;
        
        // Don't auto-connect on initialization
    }

    connect(url = null) {
        if (url) {
            this.url = url;
        }
        
        this.isManuallyDisconnected = false;
        
        try {
            this.updateStatus('connecting');
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                this.updateStatus('connected');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.onMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                if (!this.isManuallyDisconnected) {
                    this.updateStatus('disconnected');
                    if (this.autoReconnect) {
                        this.attemptReconnect();
                    }
                } else {
                    this.updateStatus('disconnected');
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateStatus('error');
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.updateStatus('error');
            if (this.autoReconnect && !this.isManuallyDisconnected) {
                this.attemptReconnect();
            }
        }
    }

    disconnect() {
        this.isManuallyDisconnected = true;
        if (this.ws) {
            this.ws.close();
        }
        this.updateStatus('disconnected');
    }

    attemptReconnect() {
        if (this.isManuallyDisconnected || !this.autoReconnect) {
            return;
        }
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                if (!this.isManuallyDisconnected && this.autoReconnect) {
                    this.connect();
                }
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.log('Max reconnection attempts reached');
            this.updateStatus('failed');
        }
    }

    updateStatus(status) {
        // Update main connection status
        const statusElement = document.getElementById('connectionStatus');
        statusElement.className = status;
        
        // Update side panel status
        const wsStatusElement = document.getElementById('wsStatus');
        wsStatusElement.className = `ws-status ${status}`;
        
        switch (status) {
            case 'connected':
                statusElement.textContent = 'Connected';
                wsStatusElement.textContent = 'Connected';
                break;
            case 'disconnected':
                statusElement.textContent = 'Disconnected';
                wsStatusElement.textContent = 'Disconnected';
                break;
            case 'connecting':
                statusElement.textContent = 'Connecting...';
                wsStatusElement.textContent = 'Connecting...';
                break;
            case 'error':
                statusElement.textContent = 'Connection Error';
                wsStatusElement.textContent = 'Connection Error';
                break;
            case 'failed':
                statusElement.textContent = 'Connection Failed';
                wsStatusElement.textContent = 'Connection Failed';
                break;
            default:
                statusElement.textContent = 'Connecting...';
                wsStatusElement.textContent = 'Connecting...';
        }
        
        if (this.onStatusChange) {
            this.onStatusChange(status);
        }
    }

    setAutoReconnect(enabled) {
        this.autoReconnect = enabled;
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    close() {
        this.disconnect();
    }
}

class SidePanel {
    constructor() {
        this.panel = document.getElementById('sidePanel');
        this.toggle = document.getElementById('panelToggle');
        this.isOpen = false;
        
        this.initializeEvents();
        this.initializeAccordion();
    }
    
    initializeEvents() {
        this.toggle.addEventListener('click', () => {
            this.togglePanel();
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target) && !this.toggle.contains(e.target)) {
                this.closePanel();
            }
        });
    }
    
    initializeAccordion() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const target = header.getAttribute('data-target');
                const content = document.getElementById(target);
                const icon = header.querySelector('.accordion-icon');
                
                // Close other accordion items
                accordionHeaders.forEach(otherHeader => {
                    if (otherHeader !== header) {
                        const otherTarget = otherHeader.getAttribute('data-target');
                        const otherContent = document.getElementById(otherTarget);
                        const otherIcon = otherHeader.querySelector('.accordion-icon');
                        
                        otherHeader.classList.remove('active');
                        otherContent.classList.remove('open');
                    }
                });
                
                // Toggle current accordion item
                header.classList.toggle('active');
                content.classList.toggle('open');
            });
        });
        
        // Open the first accordion by default
        if (accordionHeaders.length > 0) {
            accordionHeaders[0].click();
        }
    }
    
    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }
    
    openPanel() {
        this.panel.classList.add('open');
        this.isOpen = true;
    }
    
    closePanel() {
        this.panel.classList.remove('open');
        this.isOpen = false;
    }
}

class MarbleGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.physics = new PhysicsEngine();
        this.renderer = new Renderer(this.canvas);
        this.wsManager = null;
        this.sidePanel = new SidePanel();
        
        this.lastTime = 0;
        this.isRunning = false;
        this.drawingMode = false;
        
        this.init();
    }

    init() {
        // Set up physics bounds based on canvas size
        this.physics.setBounds(this.canvas.width, this.canvas.height);
        
        // Initialize WebSocket manager (but don't connect yet)
        this.wsManager = new WebSocketManager(
            'ws://localhost:21213/', 
            (data) => this.handleWebSocketMessage(data),
            (status) => this.updateButtonStates(status)
        );
        
        // Set up side panel controls
        this.initializeSidePanelControls();
        this.initializeShapeControls();
        this.initializeCanvasEvents();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.renderer.setupCanvas();
            this.physics.setBounds(this.canvas.width, this.canvas.height);
            this.renderer.updateLinePositions(this.physics);
            this.updateCSSLinePositions();
        });
        
        // Start game loop
        this.start();
    }

    initializeSidePanelControls() {
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const wsUrlInput = document.getElementById('wsUrl');
        const autoReconnectCheckbox = document.getElementById('autoReconnect');
        const clearMarblesBtn = document.getElementById('clearMarbles');
        const testMarbleBtn = document.getElementById('testMarble');
        const marbleSizeSlider = document.getElementById('marbleSize');
        const marbleSizeValue = document.getElementById('marbleSizeValue');
        const redLineSlider = document.getElementById('redLinePosition');
        const redLineValue = document.getElementById('redLineValue');
        const greenLineSlider = document.getElementById('greenLinePosition');
        const greenLineValue = document.getElementById('greenLineValue');
        const startButton = document.getElementById('startButton');
        const resetButton = document.getElementById('resetButton');
        
        // Helper function to hide winner message on any side panel interaction
        const hideWinnerOnInteraction = () => {
            this.physics.hideWinnerMessage();
        };
        
        // Connect button
        connectBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            const url = wsUrlInput.value.trim();
            if (url) {
                this.wsManager.connect(url);
            }
        });
        
        // Disconnect button
        disconnectBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.wsManager.disconnect();
        });
        
        // Auto reconnect checkbox
        autoReconnectCheckbox.addEventListener('change', () => {
            hideWinnerOnInteraction();
            this.wsManager.setAutoReconnect(autoReconnectCheckbox.checked);
        });
        
        // Clear marbles button
        clearMarblesBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.physics.clearMarbles();
            this.updateMarbleCount();
        });
        
        // Test marble button
        testMarbleBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.addTestMarble();
        });
        
        // Marble size slider
        marbleSizeSlider.addEventListener('input', () => {
            hideWinnerOnInteraction();
            const size = parseInt(marbleSizeSlider.value);
            this.physics.setMarbleSize(size);
            marbleSizeValue.textContent = `${size}px`;
        });
        
        // Red line position slider
        redLineSlider.addEventListener('input', () => {
            hideWinnerOnInteraction();
            const position = parseInt(redLineSlider.value);
            this.physics.setRedLinePosition(position);
            this.renderer.updateLinePositions(this.physics);
            this.updateCSSLinePositions();
            redLineValue.textContent = `${position}%`;
        });
        
        // Green line position slider
        greenLineSlider.addEventListener('input', () => {
            hideWinnerOnInteraction();
            const position = parseInt(greenLineSlider.value);
            this.physics.setGreenLinePosition(position);
            this.renderer.updateLinePositions(this.physics);
            this.updateCSSLinePositions();
            greenLineValue.textContent = `${position}%`;
        });
        
        // Start button (releases marbles by disabling red line)
        startButton.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.physics.disableRedLine();
            this.updateCSSRedLineState();
            startButton.disabled = true;
            resetButton.disabled = false;
            console.log('Game started! Marbles released.');
        });
        
        // Reset button (re-enables red line)
        resetButton.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.physics.enableRedLine();
            this.updateCSSRedLineState();
            startButton.disabled = false;
            resetButton.disabled = true;
            console.log('Red line reset! Marbles will be blocked again.');
        });
        
        // Initialize displays
        marbleSizeValue.textContent = `${this.physics.getMarbleSize()}px`;
        redLineValue.textContent = `${this.physics.getRedLinePosition()}%`;
        greenLineValue.textContent = `${this.physics.getGreenLinePosition()}%`;
        
        // Initialize button states
        this.updateButtonStates('disconnected');
        resetButton.disabled = true; // Start with reset disabled
    }

    initializeShapeControls() {
        const shapeModeSelect = document.getElementById('shapeMode');
        const shapeTypeSelect = document.getElementById('shapeType');
        const shapeColorInput = document.getElementById('shapeColor');
        const shapeColorValue = document.getElementById('shapeColorValue');
        const shapeSizeSlider = document.getElementById('shapeSize');
        const shapeSizeValue = document.getElementById('shapeSizeValue');
        const shapeMovementCheckbox = document.getElementById('shapeMovement');
        const movementSpeedSlider = document.getElementById('movementSpeed');
        const movementSpeedValue = document.getElementById('movementSpeedValue');
        const drawModeBtn = document.getElementById('drawModeBtn');
        const clearShapesBtn = document.getElementById('clearShapes');
        const clearCurrentShapeBtn = document.getElementById('clearCurrentShape');
        const completeShapeBtn = document.getElementById('completeShape');
        const drawingStrokeSlider = document.getElementById('drawingStroke');
        const drawingStrokeValue = document.getElementById('drawingStrokeValue');
        const drawingSensitivitySlider = document.getElementById('drawingSensitivity');
        const drawingSensitivityValue = document.getElementById('drawingSensitivityValue');
        
        // Helper function to hide winner message on any shape control interaction
        const hideWinnerOnInteraction = () => {
            this.physics.hideWinnerMessage();
        };
        
        // Shape mode selection
        shapeModeSelect.addEventListener('change', () => {
            hideWinnerOnInteraction();
            const mode = shapeModeSelect.value;
            this.physics.setShapeSettings({ mode });
            this.updateShapeModeUI(mode);
            this.updateDrawingModeButton();
        });
        
        // Shape type selection
        shapeTypeSelect.addEventListener('change', () => {
            hideWinnerOnInteraction();
            this.physics.setShapeSettings({ type: shapeTypeSelect.value });
        });
        
        // Shape color picker
        shapeColorInput.addEventListener('input', () => {
            hideWinnerOnInteraction();
            const color = shapeColorInput.value;
            this.physics.setShapeSettings({ color });
            shapeColorValue.textContent = color;
        });
        
        // Shape size slider
        shapeSizeSlider.addEventListener('input', () => {
            hideWinnerOnInteraction();
            const size = parseInt(shapeSizeSlider.value);
            this.physics.setShapeSettings({ size });
            shapeSizeValue.textContent = `${size}px`;
        });
        
        // Drawing stroke slider
        drawingStrokeSlider.addEventListener('input', () => {
            hideWinnerOnInteraction();
            const strokeWidth = parseInt(drawingStrokeSlider.value);
            this.physics.setShapeSettings({ strokeWidth });
            drawingStrokeValue.textContent = `${strokeWidth}px`;
        });
        
        // Drawing sensitivity slider
        drawingSensitivitySlider.addEventListener('input', () => {
            hideWinnerOnInteraction();
            const sensitivity = parseInt(drawingSensitivitySlider.value);
            this.physics.setShapeSettings({ drawingSensitivity: sensitivity });
            drawingSensitivityValue.textContent = `${sensitivity}px`;
        });
        
        // Movement checkbox
        shapeMovementCheckbox.addEventListener('change', () => {
            hideWinnerOnInteraction();
            this.physics.setShapeSettings({ moving: shapeMovementCheckbox.checked });
        });
        
        // Movement speed slider
        movementSpeedSlider.addEventListener('input', () => {
            hideWinnerOnInteraction();
            const speed = parseFloat(movementSpeedSlider.value);
            this.physics.setShapeSettings({ speed });
            movementSpeedValue.textContent = `${speed.toFixed(1)}x`;
        });
        
        // Drawing mode toggle
        drawModeBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.toggleDrawingMode();
        });
        
        // Clear shapes button
        clearShapesBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.physics.clearShapes();
        });
        
        // Clear current shape button
        clearCurrentShapeBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.physics.clearCurrentDrawing();
            this.updateCustomShapeButtons();
        });
        
        // Complete shape button
        completeShapeBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            const shape = this.physics.completeShape();
            if (shape) {
                console.log('Custom shape completed with', shape.points.length, 'points');
            } else {
                console.log('Need at least 3 points to complete a shape');
            }
            this.updateCustomShapeButtons();
        });
        
        // Initialize preset levels controls
        this.initializePresetLevels();
        
        // Initialize displays
        const settings = this.physics.getShapeSettings();
        shapeColorValue.textContent = settings.color;
        shapeSizeValue.textContent = `${settings.size}px`;
        movementSpeedValue.textContent = `${settings.speed.toFixed(1)}x`;
        drawingStrokeValue.textContent = `${settings.strokeWidth}px`;
        drawingSensitivityValue.textContent = `${settings.drawingSensitivity}px`;
        
        // Initialize UI
        this.updateShapeModeUI(settings.mode);
    }

    initializePresetLevels() {
        const levelSelect = document.getElementById('levelSelect');
        const levelDescription = document.getElementById('levelDescription');
        const loadLevelBtn = document.getElementById('loadLevelBtn');
        const clearLevelBtn = document.getElementById('clearLevelBtn');
        
        // Custom level elements
        const customLevelName = document.getElementById('customLevelName');
        const customLevelDescription = document.getElementById('customLevelDescription');
        const customLevelDifficulty = document.getElementById('customLevelDifficulty');
        const saveCustomLevelBtn = document.getElementById('saveCustomLevelBtn');
        const manageCustomLevelsBtn = document.getElementById('manageCustomLevelsBtn');
        const customLevelsModal = document.getElementById('customLevelsModal');
        const closeCustomLevelsModal = document.getElementById('closeCustomLevelsModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const customLevelsList = document.getElementById('customLevelsList');
        
        // Helper function to hide winner message on any preset level interaction
        const hideWinnerOnInteraction = () => {
            this.physics.hideWinnerMessage();
        };
        
        // Load custom levels from localStorage on startup
        this.loadCustomLevelsToDropdown();
        
        // Enable/disable save button based on shapes present
        const updateSaveButton = () => {
            const hasShapes = this.physics.getShapeCount() > 0;
            const hasName = customLevelName.value.trim().length > 0;
            saveCustomLevelBtn.disabled = !hasShapes || !hasName;
        };
        
        // Level selection change
        levelSelect.addEventListener('change', () => {
            hideWinnerOnInteraction();
            const selectedLevel = levelSelect.value;
            
            if (selectedLevel.startsWith('custom_')) {
                // Handle custom level selection
                const customLevel = this.getCustomLevel(selectedLevel);
                if (customLevel) {
                    levelDescription.textContent = customLevel.description;
                    loadLevelBtn.disabled = false;
                } else {
                    levelDescription.textContent = 'Custom level not found';
                    loadLevelBtn.disabled = true;
                }
            } else if (selectedLevel && window.PRESET_LEVELS && window.PRESET_LEVELS[selectedLevel]) {
                // Handle preset level selection
                const level = window.PRESET_LEVELS[selectedLevel];
                levelDescription.textContent = level.description;
                loadLevelBtn.disabled = false;
            } else {
                levelDescription.textContent = 'Select a level to see its description';
                loadLevelBtn.disabled = true;
            }
        });
        
        // Load level button
        loadLevelBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            const selectedLevel = levelSelect.value;
            
            if (selectedLevel.startsWith('custom_')) {
                this.loadCustomLevel(selectedLevel);
            } else if (selectedLevel && window.PRESET_LEVELS && window.PRESET_LEVELS[selectedLevel]) {
                this.loadPresetLevel(selectedLevel);
            }
        });
        
        // Clear level button
        clearLevelBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.physics.clearShapes();
            updateSaveButton();
            console.log('All shapes cleared');
        });
        
        // Custom level input validation
        customLevelName.addEventListener('input', updateSaveButton);
        
        // Update save button when shapes change (we'll call this from shape operations)
        this.updateSaveButton = updateSaveButton;
        
        // Save custom level button
        saveCustomLevelBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.saveCustomLevel();
            updateSaveButton();
        });
        
        // Manage custom levels button
        manageCustomLevelsBtn.addEventListener('click', () => {
            hideWinnerOnInteraction();
            this.showCustomLevelsModal();
        });
        
        // Modal close events
        closeCustomLevelsModal.addEventListener('click', () => {
            this.hideCustomLevelsModal();
        });
        
        closeModalBtn.addEventListener('click', () => {
            this.hideCustomLevelsModal();
        });
        
        // Close modal when clicking outside
        customLevelsModal.addEventListener('click', (e) => {
            if (e.target === customLevelsModal) {
                this.hideCustomLevelsModal();
            }
        });
        
        // Initialize save button state
        updateSaveButton();
    }
    
    // Custom level management methods
    saveCustomLevel() {
        const name = document.getElementById('customLevelName').value.trim();
        const description = document.getElementById('customLevelDescription').value.trim();
        const difficulty = document.getElementById('customLevelDifficulty').value;
        
        if (!name) {
            alert('Please enter a level name');
            return;
        }
        
        if (this.physics.getShapeCount() === 0) {
            alert('Please create some shapes before saving the level');
            return;
        }
        
        // Generate unique ID
        const levelId = 'custom_' + Date.now();
        
        // Serialize current shapes
        const shapes = this.physics.shapes.map(shape => ({
            type: shape.type,
            x: shape.position.x,
            y: shape.position.y,
            size: shape.size,
            color: shape.color,
            moving: shape.moving,
            speed: shape.speed,
            direction: shape.direction || 'right'
        }));
        
        const customLevel = {
            id: levelId,
            name: name,
            description: description || 'Custom level',
            difficulty: difficulty,
            shapes: shapes,
            createdAt: new Date().toISOString(),
            shapeCount: shapes.length
        };
        
        // Save to localStorage
        const customLevels = this.getCustomLevels();
        customLevels[levelId] = customLevel;
        localStorage.setItem('marbleGameCustomLevels', JSON.stringify(customLevels));
        
        // Update dropdown
        this.loadCustomLevelsToDropdown();
        
        // Clear form
        document.getElementById('customLevelName').value = '';
        document.getElementById('customLevelDescription').value = '';
        
        alert(`Level "${name}" saved successfully!`);
        console.log(`Custom level saved: ${name} with ${shapes.length} shapes`);
    }
    
    getCustomLevels() {
        try {
            const stored = localStorage.getItem('marbleGameCustomLevels');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading custom levels:', error);
            return {};
        }
    }
    
    getCustomLevel(levelId) {
        const customLevels = this.getCustomLevels();
        return customLevels[levelId];
    }
    
    loadCustomLevelsToDropdown() {
        const levelSelect = document.getElementById('levelSelect');
        const customLevelsGroup = document.getElementById('customLevelsGroup');
        const customLevels = this.getCustomLevels();
        
        // Clear existing custom options
        customLevelsGroup.innerHTML = '';
        
        const levelIds = Object.keys(customLevels);
        
        if (levelIds.length > 0) {
            customLevelsGroup.style.display = 'block';
            
            levelIds.forEach(levelId => {
                const level = customLevels[levelId];
                const option = document.createElement('option');
                option.value = levelId;
                
                // Get difficulty emoji
                const difficultyEmojis = {
                    'Easy': '🟢',
                    'Medium': '🟡',
                    'Hard': '🔴',
                    'Expert': '⚫',
                    'Insane': '🔥',
                    'Nightmare': '💀',
                    'Impossible': '💀'
                };
                
                const emoji = difficultyEmojis[level.difficulty] || '📝';
                option.textContent = `${emoji} ${level.name} (${level.difficulty})`;
                customLevelsGroup.appendChild(option);
            });
        } else {
            customLevelsGroup.style.display = 'none';
        }
    }
    
    loadCustomLevel(levelId) {
        const customLevel = this.getCustomLevel(levelId);
        if (!customLevel) {
            console.error('Custom level not found:', levelId);
            return;
        }
        
        // Clear existing shapes
        this.physics.clearShapes();
        
        // Load shapes from the custom level
        customLevel.shapes.forEach(shapeData => {
            const shape = new Shape(
                shapeData.type,
                shapeData.x,
                shapeData.y,
                shapeData.size,
                shapeData.color,
                shapeData.moving || false,
                shapeData.speed || 1
            );
            // Set direction if specified
            if (shapeData.direction) {
                shape.direction = shapeData.direction;
            }
            this.physics.shapes.push(shape);
        });
        
        console.log(`Loaded custom level: ${customLevel.name} with ${customLevel.shapes.length} shapes`);
    }
    
    showCustomLevelsModal() {
        const modal = document.getElementById('customLevelsModal');
        const customLevelsList = document.getElementById('customLevelsList');
        const customLevels = this.getCustomLevels();
        
        // Clear existing content
        customLevelsList.innerHTML = '';
        
        const levelIds = Object.keys(customLevels);
        
        if (levelIds.length === 0) {
            customLevelsList.innerHTML = '<p class="no-levels-message">No custom levels saved yet. Create your first level!</p>';
        } else {
            levelIds.forEach(levelId => {
                const level = customLevels[levelId];
                const levelItem = this.createCustomLevelItem(level);
                customLevelsList.appendChild(levelItem);
            });
        }
        
        modal.style.display = 'flex';
    }
    
    hideCustomLevelsModal() {
        const modal = document.getElementById('customLevelsModal');
        modal.style.display = 'none';
    }
    
    createCustomLevelItem(level) {
        const item = document.createElement('div');
        item.className = 'custom-level-item';
        
        const createdDate = new Date(level.createdAt).toLocaleDateString();
        
        item.innerHTML = `
            <div class="level-item-header">
                <div class="level-item-title">${level.name}</div>
                <div class="level-item-difficulty">${level.difficulty}</div>
            </div>
            <div class="level-item-description">${level.description}</div>
            <div class="level-item-meta">
                Created: ${createdDate} • ${level.shapeCount} shapes
            </div>
            <div class="level-item-actions">
                <button class="btn-small btn-load" data-level-id="${level.id}">🎮 Load</button>
                <button class="btn-small btn-delete" data-level-id="${level.id}">🗑️ Delete</button>
            </div>
        `;
        
        // Add event listeners
        const loadBtn = item.querySelector('.btn-load');
        const deleteBtn = item.querySelector('.btn-delete');
        
        loadBtn.addEventListener('click', () => {
            this.loadCustomLevel(level.id);
            this.hideCustomLevelsModal();
            
            // Update dropdown selection
            const levelSelect = document.getElementById('levelSelect');
            levelSelect.value = level.id;
            levelSelect.dispatchEvent(new Event('change'));
        });
        
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${level.name}"?`)) {
                this.deleteCustomLevel(level.id);
                this.showCustomLevelsModal(); // Refresh modal
            }
        });
        
        return item;
    }
    
    deleteCustomLevel(levelId) {
        const customLevels = this.getCustomLevels();
        const levelName = customLevels[levelId]?.name || 'Unknown';
        
        delete customLevels[levelId];
        localStorage.setItem('marbleGameCustomLevels', JSON.stringify(customLevels));
        
        // Update dropdown
        this.loadCustomLevelsToDropdown();
        
        // Reset dropdown selection if the deleted level was selected
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect.value === levelId) {
            levelSelect.value = '';
            document.getElementById('levelDescription').textContent = 'Select a level to see its description';
            document.getElementById('loadLevelBtn').disabled = true;
        }
        
        console.log(`Custom level deleted: ${levelName}`);
    }
    
    loadPresetLevel(levelId) {
        const level = window.PRESET_LEVELS[levelId];
        if (!level) {
            console.error('Level not found:', levelId);
            return;
        }
        
        // Clear existing shapes
        this.physics.clearShapes();
        
        // Add shapes from the level
        level.shapes.forEach(shapeData => {
            const shape = new Shape(
                shapeData.type,
                shapeData.x,
                shapeData.y,
                shapeData.size,
                shapeData.color,
                shapeData.moving || false, // Use the moving property from level data
                shapeData.speed || 1 // Use the speed from level data
            );
            this.physics.shapes.push(shape);
        });
        
        console.log(`Loaded preset level: ${level.name} with ${level.shapes.length} shapes`);
        console.log(`Level features: ${level.description}`);
    }

    updateShapeModeUI(mode) {
        const presetControls = document.getElementById('presetShapeControls');
        const customControls = document.getElementById('customShapeControls');
        const presetInstructions = document.getElementById('presetInstructions');
        const drawInstructions = document.getElementById('drawInstructions');
        const pinInstructions = document.getElementById('pinInstructions');
        
        // Hide all controls and instructions
        presetControls.style.display = 'none';
        customControls.style.display = 'none';
        presetInstructions.style.display = 'none';
        drawInstructions.style.display = 'none';
        pinInstructions.style.display = 'none';
        
        // Show appropriate controls
        if (mode === 'preset') {
            presetControls.style.display = 'block';
            presetInstructions.style.display = 'block';
        } else {
            customControls.style.display = 'block';
            if (mode === 'draw') {
                drawInstructions.style.display = 'block';
            } else if (mode === 'pin') {
                pinInstructions.style.display = 'block';
            }
        }
        
        this.updateCustomShapeButtons();
    }

    updateCustomShapeButtons() {
        const clearCurrentShapeBtn = document.getElementById('clearCurrentShape');
        const completeShapeBtn = document.getElementById('completeShape');
        const currentDrawing = this.physics.getCurrentDrawing();
        const settings = this.physics.getShapeSettings();
        
        if (settings.mode === 'preset') {
            clearCurrentShapeBtn.style.display = 'none';
            completeShapeBtn.style.display = 'none';
        } else {
            const hasPoints = currentDrawing.points.length > 0;
            const canComplete = currentDrawing.points.length >= 3;
            
            clearCurrentShapeBtn.style.display = hasPoints ? 'block' : 'none';
            completeShapeBtn.style.display = canComplete ? 'block' : 'none';
        }
    }

    updateDrawingModeButton() {
        const drawModeBtn = document.getElementById('drawModeBtn');
        const settings = this.physics.getShapeSettings();
        
        drawModeBtn.classList.remove('draw-mode', 'pin-mode');
        
        if (this.drawingMode) {
            if (settings.mode === 'draw') {
                drawModeBtn.classList.add('draw-mode');
                drawModeBtn.textContent = '🚫 Disable Draw Mode';
            } else if (settings.mode === 'pin') {
                drawModeBtn.classList.add('pin-mode');
                drawModeBtn.textContent = '🚫 Disable Pin Mode';
            } else {
                drawModeBtn.textContent = '🚫 Disable Drawing Mode';
            }
        } else {
            if (settings.mode === 'draw') {
                drawModeBtn.textContent = '✏️ Enable Draw Mode';
            } else if (settings.mode === 'pin') {
                drawModeBtn.textContent = '📍 Enable Pin Mode';
            } else {
                drawModeBtn.textContent = '🎨 Enable Drawing Mode';
            }
        }
    }

    initializeCanvasEvents() {
        let isMouseDown = false;
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.drawingMode) return;
            
            isMouseDown = true;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.physics.isValidShapePosition(x, y)) {
                const settings = this.physics.getShapeSettings();
                
                if (settings.mode === 'preset') {
                    this.physics.addShape(x, y);
                    console.log('Preset shape added at:', x, y);
                } else {
                    this.physics.startDrawing(x, y);
                    this.updateCustomShapeButtons();
                    console.log('Started drawing at:', x, y);
                }
            } else {
                console.log('Invalid position: shapes can only be placed between red and green lines');
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.drawingMode || !isMouseDown) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.physics.isValidShapePosition(x, y)) {
                this.physics.continueDrawing(x, y);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (!this.drawingMode || !isMouseDown) return;
            
            isMouseDown = false;
            this.physics.finishDrawing();
            this.updateCustomShapeButtons();
        });
        
        // Handle mouse leave to stop drawing
        this.canvas.addEventListener('mouseleave', () => {
            if (isMouseDown) {
                isMouseDown = false;
                this.physics.finishDrawing();
                this.updateCustomShapeButtons();
            }
        });
        
        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.drawingMode) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (this.physics.isValidShapePosition(x, y)) {
                const settings = this.physics.getShapeSettings();
                
                if (settings.mode === 'preset') {
                    this.physics.addShape(x, y);
                } else {
                    this.physics.startDrawing(x, y);
                    this.updateCustomShapeButtons();
                }
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.drawingMode) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (this.physics.isValidShapePosition(x, y)) {
                this.physics.continueDrawing(x, y);
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.drawingMode) return;
            
            this.physics.finishDrawing();
            this.updateCustomShapeButtons();
        });
    }

    toggleDrawingMode() {
        this.drawingMode = !this.drawingMode;
        const gameContainer = document.querySelector('.game-container');
        const settings = this.physics.getShapeSettings();
        
        // Remove all drawing mode classes
        gameContainer.classList.remove('drawing-mode', 'draw-shape-mode', 'pin-shape-mode');
        
        if (this.drawingMode) {
            if (settings.mode === 'draw') {
                gameContainer.classList.add('draw-shape-mode');
            } else if (settings.mode === 'pin') {
                gameContainer.classList.add('pin-shape-mode');
            } else {
                gameContainer.classList.add('drawing-mode');
            }
        }
        
        this.updateDrawingModeButton();
        this.updateCustomShapeButtons();
    }

    updateCSSLinePositions() {
        const redLine = document.querySelector('.red-line');
        const greenLine = document.querySelector('.green-line');
        
        redLine.style.top = `${this.physics.getRedLinePosition()}%`;
        greenLine.style.bottom = `${this.physics.getGreenLinePosition()}%`;
    }

    updateCSSRedLineState() {
        const redLine = document.querySelector('.red-line');
        if (this.physics.isRedLineEnabled()) {
            redLine.classList.remove('disabled');
        } else {
            redLine.classList.add('disabled');
        }
    }

    updateButtonStates(status) {
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const wsUrlInput = document.getElementById('wsUrl');
        
        switch (status) {
            case 'connected':
                connectBtn.disabled = true;
                disconnectBtn.disabled = false;
                wsUrlInput.disabled = true;
                break;
            case 'connecting':
                connectBtn.disabled = true;
                disconnectBtn.disabled = false;
                wsUrlInput.disabled = true;
                break;
            default:
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
                wsUrlInput.disabled = false;
                break;
        }
    }

    handleWebSocketMessage(data) {
        console.log('Received WebSocket message:', data);
        
        if (data.event === 'chat' && data.data) {
            this.addMarbleFromChat(data.data);
        }
    }

    addMarbleFromChat(chatData) {
        // Validate required fields
        if (!chatData.uniqueId || !chatData.nickname || !chatData.profilePictureUrl) {
            console.warn('Invalid chat data for marble creation:', chatData);
            return;
        }
        
        const marble = this.physics.addMarble(chatData);
        this.updateMarbleCount();
        
        console.log(`Added marble for ${chatData.nickname}`);
    }

    addTestMarble() {
        const testData = {
            nickname: `TestUser${Date.now()}`,
            uniqueId: `test_${Date.now()}`,
            profilePictureUrl: `https://picsum.photos/seed/${Date.now()}/100`,
            comment: "Test marble"
        };
        
        this.addMarbleFromChat(testData);
    }

    updateMarbleCount() {
        const countElement = document.getElementById('marbleCount');
        countElement.textContent = `Marbles: ${this.physics.getMarbleCount()}`;
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 16.67, 2); // Cap delta time
        this.lastTime = currentTime;
        
        // Update physics
        this.physics.update(deltaTime);
        
        // Render with shapes and red line state
        this.renderer.render(this.physics.marbles, this.physics.shapes, this.physics.isRedLineEnabled(), this.physics.getCurrentDrawing(), this.physics.getShapeSettings());
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.marbleGame = new MarbleGame();
});
