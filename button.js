class Button {
  constructor(x, y, w, h, round, text, col, ButtonFunction, visible = true) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.round = round;
    this.text = text;
    this.col = col;
    this.visible = visible;
    this.highlightColor = lerpColor(col, color("WHITE"), 0.2);
    this.ButtonFunction = ButtonFunction;
  }

  show() {
    let c;
    if (this.hoverOver(mouseX, mouseY)) {
      c = this.highlightColor;
    } else {
      c = this.col;
    }
    fill(c);
    noStroke();
    rect(this.x, this.y, this.w, this.h, this.round);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(15);
    text(this.text, this.x + this.w / 2, this.y + this.h / 2);
  }

  hoverOver(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.w &&
      y >= this.y &&
      y <= this.y + this.h &&
      this.visible
    );
  }

  click() {
    this.ButtonFunction();
  }
}
