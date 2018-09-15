// Variable initialisation
var canvas = document.querySelector('#canvas');
var context = canvas.getContext('2d');
var linePoints = [];
var toolMode = 'draw';
var toolSize = 5;
var toolColor = '#000000';
var canvasState = [];
var canvas = document.getElementById('canvas');
var undoButton = document.querySelector('[data-action=undo]');

// changing screen height based of the screen dimensions
console.log(screen.height);
if (screen.height == 1080) {
  canvas.height = 1026;
  canvas.width = 1642;
}

else if (screen.height == 720) {
  canvas.height = 684;
  canvas.width = 1094;
}

else {
  canvas.height = 805;
  canvas.width = 1117;
}


// Defaults
context.strokeStyle = "#000000";
context.lineWidth = 5;
context.lineJoin = "round";
context.lineCap = "round";

// Event listeners
canvas.addEventListener('touchstart', draw);
window.addEventListener('touchend', stop);
document.querySelector('#tools').addEventListener('click', selectTool);
document.querySelector('#colors').addEventListener('click', selectTool);

// Prevent scrolling when touching the canvas
document.body.addEventListener("touchstart", function (e) {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });
document.body.addEventListener("touchend", function (e) {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });
document.body.addEventListener("touchmove", function (e) {
    if (e.target === canvas) {
        e.preventDefault();
    }
}, { passive: false });

// Functions
function clearCanvas() {
    var result = confirm('Are you sure you want to delete the picture?');
    if (result) {
        context.clearRect( 0, 0, canvas.width, canvas.height );
        canvasState.length = 0;
        undoButton.classList.add('disabled');
    }
}

function draw(e) {
    window.addEventListener('touchmove', draw);
    // to change opacity  
    context.globalAlpha = 0.5;
    var touchX = e.targetTouches[0].pageX - canvas.offsetLeft;
    var touchY = e.targetTouches[0].pageY - canvas.offsetTop;
    var touchDrag = e.type === 'touchmove';
    if (e.type === 'touchstart') saveState();
    linePoints.push( { x: touchX, y: touchY, drag: touchDrag, width: toolSize, color: toolColor } );
    updateCanvas();

}

function highlightButton( button ) {
    var buttons = button.parentNode.querySelectorAll( 'img' );
    buttons.forEach( function( element ){ element.classList.remove( 'active' ) } );
    button.classList.add( 'active' );
}

function renderLine() {
    for ( var i = 0, length = linePoints.length; i < length; i++ ) {
        if ( !linePoints[i].drag ) {
            //context.stroke();
            context.beginPath();
            context.lineWidth = linePoints[i].width;
            context.strokeStyle = linePoints[i].color;
            context.moveTo( linePoints[i].x, linePoints[i].y );
            context.lineTo( linePoints[i].x + 0.5, linePoints[i].y + 0.5 );
        } else {
            context.lineTo( linePoints[i].x, linePoints[i].y );
        }
    }

    if ( toolMode === 'erase' ) {
        context.globalCompositeOperation = 'destination-out';
    } else {
        context.globalCompositeOperation = 'source-over';
    }

    context.stroke();
}

function saveState() {
    canvasState.unshift( context.getImageData( 0, 0, canvas.width, canvas.height ) );
    linePoints = [];
    if ( canvasState.length > 25 ) canvasState.length = 25;
    undoButton.classList.remove( 'disabled' );
}

function selectTool( e ) {
    if ( e.target === e.currentTarget ) return;
    if ( !e.target.dataset.action ) highlightButton( e.target );
    toolSize = e.target.dataset.size || toolSize;
    toolMode = e.target.dataset.mode || toolMode;
    toolColor = e.target.dataset.color || toolColor;
    if ( e.target === undoButton ) undoState();
    if ( e.target.dataset.action === 'delete' ) clearCanvas();
}

function stop( e ) {
    if ( e.which === 1 ) {
        window.removeEventListener( 'touchmove', draw );
    }
}

function undoState() {
    context.putImageData( canvasState.shift(), 0, 0 );
    if ( !canvasState.length ) undoButton.classList.add( 'disabled' );
}

function updateCanvas() {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    context.putImageData( canvasState[ 0 ], 0, 0 );
    renderLine();
}