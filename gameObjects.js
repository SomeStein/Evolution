class gameObject {
   constructor(id, x, y) {
      this.id = id
      this.pos = createVector(x, y)
   }
}

//CREATURES

class Creature extends gameObject {
   constructor(id, x, y, dna = [0, 0, 0]) {
      super(id, x, y)
      this.dna = dna;
      this.speed = 0.5
      this.age = 0;
      this.target = this
      this.lastTarget = this
      this.viewingRadius = 40;
      this.hunger = 60000
      this.dead = false
   }

   move(target) {
      this.pos.add(p5.Vector.sub(this.target.pos, this.pos).limit(this.speed));
   }

   chooseTarget(qt) {
      let angle = noise(frameCount / 100 + this.id * 10) * TWO_PI * 4
      let v = p5.Vector.fromAngle(angle)
      v.add(this.pos)
      let obj = { pos: v }
      return obj
   }

   update(qt) {

      if (this.dead) {
         // if(frameCount - this.deathTime > 100 ){
         //    delete this.world[this.id]
         // }
         return
      }

      //aging
      this.age += 1

      //hunger
      this.hunger -= 1

      //if hunger <= 0 dieing
      if (this.hunger <= 0) {
         this.die()
      }

      //choosing new target after reaching last one
      if (this.pos.dist(this.target.pos) < 1) {
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
   }

   show() {
      if (this.dead && DebugOptions["Debug Dead"]) {
         this.c = color(0, 40, 200, 50)
      }

      noStroke()
      fill(200, 0, 0)
      ellipse(this.target.pos.x, this.target.pos.y, 5)
      let c = this.c || color(0, 40, 200)
      fill(c);
      ellipse(this.pos.x, this.pos.y, 10);

      if (DebugOptions["Debug Dead"]) {
         noFill();
         stroke(0)
         ellipse(this.pos.x, this.pos.y, this.viewingRadius * 2);
      }

   }

}

class Human extends Creature {
   constructor(id, x, y, dna) {
      super(id, x, y, dna);
   }

   breed(otherHuman, id) {
      let dna = this.mutate(this.dna, otherHuman.dna);
      let baby = new Human(id, this.x, this.y, dna);

   }
}
