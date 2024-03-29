class Sun extends Vector2 {
    /*
    Point from which rays are emitted. A Sun can be controlled
    */
    constructor(x,y) {
        super(x,y);
        this.vel = new Vector2(0,0);
        this.acc = new Vector2(0,0);
        this.maxSpeed = 7;
        this.dragged = false;
        this.free = false;
        this.doDraw = false;
        this.directControl = false;
        this.size = 20;
        //this.color = "rgba(255,255,255,0.015)";
        this.color = [255,255,255];
    }

    speedUp() {
        return 3;
    }

    speedDown() {
        if (this.free)
            return 0.99;
        else
            return 0.9;
    }

    getInput() {
        if (this.directControl) {
            this.x += inpt.x * this.maxSpeed;
            this.y += inpt.y * this.maxSpeed;
            return;
        }

        this.acc.set(0,0);
        this.acc.x = inpt.x*this.speedUp();
        this.acc.y = inpt.y*this.speedUp();
    }

    update() {
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;

        if (!this.free && this.vel.len() > this.maxSpeed)
            this.vel.scale(this.maxSpeed);
        else if (this.free && this.vel.len() > this.maxSpeed*10)
            this.vel.scale(this.maxSpeed*5);

        this.x += this.vel.x;
        this.y += this.vel.y;

        if (inpt.x==0 && inpt.y==0) {
            this.vel.x *= this.speedDown();
            this.vel.y *= this.speedDown();
        }

        if (this.x > canvas.width) {
            this.vel.x *= -1;
            this.x = canvas.width;
        }
        else if (this.x < 0) {
            this.vel.x *= -1;
            this.x = 0;
        }
        if (this.y > canvas.height) {
            this.vel.y *= -1;
            this.y = canvas.height;
        }
        else if (this.y < 0) {
            this.vel.y *= -1;
            this.y = 0;
        }
    }

    draw() {
        ctx.strokeStyle = "red";
        ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI, false);
        ctx.stroke();
    }
}

class Scene {
    constructor() {
        this.blocks = [];
        this.rays = [];
        this.diffuseRays = [];
        this.reflectedRays = [];
        //this.suns = [];
        this.samples = 4500;
        this.maxSamples = 1.5*this.samples;
        this.reflectiveSplit = 0.8;
        this.resolveBlocks = true;
        this.shimmer = true;
        this.secondaryBounces = 1;
        this.sun = new Sun(canvas.width/2, canvas.height/2);
    }

    setSamples(samples) {
        this.samples = samples;
        this.maxSamples = 1.5*samples;
    }

    addBlock(block) {
        block.parent = this;
        block.index = this.blocks.length;
        this.blocks.push(block);
    }

    addRay(ray) {
        ray.parent = this;
        this.rays.push(ray);
    }

    addSun() {
        var newSun = new Sun(
            random(0, canvas.width),
            random(0, canvas.height)
        );
        this.suns.push( newSun );
        this.castRays();
    }

    castRays() {
        var angle = 2*Math.PI/this.samples;
        for (var i=0; i<this.samples; i++) {
            var ray = new Ray();
            ray.origin = this.sun;
            ray.color = this.sun.color;
            if (this.shimmer)
                ray.vector.rotate(random(0, 2*Math.PI));
            else
                ray.vector.rotate(i*angle);
            this.addRay(ray);
        }
    }

    recastRays() {
        this.diffuseRays = [];
        this.reflectedRays = [];
        for (var i=0; i<this.rays.length; i++) {
            this.rays[i].color = this.sun.color;
            this.rays[i].vector.scale(canvas.width*2);
            if (this.shimmer)
                this.rays[i].vector.rotate(random(0, 2*Math.PI));
        }
    }

    createNewDiffuseRay(ray, block, intersect) {
        var newRay = ray.copy();
        newRay.diffuse = true;
        newRay.origin.set(intersect.x, intersect.y);
        newRay.vector.rotate(random(0,2*Math.PI));
        newRay.vector.scale(canvas.width*2);
        this.diffuseRays.push(newRay);
    }

    createNewReflectedRay(ray, block, intersect) {
        var newRay = ray.copy();
        newRay.origin.set(intersect.x, intersect.y);

        //Rotate block if necessary
        if (this.resolveBlocks && block.checkFlipped(newRay)) {
            block.flip();
        }

        var norm = block.vector.normal();
        norm.scale(1);
        var angle = 2*newRay.vector.angleBetween(block.vector);

        newRay.origin = newRay.origin.subtract(norm);
        newRay.vector.rotate(angle);
        newRay.vector.scale(canvas.width*2);
        this.reflectedRays.push(newRay);
    }

    calculateBounces(rays) {
        for (var i=0; i<rays.length; i++) {
            var ray = rays[i];
            for (var j=0; j<this.blocks.length; j++) {
                var block = this.blocks[j];
                var rand = Math.random();
                var intersect = checkLineIntersection(ray, block);
                if (intersect) {
                    ray.vector = intersect.subtract(ray.origin);
                    if (rand > this.reflectiveSplit && this.getTotalRays() < this.maxSamples) {
                        this.createNewDiffuseRay(ray, block, intersect);
                    }
                    else if (this.getTotalRays() < this.maxSamples) {
                        this.createNewReflectedRay(ray, block, intersect);
                    }
                }
            }
        }
    }

    calculateStops(rays) {
        for (var i=0; i<rays.length; i++) {
            var ray = rays[i];
            for (var j=0; j<this.blocks.length; j++) {
                var block = this.blocks[j];
                var intersect = checkLineIntersection(ray, block);
                if (intersect)
                    ray.vector = intersect.subtract(ray.origin);
            }
        }
    }

