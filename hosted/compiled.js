'use strict';

var particles = [];

var canvasWidth = 1280;
var canvasHeight = 720;
var canvasHalfWidth = canvasWidth / 2;
var canvasHalfHeight = canvasHeight / 2;

var cardSize = {
  width: 143,
  height: 188,
  halfWidth: 143 / 2,
  halfHeight: 188 / 2
};

var createCard = function createCard(x, y) {
  return {
    lastUpdate: new Date().getTime(),
    x: x,
    y: y,
    prevX: x,
    prevY: y,
    destX: x,
    destY: y,
    alpha: 0,
    isMoving: false
  };
};

var myCard = createCard(canvasHalfWidth - cardSize.halfWidth, canvasHeight - cardSize.height);

var theirCard = createCard(canvasHalfWidth, cardSize.height / 2);

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

var drawCard = function drawCard(cardObj, image) {
  //if alpha less than 1, increase it by 0.01
  if (cardObj.alpha < 1) cardObj.alpha += 0.1;

  if (cardObj.alpha > 1) cardObj.alpha = 1;

  cardObj.x = lerp(cardObj.prevX, cardObj.destX, cardObj.alpha);
  cardObj.y = lerp(cardObj.prevY, cardObj.destY, cardObj.alpha);

  var drawX = cardObj.x - cardSize.halfWidth;
  var drawY = cardObj.y - cardSize.halfHeight;

  if (drawX < 0 - cardSize.halfWidth) drawX = 0 - cardSize.halfWidth;
  if (drawX > 1280 - cardSize.halfWidth) drawX = 1280 - cardSize.halfWidth;
  if (drawY < 0 - cardSize.halfHeight) drawY = 0 - cardSize.halfHeight;
  if (drawY > 720 - cardSize.halfHeight) drawY = 720 - cardSize.halfHeight;

  if (cardObj.isMoving) {
    ctx.filter = 'drop-shadow(0px 0px 50px blue)';
  }

  ctx.drawImage(image, drawX, drawY, cardSize.width, cardSize.height);
  ctx.filter = 'none';
};

var drawParticles = function drawParticles() {
  ctx.fillStyle = "#906437";

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];

    p.age += 1;

    if (p.age % 2 === 0) {
      p.x += p.speedX * 0.25;
      p.y += p.speedY * 0.25;
      p.opacity -= 0.025;

      p.opacity = p.opacity < 0 ? 0 : p.opacity;
    }
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    if (p.age > 150) {
      particles.splice(i);
    }
  }

  ctx.globalAlpha = 1;
};

var redraw = function redraw(time) {
  ctx.clearRect(0, 0, 1280, 720);
  ctx.drawImage(board, 0, 0, 1280, 720);

  drawCard(theirCard, cardback);
  drawCard(myCard, coin);
  drawParticles();

  requestAnimationFrame(redraw);
};
'use strict';

var board = void 0;
var cardback = void 0;
var coin = void 0;
var canvas = void 0;
var ctx = void 0;
//our websocket connection
var socket = void 0;
var mouseDown = false;

var checkClick = function checkClick(mouseX, mouseY) {
  var mouseCheckLeft = mouseX > myCard.x - cardSize.halfWidth;
  var mouseCheckRight = mouseX < myCard.x + cardSize.halfWidth;
  var mouseCheckUp = mouseY > myCard.y - cardSize.halfHeight;
  var mouseCheckDown = mouseY < myCard.y + cardSize.halfHeight;
  var cardClickCheck = mouseCheckLeft && mouseCheckRight && mouseCheckDown && mouseCheckUp;

  if (myCard.isMoving || cardClickCheck) {
    updatePosition(mouseX, mouseY);
  } else {
    var position = { x: mouseX, y: mouseY };
    addParticles(position);
    socket.emit('addParticles', position);
  }
};

var getMousePos = function getMousePos(e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

var handleMouseMove = function handleMouseMove(e) {
  if (!mouseDown) {
    return;
  }

  var mousePos = getMousePos(e);

  checkClick(mousePos.x, mousePos.y);
};

var mouseDownHandler = function mouseDownHandler(e) {
  mouseDown = true;
};

var mouseUpHandler = function mouseUpHandler(e) {
  mouseDown = false;
  myCard.prevX = myCard.x;
  myCard.prevY = myCard.y;
  myCard.destX = canvasHalfWidth;
  myCard.destY = canvasHeight - cardSize.halfHeight;
  myCard.alpha = 0.1;
  myCard.isMoving = false;

  socket.emit('movementUpdate', myCard);
};

var init = function init() {
  board = document.querySelector('#board');
  cardback = document.querySelector('#cardback');
  coin = document.querySelector('#coin');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser);
  socket.on('updatedMovement', update);
  socket.on('particlesRPC', addParticles);
  socket.on('left', removeUser);

  canvas.addEventListener('mousedown', mouseDownHandler);
  canvas.addEventListener('mouseup', mouseUpHandler);
  canvas.addEventListener('mousemove', handleMouseMove);
};

window.onload = init;
"use strict";

var getRandomIntFromRange = function getRandomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

var getRandomPosNeg = function getRandomPosNeg() {
  var num = Math.random();
  num = num < 0.5 ? -1 : 1;
  return num;
};

var createParticle = function createParticle(x, y) {
  return {
    age: getRandomIntFromRange(0, 25),
    x: getRandomIntFromRange(x - 15, x + 15),
    y: getRandomIntFromRange(y - 15, y + 15),
    radius: getRandomIntFromRange(1, 3),
    speedX: getRandomPosNeg(),
    speedY: getRandomPosNeg(),
    opacity: 0.6
  };
};

var addParticles = function addParticles(data) {
  for (var i = 0; i < 15; i++) {
    particles.push(createParticle(data.x, data.y));
  }
};
'use strict';

var update = function update(data) {
  if (theirCard.lastUpdate >= data.lastUpdate) {
    return;
  }

  theirCard.prevX = canvasWidth - data.prevX;
  theirCard.prevY = canvasHeight - data.prevY;
  theirCard.destX = canvasWidth - data.destX;
  theirCard.destY = canvasHeight - data.destY;
  theirCard.alpha = 0.1;
  theirCard.isMoving = data.isMoving;
};

var removeUser = function removeUser(data) {
  console.log('other player left');
};

var setUser = function setUser(data) {
  myCard = data;
  requestAnimationFrame(redraw);
};

var updatePosition = function updatePosition(mouseX, mouseY) {
  myCard.prevX = myCard.x;
  myCard.prevY = myCard.y;
  myCard.destX = mouseX;
  myCard.destY = mouseY;
  myCard.alpha = 0.1;
  myCard.isMoving = true;

  socket.emit('movementUpdate', myCard);
};
