const NUM_HEAVY_PARTICLES = 100;
const NUM_LIGHT_PARTICLES = 150;

const MAX_HEAVY_PARTICLE_RADIUS = 5;
const MAX_LIGHT_PARTICLE_RADIUS = 1.5;

const HEAVY_PARTICLE_FRICTION = 0.001;
const LIGHT_PARTICLE_FRICTION = 0.0002;

const MAX_V0 = 10;
const particles = []

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  background(0);
  noStroke();

  for (let i = 0; i < NUM_HEAVY_PARTICLES; i++) {
    const radius = random(0.3 * MAX_HEAVY_PARTICLE_RADIUS, MAX_HEAVY_PARTICLE_RADIUS);

    const red = random(120, 180);
    const green = random(200, 250);
    const blue = random(220, 250);
    const alpha = random(20, 50);

    const x = random(0, width);
    const y = random(0, height);

    const v0 = random(0, MAX_V0);
    const theta0 = random(0, 2 * PI);

    particles.push(
      new Particle(
        i, radius, HEAVY_PARTICLE_FRICTION,
        red, green, blue, alpha,
        x, y, v0 * cos(theta0), v0 * sin(theta0)
      )
    )
  }
  for (let i = 0; i < NUM_LIGHT_PARTICLES; i++) {
    const radius = random(0.3 * MAX_LIGHT_PARTICLE_RADIUS, MAX_LIGHT_PARTICLE_RADIUS);

    const red = random(150, 200);
    const green = random(120, 170);
    const blue = random(100, 150);
    const alpha = random(120, 200);

    const x = random(0, width);
    const y = random(0, height);

    const v0 = random(0, MAX_V0);
    const theta0 = random(0, 2 * PI);

    particles.push(
      new Particle(
        i + NUM_HEAVY_PARTICLES, radius, LIGHT_PARTICLE_FRICTION,
        red, green, blue, alpha,
        x, y, v0 * cos(theta0), v0 * sin(theta0)
      )
    )
  }
}

function draw() {
  blendMode(ADD);

  for (particle of particles) {
    particle.display();
  }
  const prevParticles = JSON.parse(JSON.stringify(particles))
  for (particle of particles) {
    particle.update(prevParticles);
  }

  blendMode(BLEND);
  fill(0, 20);
  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
  explode();
}

function touchEnded() {
  explode();
}

function explode() {
  for (particle of particles) {
    particle.setRandomVelocity(MAX_V0);
  }
}

function Particle(id, radius, friction, r, g, b, alpha, x, y, vx, vy) {
  this.G = 0.4;
  this.CUTOFF_D = 60;

  this.id = id;
  this.radius = radius;
  this.friction = friction;
  this.r = r;
  this.g = g;
  this.b = b;
  this.alpha = alpha;
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;

  this.ax = 0;
  this.ay = 0;
  this.mass = sq(radius);

  this.update = function(particles) {
    let fx = 0;
    let fy = 0;

    for (that of particles) {
      if (that.id === this.id) continue;

      const dx = that.x - this.x;
      const dy = that.y - this.y;
      let d = sqrt(sq(dx) + sq(dy));
      const ux = dx / d;
      const uy = dy / d;
      d = constrain(d, this.CUTOFF_D, width);

      const f0 = this.G * this.mass * that.mass / sq(d);
      fx += f0 * ux;
      fy += f0 * uy;
    }

    this.ax = fx / this.mass;
    this.ay = fy / this.mass;

    this.vx += this.ax;
    this.vy += this.ay;
    this.vx *= 1 - this.friction;
    this.vy *= 1 - this.friction;

    this.x += this.vx;
    this.y += this.vy;

    this.bounce();
  }

  this.display = function() {
    fill(this.r, this.g, this.b, this.alpha);

    const angle = atan2(this.vy, this.vx);
    const skew = constrain(0.5 * (sq(this.vx) + sq(this.vy)) + 1, 1, 2.5);

    push();
    translate(this.x, this.y);
    rotate(angle);
    ellipse(0, 0, 2 * this.radius * skew, 2 * this.radius / skew);
    pop();
  }

  this.bounce = function() {
    if (this.x < 0) {
      this.x = -this.x;
      this.vx *= -1;
    }
    else if (this.x > width) {
      this.x = 2 * width - this.x;
      this.vx *= -1;
    }

    if (this.y < 0) {
      this.y = -this.y;
      this.vy *= -1;
    }
    else if (this.y > height) {
      this.y = 2 * height - this.y;
      this.vy *= -1;
    }
  }

  this.setRandomVelocity = function(maxV0) {
    const v0 = random(0.5 * maxV0, maxV0);
    const theta0 = random(0, 2 * PI);

    this.vx = v0 * cos(theta0);
    this.vy = v0 * sin(theta0);
  }
}

