let groups = [];
let canvas;
let context;
let frameCounter = 0;
let frameDuration = 50;

export function registerGroup(lines) {
  const group = [];

  for (let i = 0; i < lines.length; i++) {
    let lengthTotal = 0;
    for (let j = 0; j < lines[i].length; j++) {
      const item = lines[i][j];
      const previous = lines[i][j - 1] || {};
      item.init(previous.endX, previous.endY);
      lengthTotal += item.length;
    }

    for (let j = 0; j < lines[i].length; j++) {
      const item = lines[i][j];
      item.percent = item.length / lengthTotal;
    }

    group.push({
      parts: lines[i],
      length: lengthTotal
    });
  }

  groups.push(group);
  return groups.length - 1;
}

export function draw(groupId) {
  canvas = document.querySelector('canvas.background');
  context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 8;
  const lines = groups[groupId];
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines[i].parts.length; j++) {
      lines[i].parts[j].draw();
    }
  }
}

export function resize() {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];

    for (let j = 0; j < group.length; j++) {
      const parts = group[j].parts;
      let lengthTotal = 0;

      for (let n = 0; n < parts.length; n++) {
        const item = parts[n];
        const previous = parts[n - 1] || {};
        item.init(previous.endX, previous.endY);
        lengthTotal += item.length;
      }

      for (let n = 0; n < parts.length; n++) {
        const item = parts[n];
        item.percent = item.length / lengthTotal;
      }
      // console.log(lengthTotal)
      group[j].length = lengthTotal;
    }
  }
}

export function play(groupId, speed = 8, reverse = false) {
  frameDuration = speed * 5;
  canvas = document.querySelector('canvas.background');
  context = canvas.getContext('2d');
  context.lineWidth = 8;
  frameCounter = 0;

  // setup index tracking for reverse calculations
  for (let i = 0; i < groups[groupId].length; i++) {
    for (let j = 0; j < groups[groupId][i].parts.length; j++) {
      groups[groupId][i].parts[j].animated = false;
    }

    groups[groupId][i].animatingIndex = groups[groupId][i].parts.length - 1;
  }

  playFrame(groups[groupId], reverse);
}

function playFrame(group, reverse = false) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  let isDone = true;

  if (reverse) {
    for (let i = 0; i < group.length; i++) {
      let percent = 0;
      let reduce = false;

      if (group[i].animatingIndex === -1) continue;

      for (let j = group[i].parts.length - 1; j >= 0; j--) {
        const line = group[i].parts[j];

        if (j < group[i].animatingIndex) {
          line.draw();
        } else if (j === group[i].animatingIndex) {
          isDone = false;
          percent += line.playPercent;
          const currentLength = Math.floor(percent * group[i].length);
          const delta = Math.max(1, easeInOutQuad(frameCounter, 0, group[i].length, frameDuration)) - currentLength;
          line.playFrame(delta, true);
          reduce = line.animated;
        } else {
          percent += line.percent;
        }
      }

      if (reduce) group[i].animatingIndex -= 1;
    }
  } else {
    for (let i = 0; i < group.length; i++) {
      let percent = 0;
      for (let j = 0; j < group[i].parts.length; j++) {
        const line = group[i].parts[j];

        if (line.animated) {
          line.draw();
          percent += line.percent;
        } else {
          isDone = false;
          percent += line.playPercent;
          const currentLength = percent * group[i].length;
          const delta = Math.max(1, easeInOutQuad(frameCounter, 0, group[i].length, frameDuration)) - currentLength;
          line.playFrame(delta, false);
          break;
        }
      }
    }
  }

  frameCounter += 1;

  if (!isDone) {
    requestAnimationFrame(() => {
      playFrame(group, reverse);
    });
  }
}

function easeInOutQuad(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
}




export class Position {
  initialX;
  initialY;
  startX;
  startY;
  endX;
  endY;
  animated = false;
  length = 0;
  percent = 0;
  playPercent = 0;

  constructor(x, y) {
    this.initialX = x;
    this.initialY = y;
  }

  init() {
    this.endX = parsePosition(this.initialX);
    this.endY = parsePosition(this.initialY);
    this.startX = this.endX;
    this.startY = this.endY;
  }

  draw() {}
  playFrame() {
    this.animated = true;
  }
}

function getDistance(x1, y1, x2, y2) {
  let start = x1 - x2;
  let end = y1 - y2;
  return Math.sqrt(start * start + end * end);
}

export class Line {
  animating = false;
  animated = false;
  reversed = false;
  directionX;
  directionY;
  color;
  startX;
  startY;
  endX;
  endY;
  length;
  percent;
  currentX;
  currentY;
  playPercent = 0;
  initialLineX;
  initialLineY;

  constructor(color, lineX, lineY) {
    this.color = color;
    this.initialLineX = lineX;
    this.initialLineY = lineY;
  }

