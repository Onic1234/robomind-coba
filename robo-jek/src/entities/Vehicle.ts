import Phaser from 'phaser';

export class Vehicle extends Phaser.Physics.Arcade.Sprite {
  private speed = 0;
  private maxSpeed = 350;
  private acceleration = 400;
  private deceleration = 300;
  private turnSpeed = 180; // degrees per second
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(30, 50);

    // Setup input
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
  }

  update(deltaSeconds: number) {
    const isUp = this.cursors?.up.isDown || this.wasd?.up.isDown;
    const isDown = this.cursors?.down.isDown || this.wasd?.down.isDown;
    const isLeft = this.cursors?.left.isDown || this.wasd?.left.isDown;
    const isRight = this.cursors?.right.isDown || this.wasd?.right.isDown;

    // Acceleration & Reverse
    if (isUp) {
      this.speed = Math.min(this.speed + this.acceleration * deltaSeconds, this.maxSpeed);
    } else if (isDown) {
      this.speed = Math.max(this.speed - this.acceleration * deltaSeconds, -this.maxSpeed * 0.4);
    } else {
      // Natural deceleration / Friction
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.deceleration * deltaSeconds);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + this.deceleration * deltaSeconds);
      }
    }

    // Turning (only turns effectively when moving)
    if (Math.abs(this.speed) > 10) {
      const dir = this.speed >= 0 ? 1 : -1;
      if (isLeft) {
        this.angle -= this.turnSpeed * deltaSeconds * dir;
      }
      if (isRight) {
        this.angle += this.turnSpeed * deltaSeconds * dir;
      }
    }

    // Apply movement vector in direction vehicle is facing
    const rotationRad = Phaser.Math.DegToRad(this.angle - 90);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      Math.cos(rotationRad) * this.speed,
      Math.sin(rotationRad) * this.speed
    );
  }

  public getSpeed(): number {
    return Math.round(this.speed);
  }
}
