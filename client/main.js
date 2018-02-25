let board;
let cardback;
let coin;
let canvas;
let ctx;
//our websocket connection
let socket;
let mouseDown = false;

//check where user is clicking and moving
const checkClick = (mouseX, mouseY) => {
  const mouseCheckLeft = mouseX > (myCard.x - cardSize.halfWidth);
  const mouseCheckRight = mouseX < (myCard.x + cardSize.halfWidth);
  const mouseCheckUp = mouseY > (myCard.y - cardSize.halfHeight);
  const mouseCheckDown = mouseY < (myCard.y + cardSize.halfHeight);
  const cardClickCheck = (mouseCheckLeft && mouseCheckRight && mouseCheckDown && mouseCheckUp);

  //if moving the card, update the card positions
  if(myCard.isMoving || cardClickCheck) {
    updatePosition(mouseX, mouseY);
  }
  //if NOT moving the card, then we'll draw particles where
  //the mouse is
  else {
    let position = {x: mouseX, y: mouseY};
    addParticles(position);
    socket.emit('addParticles', position);
  }

};

//translate mouse position to canvas instead of page
//starts mouse measurements from 0,0 of canvas, not page
const getMousePos = (e) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

//if mouse is moving, check if the user is also clicking
const handleMouseMove = (e) => {
  if(!mouseDown) {
    return;
  }

  const mousePos = getMousePos(e);

  checkClick(mousePos.x, mousePos.y);
};

//if mouse is down
const mouseDownHandler = (e) => {
  mouseDown = true;
};

//when mouse is released
const mouseUpHandler = (e) => {
  mouseDown = false;
  myCard.prevX = myCard.x;
  myCard.prevY = myCard.y;
  myCard.destX = canvasHalfWidth;
  myCard.destY = canvasHeight - cardSize.halfHeight;
  myCard.alpha = 0.1;
  myCard.isMoving = false;

  socket.emit('movementUpdate', myCard);
};

//setup app
const init = () => {
  board = document.querySelector('#board');
  cardback = document.querySelector('#cardback');
  coin = document.querySelector('#coin');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser);
  socket.on('updatedMovement', update);
  /**
    Upon receiving a particles RPC call
    from the server we will invoke our add particles function
  **/
  socket.on('particlesRPC', addParticles);
  socket.on('left', removeUser);

  canvas.addEventListener('mousedown', mouseDownHandler);
  canvas.addEventListener('mouseup', mouseUpHandler);
  canvas.addEventListener('mousemove', handleMouseMove);
};

window.onload = init;