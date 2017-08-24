class Sun extends Vector2 {
    constructor(x,y) {
        super(x,y);
        this.vel = new Vector2(0,0);
        this.acc = new Vector2(0,0);
        this.speed = 10;
        this.dragged = false;
        this.free = false;
    }
    
    speedUp() {
        return 5;
    }
    
    speedDown() {
        if (this.free)
            return 0.99;
        else
            return 0.8;
    }
    
    update() {
        this.acc.set(0,0);
        this.acc.x = inpt.x*this.speedUp();
        this.acc.y = inpt.y*this.speedUp();
        
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        
        if (!this.free && this.vel.len() > this.speed)
            this.vel.scale(this.speed);
        else if (this.free && this.vel.len() > this.speed*5)
            this.vel.scale(this.speed*5);
        
        this.x += this.vel.x;
        this.y += this.vel.y;
        
        this.vel.x *= this.speedDown();
        this.vel.y *= this.speedDown();
        
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
}

function Scene() {
    this.blocks = [];
    this.rays = []; 
    this.diffuseRays = [];
    this.reflectedRays = [];
    this.samples = 2400;
    this.maxSamples = 1.5*this.samples;
    this.reflectiveSplit = 0.8;
    this.resolveBlocks = true;
    this.secondaryBounces = 1;
    this.sun = new Sun(canvas.width/2, canvas.height/2);
    
    this.addBlock = function(block) {
        block.parent = this;
        this.blocks.push(block);
    }
    
    this.addRay = function(ray) {
        ray.parent = this;
        this.rays.push(ray);
    }
    
    this.castRays = function() {
        for (var i=0; i<this.samples; i++) {
            var ray = new Ray();
            ray.origin = this.sun;
            ray.vector.rotate(random(0, 2*Math.PI));
            this.addRay(ray);
        }
    }
    
    this.recastRays = function() {
        this.diffuseRays = [];
        this.reflectedRays = [];
        for (var i in this.rays) {
            this.rays[i].vector.scale(canvas.width*2);
            this.rays[i].vector.rotate(random(0, 2*Math.PI));
        }
    }
    
    this.calculateBounces = function(rays) {
        for (var i in rays) {
            var ray = rays[i];
            var totalRays = this.getTotalRays();
            //this.sortBlocks();
            for (var j in this.blocks) {
                var block = this.blocks[j];
                
                var rand = Math.random();
                var intersect = checkLineIntersection(ray, block);
                if (intersect) {
                    ray.vector = intersect.subtract(ray.origin);
                    if (rand > this.reflectiveSplit && this.totalRays < this.maxSamples) {
                        var newRay = ray.copy();
                        var diffAmount = 1.9;
                        
                        //Rotate block if necessary
                        if (this.resolveBlocks && block.checkFlipped(newRay)) {
                            block.flip();
                        }
                        
                        newRay.vector.set(-block.vector.normal().x, -block.vector.normal().y);
                        newRay.vector.rotate(random(-Math.PI/diffAmount, Math.PI/diffAmount));
                        newRay.origin.set(intersect.x, intersect.y);
                        newRay.vector.scale(canvas.width*2);
                        this.diffuseRays.push(newRay);
                    }
                    else if (totalRays < this.maxSamples) {
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
                }
            }
        }
    }
    
    this.calculateStops = function(rays) {
        for (var i in rays) {
            var ray = rays[i];
            for (var j in this.blocks) {
                var block = this.blocks[j];
                var intersect = checkLineIntersection(ray, block);
                if (intersect)
                    ray.vector = intersect.subtract(ray.origin);
            }
        }
    }
    
    this.getTotalRays = function() {
        return this.rays.length+this.reflectedRays.length+this.diffuseRays.length;
    }
    
    this.sortBlocks = function() {
        /*
        this.blocks.sort(function(blockA, blockB) {
            var a = blockA.center().subtract(scene.sun);
            var b = blockB.center().subtract(scene.sun);
            return a.len() - b.len();
        });
        */
        
        this.blocks.sort(function(blockA, blockB) {
            var Aa = blockA.origin.subtract(scene.sun).len();
            var Ab = blockA.origin.add(blockA.vector).subtract(scene.sun).len();
            var Ba = blockB.origin.subtract(scene.sun).len();
            var Bb = blockB.origin.add(blockA.vector).subtract(scene.sun).len();
            
            var A = (Aa < Ab) ? Aa : Ab;
            var B = (Ba < Bb) > Ba : Bb;
            
            return B-A;    
        });
    }
    
    this.update = function() {
        this.sun.update();
        
        //Ensure blocks are in right order
        //this.sortBlocks();
        
        this.recastRays();
        this.calculateBounces(this.rays);
        for (var i=0; i<this.secondaryBounces; i++)
            this.calculateBounces(this.reflectedRays);
        this.calculateStops(this.reflectedRays);
    }
    
    this.draw = function() {
        for (var i in this.rays) {
            this.rays[i].draw();
        }
        for (var i in this.diffuseRays) {
            this.diffuseRays[i].draw();
        }
        for (var i in this.reflectedRays) {
            this.reflectedRays[i].draw();
        }
        if (this.visibleBlocks) {
            for (var i in this.blocks) {
                this.blocks[i].draw();
            }
        }
    }
    
    this.save = function() {
        var nums = '';
        var tmp;
        for (var i in this.blocks) {
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
        return nums
    }
    
    this.load = function(saveString) {
        this.blocks = [];
        var newBlocks = saveString.split(',');
        for (var i in newBlocks) {
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

function Block() {
    this.parent = null;
    this.origin = new Vector2(0,0);
    this.vector = new Vector2(0,0);
    this.flipped = false;
    
    this.center = function() {
        return this.origin.add(this.vector.scalarMult(0.5));
    }
    
    this.copy = function() {
        var newBlock = new Block();
        newBlock.parent = this.parent;
        newBlock.origin = this.origin.copy();
        newBlock.vector = this.vector.copy();
        newBlock.flipped = this.flipped;
        return newBlock;
    }
    
    this.checkFlipped = function(ray) {
        var norm = this.vector.normal();
        var angle = norm.angleBetween(ray.vector);
        if (angle > Math.PI/2)
            return true;
        else
            return false;
    }
    
    this.flip = function() {
        this.origin = this.origin.add(this.vector);
        this.vector.rotate(Math.PI);
        this.flipped = !this.flipped;
    }
    
    this.draw = function() {
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

function Ray() {
    this.parent = null;
    this.origin = new Vector2(canvas.width/2,canvas.height/2);
    this.vector = new Vector2(canvas.width*2,0);
    this.color = "rgba(255,255,255";
    
    this.copy = function() {
        var newRay = new Ray();
        newRay.parent = this.parent;
        newRay.origin.set(this.origin.x, this.origin.y);
        newRay.vector.set(this.vector.x, this.vector.y);
        return newRay;
    }
    
    this.draw = function() {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = this.color+",0.015)";
        this.vector.drawFrom(ctx, this.origin.x, this.origin.y);
    }
}

function Fps(fps) {
    this.interval = 1000 / fps;
    this.last = Date.now();
    this.now = Date.now();
    
    this.fps = function() {
        var delta = (Date.now() - this.lastCalled)/1000;
        this.lastCalled = Date.now();
        return 1/delta;
    }
    
    this.showFps = function() {
        ctx.font = '20px Arial';
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,100,50);
        ctx.fillStyle = "red";
        ctx.fillText("Fps: "+parseInt(this.fps()), 10, 30);
    }
}