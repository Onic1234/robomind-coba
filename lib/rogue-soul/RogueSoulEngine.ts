import { RogueAudio } from "./RogueSoulAudio";
import { CostumeSkin, WeaponItem, LevelData } from "./RogueSoulData";

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  facingRight: boolean;
  
  // State machine
  action: "run" | "jump" | "double_jump" | "wall_slide" | "wall_jump" | "slide" | "slash" | "throw" | "hurt" | "dead" | "victory";
  actionFrame: number;
  doubleJumpAvailable: boolean;
  wallTouchDir: "left" | "right" | null;
  slideCooldown: number;
  slashCooldown: number;
  throwCooldown: number;

  // Stats
  hp: number;
  maxHp: number;
  coins: number;
  gems: number;
  score: number;
  daggers: number;
  maxDaggers: number;
  combo: number;
  comboTimer: number;

  // Equipped
  skin: CostumeSkin;
  weapon: WeaponItem;
  magnetRadius: number;

  invulnerableTimer: number;
}

export interface DaggerProjectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  fromPlayer: boolean;
  active: boolean;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "grass" | "stone" | "dungeon" | "wall" | "springboard" | "ramparts";
}

export interface Enemy {
  id: number;
  type: "guard" | "archer" | "bandit" | "boss";
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  facingRight: boolean;
  state: "idle" | "patrol" | "attack" | "hurt" | "dead";
  attackCooldown: number;
  shielded?: boolean;
}

export interface ItemCollectible {
  id: number;
  type: "coin" | "gem" | "potion" | "dagger_refill" | "speed_boost";
  x: number;
  y: number;
  w: number;
  h: number;
  collected: boolean;
  floatOffset: number;
}

export interface TrapHazard {
  id: number;
  type: "spikes" | "swinging_blade" | "falling_rock";
  x: number;
  y: number;
  w: number;
  h: number;
  angle?: number;
  swingSpeed?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape?: "circle" | "spark" | "text";
  text?: string;
}

export class RogueSoulGameEngine {
  public player: PlayerState;
  public platforms: Platform[] = [];
  public enemies: Enemy[] = [];
  public collectibles: ItemCollectible[] = [];
  public hazards: TrapHazard[] = [];
  public projectiles: DaggerProjectile[] = [];
  public particles: Particle[] = [];
  
  public cameraX: number = 0;
  public cameraY: number = 0;
  public screenShake: number = 0;
  
  public gameDistance: number = 0;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;
  public currentLevelData: LevelData | null = null;
  public isEndless: boolean = false;
  
  private nextId: number = 1;
  private canvasWidth: number = 900;
  private canvasHeight: number = 500;

  constructor(
    skin: CostumeSkin,
    weapon: WeaponItem,
    maxHp: number = 3,
    maxDaggers: number = 5,
    magnetRadius: number = 0
  ) {
    this.player = {
      x: 100,
      y: 300,
      vx: 0,
      vy: 0,
      width: 44,
      height: 64,
      grounded: true,
      facingRight: true,
      action: "run",
      actionFrame: 0,
      doubleJumpAvailable: true,
      wallTouchDir: null,
      slideCooldown: 0,
      slashCooldown: 0,
      throwCooldown: 0,
      hp: maxHp,
      maxHp: maxHp,
      coins: 0,
      gems: 0,
      score: 0,
      daggers: maxDaggers,
      maxDaggers: maxDaggers,
      combo: 0,
      comboTimer: 0,
      skin: skin,
      weapon: weapon,
      magnetRadius: magnetRadius,
      invulnerableTimer: 0,
    };
  }

  public initLevel(levelData: LevelData | null, endless: boolean = false) {
    this.currentLevelData = levelData;
    this.isEndless = endless;
    this.isGameOver = false;
    this.isVictory = false;
    this.gameDistance = 0;
    this.cameraX = 0;
    this.cameraY = 0;
    this.projectiles = [];
    this.particles = [];
    this.platforms = [];
    this.enemies = [];
    this.collectibles = [];
    this.hazards = [];

    // Reset player position
    this.player.x = 100;
    this.player.y = 280;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.hp = this.player.maxHp;
    this.player.coins = 0;
    this.player.gems = 0;
    this.player.score = 0;
    this.player.combo = 0;
    this.player.daggers = this.player.maxDaggers;
    this.player.action = "run";

    this.generateLevelContent();
  }

