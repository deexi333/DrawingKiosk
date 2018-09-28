// Variable initialisation
var canvas = document.querySelector( '#canvas' );
var context = canvas.getContext( '2d' );
var linePoints = [];
var toolMode = 'draw'
var toolSize = 50;
var toolOpacity = 100;
var toolColor = '#FFFFFF';
var colorsList = [];
var canvasState = [];
var undoButton = document.querySelector( '[data-action=undo]' );
var currentBackgroundIdx = 0;

// Background colors
var backgroundColors = [
  {
    body: '#e69138',
    toolBox: '#f1c232'
  },
  {
    body: '#F55C5C',
    toolBox: '#F206B2'
  },
  {
    body: '#696969',
    toolBox: '#C0C0C0'
  },
  {
    body: '#00BFFF',
    toolBox: '#F0F8FF'
  },
  {
    body: '#98FB98',
    toolBox: '#C0C0C0'
  },
  {
    body: '#FFDEAD',
    toolBox: '#F4A460'
  },
  {
    body: '#9370DB',
    toolBox: '#E6E6FA'
  },
  {
    body: '#E6E6FA',
    toolBox: '#FFF0F5'
  }
]

// Create default colors
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
document.getElementById('next').onclick = () => {
  currentBackgroundIdx = (currentBackgroundIdx + 1) % backgroundColors.length;
  document.body.style.backgroundColor = backgroundColors[currentBackgroundIdx].body;
  document.getElementById('toolbar').style.backgroundColor = backgroundColors[currentBackgroundIdx].toolBox;
}
document.getElementById('prev').onclick = () => {
  currentBackgroundIdx = (currentBackgroundIdx - 1 + backgroundColors.length) % backgroundColors.length;
  document.body.style.backgroundColor = backgroundColors[currentBackgroundIdx].body;
  document.getElementById('toolbar').style.backgroundColor = backgroundColors[currentBackgroundIdx].toolBox;
}
document.querySelector( '#tools' ).addEventListener( 'click', selectTool );
document.getElementById( 'widthRangeInput' ).oninput = (evt) => {
  var value = parseInt(evt.target.value)
  toolSize = value;
  document.getElementById( 'widthRangeOutput' ).value = value;
  document.getElementById( 'sampleBrush' ).style.width = `${value-10}px`;
  document.getElementById( 'sampleBrush' ).style.height = `${value-10}px`;
};
document.getElementById( 'opacityRangeInput' ).oninput = (evt) => {
  var value = parseInt(evt.target.value)
  toolOpacity = value;
  document.getElementById( 'opacityRangeOutput' ).value = value;
  document.getElementById( 'sampleBrush' ).style.opacity = `${value/100}`;
};
document.getElementById( 'sampleBrush' ).oninput = (evt) => {
  toolColor = evt.target.value;
};
resizeCanvas();

// Functions
function clearCanvas(e) {
  var result = confirm( 'Are you sure you want to delete the picture?' );
  e.prevenDefault;
  if ( result ) {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    canvasState.length = 0;
    undoButton.classList.add( 'disabled' );
  }
}

function draw( e ) {
  if ( e.which === 1 || e.type === 'touchstart' || e.type === 'touchmove') {
    waitTime = 0;
    if (!window.colorsList.includes(toolColor)) {
      saveColor(toolColor);
    }
    window.addEventListener( 'mousemove', draw );
    window.addEventListener( 'touchmove', draw );
    // To change the opacity
    context.globalAlpha = toolOpacity / 100;
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
    document.getElementById( 'opacityRange' ).classList.add('d-none');
    context.globalAlpha = 1;
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
  if ( e.target.dataset.mode === 'erase' ) {
    document.getElementById( 'opacityRange' ).classList.add('d-none');
    document.getElementById( 'widthRange' ).classList.remove('d-none');
  } else if (e.target.dataset.mode === 'draw') {
    document.getElementById( 'opacityRange' ).classList.remove('d-none');
    document.getElementById( 'widthRange' ).classList.remove('d-none');
  } else {
    document.getElementById( 'opacityRange' ).classList.add('d-none');
    document.getElementById( 'widthRange' ).classList.add('d-none');
  }
  toolColor = e.target.dataset.color || toolColor;
  if ( e.target === undoButton ) undoState();
  if ( e.target.dataset.action == 'delete' ) {
    clearCanvas(e);
    document.getElementById( 'opacityRange' ).classList.remove('d-none');
    document.getElementById( 'widthRange' ).classList.remove('d-none');
  }
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

function saveColor(color) {
  if (window.colorsList.length >= 7) {
    var id = window.colorsList.shift();
    document.getElementById("colorContainer").removeChild(document.getElementById(id));
  }
  window.colorsList.push(color);
  var div = document.createElement("div");
  div.setAttribute("style", `background-color: ${color}; width: 50px; height: 50px`);
  div.setAttribute("class", 'rounded-circle');
  div.setAttribute("id", color);
  div.onclick = () => {
    toolColor = color;
    document.getElementById('opacityRangeInput').value = 100;
    document.getElementById( 'opacityRangeOutput' ).value = 100;
    toolOpacity = 100;
    document.getElementById( 'sampleBrush' ).value = color;
    document.getElementById( 'sampleBrush' ).style.opacity = 1;
  }
  document.getElementById("colorContainer").appendChild(div);
}