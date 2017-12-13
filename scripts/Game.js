import 'p2';
import 'pixi';
import Phaser from 'phaser';

let game = new Phaser.Game(
        1200,
        800,
        Phaser.CANVAS,
        'phaser-example',
        { preload: preload, create: create, update: update, render: render }
    );

function preload() {

    game.load.image('space', '../img/starfield.png');
    game.load.spritesheet('kaboom', '../img/explode.png', 128, 128);
    game.load.atlasJSONHash('imgpack', '../img/imgpack.png', '../img/imgpack.json');

}

let startField;
let friendShip;
let enemy;
let keysFriend;
let keysEnemy;
let bullet;
let scoreFriend;
let scoreEnemy;
let explosions;
let stateText;
let meteors;
let meteorsArray;

meteorsArray = [
    'meteorBrown_big1.png',
    'meteorBrown_big2.png',
    'meteorBrown_big3.png',
    'meteorBrown_big4.png',
    'meteorBrown_med1.png',
    'meteorBrown_med3.png',
    'meteorBrown_small1.png',
    'meteorBrown_small2.png',
];

function create() {

    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Enable physics on everything added to the world so far (the true parameter makes it recurse down into children)
    game.physics.arcade.enable(game.world, true);

    startField = game.add.tileSprite(-100, -100, game.width+100, game.height+100, 'space');
    game.add.tween(startField).to( { x: 0, y: 0 }, 10000, Phaser.Easing.Sinusoidal.InOut, true, 0, 1000, true);

    enemy = createShip('playerShip1_green.png',200, game.height / 2);
    friendShip = createShip('playerShip2_orange.png', game.width - 200, game.height / 2);
    friendShip.rotation = Math.PI;

    friendShip.bullets = createBullets('laserRed03.png');

    friendShip.bullets.blow = game.add.sprite(0, 180, 'imgpack', '0005.png');
    friendShip.bullets.blow.exists = false;
    friendShip.bullets.blow.scale.setTo(0.7,0.7);
    friendShip.bullets.blow.anchor.setTo(0.5,0.5);
    friendShip.bullets.blow.animations.add(
        'blow',
        ['0005.png','0006.png','0006.png','0005.png','0007.png','0008.png']
    );

    enemy.bullets = createBullets('laserGreen05.png');

    enemy.bullets.blow = game.add.sprite(0, 180, 'imgpack', '0001.png');
    enemy.bullets.blow.exists = false;
    enemy.bullets.blow.scale.setTo(0.7,0.7);
    enemy.bullets.blow.anchor.setTo(0.5,0.5);
    enemy.bullets.blow.animations.add(
        'blow',
        ['0001.png','0002.png','0002.png','0001.png','0003.png','0004.png']
    );

    meteors = createMeteorsPack();

    keysFriend = game.input.keyboard.createCursorKeys();
    keysFriend.fire = game.input.keyboard.addKey(Phaser.KeyCode.NUMPAD_DECIMAL);
    keysEnemy = game.input.keyboard.addKeys(
        {
            'up': Phaser.KeyCode.W,
            'down': Phaser.KeyCode.S,
            'left': Phaser.KeyCode.A,
            'right': Phaser.KeyCode.D,
            'fire': Phaser.KeyCode.SPACEBAR
        }
    );
    game.input.keyboard.addKeyCapture(keysEnemy);
    game.input.keyboard.addKeyCapture(keysFriend);

    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach(item => item.animations.add('kaboom'));

    scoreEnemy = game.add.text(10, 10, friendShip.numOfDeath , { font: '34px Arial', fill: '#fff' });
    scoreFriend = game.add.text(1010, 10, enemy.numOfDeath , { font: '34px Arial', fill: '#fff' });

    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

}

