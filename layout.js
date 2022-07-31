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
    this.ButtonFunction(this);
  }
}

class DropDown extends Button {
  constructor(x, y, w, h, round, id, text, col, orientation, nameList, functionList, visible = true) {


    this.orientation = orientation
    this.nameList = nameList
    this.functionList = functionList
    this.buttons = []
    this.buttonsVisibility = false

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
      this.Yoffset = this.h
    }

    for (let i = 0; i < this.nameList.length; i++) {
      let button = new Button(this.x + this.Xoffset,
        this.y + this.Yoffset,
        this.w,
        this.h,
        this.round,
        this.id + " " + this.nameList[i],
        this.nameList[i],
        this.col,
        this.functionList[i],
        false)
      Buttons[button.id] = button
      this.buttons.push(button)
    }
    let ButtonFunction = function () {
      let visible = !this.buttonsVisibility
      for (let button of this.buttons) {
        button.visible = visible
      }
    }
    super(x, y, w, h, round, id, text, col, ButtonFunction, visible = true)
  }
}

class InfoScreen {
  constructor(text, x, y, w, col) {
    this.text = text
    this.x = x
    this.y = y
    this.w = w
    this.col = col
  }

  showInfo(Info) {
    
    if (Info.length > 0) {
      noStroke()
      fill(this.col)
      rect(this.x, this.y, this.w, Info.length * 25 + 25)
      fill(0)
      text(this.text, this.x + this.w / 2, this.y + 12.5)
    }
    for (let i = 0; i < Info.length; i++) {
      text(Info[i], this.x + this.w / 2, this.y + i * 25 + 37.5)
    }
  }
}
