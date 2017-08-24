// Setup and render loop
function setup() {
    fps = new Fps();
    scene = new Scene();
    scene.setSamples(4500);
    //scene.reflectiveSplit = 0.8;
    scene.secondaryBounces = 2;
    scene.shimmer = false;
    scene.load('500.9999999999969:216.99999999999687:-168.99999999999685:195.00000000000315,831:181:212:204,1036:580:-261:129,576:742:-207:-57,463:432:-15.99999999999828:123,627:220:-51.99999999999996:115,859:370:109:55.999999999975316,876:508:32.00000000000004:102,816.999999999998:591:-30.999999999997897:68,735.9999999999999:590:-44.999999999999915:75,598.9999999999965:557:7.139690839029111e-12:100,548:505:28.00000000000001:40,520:391:81:54.99999999999948,723:292:-80:39.00000000000002,734:212.00000000000026:86:40.999999999999744,777:343:42.000000000000064:52.999999999999936,804:467:-9.999999999999947:88,631:523:93:-3.4167645696211157e-14,623:349:38.00000000000004:105,715:380:79:-2.0000000000000293,829:417:-38:43,663:489:57:-2.0000000000000497,553:493.00000000000006:52:-26.000000000000043,723:607:0:0,NaN:NaN:NaN:NaN,191:302:-2:-161,367:290:-176:12.000000000000043,339:124:28:166,186:141.00000000000006:153:-17.00000000000007,');
    
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
    loop(30); 
});