  private generateLevelContent() {
    const env = this.currentLevelData?.environment || "forest";

    // Base ground floor layout
    this.platforms.push({ x: -200, y: 420, w: 1000, h: 200, type: env === "dungeon" ? "dungeon" : "grass" });

    let currentX = 800;
    const targetDist = this.isEndless ? 10000 : (this.currentLevelData?.targetDistance || 2000);

    while (currentX < targetDist + 800) {
      const pWidth = 300 + Math.random() * 400;
      const gap = 120 + Math.random() * 160;
      const heightVar = Math.floor(Math.random() * 3); // 0 = ground, 1 = mid, 2 = high
      const pY = 420 - heightVar * 80;

      this.platforms.push({
        x: currentX,
        y: pY,
        w: pWidth,
        h: 200,
        type: env === "dungeon" ? "dungeon" : env === "ramparts" ? "stone" : "grass",
      });

      // Wall obstacles for wall jumps
      if (Math.random() < 0.45) {
        const wallH = 160 + Math.random() * 120;
        this.platforms.push({
          x: currentX + pWidth / 2,
          y: pY - wallH,
          w: 40,
          h: wallH,
          type: "wall",
        });
      }

      // Springboards
      if (Math.random() < 0.3) {
        this.platforms.push({
          x: currentX + 60,
          y: pY - 20,
          w: 50,
          h: 20,
          type: "springboard",
        });
      }

      // Collectibles (Coins, Gems, Potions & Speed Boost Pads)
      for (let c = 0; c < 5; c++) {
        const rand = Math.random();
        const itemType = rand < 0.12 ? "gem" : rand < 0.22 ? "speed_boost" : rand < 0.28 ? "potion" : "coin";
        this.collectibles.push({
          id: this.nextId++,
          type: itemType,
          x: currentX + 80 + c * 40,
          y: pY - 50 - (c % 2) * 30,
          w: 24,
          h: 24,
          collected: false,
          floatOffset: Math.random() * Math.PI * 2,
        });
      }

      // Enemies
      if (currentX > 500) {
        const enemyType = Math.random() < 0.4 ? "guard" : Math.random() < 0.5 ? "archer" : "bandit";
        this.enemies.push({
          id: this.nextId++,
          type: enemyType,
          x: currentX + 180,
          y: pY - 60,
          vx: enemyType === "bandit" ? -2 : -1,
          vy: 0,
          w: 46,
          h: 60,
          hp: enemyType === "guard" ? 3 : 1,
          maxHp: enemyType === "guard" ? 3 : 1,
          facingRight: false,
          state: "patrol",
          attackCooldown: 0,
          shielded: enemyType === "guard",
        });
      }

      // Traps / Spikes
      if (Math.random() < 0.35) {
        this.hazards.push({
          id: this.nextId++,
          type: "spikes",
          x: currentX + pWidth - 80,
          y: pY - 20,
          w: 60,
          h: 20,
        });
      }

      currentX += pWidth + gap;
    }

    // Boss at end of level 4
    if (this.currentLevelData?.bossLevel) {
      this.enemies.push({
        id: this.nextId++,
        type: "boss",
        x: targetDist + 200,
        y: 300,
        vx: 0,
        vy: 0,
        w: 90,
        h: 110,
        hp: 20,
        maxHp: 20,
        facingRight: false,
        state: "idle",
        attackCooldown: 60,
      });
    }
  }

