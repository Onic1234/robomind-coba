import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Display loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: 'Loading Robo-Jek...',
      style: {
        font: '24px monospace',
        color: '#38bdf8'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
  }

  create() {
    // Generate placeholder textures programmatically using Graphics
    this.createVehicleTexture();
    this.createObstacleTexture();

    // Transition to LevelScene
    this.scene.start('LevelScene');
  }

  private createVehicleTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Vehicle body (Top-down Robot Driver / Motor)
    graphics.fillStyle(0x0284c7, 1); // Main blue
    graphics.fillRoundedRect(5, 5, 30, 50, 6);

    // Windshield / Roof
    graphics.fillStyle(0x38bdf8, 1);
    graphics.fillRect(10, 15, 20, 15);

    // Front Lights
    graphics.fillStyle(0xfacc15, 1);
    graphics.fillRect(7, 5, 6, 4);
    graphics.fillRect(27, 5, 6, 4);

    // Rear Lights
    graphics.fillStyle(0xef4444, 1);
    graphics.fillRect(7, 51, 6, 3);
    graphics.fillRect(27, 51, 6, 3);

    graphics.generateTexture('vehicle_placeholder', 40, 60);
    graphics.destroy();
  }

  private createObstacleTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Obstacle (Dummy Block / Trash Bin / Box)
    graphics.fillStyle(0xd97706, 1);
    graphics.fillRoundedRect(0, 0, 50, 50, 8);

    graphics.lineStyle(3, 0xf59e0b, 1);
    graphics.strokeRoundedRect(2, 2, 46, 46, 6);

    // Hazard Cross
    graphics.lineStyle(4, 0x78350f, 0.8);
    graphics.lineBetween(10, 10, 40, 40);
    graphics.lineBetween(40, 10, 10, 40);

    graphics.generateTexture('obstacle_placeholder', 50, 50);
    graphics.destroy();
  }
}
