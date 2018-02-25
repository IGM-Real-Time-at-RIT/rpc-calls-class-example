//xxhash for unique room codes
const xxh = require('xxhashjs');

//hardcoding the canvas size measurements
//for this example. This is so the server knows
//the size of the screen.
const viewport = {
  canvasWidth: 1280,
  canvasHeight: 720,
  canvasHalfWidth: 1280 / 2,
  canvasHalfHeight: 720 / 2,
};

//hardcoding the card size measurements
//for this example. This is so the server knows
//the size of the cards on screen.
const cardSize = {
  width: 143,
  height: 188,
  halfWidth: 143 / 2,
  halfHeight: 188 / 2,
};

//starting position for cards 
//clients will inverse the points for their opponent
const startX = viewport.canvasHalfWidth;
const startY = viewport.canvasHeight - cardSize.halfHeight;

//function to generate a new unique room name
const getNewRoom = () =>
  xxh.h32(`room${new Date().getTime()}`, 0xCAFEBABE).toString(16);

//the latest room
let lastRoom = getNewRoom();

//setup our sockets
const startSocketServer = (io) => {
  io.on('connection', (sock) => {
    const socket = sock;

    //get the socket room object from socket.io
    const socketRoom = io.sockets.adapter.rooms[lastRoom];

    //if the room is already full, generate a new room
    if (socketRoom && socketRoom.length >= 2) {
      lastRoom = getNewRoom();
    }

    //join the socket to the latest room
    socket.join(lastRoom);
    //attach the room reference to the socket for
    //quick referencing
    socket.room = lastRoom;

    //generate this user's card to show on screen
    socket.card = {
      lastUpdate: new Date().getTime(),
      x: startX,
      y: startY,
      prevX: startX,
      prevY: startY,
      destX: startX,
      destY: startY,
      alpha: 0,
      isMoving: false, 
    };

    //send card info to user
    socket.emit('joined', socket.card);

    //on movement, update opponents screen
    socket.on('movementUpdate', (data) => {
      socket.card = data;
      socket.card.lastUpdate = new Date().getTime();

      socket.broadcast.to(socket.room).emit('updatedMovement', socket.card);
    });

    //on particles we will ask the opponent to add particles to their screen
    /**
      Unlike our movement, we are not going to sync everything on screen. 
      With the card, we consider that a high priority graphic and we want the
      movement to stay synced and lerped. That's important, especially if
      we were using collision. We want player movement to be update to 
      and accurate across users.
      
      Particles (or other effects like lighting) we don't care as much. 
      These effects to not change gameplay as long as they show up. 
      We do not have to match each particle pixel for pixel. 
      In fact, if we did, it would be very bad. 
      That would be an incredible amount of data syncing. It would
      introduce lag, lower frame rates, more data to do physics and lerping
      on, etc. 
      
      For special effects like particles, lighting, explosions, etc. 
      We use remote procedure calls (RPC). 
      
      With a remote procedure call (RPC), we basically say
      "hey put an explosion effect on screen at these coordinates"
      
      Will that explosion look exactly the same on every person's app?
      No absolutely not. 
      
      Does it matter if a special effect looks identical across machines?
      No ultimately. Users won't notice or care if the special effect is 
      slightly different across apps. In fact, they will probably be too 
      focused on the special effect or gameplay to even notice. 
      
      It's important to do this for non-priority stuff. That is, the stuff
      that does not effect the core mechanics. Otherwise the server will
      become way too overloaded. 
    **/
    socket.on('addParticles', (data) => {
      socket.broadcast.to(socket.room).emit('particlesRPC', data);
    });

    socket.on('disconnect', () => {
      socket.broadcast.to(socket.room).emit('left');

      socket.leave(socket.room);
    });
  });
};

module.exports.startSocketServer = startSocketServer;