  // --- CONTROLS INPUT API ---
  public handleJump() {
    if (this.isGameOver || this.isVictory) return;

    // 1. Wall Jump
    if (this.player.wallTouchDir && !this.player.grounded) {
      const jumpDir = this.player.wallTouchDir === "left" ? 1 : -1;
      this.player.vx = jumpDir * 9;
      this.player.vy = -12.5;
      this.player.facingRight = jumpDir > 0;
      this.player.action = "wall_jump";
      this.player.actionFrame = 0;
      this.player.doubleJumpAvailable = true;
      RogueAudio.playWallJump();
      this.addDustParticle(this.player.x + (jumpDir < 0 ? 0 : this.player.width), this.player.y + 30);
      return;
    }

    // 2. Ground Jump
    if (this.player.grounded) {
      this.player.vy = -14;
      this.player.grounded = false;
      this.player.action = "jump";
      this.player.actionFrame = 0;
      this.player.doubleJumpAvailable = true;
      RogueAudio.playJump();
      this.addDustParticle(this.player.x + 20, this.player.y + 60);
      return;
    }

    // 3. Double Jump
    if (this.player.doubleJumpAvailable && !this.player.grounded) {
      this.player.vy = -13;
      this.player.doubleJumpAvailable = false;
      this.player.action = "double_jump";
      this.player.actionFrame = 0;
      RogueAudio.playDoubleJump();
      this.addSparkleCircle(this.player.x + 22, this.player.y + 50, "#FBBF24");
      return;
    }
  }

  public handleSlide() {
    if (this.isGameOver || this.isVictory) return;
    if (this.player.grounded && this.player.action !== "slide" && this.player.slideCooldown <= 0) {
      this.actionSlide();
    }
  }

  private actionSlide() {
    this.player.action = "slide";
    this.player.actionFrame = 0;
    this.player.slideCooldown = 28;
    this.player.vx = (this.player.facingRight ? 1 : -1) * 13.5;
    RogueAudio.playSlide();
    this.addDustParticle(this.player.x + 10, this.player.y + 55);
  }

  public handleSlash() {
    if (this.isGameOver || this.isVictory) return;
    if (this.player.slashCooldown <= 0) {
      this.player.action = "slash";
      this.player.actionFrame = 0;
      this.player.slashCooldown = 18;
      RogueAudio.playSlash();

      // Sword attack collision check
      const reach = this.player.weapon.range;
      const attackBox = {
        x: this.player.facingRight ? this.player.x + 30 : this.player.x - reach,
        y: this.player.y - 10,
        w: reach + 20,
        h: 80,
      };

      // Slash visual particle arc
      this.particles.push({
        x: this.player.facingRight ? this.player.x + 40 : this.player.x - 20,
        y: this.player.y + 20,
        vx: 0,
        vy: 0,
        color: this.player.weapon.bladeColor,
        size: reach,
        life: 10,
        maxLife: 10,
        shape: "spark",
      });

      // Hit enemies
      this.enemies.forEach((enemy) => {
        if (enemy.hp > 0 && this.checkAABB(attackBox, enemy)) {
          this.damageEnemy(enemy, this.player.weapon.damage);
        }
      });
    }
  }

  public handleThrowDagger() {
    if (this.isGameOver || this.isVictory) return;
    if (this.player.daggers > 0 && this.player.throwCooldown <= 0) {
      this.player.daggers--;
      this.player.throwCooldown = 15;
      this.player.action = "throw";
      this.player.actionFrame = 0;
      RogueAudio.playThrowDagger();

      const dir = this.player.facingRight ? 1 : -1;
      this.projectiles.push({
        id: this.nextId++,
        x: this.player.x + (dir > 0 ? 40 : -10),
        y: this.player.y + 25,
        vx: dir * 14,
        vy: -1.5,
        rotation: dir > 0 ? 0 : Math.PI,
        fromPlayer: true,
        active: true,
      });
    }
  }

