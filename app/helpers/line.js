const pi2 = Math.PI * 2;

export default class Line {
  #context;
  #points;
  #color;
  #width;
  #animation = true;
  #num = 0;
  #lastTime = 0;

  constructor(context, points, color, width) {
    this.#context = context;
    this.#points = points;
    this.#color = color;
    this.#width = width;
  }

  draw(seconds) {
    let i;
    let drawObj;
    let len = this.#points.length;
    let xGoal;
    let yGoal;
    let startGoal;
    let endGoal;
    let pos;

    this.#context.lineWidth = this.#width;
    this.#context.strokeStyle = this.#color;


    if (!this.#animation) {
      for (i = 0; i < len; i++) {
        drawObj = this.#points[i];

        if (drawObj instanceof Path) {
          this.drawLine(drawObj.startX, drawObj.startY, drawObj.endX, drawObj.endY);
        } else {
          this.drawArch(drawObj.startX, drawObj.startY, drawObj.startAngle, drawObj.endAngle, drawObj.radius);
        }
      }
    } else if (this.#num < len) {
      for (i = 0; i < len; i++) {
        drawObj = this.#points[i];
        pos = (seconds - this.#lastTime) / drawObj.time;

        if (pos > 1){
          pos = 1;
          this.#num++;
          this.#lastTime = seconds;
          if (this.#num >= len) this.#animation = false;
        }

        if (drawObj instanceof Path) {
          if (i == this.#num) {
            xGoal = drawObj.startX + (drawObj.endX - drawObj.startX) * pos;
            yGoal = drawObj.startY + (drawObj.endY - drawObj.startY) * pos;

            this.drawLine(drawObj.startX, drawObj.startY, xGoal, yGoal);
          } else if (i < this.num) {
            this.drawLine(drawObj.startX, drawObj.startY, drawObj.endX, drawObj.endY);
          }
        } else {
          if (i == this.#num) {
            startGoal = drawObj.startAngle;
            endGoal = drawObj.endAngle;
            if ((drawObj.enterDirection == 0 && drawObj.direction == 1) || (drawObj.enterDirection == 3 && drawObj.direction == 0) || (drawObj.enterDirection == 2 && drawObj.direction == 3)) {
              if (startGoal > endGoal) {
                endGoal = startGoal + (pi2 - startGoal) * pos;
              } else {
                endGoal = drawObj.startAngle + (drawObj.endAngle - drawObj.startAngle) * pos;
              }
            } else {
              if (startGoal > endGoal) {
                startGoal = pi2 - ((pi2 - startGoal) * pos)
              } else {
                startGoal = drawObj.endAngle + (drawObj.startAngle - drawObj.endAngle) * pos;
              }
            }

            this.drawArch(drawObj.startX, drawObj.startY, startGoal, endGoal, drawObj.radius);
          } else if (i < this.#num) {
            this.drawArch(drawObj.startX, drawObj.startY, drawObj.startAngle, drawObj.endAngle, drawObj.radius);
          }
        }
      }
    }
  }

  drawLine(x, y, x2, y2) {
    this.#context.beginPath();
    this.#context.moveTo(x, y);
    this.#context.lineTo(x2, y2);
    this.#context.stroke();
  }

  drawArch(x, y, start, end, radius) {
    this.#context.beginPath();
    this.#context.arc(x, y, radius, start, end, false);
    this.#context.stroke();
  }
}
