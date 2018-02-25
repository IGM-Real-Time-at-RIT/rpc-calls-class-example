const getRandomIntFromRange = (min, max) => {
  return Math.floor(Math.random()*(max-min+1)+min);
};

//get a random positive or negative one
//to help with random multipliers
const getRandomPosNeg = () => {
  let num = Math.random();
  num = (num < 0.5) ? -1 : 1;
  return num;
};

//create a new particle from an x,y coordinate
//with some randomness near that position
const createParticle = (x, y) => {
  return {
    age: getRandomIntFromRange(0, 25),
    x: getRandomIntFromRange(x-15, x+15),
    y: getRandomIntFromRange(y-15, y+15),
    radius: getRandomIntFromRange(1, 3),
    speedX: getRandomPosNeg(),
    speedY: getRandomPosNeg(),
    opacity: 0.6,
  };
};

//generate particles based on an x,y coordinate.
/**
   This data is coming from the server, but it's not synced
   data about individual particles or where they should be.
   This is instead a request to invoke this function. 
   
   This data is not important for mechanics of the app or gameplay,
   so we just ask to draw some data on the client side and ignore
   syncing it completely or doing it server-side. 
   
   For data not important to mechanics of the app or gameplay,
   we invoke it client-side at the correct place, but it 
   likely will not look identical on each user's screen and 
   it does not need to. For special effects, users really won't notice
   or care. They will appreciate the effects, but they won't know that
   particles are synced 1 to 1 on each screen. 
   
   If an explosion happens in the same place at the same time on both
   screens, users will not notice that the lighting or particles
   were slightly different across screens.
   
   This saves our server a lot of stress. We don't have to send 
   hundreds of thousands of packets for thousands of particles
   across user's screens. Instead we sent only one very small packet 
   asking to add a certain effect at a certain spot.
   
   This can also be used to add new things to the screen, such as
   UI, objects, effects, etc.
**/
const addParticles = (data) => {
  for(let i = 0; i < 15; i++) {
    particles.push(createParticle(data.x, data.y));
  }
};