  init(startX, startY) {
    this.lineX = parsePosition(this.initialLineX);
    this.lineY = parsePosition(this.initialLineY);
    this.startX = parsePosition(startX);
    this.startY = parsePosition(startY);
    this.endX = this.lineX || this.startX;
    this.endY = this.lineY || this.startY;
    this.directionX = this.startX < this.endX ? 1 : -1;
    this.directionY = this.startY < this.endY ? 1 : -1;
    this.length = getDistance(this.startX, this.startY, this.endX, this.endY);
  }

  draw() {
    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(this.startX, this.startY);
    context.lineTo(this.endX, this.endY);
    context.stroke();
  }

  playFrame(factor, reverse = false) {
    this.animated = false;
    this.animating = true;
    this.reversed = false;

    if (!this.currentX) this.currentX = reverse ? this.endX : this.startX;
    if (!this.currentY) this.currentY = reverse ? this.endY : this.startY;

    let stepX = this.directionX * factor;
    let stepY = this.directionY * factor;

    let toX = reverse ? this.currentX - stepX : this.currentX + stepX;
    let toY = reverse ? this.currentY - stepY : this.currentY + stepY;
    let maxX = Math.abs(this.startX - this.endX) <= Math.abs(this.startX - toX);
    let maxY = Math.abs(this.startY - this.endY) <= Math.abs(this.startY - toY);
    if (reverse) {
      if (this.directionX < 0 && stepX > 0) maxX = true;
      if (this.directionX > 0 && stepX < 0) maxX = true;
      if (this.directionY < 0 && stepY > 0) maxY = true;
      if (this.directionY > 0 && stepY < 0) maxY = true;
    }
    
    if (maxX) toX = reverse ? this.startX : this.endX;
    if (maxY) toY = reverse ? this.startY : this.endY;
    this.currentX = toX;
    this.currentY = toY;
    let currentPercent = getDistance(this.startX, this.startY, toX, toY) / this.length;
    this.playPercent = currentPercent * this.percent;
    if (reverse) this.playPercent = this.percent - this.playPercent

    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(this.startX, this.startY);
    context.lineTo(toX, toY);
    context.stroke();
    
    if (maxX && maxY) {
      this.animated = true;
      this.animating = false;
      this.currentX = undefined;
      this.currentY = undefined;
      this.playPercent = 0;
      this.reversed = reverse;
    }
  }
}

export class Arch {
  direction;
  current;
  color;
  animating = false;
  animated = false;
  startX;
  startY;
  endX;
  endY;
  length;
  percent;
  currentDistance;
  playPercent = 0;
  reversed = false;


  constructor(color, radius, start, end, counterclockwise = false, offsetX = 0, offsetY = 0) {
    this.color = color;
    this.radius = radius;
    this.start = start;
    this.end = end;
    this.counterclockwise = counterclockwise;
    this.offsetX = parsePosition(offsetX);
    this.offsetY = parsePosition(offsetY);
  }

  init(startX, startY) {
    this.startX = parsePosition(startX);
    this.startY = parsePosition(startY);

    const radiusRadians = this.end * Math.PI / 180;
    this.endX = this.startX + this.offsetX + (this.radius * Math.cos(radiusRadians));
    this.endY = this.startY + this.offsetY + (this.radius * Math.sin(radiusRadians));
    this.direction = this.start < this.end ? 1 : -1;
    this.length = 2 * Math.PI * this.radius * (this.end - this.start) / 360;
  }

  draw() {
    context.strokeStyle = this.color;
    context.beginPath();
    context.arc(this.startX + this.offsetX, this.startY + this.offsetY, this.radius, this.start * Math.PI / 180, this.end * Math.PI / 180, this.counterclockwise);
    context.stroke();
  }

  playFrame(factor, reverse = false) {
    this.animated = false;
    this.animating = true;
    this.reversed = false;

    if (!this.current) {
      this.current = reverse ? this.end : this.start;
      this.currentDistance = 0;
    }

    let stepDistance = this.direction * factor;
    let stepPercent = Math.min(1, (this.currentDistance + stepDistance) / this.length);
    this.currentDistance = this.currentDistance + stepDistance;
    const max = this.length - this.currentDistance < 0.01;

    this.current = (stepPercent * (this.end - this.start)) + this.start;
    if (reverse) this.current = this.end - (stepPercent * (this.end - this.start));
    if (max) this.current = reverse ? this.start : this.end;
    this.playPercent = stepPercent * this.percent;

    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(this.startX, this.startY);
    context.moveTo(this.startX, this.startY);
    context.arc(this.startX + this.offsetX, this.startY + this.offsetY, this.radius, this.start * Math.PI / 180, this.current * Math.PI / 180, this.counterclockwise);
    context.stroke();

    if (max) {
      this.animated = true;
      this.animating = false;
      this.current = undefined;
      this.playPercent = 0;
      this.reversed = reverse;
    }
  }
}


function parsePosition(value) {
  if (typeof value === 'string') {
    return (parseFloat(value) / 100) * document.documentElement.clientWidth;
  }
  return value;
}
