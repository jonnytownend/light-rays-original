function Vector2(x,y) { //Simple vector3 class
    this.x = x;
    this.y = y;
    
    this.len = function() {
        sqr = (this.x*this.x) + (this.y*this.y);
        return Math.sqrt( sqr );
    }
    
    this.add = function( vect ) {
        var x = this.x + vect.x;
        var y = this.y + vect.y;
        
        return new Vector2(x,y);
    }
    
    this.subtract = function( vect ) {
        var x = this.x - vect.x;
        var y = this.y - vect.y;
        
        return new Vector2(x,y);
    }
	
	this.scalarMult = function( scalar ) {
		var x = this.x*scalar;
		var y = this.y*scalar;
		
		return new Vector2(x,y);
	}
	
	this.scale = function( scale ) {
		var x = this.x*scale/this.len();
		var y = this.y*scale/this.len();
		this.x = x;
		this.y = y;
	}
    
    this.rotate = function( angle ) {
        var x;
        var y;
		
		x = this.x*Math.cos(angle) - this.y*Math.sin(angle);
		y = this.x*Math.sin(angle) + this.y*Math.cos(angle);
		this.x = x;
		this.y = y;
    }
	
	this.dot = function( vect ) {
		return this.x*vect.x + this.y*vect.y;
	}
    
    this.cross = function( vect ) {
        
    }
	
	this.angleBetween = function( vect ) {
		var dot = this.dot( vect );
		var mult = this.len() * vect.len();
		if (mult==0) {
			return false;
		}
		else {
			var costheta = dot/mult;
			return Math.acos( costheta );
		}
	}
    
    this.angleBetween2 = function( vect ) {
        var angle = Math.atan2(this.y, this.x) - Math.atan2(vect.y, vect.x);
        if (angle < 0)
            angle += 2*Math.PI;
        return angle;
    }
    
    this.angleBetween3 = function( vect ) {
        var v1 = this.copy();
        v1.scale(1);
        var v2 = vect.copy();
        v2.scale(1);
        return Math.acos(v1.dot(v2));
    }
	
	this.normal = function() {
		return new Vector2(this.y, -this.x);
	}
	
	this.set = function(x,y) {
		this.x = x;
		this.y = y;
	}
    
    this.copy = function() {
        return new Vector2(this.x, this.y);
    }
    
    this.angleToX = function() {
        if (Math.sign(this.y) == Math.sign)
            return Math.atan2(this.y, this.x);
        else
            return Math.atan2(this.y, this.x);
    }
	
	this.drawFrom = function( context, x, y ) { //For html5 canvas use
		ctx.beginPath();
		ctx.moveTo( x, y );
		ctx.lineTo( x + this.x, y + this.y );
		ctx.stroke();
		ctx.closePath();
	}

}
