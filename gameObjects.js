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
      this.age = 0;
      this.target = this
      this.lastTarget = this
      this.viewingRadius = 40;
      this.hunger = 6000
      this.dead = false
   }

   move(target) {
      this.pos.add(this.target.pos.copy().sub(this.pos).limit(this.dna[0]));
   }

   chooseTarget(qt) {
      let instances = qt.instancesInView(this.pos.x, this.pos.y, this.viewingRadius)
      
      if (instances.length > 0){
         let nearest = instances[0]
         let nearestDist = nearest.pos.dist(this.pos)
         for(let i = 1; i < instances.length; i++){
            if(instances[i].pos.dist(this.pos) < nearestDist || nearest == this){
               nearest = instances[i]
               nearestDist = nearest.pos.dist(this.pos)
            }  
         }
         return nearest
      }
      console.log("not nearest")
      let noise1 = (noise(frameCount / 100 + 1 + 100 * this.id) - 0.5) * 10
      let noise2 = (noise(frameCount / 100 + 2 + 100 * this.id) - 0.5) * 10
      let obj = { pos: createVector(noise1, noise2).add(this.lastTarget.pos) }
      if (MainBoundary.contains(obj)) {
         return obj
      }
      else {
         obj.pos.x = MainBoundary.pos.x + MainBoundary.w / 2
         obj.pos.y = MainBoundary.pos.y + MainBoundary.h / 2
         return obj
      }
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
         if (frameCount - this.deathTime > 300) {

            this.c = color(0, 40, 200, 50)
         }
      }
      else if (this.dead) {
         return
      }
      let c = this.c || color(0, 40, 200)
      noStroke();
      fill(c);
      ellipse(this.pos.x, this.pos.y, 10);
      noFill();
      stroke(255)
      //ellipse(this.pos.x, this.pos.y, this.viewingRadius*2);
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

//BUILDINGS

class Building extends gameObject {
   constructor(id, x, y) {
      super(id, x, y)

   }
}