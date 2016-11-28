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
  this.thrustFactor = 0.1;
  this.slowFactor = this.thrustFactor / 5;
  this.maxSpeed = 5;

  this.move = function() {
    this.angle += this.turningLeft ? -Math.PI/30 : 0 ;
    this.angle += this.turningRight ? Math.PI/30 : 0;
    var tAngle = Math.atan2(this.vy, this.vx);
    if (this.thrust) {
      this.vx += this.thrustFactor * Math.cos(this.angle);
      this.vy += this.thrustFactor * Math.sin(this.angle);
    }
    else {
      this.vx -= this.slowFactor * Math.cos(tAngle);
      this.vy -= this.slowFactor * Math.sin(tAngle);
    }
    if (Math.hypot(this.vx, this.vy) > this.maxSpeed) {
      var factor = this.maxSpeed / Math.hypot(this.vx, this.vy);
      this.vx *= factor;
      this.vy *= factor;
    }
    this.x += this.vx;
    this.y += this.vy;
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
  return Math.hypot(obj1.x-obj2.x, obj1.y-obj2.y);
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
  this.minSize = 10;

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
        var newRocks = 3*Math.random()+2;
        for (var j=0; j<newRocks; j++) {
          var size = rock.size/(2+Math.random(3));
          var angle = rock.angle + Math.PI/2*Math.random()-Math.PI/4;
          var x = rock.x + 10*Math.random()-5;
          var y = rock.y + 10*Math.random()-5;
          var speed = 0.5+0.5*Math.random();
          if (size > this.minSize) {
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

function World(width, height) {
  this.ship = new Ship(this);
  this.rocks = [];
  for (var i=0; i<10; i++) {
    var size = 30+30*Math.random();
    var angle = 2*Math.PI*Math.random();
    var x = 1000*Math.random()-500;
    var y = 800*Math.random()-400;
    var speed = 0.5+0.5*Math.random();
    this.rocks.push(new Rock(this, size, angle, x, y, speed));
  }
  this.missiles = [];

  this.moveObject = function(obj) {
    obj.move();
    if (obj.vx > 0 && obj.x > width/2) {
      obj.x = -width/2;
    }
    if (obj.vx < 0 && obj.x < -width/2) {
      obj.x = width/2;
    }
    if (obj.vy > 0 && obj.y > height/2) {
      obj.y = -height/2;
    }
    if (obj.vy < 0 && obj.y < -height/2) {
      obj.y = height/2;
    }
  }

  this.move = function() {
    this.moveObject(this.ship);
    this.rocks.forEach(this.moveObject);
    this.missiles.forEach(this.moveObject);
    var i = 0;
    while ((i = this.missiles.findIndex(m => m.destroyed)) != -1) {
      this.missiles.splice(i, 1);
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
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.drawObject(ctx, this.ship);
    this.rocks.forEach(rock => this.drawObject(ctx, rock));
    this.missiles.forEach(missile => this.drawObject(ctx, missile));
  }
}

function init() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var world = new World(ctx.canvas.width, ctx.canvas.height);

    var keyDown = function(e) {
      e = e || window.event;
      switch (e.keyCode) {
        case 38: world.ship.thrust = true; break;
        case 40: /* down arrow */ break
        case 37: world.ship.turningLeft = true; break;
        case 39: world.ship.turningRight = true; break;
      }
    }

    var keyUp = function(e) {
      e = e || window.event;
      switch (e.keyCode) {
        case 38: world.ship.thrust = false; break;
        case 40: /* down arrow */ break;
        case 37: world.ship.turningLeft = false; break;
        case 39: world.ship.turningRight = false; break;
        case 32: world.ship.fire(); break;
      }
    }

    var draw = function() {
      world.move();
      world.draw(ctx);
      window.requestAnimationFrame(draw);
    }

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    draw();
  }
}
