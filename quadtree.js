function pointInCircle(px, py, cx, cy, cr) {
   pv = createVector(px, py);
   cv = createVector(cx, cy);
   return (pv.dist(cv) <= cr);

}


//Boundaries for Quadsections, handles intersection of Quadrant and ViewingCircle 
class Boundary {
   constructor(x, y, w, h) {
      this.pos = createVector(x, y);
      this.w = w;
      this.h = h;
   }

   isContained(x, y, r) {
      return (pointInCircle(this.x, this.y, x, y, r) &&
         pointInCircle(this.x + this.w, this.y, x, y, r) &&
         pointInCircle(this.x, this.y + this.h, x, y, r) &&
         pointInCircle(this.x + this.w, this.y + this.h, x, y, r))

   }

   //containing pos point of instance?
   contains(instance) {
      return (
         instance.pos.x >= this.pos.x &&
         instance.pos.x < this.pos.x + this.w &&
         instance.pos.y >= this.pos.y &&
         instance.pos.y < this.pos.y + this.h
      );
   }

   //Boundary rect intersection with x,y,r circle?
   intersects(x, y, r) {
      const xRect = this.pos.x
      const yRect = this.pos.y
      const w = this.w
      const h = this.h

      //outside big box?
      if (x <= xRect - r ||
         x >= xRect + w + r ||
         y <= yRect - r ||
         y >= yRect + h + r) {
         return false

      }
      //inside small box ? 
      else if ((x <= xRect + w && x >= xRect)
         || (y <= yRect + h && y >= yRect)) {
         return true
      }
      //corner case 
      else {
         abs(circle.x - rect.x);
         abs(circle.y - rect.y);
         let cornerX = abs(x - xRect - w / 2) - w / 2
         let cornerY = abs(y - yRect - h / 2) - h / 2
         return (r * r >= cornerX * cornerX + cornerY * cornerY)
      }
   }

   //Debugging
   show(color) {
      stroke(color);
      strokeWeight(3);
      noFill()
      rect(this.pos.x, this.pos.y, this.w, this.h)
   }
}

//Recursive Quadtree for instance query effeciency improvement 
class QuadTree {

   //Boundary as Quadrants, max capacity, max depth of Tree
   constructor(boundary, cap, depth) {
      this.boundary = boundary;
      this.capacity = cap;
      this.depth = depth;
      this.maxDepth = 60;
      this.instances = [];
      this.divided = false;
   }

   // creating 4 new branches 
   subdivide() {
      let x = this.boundary.pos.x;
      let y = this.boundary.pos.y;
      let w = this.boundary.w;
      let h = this.boundary.h;
      let ne = new Boundary(x + w / 2, y, w / 2, h / 2);
      this.northeast = new QuadTree(ne, this.capacity, this.depth + 1);
      let nw = new Boundary(x, y, w / 2, h / 2);
      this.northwest = new QuadTree(nw, this.capacity, this.depth + 1);
      let se = new Boundary(x + w / 2, y + h / 2, w / 2, h / 2);
      this.southeast = new QuadTree(se, this.capacity, this.depth + 1);
      let sw = new Boundary(x, y + h / 2, w / 2, h / 2);
      this.southwest = new QuadTree(sw, this.capacity, this.depth + 1);
      this.divided = true;
   }

   //inserting for every element in list
   insertList(list) {
      for (let i = 0; i < list.length; i++) {
         let instance = list[i]
         if (instance) {
            this.insert(instance);
         }
      }
   }

   //put new object into the quadtree 

   insert(instance) {
      if (!this.boundary.contains(instance)) {
         return false;
      }
      if (this.divided) {
         if (this.northeast.insert(instance)) {
            return true;
         } else if (this.northwest.insert(instance)) {
            return true;
         } else if (this.southeast.insert(instance)) {
            return true;
         } else if (this.southwest.insert(instance)) {
            return true;
         }
      }
      else if (this.instances.length == this.capacity && this.depth < this.maxDepth) {
         this.subdivide()
         this.instances.push(instance)
         this.insertList(this.instances)
         this.instances = []
         return true
      }
      else {
         this.instances.push(instance)
         return true
      }
   }

   //returning all instances of tree in a list
   allInstances() {
      if (this.divided) {
         return this.northwest.allInstances().concat(
            this.northeast.allInstances(),
            this.southwest.allInstances(),
            this.southeast.allInstances())
      }
      return this.instances
   }

   //rebuilding the tree with new positions
   update() {
      let allInstances = this.allInstances();
      let qt = new QuadTree(this.boundary, this.capacity, this.depth)
      qt.insertList(allInstances)
      return qt
   }

   //query all instances in the tree that are in a given circle
   instancesInView(x, y, r, found) {
      if (!found) {
         found = [];
      }
      debugQuadtreeFetchingCounter.next()
      if (!this.boundary.intersects(x, y, r)) {
         return;
      } else if (this.instances.length > 0) {
         //this.boundary.show(color("green"))
         for (let instance of this.instances) {
            debugQuadtreeFetchingCounter.next()
            if (instance.pos.dist(createVector(x, y)) < r) {
               found.push(instance);
            }
         }
      }

      if (this.divided) {
         this.northwest.instancesInView(x, y, r, found);
         this.northeast.instancesInView(x, y, r, found);
         this.southwest.instancesInView(x, y, r, found);
         this.southeast.instancesInView(x, y, r, found);
      }

      return found;
   }

   //Debugging
   show() {
      if (this.divided) {
         this.northwest.show()
         this.northeast.show()
         this.southwest.show()
         this.southeast.show()
      }
      else if (this.instances.length > 0) {
         stroke(255);
         strokeWeight(0.5);
         noFill()
         fill(map(this.instances.length, 0, this.capacity, 0, 255), 150);
         rect(this.boundary.pos.x, this.boundary.pos.y, this.boundary.w, this.boundary.h);
      }




   }
}