    getTotalRays() {
        return this.rays.length+this.reflectedRays.length+this.diffuseRays.length;
    }

    sortBlocks(obj) {
        this.blocks.sort(function(blockA, blockB) {
            var a = blockA.center().subtract(scene.sun);
            var b = blockB.center().subtract(scene.sun);
            return a.len() - b.len();
        });
    }

    sortBlocks2(ray) {
        this.blocks.sort(function(blockA, blockB) {
            var a = blockA.center().subtract(ray.origin);
            var b = blockB.center().subtract(ray.origin);
            return a.len() - b.len();
        });
    }

    update() {
        this.sun.getInput();
        this.sun.update();

        //Ensure blocks are in right order
        this.sortBlocks(this.sun);

        this.recastRays();
        this.calculateBounces(this.rays);
        for (var i=0; i<this.secondaryBounces; i++)
            this.calculateBounces(this.reflectedRays);
        this.calculateStops(this.reflectedRays);
    }

    draw() {
        for (var i=0; i<this.rays.length; i++) {
            this.rays[i].draw();
        }
        for (var i=0; i<this.diffuseRays.length; i++) {
            this.diffuseRays[i].draw();
        }
        for (var i=0; i<this.reflectedRays.length; i++) {
            this.reflectedRays[i].draw();
        }
        if (this.visibleBlocks) {
            for (var i=0; i<this.blocks.length; i++) {
                this.blocks[i].draw();
            }
        }
        if (this.sun.doDraw)
            this.sun.draw();
    }

    save() {
        var nums = '';
        var tmp;
        for (var i=0; i<this.blocks.length; i++) {
            var block = this.blocks[i];
            var blockVals = [
                block.origin.x,
                block.origin.y,
                block.vector.x,
                block.vector.y
            ];
            for (var j in blockVals) {
                if (j!=0)
                    nums += ':';
                nums += blockVals[j];
            }
            nums += ',';
        }
        return nums;
    }

    loadFile(filepath) {
      var client = new XMLHttpRequest();
      var self = this;
      client.open('GET', filepath);
      client.onreadystatechange = function() {
        self.loadString(client.responseText);
      }
      client.send();
    }

    loadString(saveString) {
        this.blocks = [];
        var newBlocks = saveString.split(',');
        for (var i=0; i<newBlocks.length; i++) {
            var vals = newBlocks[i].split(':');
            var newBlock = new Block();
            newBlock.origin.x = parseInt(vals[0]);
            newBlock.origin.y = parseInt(vals[1]);
            newBlock.vector.x = parseInt(vals[2]);
            newBlock.vector.y = parseInt(vals[3]);
            this.blocks.push(newBlock);
        }
    }
}

class Block {
    constructor() {
        this.parent = null;
        this.origin = new Vector2(0,0);
        this.vector = new Vector2(0,0);
        this.flipped = false;
        this.index = 0;
    }

    center() {
        return this.origin.add(this.vector.scalarMult(0.5));
    }

    copy() {
        var newBlock = new Block();
        newBlock.parent = this.parent;
        newBlock.origin = this.origin.copy();
        newBlock.vector = this.vector.copy();
        newBlock.flipped = this.flipped;
        return newBlock;
    }

    checkFlipped(ray) {
        var norm = this.vector.normal();
        var angle = norm.angleBetween(ray.vector);
        if (angle > Math.PI/2)
            return true;
        else
            return false;
    }

    flip() {
        this.origin = this.origin.add(this.vector);
        this.vector.rotate(Math.PI);
        this.flipped = !this.flipped;
    }

    draw() {
        ctx.strokeStyle = 'red';
        this.vector.drawFrom(ctx, this.origin.x, this.origin.y);
        var norm = this.vector.normal();
        norm.scale(50);
        norm.drawFrom(
            ctx,
            this.origin.x + this.vector.x/2,
            this.origin.y + this.vector.y/2
        );
    }
}

class Ray {
    constructor() {
        this.parent = null;
        this.origin = new Vector2(canvas.width/2,canvas.height/2);
        this.vector = new Vector2(canvas.width*2,0);
        this.color = [255,255,255];
        this.diffuse = false;
    }

    copy() {
        var newRay = new Ray();
        newRay.parent = this.parent;
        newRay.color = this.color;
        newRay.origin.set(this.origin.x, this.origin.y);
        newRay.vector.set(this.vector.x, this.vector.y);
        return newRay;
    }

    draw() {
        if (this.diffuse) {
            var col1 = 'rgba('+this.color[0]+','+this.color[1]+','+this.color[2]+',0.015)';
            var col2 = 'rgba('+this.color[0]+','+this.color[1]+','+this.color[2]+',0)';
            var grad = ctx.createLinearGradient(
                this.origin.x,
                this.origin.y,
                10,
                this.origin.x,
                this.origin.y,
                canvas.width/5
            );
            grad.addColorStop(0, col1);
            grad.addColorStop(1, col2);
            ctx.lineWidth = 1;
            ctx.strokeStyle = grad;
        }
        else {
            var col = 'rgba('+this.color[0]+','+this.color[1]+','+this.color[2]+',0.015)';

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = col;
        }
        this.vector.drawFrom(ctx, this.origin.x, this.origin.y);
    }
}

class Fps {
    constructor(fps) {
        this.interval = 1000 / fps;
        this.last = Date.now();
        this.now = Date.now();
    }

    fps() {
        var delta = (Date.now() - this.lastCalled)/1000;
        this.lastCalled = Date.now();
        return 1/delta;
    }

    showFps() {
        ctx.font = '20px Arial';
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,100,50);
        ctx.fillStyle = "red";
        ctx.fillText("Fps: "+parseInt(this.fps()), 10, 30);
    }
}
