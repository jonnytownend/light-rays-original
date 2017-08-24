var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

mouse = new Vector2(0,0);
inpt = new Vector2(0,0);
clickBlock = null;
mouseDown = false;

/*
var controlHUD = document.getElementById("hud");
controlHUD.style.visibility = "visible";
hudBlock = new Block();
*/
var drawRayCount = -1;

function drawHud() {
	var center = new Vector2(canvas.width/2, canvas.height/2);
	var block = new Block();
	block.hud = true;
	var size = 140;
	block.origin = center.add( new Vector2(-size,size*1.1) );
	block.vector = new Vector2(2*size, 0);
	scene.add( block );
}

function removeHud() {
	for (var i=0; i<scene.blocks.length; i++) {
		var block = scene.blocks[i];
		if (block.hud) {
			scene.blocks.splice(i,1);
		}
	}
}

function getVals() {
	for (var i=0; i<scene.blocks.length; i++) {
		var b = scene.blocks[i];
		console.log(b.origin.subtract(scene.sun));
		console.log(b.vector);
	}
}

function keyPress(event) {
	if (event.keyCode == 90) //Z
		scene.blocks.pop();
	else if (event.keyCode >= 49 && event.keyCode <= 57) {
		var rays = (event.keyCode-48)*1000;
		scene.samples = rays;
	}
	else if (event.keyCode == 38) //Up
		inpt.y = -1;
	else if (event.keyCode == 40) //Down
		inpt.y = 1;
	else if (event.keyCode == 37) //Left
		inpt.x = -1;
	else if (event.keyCode == 39) //Right
		inpt.x = 1;
	else if (event.keyCode == 82) { //R
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		scene.sun.x = canvas.width/2;
		scene.sun.y = canvas.height/4;
	}
	else if (event.keyCode == 67) //C
		drawRayCount *= -1;
	else if (event.keyCode == 72) { //H
		getVals();
		if (controlHUD.style.visibility == "visible") {
			controlHUD.style.visibility = "hidden";
		}
		else {
			controlHUD.style.visibility = "visible";
		}
	}
	
	//console.log( event.keyCode );
}
window.addEventListener("keydown", keyPress, false);

function keyUp(event) {
	if (event.keyCode == 38) //Up
		inpt.y = 0;
	else if (event.keyCode == 40) //Down
		inpt.y = 0;
	else if (event.keyCode == 37) //Left
		inpt.x = 0;
	else if (event.keyCode == 39) //Right
		inpt.x = 0;
}
window.addEventListener("keyup", keyUp, false);

function getMouse(event) {
	mouse.x = event.pageX;
	mouse.y = event.pageY;
}
canvas.addEventListener("mousemove", getMouse, false);

function onMouseDown(event) {
	mouseDown = true;
	clickBlock = new Block();
	//clickBlock.visible = true;
	clickBlock.beingDrawn = true;
	clickBlock.origin = mouse.scalarMult(1);
	clickBlock.vector = mouse.scalarMult(0);
	scene.add( clickBlock );
}
canvas.addEventListener("mousedown", onMouseDown, false);

function onMouseMove(event) {
	if (clickBlock) {
		clickBlock.vector = mouse.subtract(clickBlock.origin);
	}
}
canvas.addEventListener("mousemove", onMouseMove, false);

function onMouseUp(event) {
	mouseDown = false;
	clickBlock.vector = mouse.subtract(clickBlock.origin);
	clickBlock.beingDrawn = false;
	scene.alignBlocks();
	clickBlock = new Block();
}
canvas.addEventListener("mouseup", onMouseUp, false);

