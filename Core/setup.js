// Setup and render loop
function setup() {
    fps = new Fps();
    scene = new Scene();
    scene.setSamples(4500);
    //scene.reflectiveSplit = 0.8;
    scene.secondaryBounces = 2;
    scene.shimmer = false;
    scene.loadFile('SavedStates/complex.txt');

    scene.castRays();

    //dat.gui setup
    gui = new dat.GUI();
    //gui.add(scene.sun, 'color');
}

function loop(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    render();
}

function render2() {
    window.requestAnimationFrame(render2);

    //DRAW CODE
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    scene.update();
    scene.draw();

    if (t%1==0 && showFps)
        fps.showFps();
    t++;
}

t=0;
function render() {
    window.requestAnimationFrame(render);

    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        //DRAW CODE
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        scene.update();
        scene.draw();

        if (t%1==0 && showFps)
            fps.showFps();
        t++;
    }
}

$(document).ready(function(){
    setup();
    loop(60);
});
