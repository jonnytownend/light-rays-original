function mouseDown(event) {
    mouse.down = true;
    //Check sun
    var width = scene.sun.size;
    if (mouse.x < scene.sun.x+width && mouse.x > scene.sun.x-width && mouse.y < scene.sun.y+width && mouse.y > scene.sun.y-width) {
        scene.sun.vel.set(0,0);
        scene.sun.free = true;
        scene.sun.dragged = true;
    }
    else {
        blockStart.set(mouse.x, mouse.y);
        currentBlock = new Block();
        currentBlock.origin.set(blockStart.x, blockStart.y);
        scene.addBlock(currentBlock);
    }
}
canvas.addEventListener("mousedown", mouseDown, false);

function mouseMove(event) {
    var rect = canvas.getBoundingClientRect();
    pmouse.x = mouse.x;
    pmouse.y = mouse.y;
    mouse.x = event.pageX - rect.x;
    mouse.y = event.pageY - rect.y;
    if (mouse.down) {
        if (scene.sun.dragged) {
            scene.sun.set(mouse.x, mouse.y);
        }
        else if (currentBlock.flipped) {
            currentBlock.origin.set(mouse.x, mouse.y);
            currentBlock.vector = blockStart.subtract(currentBlock.origin);
        }
        else {
            currentBlock.vector =   mouse.subtract(currentBlock.origin);
        }
    }
}
canvas.addEventListener("mousemove", mouseMove, false);

function mouseUp(event) {
    mouse.down = false;
    if (scene.sun.dragged) {
        var diff = mouse.subtract(pmouse);
        if (diff.len() > 3)
            scene.sun.vel.set(diff.x, diff.y);
        scene.sun.dragged = false;
    }
}
canvas.addEventListener("mouseup", mouseUp, false);

function keyDown(event) {
    scene.sun.free = false;
    if (event.keyCode == 38) //Up
		inpt.y = -1;
	else if (event.keyCode == 40) //Down
		inpt.y = 1;
	else if (event.keyCode == 37) //Left
		inpt.x = -1;
	else if (event.keyCode == 39) //Right
		inpt.x = 1;
    else if (event.keyCode == 32) //Space bar
        scene.resolveBlocks = !scene.resolveBlocks;
    else if (event.keyCode == 67) //c
        scene.blocks = [];
    else if (event.keyCode == 66) //b
        scene.secondaryBounces = !scene.secondaryBounces;
    else if (event.keyCode == 83) { //s
        if ($('textarea').css('display') == 'none') {
            var saveString = scene.save();
            $('textarea').val(saveString);
            $('textarea').css('display','inline');
        }
        else {
            $('textarea').css('display','none');
        }
    }
    else if (event.keyCode == 76) { //l
        var loadString = $('textarea').val();
        scene.load(loadString);
    }
    else if (event.keyCode == 70) //f
        showFps = !showFps;
    else if (event.keyCode == 85) { //u
        scene.blocks.sort(function(blockA, blockB) {
            return blockA.index - blockB.index;
        });
        scene.blocks.pop();
    }
    else if (event.keyCode == 65) //a
        scene.addSun();

    else if (String.fromCharCode(event.keyCode) == 'H') {
        var hud = $('#hud');
        hud.fadeToggle();
    }

    //console.log(event.keyCode);
}
window.addEventListener("keydown", keyDown, false);

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
