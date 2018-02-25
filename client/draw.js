//particle objects to draw
const particles = [];

//canvas sizes
const canvasWidth = 1280;
const canvasHeight = 720;
const canvasHalfWidth = canvasWidth / 2;
const canvasHalfHeight = canvasHeight / 2;

//card sizes
let cardSize = {
  width: 143,
  height: 188,
  halfWidth: 143 / 2,
  halfHeight: 188 / 2,
};

//base card object
const createCard = (x, y) => ({
  lastUpdate: new Date().getTime(),
  x: x,
  y: y,
  prevX: x,
  prevY: y,
  destX: x,
  destY: y,
  alpha: 0,
  isMoving: false,
});

//this users card object
let myCard = createCard(canvasHalfWidth - cardSize.halfWidth, canvasHeight - cardSize.height);

//opponents card object
let theirCard = createCard(canvasHalfWidth, cardSize.height / 2);

const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

//drawing the cards. If one is moving, we'll add a special canvas
//filter to it for added effect
const drawCard = (cardObj, image) => {
  //if alpha less than 1, increase it by 0.01
  if(cardObj.alpha < 1) cardObj.alpha += 0.1;

  if(cardObj.alpha > 1) cardObj.alpha = 1;

  cardObj.x = lerp(cardObj.prevX, cardObj.destX, cardObj.alpha);
  cardObj.y = lerp(cardObj.prevY, cardObj.destY, cardObj.alpha);

  let drawX = cardObj.x - cardSize.halfWidth;
  let drawY = cardObj.y - cardSize.halfHeight;

  if(drawX < 0 - cardSize.halfWidth ) drawX = 0 - cardSize.halfWidth;
  if(drawX > 1280 - cardSize.halfWidth) drawX = 1280 - cardSize.halfWidth;
  if(drawY < 0 - cardSize.halfHeight) drawY = 0 - cardSize.halfHeight;
  if(drawY > 720 - cardSize.halfHeight) drawY = 720 - cardSize.halfHeight;

  if(cardObj.isMoving) {
    ctx.filter = 'drop-shadow(0px 0px 50px blue)';
  }

  ctx.drawImage(image, drawX, drawY, cardSize.width, cardSize.height);
  ctx.filter = 'none';
};

//redraw our particle objects and age them out over time
const drawParticles = () => {
  ctx.fillStyle = "#906437";

  for(let i = 0; i < particles.length; i++) {
    const p = particles[i];

    p.age += 1;

    if(p.age % 2 === 0) {
      p.x += p.speedX * 0.25;
      p.y += p.speedY * 0.25;
      p.opacity -= 0.025;

      p.opacity = (p.opacity < 0) ? 0 : p.opacity;
    }
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    if(p.age > 150) {
      particles.splice(i);
    }
  }

  ctx.globalAlpha = 1;
};

const redraw = (time) => {
  ctx.clearRect(0, 0, 1280, 720);
  ctx.drawImage(board, 0, 0, 1280, 720);

  drawCard(theirCard, cardback);
  drawCard(myCard, coin);
  drawParticles();

  requestAnimationFrame(redraw);
};