  private damageEnemy(enemy: Enemy, amount: number) {
    if (enemy.shielded && ((this.player.facingRight && !enemy.facingRight) || (!this.player.facingRight && enemy.facingRight))) {
      // Shield block sound & spark!
      RogueAudio.playEnemyHit();
      this.addFloatingText("BLOCKED!", enemy.x, enemy.y - 20, "#64748B");
      this.addSparkleCircle(enemy.x + 20, enemy.y + 20, "#94A3B8");
      return;
    }

    enemy.hp -= amount;
    RogueAudio.playEnemyHit();
    this.addFloatingText(`-${amount}`, enemy.x + 10, enemy.y - 20, "#EF4444");
    this.addSparkleCircle(enemy.x + 20, enemy.y + 30, "#DC2626");

    // Add combo
    this.player.combo++;
    this.player.comboTimer = 180; // 3 seconds combo reset window
    const comboBonus = Math.floor(this.player.combo / 3) * 10;
    this.player.score += 50 + comboBonus;

    if (enemy.hp <= 0) {
      enemy.state = "dead";
      this.player.coins += 15;
      this.player.score += 150;
      this.addFloatingText("+15 GOLD", enemy.x, enemy.y - 40, "#F59E0B");

      // Chance to drop health potion or dagger refill
      if (Math.random() < 0.4) {
        this.collectibles.push({
          id: this.nextId++,
          type: Math.random() < 0.5 ? "potion" : "dagger_refill",
          x: enemy.x,
          y: enemy.y,
          w: 24,
          h: 24,
          collected: false,
          floatOffset: 0,
        });
      }
    }
  }

