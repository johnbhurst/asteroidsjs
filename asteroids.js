// Copyright 2016 John Hurst
// John Hurst (john.b.hurst@gmail.com)
// 2016-11-26

function Ship(world) {
  this.world = world;
  this.angle = Math.PI/2;
  this.x = 0;
  this.y = 0;
  this.vx = 0;
  this.vy = 0;
  this.thrust = false;
  this.turningLeft = false;
  this.turningRight = false;
  this.hit = false;

  this.move = function() {
    this.angle += this.turningLeft ? -Math.PI/30 : 0 ;
    this.angle += this.turningRight ? Math.PI/30 : 0;
  }

  this.fire = function() {
    this.world.missiles.push(new Missile(this.world, this.angle, this.x, this.y, 5));
  }

  this.draw = function(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = this.hit ? "red" : "black";
    ctx.moveTo(10, -10);
    ctx.lineTo(-10, 0);
    ctx.lineTo(10, 10);
    ctx.lineTo(10, -10);
    ctx.stroke();
  }
}

function distance(obj1, obj2) {
  return Math.sqrt((obj1.x-obj2.x)*(obj1.x-obj2.x) + (obj1.y-obj2.y)*(obj1.y-obj2.y));
}

function Rock(world, size, angle, x, y, speed) {
  this.world = world;
  this.size = size;
  this.angle = angle;
  this.x = x;
  this.y = y;
  this.vx = speed * Math.cos(angle);
  this.vy = speed * Math.sin(angle);

  this.move = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (distance(this, this.world.ship) < this.size) {
      this.world.ship.hit = true;
    }
  }

  this.draw = function(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.ellipse(0, 0, this.size, this.size, 0, 0, 2*Math.PI, false);
    ctx.stroke();
  }
}

function Missile(world, angle, x, y, speed) {
  this.world = world;
  this.size = 2;
  this.angle = angle;
  this.x = x;
  this.y = y;
  this.vx = speed * Math.cos(angle);
  this.vy = speed * Math.sin(angle);
  this.age = 0;
  this.destroyed = false;

  this.move = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.age++ > 100) {
      this.destroyed = true;
    }
    this.checkHit();
  }

  this.checkHit = function() {
    for (var i=0; i<this.world.rocks.length; i++) {
      var rock = this.world.rocks[i];
      if (distance(this, rock) < this.size + rock.size) {
        this.world.rocks.splice(i, 1);
        if (rock.size > 10) {
          var newRocks = 3*Math.random()+2;
          for (var j=0; j<newRocks; j++) {
            var size = rock.size/2; //20+20*Math.random();
            var angle = rock.angle + Math.PI/2*Math.random()-Math.PI/4;
            var x = rock.x + 10*Math.random()-5;
            var y = rock.y + 10*Math.random()-5;
            var speed = 0.5+0.5*Math.random();
            world.rocks.push(new Rock(world, size, angle, x, y, speed));
          }
        }
        this.destroyed = true;
        return;
      }
    }
  }

  this.draw = function(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.ellipse(0, 0, this.size, this.size, 0, 0, 2*Math.PI, false);
    ctx.stroke();
  }
}

function World() {
  this.ship = null;
  this.rocks = [];
  this.missiles = [];

  this.move = function() {
    this.ship.move();
    for (var i=0; i<this.rocks.length; i++) {
      this.rocks[i].move();
      this.fixpos(this.rocks[i]);
    }
    for (var i=0; i<this.missiles.length; i++) {
      this.missiles[i].move();
      this.fixpos(this.missiles[i]);
    }
    var i = 0;
    while ((i = this.missiles.findIndex(m => m.destroyed)) != -1) {
      this.missiles.splice(i, 1);
    }
  }

  this.fixpos = function(obj) {
    if (obj.vx > 0 && obj.x > 500) {
      obj.x = -500;
    }
    if (obj.vx < 0 && obj.x < -500) {
      obj.x = 500;
    }
    if (obj.vy > 0 && obj.y > 400) {
      obj.y = -400;
    }
    if (obj.vy < 0 && obj.y < -400) {
      obj.y = 400;
    }
  }

  this.drawObject = function(ctx, obj) {
    ctx.save();
    ctx.translate(ctx.canvas.width/2-obj.x, ctx.canvas.height/2-obj.y);
    ctx.rotate(obj.angle);
    obj.draw(ctx);
    ctx.restore();
  }

  this.draw = function(ctx) {
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    this.drawObject(ctx, this.ship);
    this.rocks.forEach(rock => this.drawObject(ctx, rock));
    this.missiles.forEach(missile => this.drawObject(ctx, missile));
  }
}

var world;

function keyDown(e) {
  e = e || window.event;
  if (e.keyCode == '38') {
    world.ship.thrust = true;
  }
  if (e.keyCode == '40') {
    // down arrow
  }
  if (e.keyCode == '37') {
    world.ship.turningLeft = true;
  }
  if (e.keyCode == '39') {
    world.ship.turningRight = true;
  }
}

function keyUp(e) {
  e = e || window.event;
  if (e.keyCode == '38') {
    world.ship.thrust = false;
  }
  if (e.keyCode == '40') {
    // down arrow
  }
  if (e.keyCode == '37') {
    world.ship.turningLeft = false;
  }
  if (e.keyCode == '39') {
    world.ship.turningRight = false;
  }
  if (e.keyCode == '32') {
    world.ship.fire();
  }
}

function init() {
  document.onkeydown = keyDown;
  document.onkeyup = keyUp;
  world = new World();
  world.ship = new Ship(world);
  for (var i=0; i<10; i++) {
    var size = 20+20*Math.random();
    var angle = 2*Math.PI*Math.random();
    var x = 1000*Math.random()-500;
    var y = 800*Math.random()-400;
    var speed = 0.5+0.5*Math.random();
    world.rocks.push(new Rock(world, size, angle, x, y, speed));
  }
  draw();
}

function draw() {
  world.move();
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    world.draw(ctx);
  }
  window.requestAnimationFrame(draw);
}
