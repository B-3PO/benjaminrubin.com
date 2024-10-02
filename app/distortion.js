let canvas;
let context;
let particles = [];
let width;
let height;
let mouseX;
let mouseY;
let running = false;
let effectArea = 50;
let distortionAmount = 5;
let imageData;

export function init() {
  const img = new Image();
  img.src = 'logo-320.png';
  canvas = document.querySelector('canvas.logo');
  context = canvas.getContext('2d');
  img.addEventListener('load', () => {
    context.drawImage(img, 0, 0, 160, 160);
    img.style.display = "none";
    buildPixels();
  });

  canvas.addEventListener('mouseover', mouseOver);
}

function buildPixels() {
  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  width = imageData.width;
  height = imageData.height;
  for (let i = 0; i < data.length; i += 4) {
    const pixel = Math.floor(i / 4);
    particles.push(new particle(pixel % width, Math.floor(pixel / height), data[i], data[i + 1], data[i + 2], data[i + 3]))
  }
}

class particle {
  r;
  g;
  b;
  a;
  x;
  y;
  rgba;
  originalX;
  originalY;

  constructor(x, y, r, g, b, a) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.rgba = `rgba(${r},${g},${b},${a})`;
  }

  get index() {
    return Math.floor((Math.floor(this.y * height) + this.x) * 4);
  }
}


function mouseOver() {
  window.addEventListener('mousemove', mouseMove);
  canvas.addEventListener('mouseout', mouseOut);

  running = true;
  run();
}

function mouseOut() {
  window.removeEventListener('mousemove', mouseMove);
  canvas.removeEventListener('mouseout', mouseOut);

  running = false;
}

function mouseMove(event) {
  mouseX = event.pageX - canvas.offsetLeft;
  mouseY = event.pageY - canvas.offsetTop;
}

function run() {
  let keepRunning = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  // imageData = context.getImageData(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    let distanceX = mouseX - (particle.x);
    let distanceY = mouseY - (particle.y);
    let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    let newX = particle.x;
    let newY = particle.y;

    if (distance < effectArea && running) {
      // Get the angle of the particle in relation to the mouse
      let angle = Math.atan2(mouseX - particle.x, mouseY - particle.y);
      // Get a 0 to 1 number based on the particles distance from the mouse
      let multiplier = (effectArea - distance) / effectArea;

      // Use the Multiplier to create individual distance numbers
      // to effect the new Particle Positions
      distanceX /= effectArea;
      distanceX *= distortionAmount;
      distanceX *= multiplier;
      distanceY /= effectArea;
      distanceY *= distortionAmount;
      distanceY *= multiplier;

      // Split the angle into two different angles and modify
      // them to get some cool flow patterns
      let angleX = angle * distanceX * distanceX / multiplier;
      let angleY = angle * distanceY * distanceY / multiplier;

      // Calculate the new Positions
      newX = particle.x - Math.cos(angleX) * distanceX;
      newY = particle.y - Math.sin(angleY) * distanceY;
      
    } else {
      // if (i === 102081) console.log(particle.originalYparticle.y, newY);
      // Calculate the positions for the Particle
      // heading back to its original position.
      newX = particle.x;
      let diffX = particle.x - particle.originalX;
      if (Math.abs(diffX) < 1) newX = particle.originalX;
      else newX -= diffX / 10;

      newY = particle.y;
      let diffY = particle.y - particle.originalY;
      if (Math.abs(diffY) < 1) newY = particle.originalY;
      else newY -= diffY / 10;

      // keep running if pixels are not to original position. This prevents pixels from stopping when mouse leaves area
      if (particle.originalX !== newX || particle.originalY !== newY) keepRunning = true;
    }

    particle.x = newX;
    particle.y = newY;
  

    if (particle.x < 0 || particle.x > width || particle.y < 0 || particle.y > height) {
      continue;
    }

    context.fillStyle = particle.rgba;
    context.fillRect(particle.x, particle.y, 1, 1);

    // const index = particle.index;
    // imageData.data[index] = particle.r;
    // imageData.data[index + 1] = particle.g;
    // imageData.data[index + 2] = particle.b;
    // imageData.data[index + 3] = particle.a;
  }

  // context.putImageData(imageData, 0, 0);
  // imageData = context.getImageData(0, 0, width, height);
  if (running || keepRunning) requestAnimationFrame(run);
  else context.putImageData(imageData, 0, 0);
}