  // --- MAIN ENGINE TICK (60 FPS) ---
  public update(inputLeft: boolean, inputRight: boolean) {
    if (this.isGameOver || this.isVictory) return;

    // Dynamic Speed Curve: Starts comfortable & controlled, then accelerates as distance & combos increase!
    const distanceAccel = Math.min(4.0, (this.gameDistance / 400));
    const comboBonus = Math.min(2.5, this.player.combo * 0.3);
    const dynamicSpeed = (4.8 + distanceAccel + comboBonus) * this.player.skin.speedMultiplier;

    // Movement horizontal logic
    if (this.player.action !== "slide") {
      if (inputRight) {
        this.player.vx = dynamicSpeed;
        this.player.facingRight = true;
      } else if (inputLeft) {
        this.player.vx = -dynamicSpeed;
        this.player.facingRight = false;
      } else {
        // Natural speed decay
        this.player.vx *= 0.88;
      }
    } else {
      // Slide speed friction
      this.player.vx *= 0.96;
    }

    // Apply gravity
    this.player.vy += 0.75;
    if (this.player.vy > 14) this.player.vy = 14;

    // Wall slide friction speed cap
    if (this.player.wallTouchDir && !this.player.grounded && this.player.vy > 0) {
      this.player.action = "wall_slide";
      if (this.player.vy > 2.5) this.player.vy = 2.5;
    }

    // Move player
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Distance tracking
    if (this.player.x > this.gameDistance) {
      this.gameDistance = this.player.x;
      this.player.score += 1;
    }

    // Cooldown timers
    if (this.player.slideCooldown > 0) this.player.slideCooldown--;
    if (this.player.slashCooldown > 0) this.player.slashCooldown--;
    if (this.player.throwCooldown > 0) this.player.throwCooldown--;
    if (this.player.invulnerableTimer > 0) this.player.invulnerableTimer--;

    // Combo timer decay
    if (this.player.comboTimer > 0) {
      this.player.comboTimer--;
      if (this.player.comboTimer <= 0) this.player.combo = 0;
    }

    // Action animation frame progression
    this.player.actionFrame++;
    if (this.player.action === "slide" && this.player.actionFrame > 24) {
      this.player.action = "run";
    }

    // 1. Platform Collisions
    this.player.grounded = false;
    this.player.wallTouchDir = null;

    this.platforms.forEach((plat) => {
      // Springboard bounce
      if (plat.type === "springboard" && this.checkAABB(this.player, plat)) {
        this.player.vy = -18;
        this.player.grounded = false;
        RogueAudio.playJump();
        this.addSparkleCircle(plat.x + 25, plat.y, "#38BDF8");
        return;
      }

      // Standard platform top collision
      if (
        this.player.x + this.player.width > plat.x &&
        this.player.x < plat.x + plat.w &&
        this.player.y + this.player.height >= plat.y &&
        this.player.y + this.player.height - this.player.vy <= plat.y + 16 &&
        this.player.vy >= 0
      ) {
        this.player.y = plat.y - this.player.height;
        this.player.vy = 0;
        this.player.grounded = true;
        this.player.doubleJumpAvailable = true;
        if (this.player.action === "jump" || this.player.action === "double_jump" || this.player.action === "wall_jump") {
          this.player.action = "run";
        }
      }

      // Wall side collision for Wall Jump / Cling
      if (plat.type === "wall" || plat.h > 100) {
        if (
          this.player.y + this.player.height > plat.y + 10 &&
          this.player.y < plat.y + plat.h - 10
        ) {
          // Touching left side of wall
          if (this.player.x + this.player.width >= plat.x && this.player.x + this.player.width <= plat.x + 15) {
            this.player.x = plat.x - this.player.width;
            this.player.wallTouchDir = "right";
          }
          // Touching right side of wall
          else if (this.player.x <= plat.x + plat.w && this.player.x >= plat.x + plat.w - 15) {
            this.player.x = plat.x + plat.w;
            this.player.wallTouchDir = "left";
          }
        }
      }
    });

    // Pitfall Death check
    if (this.player.y > 600) {
      this.playerHurt(this.player.maxHp);
    }

    // 2. Collectibles & Magnet
    this.collectibles.forEach((item) => {
      if (item.collected) return;

      // Magnet pull
      if (this.player.magnetRadius > 0 && (item.type === "coin" || item.type === "gem")) {
        const dx = (this.player.x + 20) - (item.x + 12);
        const dy = (this.player.y + 30) - (item.y + 12);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.player.magnetRadius) {
          item.x += (dx / dist) * 7;
          item.y += (dy / dist) * 7;
        }
      }

      if (this.checkAABB(this.player, item)) {
        item.collected = true;
        if (item.type === "coin") {
          this.player.coins += 1;
          this.player.score += 20;
          RogueAudio.playCoin();
          this.addFloatingText("+1", item.x, item.y, "#F59E0B");
        } else if (item.type === "gem") {
          this.player.gems += 1;
          this.player.score += 100;
          RogueAudio.playGem();
          this.addFloatingText("+1 GEM!", item.x, item.y - 10, "#EC4899");
        } else if (item.type === "potion") {
          if (this.player.hp < this.player.maxHp) this.player.hp++;
          RogueAudio.playGem();
          this.addFloatingText("+1 HP", item.x, item.y, "#10B981");
        } else if (item.type === "dagger_refill") {
          this.player.daggers = Math.min(this.player.maxDaggers, this.player.daggers + 3);
          RogueAudio.playCoin();
          this.addFloatingText("+3 DAGGER", item.x, item.y, "#38BDF8");
        } else if (item.type === "speed_boost") {
          this.player.vx = (this.player.facingRight ? 1 : -1) * 16.5;
          RogueAudio.playDoubleJump();
          this.addFloatingText("HYPER SPEED!", item.x, item.y - 15, "#F97316");
          this.addSparkleCircle(this.player.x, this.player.y + 20, "#F97316");
        }
      }
    });

    // 3. Traps / Hazards Collision
    this.hazards.forEach((hazard) => {
      if (this.player.invulnerableTimer <= 0 && this.checkAABB(this.player, hazard)) {
        this.playerHurt(1);
      }
    });

    // 4. Projectiles Update
    this.projectiles.forEach((proj) => {
      if (!proj.active) return;
      proj.x += proj.vx;
      proj.y += proj.vy;

      // Enemy hit check
      if (proj.fromPlayer) {
        this.enemies.forEach((enemy) => {
          if (enemy.hp > 0 && proj.active && this.checkAABB({ x: proj.x, y: proj.y, w: 20, h: 10 }, enemy)) {
            proj.active = false;
            this.damageEnemy(enemy, 2);
          }
        });
      }

      // Out of bounds
      if (Math.abs(proj.x - this.player.x) > 800) {
        proj.active = false;
      }
    });

