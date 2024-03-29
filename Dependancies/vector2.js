class Vector2 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    
    len() {
        var sqr = (this.x*this.x) + (this.y*this.y);
        return Math.sqrt( sqr );
    }
    
    add( vect ) {
        var x = this.x + vect.x;
        var y = this.y + vect.y;
        
        return new Vector2(x,y);
    }
    
    subtract( vect ) {
        var x = this.x - vect.x;
        var y = this.y - vect.y;
        
        return new Vector2(x,y);
    }
    
    scalarMult( scalar ) {
        var x = this.x*scalar;
		var y = this.y*scalar;
		
		return new Vector2(x,y);
    }
    
    scale( scale ) {
        var x = this.x*scale/this.len();
		var y = this.y*scale/this.len();
		this.x = x;
		this.y = y;
    }
    
    rotate( angle ) {
        var x, y;
		x = this.x*Math.cos(angle) - this.y*Math.sin(angle);
		y = this.x*Math.sin(angle) + this.y*Math.cos(angle);
		this.x = x;
		this.y = y;
    }
    
    dot( vect ) {
        return this.x*vect.x + this.y*vect.y;
    }
    
    angleBetween( vect ) {
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
    
    normal() {
        return new Vector2(this.y, -this.x);
    }
    
    set(x,y) {
        this.x = x;
		this.y = y;
    }
    
    copy() {
        return new Vector2(this.x, this.y);
    }
    
    angleToX() {
        if (Math.sign(this.y) == Math.sign)
            return Math.atan2(this.y, this.x);
        else
            return Math.atan2(this.y, this.x);
    }
    
    greateThan(vect) {
        if (this.len() > vect.len())
            return true;
        else
            return false;
    }
    
    drawFrom(context, x, y) {
        //For html5 canvas use
		ctx.beginPath();
		ctx.moveTo( x, y );
		ctx.lineTo( x + this.x, y + this.y );
		ctx.stroke();
		ctx.closePath();
    }
}