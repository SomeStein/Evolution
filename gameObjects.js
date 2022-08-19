class gameObject {
   constructor(id, x, y, img) {
      this.id = id
      this.pos = createVector(x, y)
      this.img = img
   }

   update(){
      return
   }

   show(){
      fill(255,100)
      ellipse(this.pos.x,this.pos.y,5)
   }
}

//CREATURES

class Creature extends gameObject {
   constructor(id, x, y, img, dna = [0.3, 50, 0]) {
      super(id, x, y, img)
      this.dna = dna;
      this.speed = dna[0];
      this.viewingRadius = dna[1];
      this.hunger = dna[2];
      this.age = 0;
      this.health = 100
      this.target = this;
      this.lastTarget = this;
      this.dead = false;
   }

   move(target) {
      //check Terrain 
      let viscosity = 1
      this.pos.add(p5.Vector.sub(this.target.pos, this.pos).limit(this.speed * viscosity));
   }

   chooseTarget(qt) {
      let angle = noise(frameCount / 1000 + this.id * 10) * TWO_PI * 4
      let v = p5.Vector.fromAngle(angle).setMag(10)
      v.add(this.pos)
      let obj = { pos: v }
      if (!(MainBoundary.contains(obj))) {
         return this
      }
      return obj
   }

   update(qt) {

      //dies
      if (this.health <= 0) {
         this.die()
      }

      //dead
      if (this.dead) {
         return
      }

      //aging
      this.age += 1

      //hunger
      this.hunger += 0.1
      this.hunger = constrain(this.hunger, 0, 300)

      //hunger removes health 
      if (this.hunger > 100) {
         this.health -= this.hunger / 100
      }

      //choosing new target after reaching last one
      if (this.pos.dist(this.target.pos) < 3 || this.target.dead) {
         this.lastTarget = this.target;
         this.target = this.chooseTarget(qt);
      }

      //moving towards target if existing
      if (this.target) {
         this.move(this.target);
      }
   }

   die() {
      this.dead = true
      this.deathTime = frameCount
      this.deathAge = this.age
   }

   show() {
      noStroke()
      if (this.dead) {
         if (DebugOptions["Debug CreatureInfo"] || this.info) {
            let c = this.c || color(255, 100)
            c.setAlpha(100)
            fill(255,0,0, 50)
            ellipse(this.pos.x, this.pos.y, this.viewingRadius * 2)
            fill(c)
            noStroke()
            this.img ? image(this.img, this.pos.x - 8, this.pos.y - 8) : ellipse(this.pos.x, this.pos.y, 7)
            textSize(10)
            fill(255, 150)
            text("health: " + str(round(this.health)), this.pos.x, this.pos.y)
            text("hunger: " + str(round(this.hunger)), this.pos.x, this.pos.y + 10)
         }
         else {
            return
         }
      }
      else {
         let c = this.c || color(255)
         if (DebugOptions["Debug CreatureInfo"] || this.info) {
            fill(255, 70)
            ellipse(this.pos.x, this.pos.y, this.viewingRadius * 2)
            fill(c)
            noStroke()
            this.img ? image(this.img, this.pos.x - 8, this.pos.y - 8) : ellipse(this.pos.x, this.pos.y, 7)
            textSize(10)
            fill(255)
            text("health: " + str(round(this.health)), this.pos.x, this.pos.y)
            text("hunger: " + str(round(this.hunger)), this.pos.x, this.pos.y + 10)
         }
         else {
            fill(c)
            noStroke()
            this.img ? image(this.img, this.pos.x - 8, this.pos.y - 8, 10,10) : ellipse(this.pos.x, this.pos.y, 7)
         }
      }
   }

}

class Human extends Creature {
   constructor(id, x, y, img, dna) {
      super(id, x, y, img, dna);
      this.c = color(0, 0, 200)
      this.speed = 0.15
   }

   chooseTarget(qt) {
      let others = qt.instancesInView(this.pos.x, this.pos.y, this.viewingRadius)
      let nearestDist = Infinity
      let nearest
      for (let i = 0; i < others.length; i++) {
         let other = others[i]
         if (other.constructor.name === "Food") {
            if (this.pos.dist(other.pos) < nearestDist) {
               nearest = other
               nearestDist = this.pos.dist(other.pos)
            }
         }
      }
      return nearest || this
   }

   update(qt) {
      if (this.pos.dist(this.target.pos) < 3) {
         if (!(this.target == this)) {
            this.target.amount -= 1
            this.health += 200
            this.hunger = 0
         }
      }
      super.update(qt)
   }


   breed(otherHuman, id) {
      let dna = this.mutate(this.dna, otherHuman.dna);
      let baby = new Human(id, this.x, this.y, dna);

   }
}

class Bear extends Creature {
   constructor(id, x, y, img, dna) {
      super(id, x, y, img, dna)
      this.c = color(200, 0, 0)
      this.speed = 0.3
   }
   chooseTarget(qt) {
      let others = qt.instancesInView(this.pos.x, this.pos.y, this.viewingRadius)
      let nearestDist = Infinity
      let nearest
      for (let i = 0; i < others.length; i++) {
         let other = others[i]
         if (other.constructor.name === "Human") {
            if (this.pos.dist(other.pos) < nearestDist) {
               nearest = other
               nearestDist = this.pos.dist(other.pos)
            }
         }
      }
      return nearest || this
   }

   update(qt) {
      if (this.pos.dist(this.target.pos) < 3) {
         if (!(this.target == this)) {
            this.target.die()
            this.health += 200
            this.hunger = 0
         }
      }
      super.update(qt)
   }
}

class Food extends gameObject {
   constructor(id, x, y, amount) {
      super(id, x, y)
      this.amount = amount
   }
   update(){
      if(this.amount <= 0){
         this.dead = true
         delete WorldObjects[this.id]
      }
   }

}
