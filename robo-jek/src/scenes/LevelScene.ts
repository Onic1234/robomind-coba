import Phaser from 'phaser';
import { Vehicle } from '../entities/Vehicle';

export class LevelScene extends Phaser.Scene {
  private player!: Vehicle;
  private obstacle!: Phaser.Physics.Arcade.Sprite;
  private timerText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;
  private collisionCountText!: Phaser.GameObjects.Text;
  private elapsedTime: number = 0;
  private collisions: number = 0;

  constructor() {
    super({ key: 'LevelScene' });
  }

  create() {
    this.elapsedTime = 0;
    this.collisions = 0;

    // Draw background grid (road feel)
    this.drawRoadBackground();

    // Create Dummy Obstacle
    this.obstacle = this.physics.add.sprite(500, 300, 'obstacle_placeholder');
    this.obstacle.setImmovable(true);

    // Create Vehicle Player
    this.player = new Vehicle(this, 200, 300, 'vehicle_placeholder');

    // Setup Collision Detection
    this.physics.add.collider(this.player, this.obstacle, this.handleCollision, undefined, this);

    // Setup HUD Overlay
    this.setupHUD();

    // Camera follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    this.physics.world.setBounds(0, 0, 1600, 1200);
  }

  private drawRoadBackground() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRect(0, 0, 1600, 1200);

    // Grid road markings
    graphics.lineStyle(2, 0x334155, 0.6);
    for (let x = 0; x < 1600; x += 100) {
      graphics.lineBetween(x, 0, x, 1200);
    }
    for (let y = 0; y < 1200; y += 100) {
      graphics.lineBetween(0, y, 1600, y);
    }

    // Yellow center lines
    graphics.lineStyle(4, 0xeab308, 0.8);
    for (let y = 0; y < 1200; y += 40) {
      graphics.lineBetween(800, y, 800, y + 20);
    }

    // Decorative labels
    this.add.text(50, 50, 'FASE 0 PROTOTYPE — ROAD TEST', {
      font: 'bold 20px Arial',
      color: '#4ade80'
    });
  }

  private setupHUD() {
    const hudContainer = this.add.container(0, 0);
    hudContainer.setScrollFactor(0);

    // HUD Panel Background
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x0f172a, 0.85);
    hudBg.fillRoundedRect(16, 16, 320, 150, 8);
    hudBg.lineStyle(2, 0x38bdf8, 1);
    hudBg.strokeRoundedRect(16, 16, 320, 150, 8);
    hudContainer.add(hudBg);

    // Timer Text
    this.timerText = this.add.text(32, 28, 'Waktu: 0.0s', {
      font: 'bold 18px monospace',
      color: '#38bdf8'
    });

    // Speed Text
    this.speedText = this.add.text(32, 56, 'Kecepatan: 0 km/h', {
      font: '16px monospace',
      color: '#f8fafc'
    });

    // Collision Text
    this.collisionCountText = this.add.text(32, 84, 'Tabrakan: 0x', {
      font: '16px monospace',
      color: '#f43f5e'
    });

    // Controls Info
    this.infoText = this.add.text(32, 115, 'Kontrol: WASD / Panah', {
      font: '14px Arial',
      color: '#94a3b8'
    });

    hudContainer.add([this.timerText, this.speedText, this.collisionCountText, this.infoText]);
  }

  private handleCollision() {
    this.collisions++;
    console.log(`[COLLISION] Nabrak obstacle dummy! Total tabrakan: ${this.collisions}`);
    
    // Flash camera on hit
    this.cameras.main.shake(100, 0.01);
  }

  update(_time: number, delta: number) {
    const deltaSeconds = delta / 1000;
    this.elapsedTime += deltaSeconds;

    // Update Player physics
    this.player.update(deltaSeconds);

    // Update HUD Text
    this.timerText.setText(`Waktu: ${this.elapsedTime.toFixed(1)}s`);
    this.speedText.setText(`Kecepatan: ${this.player.getSpeed()} km/h`);
    this.collisionCountText.setText(`Tabrakan: ${this.collisions}x`);
  }
}
