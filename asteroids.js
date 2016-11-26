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

  this.move = function() {
    this.angle += this.turningLeft ? -Math.PI/30 : 0 ;
    this.angle += this.turningRight ? Math.PI/30 : 0;
  }

  this.fire = function() {
    this.world.missles.push(new Missle(this.world, this.angle, this.x, this.y, 5));
  }

  this.draw = function(ctx) {
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
    ctx.save();
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(10, -10);
    ctx.lineTo(-10, 0);
    ctx.lineTo(10, 10);
    ctx.lineTo(10, -10);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
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
  }

  this.draw = function(ctx) {
    ctx.save();
    ctx.translate(ctx.canvas.width/2-this.x, ctx.canvas.height/2-this.y);
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.ellipse(0, 0, this.size, this.size, 0, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.restore();
  }
}

function Missle(world, angle, x, y, speed) {
  this.world = world;
  this.angle = angle;
  this.x = x;
  this.y = y;
  this.vx = speed * Math.cos(angle);
  this.vy = speed * Math.sin(angle);

  this.move = function() {
    this.x += this.vx;
    this.y += this.vy;
  }

  this.draw = function(ctx) {
    ctx.save();
    ctx.translate(ctx.canvas.width/2-this.x, ctx.canvas.height/2-this.y);
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.ellipse(0, 0, 2, 2, 0, 0, 2*Math.PI, false);
    ctx.stroke();
    ctx.restore();
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
    for (var i=0; i<this.missles.length; i++) {
      this.missles[i].move();
      this.fixpos(this.missles[i]);
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

  this.draw = function(ctx) {
    this.ship.draw(ctx);
    for (var i=0; i<this.rocks.length; i++) {
      this.rocks[i].draw(ctx);
    }
    for (var i=0; i<this.missles.length; i++) {
      this.missles[i].draw(ctx);
    }
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
    var size = 10+10*Math.random();
    var angle = 2*Math.PI*Math.random();
    var x = 1000*Math.random()-500;
    var y = 800*Math.random()-400;
    var speed = 3*Math.random();
    world.rocks.push(new Rock(world, size, angle, x, y, speed));
  }
  world.missles = [];
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
