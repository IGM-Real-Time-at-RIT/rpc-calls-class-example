//receive updates about the opponents card
const update = (data) => {
  if(theirCard.lastUpdate >= data.lastUpdate) {
    return;
  }

  theirCard.prevX = canvasWidth - data.prevX;
  theirCard.prevY = canvasHeight - data.prevY;
  theirCard.destX = canvasWidth - data.destX;
  theirCard.destY = canvasHeight - data.destY;
  theirCard.alpha = 0.1;
  theirCard.isMoving = data.isMoving;
};

const removeUser = (data) => {
  console.log('other player left');
};

//sync this user's card with the server data
//and start drawing
const setUser = (data) => {
  myCard = data;
  requestAnimationFrame(redraw);
};

//update our position based on the mouse coordinates
const updatePosition = (mouseX, mouseY) => {
  myCard.prevX = myCard.x;
  myCard.prevY = myCard.y;
  myCard.destX = mouseX;
  myCard.destY = mouseY;
  myCard.alpha = 0.1;
  myCard.isMoving = true;

  socket.emit('movementUpdate', myCard);
};