function Scene() {
	this.blocks = [];
	this.rays = [];
	this.secondaryEmitters = [];
	this.samples = 2000;
	this.drawsecondaryEmitters = true;
	this.dt = 0;
	
	this.sun = new Vector2(canvas.width/2, canvas.height/2.45);
	
	this.add = function( object ) {
		object.parent = this;
		if (object instanceof Block) {
			this.blocks.push( object );
		}
		else if (object instanceof Ray) {
			this.rays.push( object );
		}
	}
	
	this.checkIntersects = function( mode ) {
		var currentRays = this.rays.length;
		for (var i=0; i<currentRays; i++) {
			for (var j=0; j<this.blocks.length; j++) {
				var insct = checkLineIntersection(this.rays[i], this.blocks[j]);
				if (insct) {
					//console.log( insct );
					this.rays[i].vector = insct.subtract(this.rays[i].origin);
					if (this.drawsecondaryEmitters && this.rays[i].diffuse==false)
						this.castBouncedRays(mode, 1, insct, this.rays[i], this.blocks[j]);
				}
			}
		}
	}
	
	this.castRays = function() {
		for (var i=0; i<this.samples; i++) {
			var ray = new Ray();
			ray.origin = this.sun;
			ray.vector.rotate(Math.random()*2*Math.PI);
			this.add( ray );
		}
	}
	
	this.castBouncedRays = function(mode, amount, origin, initRay, block) {
		for (var i=0; i<amount; i++) {
			var ray = new Ray();
			ray.origin = origin;
			if (mode=="diffuse" || block.beingDrawn) {
				ray.vector.rotate(Math.random()*Math.PI*2);
				ray.diffuse = true;
			}
			else if (mode=="reflective") {
				ray.vector = initRay.vector.scalarMult(1);
				var angle = 2*initRay.vector.angleBetween( block.vector );
				ray.vector.rotate( angle );
				var norm = block.vector.normal();
				norm.scale(1);
				ray.origin.x -= norm.x;
				ray.origin.y -= norm.y;
			}
			ray.vector.scale(canvas.width*2);
			this.add( ray );
		}
	}
	
	this.resetRays = function() {
		this.rays = [];
		this.secondaryEmitters = [];
	}
	
	this.alignBlocks = function() {
		for (var i=0; i<this.blocks.length; i++) {
			var block = this.blocks[i];
			var norm = block.vector.normal();
			norm.scale(1);
			var toInner = this.sun.subtract(block.origin).len();
			var toOuter = this.sun.subtract(block.origin.add(norm)).len();
			
			if (toInner > toOuter) {
				block.origin = block.origin.add(block.vector);
				block.vector.rotate(Math.PI);
			}
		}
	}
	
	this.draw = function() {
		for (var i=0; i<this.rays.length; i++) {
			this.rays[i].draw();
		}
		for (var i=0; i<this.blocks.length; i++) {
			if (this.blocks[i].visible)
				this.blocks[i].draw();	
		}
	}
}

function Ray() {
	this.parent = null;
	this.origin = null;
	this.vector = new Vector2(canvas.width*2,0);
	this.secondaryCaster = false;
	this.bounces = 0;
	this.diffuse = false;
	this.beingDrawn = false;
	
	this.draw = function() {
		this.vector.drawFrom(ctx, this.origin.x, this.origin.y );
	}
}

function Block(a,b,c,d) {
	this.parent = null;
	this.origin = new Vector2(a,b);
	this.vector = new Vector2(c,d);
	this.visible = false;
	this.hud = false;
	
	this.draw = function() {
		ctx.strokeStyle = "red";
		this.vector.drawFrom(ctx, this.origin.x, this.origin.y );
	}
}

function setup() {
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	//SETUP CODE HERE
	scene = new Scene();
	scene.samples = 3000;
	//scene.drawsecondaryEmitters = false;
	//ctx.globalAlpha = 0.1;
}

function renderLoop() {
	window.requestAnimationFrame( renderLoop );
	ctx.fillStyle = "rgba(0,0,0,0.1)";
    //ctx.fillStyle = "red";
    //ctx.fillStyle = "black";
	ctx.strokeStyle = "rgba(255,255,255,0.01)";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	//DRAW CODE HERE
	scene.resetRays();
	scene.castRays();
	scene.checkIntersects("diffuse");
	scene.checkIntersects("reflective");
	scene.checkIntersects("reflective");
	
	scene.draw();
	
	scene.sun.x += inpt.x*3;
	scene.sun.y += inpt.y*3;
	
	//Draw light rays count on screen
	if (drawRayCount==1) {
		ctx.fillStyle = "red";
		ctx.font = "12pt Arial";
		ctx.fillText("Ray Count: "+scene.rays.length,10,20);
	}
	
	//console.log( scene.blocks.length );
}

setup();
renderLoop();