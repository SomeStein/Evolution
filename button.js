class Button {
  constructor(x, y, w, h, round, id, text, col, ButtonFunction, visible = true) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.round = round;
    this.id = id
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

class DropDown extends Button {
  constructor(x, y, w, h, round, id, text, col, ButtonFunction, visible = true, orientation, nameList, functionList) {
    super(x, y, w, h, round, id, text, col, ButtonFunction, visible = true)
    this.orientation = orientation
    this.nameList = nameList
    this.functionList = functionList

    if (this.orientation == 0) {
      this.Xoffset = 0
      this.Yoffset = this.h
    }
    else if (this.orientation == 1) {
      this.Xoffset = this.w
      this.Yoffset = 0
    }
    else {
      this.Xoffset = 0
    }

    for (let i = 0; i < this.nameList.length; i++) {
      let button = new Button(this.x + this.Xoffset, this.y + this.Yoffset,)
    }
  }
}
