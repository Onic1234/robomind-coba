import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { LevelScene } from './scenes/LevelScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#0f172a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, LevelScene]
};

new Phaser.Game(config);
