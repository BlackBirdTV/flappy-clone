import Phaser from 'phaser'

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    classList: ['game'],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.setBaseURL('http://localhost:3000');

    this.load.image('button_go_unpressed', 'assets/Button_Go_Unpressed.png');
    this.load.image('button_go_pressed', 'assets/Button_Go_Pressed.png');
    this.load.image('smiley', 'assets/smiley.png');
}

let button: Phaser.Physics.Arcade.Image;
let entity: Phaser.Physics.Arcade.Image;

function create ()
{
    // this.add.rectangle(400, 300, 800, 600, 0xff0000);
    entity = this.physics.add.image(32, 300, 'smiley');

    button = this.add.image(400, 550, 'button_go_unpressed');
}

let cursors;
let mouse;

let start: number;

function getTime() {
    //make a new date object
    let d = new Date();

    //return the number of milliseconds since 1 January 1970 00:00:00.
    return d.getTime();
}
function deltaTime() {
    //subtract the start time from the time now
    // 
    let elapsed = getTime() - start;

    //reset the start time
    start = getTime();
    return elapsed;
}

let goLeft = false;

const speed = 0.05;

function update() {
    let dt = deltaTime();
    cursors = this.input.keyboard.createCursorKeys();
    mouse = this.input.activePointer;

    if (mouse.x >= button.x - button.width * 0.5 && mouse.x <= button.x + button.width * 0.5 && mouse.y >= button.y - button.height * 0.5 && mouse.y <= button.y + button.height * 0.5 && game.input.activePointer.leftButtonDown()) {
        button.setTexture('button_go_pressed');
        entity.x += goLeft ? -5 * dt * speed : 5 * dt * speed;
        entity.rotation += goLeft ? - 0.09 * dt * speed: 0.09 * dt * speed;
    }
    else {
        button.setTexture('button_go_unpressed');
        entity.setVelocity(0, 0);
    }

    if (entity.x >= 736 && !goLeft) goLeft = true;
    else if (entity.x <= 64 && goLeft) goLeft = false;
}
    