function update() {

    actShip(keysEnemy, enemy);
    actShip(keysFriend, friendShip);

    game.physics.arcade.overlap(enemy.bullets, friendShip, collisionHandler, null, this);
    game.physics.arcade.overlap(friendShip.bullets, enemy, collisionHandler, null, this);

    game.physics.arcade.overlap(meteors, [friendShip.bullets, enemy.bullets],  damageMeteors, null, this);
    game.physics.arcade.collide(enemy, friendShip);
    game.physics.arcade.collide([enemy, friendShip], meteors);
    game.physics.arcade.collide(meteors);

    meteors.forEachExists(screenWrap, this);

    if (!friendShip.exists || !enemy.exists) {

        stateText.text = "Rrrround!!1111 \n Just click for next...";
        stateText.visible = true;

        game.input.onTap.addOnce(restart,this);
    }


}

function render() {
}

function createShip(img, x, y) {
    let ship;

    ship = game.add.sprite(x, y, 'imgpack', img);
    ship.scale.setTo(0.6, 0.6);
    ship.anchor.set(0.5);

    game.physics.enable(ship);

    ship.body.drag.set(200);
    ship.body.mass = 200;
    ship.body.maxVelocity.set(400);
    ship.health = 100;
    ship.numOfDeath = 0;
    ship.body.collideWorldBounds = true;
    ship.body.bounce.setTo(0.6, 0.6);

    return ship
}

function createBullets(img) {
    let bullets;

    bullets = game.add.physicsGroup(Phaser.Physics.ARCADE);
    bullets.createMultiple(40, 'imgpack', img);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('scale.x', '0.6');
    bullets.setAll('scale.y', '0.6');
    bullets.bulletTime = 0;
    bullets.setAll('damage', 5);

    return bullets
}

function createMeteorsPack(imgArr, amount, prop) {

    let meteors;

    meteors = game.add.physicsGroup(Phaser.Physics.ARCADE);

    for (let i = 0; i < 4; i++)
    {
        let a;

        a =createMeteor(meteorsArray[game.rnd.integerInRange(0, 3)]);
        meteors.add(a);
        a = setMeteorsProperty(a, {
            health: 400,
            mass: 200000,
            immovable: false,
            speed: 400,
        })
    }

    for (let i = 0; i < 2; i++)
    {
        let a;

        a =createMeteor(meteorsArray[game.rnd.integerInRange(0, 3)]);
        meteors.add(a);
        a = setMeteorsProperty(a, {
            health: 400,
            mass: 200000,
            immovable: true,
            speed: 0,
        })
    }

    for (let i = 0; i < 6; i++)
    {
        let a;

        a =createMeteor(meteorsArray[game.rnd.integerInRange(4, 5)]);
        meteors.add(a);
        a = setMeteorsProperty(a, {
            health: 60,
            mass: 200,
            immovable: false,
            speed: 400,
        })
    }

    for (let i = 0; i < 6; i++)
    {
        let a;

        a =createMeteor(meteorsArray[game.rnd.integerInRange(6, 7)]);
        meteors.add(a);
        a = setMeteorsProperty(a, {
            health: 20,
            mass: 2,
            immovable: false,
            speed: 800,
            // checkCollision: true
        })
    }
    return meteors
}

function actShip(keys,ship) {

    if (keys.up.isDown)
    {
        game.physics.arcade.accelerationFromRotation(ship.rotation, 800, ship.body.acceleration);
    }
    else if (keys.down.isDown){
        game.physics.arcade.accelerationFromRotation(ship.rotation, -500, ship.body.acceleration);
    }
    else
    {
        ship.body.acceleration.set(0);
    }

    if (keys.left.isDown)
    {
        ship.body.angularVelocity = -300;
        game.physics.arcade.accelerationFromRotation(ship.rotation - Math.PI/2, 400, ship.body.acceleration);

    }
    else if (keys.right.isDown)
    {
        ship.body.angularVelocity = 300;
        game.physics.arcade.accelerationFromRotation(ship.rotation + Math.PI/2, 400, ship.body.acceleration);
    }
    else
    {
        ship.body.angularVelocity = 0;

    }

    if (keys.fire.isDown && ship.exists)
    {
        fireBullet(ship);
    }

}

