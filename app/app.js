import { Position, Line, Arch, registerGroup, draw, play, resize } from "./draw.js";
import { init } from './distortion.js';

const canvas = document.querySelector('canvas.background');
const context = canvas.getContext('2d');
const green = '#b2e646';
const yellow = '#e0b74f';
const blue = '#0ec8f7';
const pink = '#ff0094';
let animated = false;
let page = location.pathname;
document.body.classList.toggle('timewarp', page === '/timewarp');


window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  resize();

  let groupId = group1;
  if (page === '/timewarp') groupId = group2;

  if (!animated) {
    animated = true;
    play(groupId, 8, false);
  } else draw(groupId);
}

window.addEventListener('locationchange', () => {
  page = location.pathname;

  if (animated) {
    play(page === '/timewarp' ? group1 : group2, 2, true);
    setTimeout(() => {
      document.body.classList.toggle('timewarp', page === '/timewarp');
      animated = false;

      setTimeout(() => {
        resizeCanvas();
      }, 180);
    }, 220);
  } else {
    document.body.classList.toggle('timewarp', page === '/timewarp');
    setTimeout(() => {
      resizeCanvas();
    }, 180);
  }
})


const group1 = registerGroup([
  [
    new Position('50%', 70),
    new Line(pink, '12%', undefined),
  ],
  [
    new Position('50%', 90),
    new Line(blue, '14%', undefined)
  ],
  [
    new Position('50%', 110),
    new Line(yellow, '18%', undefined)
  ],
  [
    new Position('50%', 130),
    new Line(green, '22%', undefined)
  ],

  [
    new Position('50%', 70),
    new Line(pink, '88%', undefined)
  ],

  [
    new Position('50%', 90),
    new Line(blue, '86%', undefined)
  ],

  [
    new Position('50%', 110),
    new Line(yellow, '82%', undefined)
  ],

  [
    new Position('50%', 130),
    new Line(green, '78%', undefined)
  ]
]);


const group2 = registerGroup([
  [
    new Position(100, 50),
    new Line(pink, 386, undefined),

  ],

  [
    new Position(100, 76),
    new Line(blue, 320, undefined)
  ],

  [
    new Position(100, 102),
    new Line(yellow, 240, undefined)
  ],

  [
    new Position(100, 130),
    new Line(green, 160, undefined)
  ]
]);

document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  init();
  setTimeout(() => {
    document.body.classList.add('animate');
  }, 100);
});
