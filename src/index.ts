import GameScene from './gameScene'

import Phaser from 'phaser'

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    classList: ['game'],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [ GameScene ]
};

var game = new Phaser.Game(config);