function fireBullet (ship) {
    if (game.time.now > ship.bullets.bulletTime)
    {
        bullet = ship.bullets.getFirstExists(false);

        if (bullet)
        {
            bullet.reset(ship.body.x + ship.body.width/2, ship.body.y + ship.body.height/2);
            bullet.lifespan = 2000;
            bullet.rotation = ship.rotation + Math.PI/2;
            game.physics.arcade.velocityFromRotation(ship.rotation, 1000, bullet.body.velocity);
            ship.bullets.bulletTime = game.time.now + 50;
        }
    }
}

function screenWrap (sprite) {

    if (sprite.x < -200)
    {
        sprite.x = game.width + 200;
    }
    else if (sprite.x > game.width + 200)
    {
        sprite.x = -200;
    }

    if (sprite.y < -200)
    {
        sprite.y = game.height + 200;
    }
    else if (sprite.y > game.height + 200)
    {
        sprite.y = -200;
    }

}

function collisionHandler (alien, bullet) {

    bullet.kill();
    alien.health -= bullet.damage;

    if (alien.health <= 0)
    {
        alien.exists ? alien.numOfDeath++ : null;

        alien.kill();
        alien.bullets.setAll('exists', false);

        scoreEnemy.text = friendShip.numOfDeath;
        scoreFriend.text = enemy.numOfDeath;
    }

    blowUp(alien,bullet);
}

function createMeteor(img) {
    let meteor;
    do {
        (meteor) ? meteor.destroy() : null;
        meteor = game.add.sprite
        (
            game.world.randomX,
            game.world.randomY,
            'imgpack',
            img
        );
    } while (
        game.physics.arcade.intersects(friendShip, meteor)
        || game.physics.arcade.intersects(enemy, meteor)
        );
    return meteor
}

function setMeteorsProperty(meteor,prop) {

    meteor.anchor.setTo(0.5, 0.5);
    meteor.health = prop.health;
    meteor.body.mass = prop.mass;
    meteor.body.bounce.setTo(0.6, 0.6);
    meteor.body.immovable = prop.immovable || false;
    meteor.body.checkCollision.none = prop.checkCollision || false;
    meteor.body.angularVelocity = Math.random() * 100;
    meteor.rotation = Math.random() * 360;
    meteor.body.maxVelocity.setTo(game.rnd.integerInRange(prop.speed * 0.25, prop.speed));
    game.physics.arcade.velocityFromRotation(meteor.rotation, prop.speed, meteor.body.velocity);
    game.physics.arcade.accelerationFromRotation(meteor.rotation, 100, meteor.body.acceleration);

    return meteor
}

function damageMeteors (meteor, bullet) {
    bullet.kill();
    meteor.health -= bullet.damage;
    blowUp(meteor,bullet);
}

function blowUp(obj,bullet) {
    if (obj.health <= 0)
    {
        let explosion = explosions.getFirstExists(false);
        explosion.reset(bullet.body.x, bullet.body.y);
        explosion.play('kaboom', 30, false, true);
        obj.kill();

    } else {

        bullet.parent.blow.reset(bullet.body.x, bullet.body.y);
        bullet.parent.blow.exists = true;
        bullet.parent.blow.animations.play('blow',30,false,true);
    }
}

function restart () {

    enemy.revive();
    friendShip.revive();

    enemy.reset(200, game.height / 2, 100);
    enemy.rotation = 0;
    enemy.bullets.setAll('exists', false);

    friendShip.reset(game.width - 200, game.height / 2, 100);
    friendShip.rotation = Math.PI;
    friendShip.bullets.setAll('exists', false);

    meteors.destroy();
    meteors = createMeteorsPack();

    stateText.visible = false;
}