    // 5. Enemy AI & Attack
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;

      // Archer shoot arrows
      if (enemy.type === "archer") {
        enemy.attackCooldown++;
        if (enemy.attackCooldown >= 140) {
          enemy.attackCooldown = 0;
          const dir = enemy.x > this.player.x ? -1 : 1;
          enemy.facingRight = dir > 0;
          this.projectiles.push({
            id: this.nextId++,
            x: enemy.x,
            y: enemy.y + 15,
            vx: dir * 7,
            vy: 0,
            rotation: dir > 0 ? 0 : Math.PI,
            fromPlayer: false,
            active: true,
          });
        }
      }

      // Bandit charge player
      if (enemy.type === "bandit") {
        const dist = Math.abs(enemy.x - this.player.x);
        if (dist < 300) {
          enemy.vx = enemy.x > this.player.x ? -3.5 : 3.5;
          enemy.facingRight = enemy.vx > 0;
        }
      }

      enemy.x += enemy.vx;

      // Touch player attack
      if (this.player.invulnerableTimer <= 0 && this.checkAABB(this.player, enemy)) {
        if (this.player.action === "slide") {
          // Slide knockback enemy!
          this.damageEnemy(enemy, 1);
          this.player.vx = (this.player.facingRight ? 1 : -1) * 8;
        } else {
          this.playerHurt(1);
        }
      }
    });

    // 6. Arrow hit player check
    this.projectiles.forEach((proj) => {
      if (proj.active && !proj.fromPlayer && this.player.invulnerableTimer <= 0) {
        if (this.checkAABB(this.player, { x: proj.x, y: proj.y, w: 15, h: 10 })) {
          proj.active = false;
          this.playerHurt(1);
        }
      }
    });

    // 7. Particles update
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    this.particles = this.particles.filter((p) => p.life > 0);

    // 8. Camera Smooth Follow
    const targetCamX = this.player.x - 200;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    if (this.screenShake > 0) {
      this.screenShake *= 0.85;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    // 9. Level Target Victory Check
    if (!this.isEndless && this.currentLevelData) {
      if (this.player.x >= this.currentLevelData.targetDistance) {
        this.isVictory = true;
        RogueAudio.playVictory();
      }
    }
  }

  private playerHurt(damage: number) {
    const defenseBonus = this.player.skin.defenseBonus;
    const actualDamage = Math.max(1, damage - defenseBonus);

    this.player.hp -= actualDamage;
    this.player.invulnerableTimer = 60; // 1 sec iframe
    this.player.combo = 0;
    this.screenShake = 12;
    RogueAudio.playPlayerHurt();
    this.addFloatingText(`-${actualDamage} HP`, this.player.x + 10, this.player.y - 20, "#DC2626");

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.player.action = "dead";
      this.isGameOver = true;
    }
  }

  // --- HELPER UTILITIES ---
  private checkAABB(a: { x: number; y: number; w?: number; width?: number; h?: number; height?: number }, b: { x: number; y: number; w?: number; width?: number; h?: number; height?: number }) {
    const aw = a.w || a.width || 0;
    const ah = a.h || a.height || 0;
    const bw = b.w || b.width || 0;
    const bh = b.h || b.height || 0;

    return a.x < b.x + bw && a.x + aw > b.x && a.y < b.y + bh && a.y + ah > b.y;
  }

  private addDustParticle(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 2,
        color: "#CBD5E1",
        size: 4 + Math.random() * 4,
        life: 15,
        maxLife: 15,
        shape: "circle",
      });
    }
  }

  private addSparkleCircle(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        color: color,
        size: 3 + Math.random() * 3,
        life: 20,
        maxLife: 20,
        shape: "circle",
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string) {
    this.particles.push({
      x: x,
      y: y,
      vx: 0,
      vy: -1.2,
      color: color,
      size: 16,
      life: 35,
      maxLife: 35,
      shape: "text",
      text: text,
    });
  }
}
