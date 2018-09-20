// Variable initialisation
var canvas = document.querySelector( '#canvas' );
var context = canvas.getContext( '2d' );
var linePoints = [];
var toolMode = 'draw'
var toolSize = 5;
var toolColor = '#000000'
var canvasState = [];
var undoButton = document.querySelector( '[data-action=undo]' );

// Couting no action time
var waitTime = 0;
setInterval(() => {
  waitTime += 1;
  if (waitTime > 600) { // Clear the canvas without confirmation
    context.clearRect( 0, 0, canvas.width, canvas.height );
    canvasState.length = 0;
    undoButton.classList.add( 'disabled' );
  }
}, 1000);

// Defaults
context.strokeStyle = "#000000";
context.lineWidth = 5;
// canvas.style.cursor = 'url( images/size'+toolSize+'.cur ), crosshair';
context.lineJoin = "round";
context.lineCap = "round";

// Event listeners canvas 
canvas.addEventListener( 'mousedown', draw );
canvas.addEventListener( 'touchstart', draw );

// Event listeners window
window.addEventListener( 'mouseup', stop );
window.addEventListener( 'touchend', stop );
window.addEventListener( 'resize', resizeCanvas );

// Add function for component
document.querySelector( '#tools' ).addEventListener( 'click', selectTool );
resizeCanvas();

// Create colors
var colors1 = [
  "#d4507f",
  "#e1010c",
  "#7a2e20",
  "#fe7200",
  "#fc9b57",
  "#fedd02"
];
var colors2 = [
  "#9aa837",
  "#146343",
  "#8f9f9c",
  "#1f4acd",
  "#012c5f",
  "#19193f"
];

colors1.forEach(color => {
  var button = document.createElement("button");
  button.setAttribute("style", `background-color: ${color}`);
  button.onclick = () => {
    toolColor = color;
  }
  document.getElementById("colors1").appendChild(button);
});

colors2.forEach(color => {
  var button = document.createElement("button");
  button.setAttribute("style", `background-color: ${color}`);
  button.onclick = () => {
    toolColor = color;
  }
  document.getElementById("colors2").appendChild(button);
});

// Functions
function clearCanvas() {
  var result = confirm( 'Are you sure you want to delete the picture?' );
  if ( result ) {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    canvasState.length = 0;
    undoButton.classList.add( 'disabled' );
  }
}

function draw( e ) {
  waitTime = 0;
  if ( e.which === 1 || e.type === 'touchstart' || e.type === 'touchmove') {
    window.addEventListener( 'mousemove', draw );
    window.addEventListener( 'touchmove', draw );
    // To change the opacity
    context.globalAlpha = 0.5;
    var mouseX = e.pageX - canvas.offsetLeft;
    var mouseY = e.pageY - canvas.offsetTop;
    var mouseDrag = e.type === 'mousemove';
    if ( e.type === 'touchstart' || e.type === 'touchmove' ) {
      mouseX = e.touches[0].pageX - canvas.offsetLeft;
      mouseY = e.touches[0].pageY - canvas.offsetTop;
      mouseDrag = e.type === 'touchmove';
    }
    if ( e.type === 'mousedown' || e.type === 'touchstart' ) saveState();
    linePoints.push( { x: mouseX, y: mouseY, drag: mouseDrag, width: toolSize, color: toolColor } );
    updateCanvas();
  }
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
  // canvas.style.cursor = 'url( images/size'+toolSize+'.cur ), crosshair';
  toolMode = e.target.dataset.mode || toolMode;
  toolColor = e.target.dataset.color || toolColor;
  if ( e.target === undoButton ) undoState();
  if ( e.target.dataset.action == 'delete' ) clearCanvas();
}

function stop( e ) {
  if ( e.which === 1 || e.type === 'touchend') {
    window.removeEventListener( 'mousemove', draw );
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

function resizeCanvas() {
  canvas.width = parseInt(screen.width * 0.95);
  canvas.height = parseInt(screen.height * 0.8);
  if ( canvasState.length ) updateCanvas();
}
