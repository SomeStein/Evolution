// generating world in default setup 
// map is graphic object generated in world class 
// trees, bushes, rocks, ores on top as instances ( for later mining implementation )
// buildings, creatures on top of that 

class World {
   constructor(w, h, TS, TR, seed = 98) {
      this.w = w
      this.h = h
      this.tileSet = TS
      this.tileRef = TR
      this.map = this.generateMap(seed)
   }

   generateMap(seed = 97) {
      let size = this.tileRef.tileSize
      let tileMap = createGraphics(this.w, this.h)
      let tiles = []
      tileMap.background(255)
      noiseSeed(seed);

      let grassImages =
         [this.tileSet.get(0 * 16, 0 * 16, 16, 16),
         this.tileSet.get(1 * 16, 0 * 16, 16, 16),
         this.tileSet.get(2 * 16, 0 * 16, 16, 16),
         this.tileSet.get(3 * 16, 0 * 16, 16, 16)]

      let waterImages =
         [this.tileSet.get(0 * 16, 24 * 16, 16, 16),
         this.tileSet.get(1 * 16, 24 * 16, 16, 16),
         this.tileSet.get(2 * 16, 24 * 16, 16, 16),
         this.tileSet.get(3 * 16, 24 * 16, 16, 16)]

      let flowerImages =
         [this.tileSet.get(1 * 16, 43 * 16, 16, 16),
         this.tileSet.get(2 * 16, 43 * 16, 16, 16)]

      let treeImages =
         [this.tileSet.get(4 * 16, 0 * 16, 16, 16),
         this.tileSet.get(5 * 16, 0 * 16, 16, 16),
         this.tileSet.get(6 * 16, 0 * 16, 16, 16),
         // this.tileSet.get(5 * 16, 43 * 16, 16, 16),
         // this.tileSet.get(6 * 16, 43 * 16, 16, 16),
         this.tileSet.get(6 * 16, 1 * 16, 16, 16),
         this.tileSet.get(6 * 16, 3 * 16, 16, 16)]

      let hillImages =
         [this.tileSet.get(6 * 16, 1 * 16, 16, 16),
         this.tileSet.get(6 * 16, 3 * 16, 16, 16),]

      let mountainImages =
         [this.tileSet.get(3 * 16, 1 * 16, 16, 16),
         this.tileSet.get(4 * 16, 1 * 16, 16, 16),
         this.tileSet.get(5 * 16, 1 * 16, 16, 16),
         this.tileSet.get(6 * 16, 28 * 16, 16, 16),
         this.tileSet.get(6 * 16, 29 * 16, 16, 16)]

      // Pass 0
      tileMap.noStroke();
      for (let i = 0; i < this.w / size; i++) {
         tiles[i] = []
         for (let j = 0; j < this.h / size; j++) {
            let noiseValue = noise(i / 100, j / 100) + 0.05
            let v = createVector(i * size, j * size)
            noiseValue -= constrain((p5.Vector.dist(v, createVector(this.w / 2, this.h / 2))) / 4000, 0.1, 0.6)
            noiseValue / 2
            if (noiseValue < 0.2) {
               noiseValue = 0.2
            }
            else if (noiseValue < 0.25) {
               noiseValue = 0.25
            }
            else if (noiseValue < 0.55) {
               noiseValue = 0.55
            }
            else if (noiseValue < 0.6) {
               noiseValue = 0.6
            }
            else { noiseValue = 1 }
            tiles[i][j] = noiseValue


            tileMap.fill(color(noiseValue * 255), 30);
            tileMap.rect(i * size, j * size, size);
         }
      }

      //Pass 1
      for (let i = 0; i < this.w / size; i++) {
         for (let j = 0; j < this.h / size; j++) {
            let val = tiles[i][j]
            let img
            if (val == 0.2) {
               img = random(waterImages)
            }
            else {
               img = random(grassImages)
            }
            tileMap.image(img, i * size, j * size)
         }
      }

      //Pass 2
      for (let i = 0; i < this.w / size; i++) {
         for (let j = 0; j < this.h / size; j++) {
            let val = tiles[i][j]
            let img
            if (val == 1) {
               img = random(mountainImages)
               tileMap.image(img, i * size + 1, j * size + 1, 14, 14)
            }
            else if (val > 0.55) {
               if (random() < 0.5) {
                  img = random(treeImages)
                  tileMap.image(img, i * size + 1, j * size + 1, 14, 14)
               }
            }
            else if (val > 0.25) {
               if (random() < 0.1) {
                  img = random(treeImages)
                  tileMap.image(img, i * size + 1, j * size + 1, 14, 14)
               }
               else if (random() < 0.3) {
                  img = random(flowerImages)
                  tileMap.image(img, i * size + 1, j * size + 1, 14, 14)
               }
            }
         }
      }

      return tileMap
   }

   show() {
      //image(this.map, -this.w / 2, -this.h / 2)
      image(this.map, -this.w/2 + width/2, -this.h/2 +height/2)
   }

}