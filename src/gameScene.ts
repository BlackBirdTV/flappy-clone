import Phaser from 'phaser'

class Pipes {
    pipe1: Phaser.Physics.Arcade.Image
    pipe2: Phaser.Physics.Arcade.Image
    spawnedPipes: boolean
    gavePoint: boolean
    setVelocity (x: number, y: number) {
        this.pipe1.setVelocity(x, y)
        this.pipe2.setVelocity(x, y)
    }
    update: Function
}

export default class gameScene1 extends Phaser.Scene {
    constructor() {
        super('game')
    }

    preload()
    {
        this.load.spritesheet('bird', 'assets/bird1.png', { frameWidth: 48, frameHeight: 48 });
        this.load.image('top-pipe', 'assets/top_pipe.png');
        this.load.image('bottom-pipe', 'assets/bottom_pipe.png');
        this.load.image('floor', 'assets/floor.png');
        this.load.image('bg', 'assets/bg.png');
        this.load.audio('jump', 'assets/jump.wav');
        this.load.audio('die', 'assets/die.wav');
    }

    bird: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    floor: Phaser.Physics.Arcade.Image[] = [];
    pipes: Pipes[] = [];
    score: number = 0;
    scoreDisplay: Phaser.GameObjects.Text;
    titleDisplay: Phaser.GameObjects.Text;
    helpDisplay: Phaser.GameObjects.Text;
    gameStarted: boolean = false;
    jump: Phaser.Sound.BaseSound;
    deathSound: Phaser.Sound.BaseSound;

    create ()
    {
        const bg = this.add.image(400, 300, 'bg')
        for (let i = 0; i < 3; i++) {
            const floor = this.physics.add.image(400 + 800 * i, 568, 'floor')
            floor.setDepth(3);
            this.floor.push(floor);
        }
        bg.setDepth(1);

        this.anims.create({
            key: 'main',
            frames: this.anims.generateFrameNumbers('bird', { frames: [ 0, 1, 2, 3 ] }),
            frameRate: 8,
            repeat: -1
        });

        this.bird = this.physics.add.sprite(400, 300, 'main', 0);
        this.bird.setDepth(2);
        this.bird.play('main');

        this.scoreDisplay = this.add.text(20, 20, this.score.toString(), {
            fontFamily: 'Toon',
            fontSize: '64px',
            color: '#ffffff'
        });
        this.scoreDisplay.setDepth(3);

        this.titleDisplay = this.add.text(20, 20, 'flappy clone', {
            fontFamily: 'Toon',
            fontSize: '64px',
            color: '#ffffff'
        });
        this.titleDisplay.setDepth(3);
        this.titleDisplay.x = 400 - this.titleDisplay.width * 0.5

        this.helpDisplay = this.add.text(20, 560, 'Press Up to start!', {
            fontFamily: 'Toon',
            fontSize: '28px',
            color: '#ffffff'
        });
        this.helpDisplay.setDepth(3);
        this.helpDisplay.x = 400 - this.helpDisplay.width * 0.5
    }

    startGame() {
        for (let i = 0; i < this.floor.length; ++i) this.floor[i].setVelocity(-this.pipeSpeed, 0);
        this.jump = this.sound.add('jump');
        this.deathSound = this.sound.add('die');
        this.bird.setGravityY(300);
        this.createPipes(this, 300)
        this.gameStarted = true;
        this.titleDisplay.destroy();
        this.helpDisplay.destroy();
    }

    holeHeight = 150;
    pipeSpeed = 100;

    createPipes(game: any, holeOrigin: number) {
        let self = new Pipes();
        self.pipe1 = game.physics.add.image(864, holeOrigin + this.holeHeight * 0.5 + 300, 'bottom-pipe') as Phaser.Physics.Arcade.Image;
        self.pipe2 = game.physics.add.image(864, holeOrigin - this.holeHeight * 0.5 - 300, 'top-pipe') as Phaser.Physics.Arcade.Image;
        self.pipe1.setDepth(2);
        self.pipe2.setDepth(2);
        self.spawnedPipes = false;
        self.setVelocity(-this.pipeSpeed, 0);
        self.setVelocity(-this.pipeSpeed, 0);

        self.update = () => {
            this.physics.collide(this.bird, self.pipe1, () => this.die());
            this.physics.collide(this.bird, self.pipe2, () => this.die());
            if (self.pipe1.x <= -32) {
                self.pipe1.destroy()
                self.pipe2.destroy()
            }
            if (self.pipe1.x <= 400 && !self.spawnedPipes) {
                this.createPipes(game, randRange(150, 400));
                self.spawnedPipes = true;
            }
            if (this.bird.x >= self.pipe1.x + self.pipe1.width * 0.5 + this.bird.width * 0.5 && !self.gavePoint) {
                self.gavePoint = true;
                this.score++;
                this.scoreDisplay.text = this.score.toString();
            }
        }
        this.pipes.push(self);
    }

    cursors: any;

    upDown = false;
    upPressed = false;

    update() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.bird.setAngle(clamp(-60, 60, this.bird.body.velocity.y * 0.5));

        if (this.bird.y < 0 || this.bird.y > 512) {
            this.die()
        }

        if (this.cursors.up.isDown && !this.upDown) {
            this.upDown = true
            this.upPressed = true
        }
        else if (this.upDown && !this.cursors.up.isDown) {
            this.upDown = false;
        }

        if (this.upPressed && !this.gameStarted) {
            this.startGame()
        }
        else if (this.upPressed) {
            this.upPressed = false;
            this.bird.setVelocity(0, -200);
            this.jump.stop();
            this.jump.play();
        }

        let biggestFloorNumber = 0;
        let floorToSkip;

        for (let i = 0; i < this.pipes.length; ++i) {
            this.pipes[i].update();
        }
        for (let i = 0; i < this.floor.length; ++i) {
            biggestFloorNumber = this.floor[i].getCenter().x > biggestFloorNumber ? i : 0
            if (this.floor[i].getCenter().x <= -400) {
                floorToSkip = this.floor[i]
            }
        }
        floorToSkip?.setPosition(this.floor[biggestFloorNumber].getCenter().x + 800, 568);
    }

    die() {
        this.floor = [];
        this.gameStarted = false;
        this.score = 0;
        this.deathSound.play();
        this.scene.restart();
    }
}

function randRange(min: number, max: number) {
    let outp = Math.random() * max + min;
    return outp > max ? max : outp;
}

const clamp=(min:number,max:number,num:number)=>num<max?num>min?num:min:max