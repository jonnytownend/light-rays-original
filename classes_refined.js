class GameObject {
    /*
    Base class for any object added to a Scene. All objects have position, velocity, acceleration, and a directional vector, all as Vector2 objects.
    */
    constructor() {
        this.pos = new Vector2(0,0);
        this.origin = this.pos; //Alias for pos
        this.vel = new Vector2(0,0);
        this.acc = new Vector2(0,0);
        this.vector = new Vector2(0,0);
        
        this.maxSpeed = 7; //Maximum speed that an object can move at
        this.free = false;
        this.forces = [];
        this.input = null;
        this.parent = null;
        this.boundingBox = {
            bound: true,
            lower: new Vector2(0,0),
            upper: new Vector2(canvas.width, canvas.height)
        }
    }
    
    addInput(input, mode) {
        // Add an input controller to control movement of GameObject
        if (typeof mode = 'undefined')
            this.inputMode = 'direct'
        else
            this.inputMode = 'indirect';
        this.input = input;
    }
    
    addForce(vect) {
        // Add Vector2 to this.acc
        this.acc.add(vect);
    }
    
    removeForce(vect) {
        // Remove Vector2 from this.acc
        this.acc.sub(vect);
    }
    
    removeAllForces() {
        // Remove all forces on GameObject by setting acc to zero
        this.acc.set(0,0);
    }
    
    speedUp(func) {
        // How quickly GameObject responds to input
        // func must return a multiplier
        var mult;
        if (func)
            mult = func();
        else
            mult = 3;
        this.vel.mult(mult);
    }
    
    speedDown(func) {
        // How quickly GameObject responds to input
        var mult;
        if (func)
            mult = func();
        this.vel.mult(-mult);
    }
    
    getInput(input) {
        // Get an Input object and react to it
        // Modes: 'direct', 'indirect', 'place'
        if (input.mode = 'place') {
            this.removeAllForces();
            this.pos.set(input.x, input.y);
        }
        else if (input.mode == 'direct') {
            this.removeAllForces();
            this.pos.radd(input.mult(this.maxSpeed));
        }
        else if (input.mode == 'indirect') {
            if (input.x==0 && input.y==0)
                this.speedDown()
            else
                this.speedUp();
        }
    }
    
    update() {
        // Calculate new pos of GameObject
        if (typeof this.input != 'undefined')
            this.getInput();
        
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        
        if (this.boundingBox.bound) {
            var bb = this.boundingBox;
            if (this.x > bb.upper.x) {
                this.vel.x *= -1;
                this.pos.x = bb.upper.x;
            }
            else if (this.x < bb.lower.x) {
                this.vel.x *= -1;
                this.pos.x = bb.lower.x;
            }
            
            if (this.y > bb.upper.y) {
                this.vel.y *= -1;
                this.pos.y = bb.upper.y;
            }
            else if (this.y < bb.lower.y) {
                this.vel.y *= -1;
                this.pos.y = bb.lower.y;
            }
        }
    }
}

class Sun extends GameObject {
    /*
    
    */
    constructor() {
        this.dragged = false;
        this.free = false;
        this.doDraw = false;
    }
}