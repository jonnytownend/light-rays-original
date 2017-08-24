// Canvas setup
canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx = canvas.getContext("2d");

// Global variables and functions
mouse = new Vector2(0,0);
mouse.down = false;
showFps = false;

blockStart = new Vector2(0,0);
pmouse = new Vector2(0,0);

inpt = {x:0, y:0};

// --Global functions--
function random(a,b) {
    return (b-a)*Math.random() + a;
}

function randint(a,b) {
    return parseInt(random(a,b)+0.5);
}

function zfill(n, p) {
    var pad_char = '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}