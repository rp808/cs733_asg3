"use strict";
var button;
var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];

var rotationMatrix;
var rotationMatrixLoc;

var  angle = 0.0;
var  axis = vec3(0, 0, 1);

var 	trackingMouse = false;
var   trackballMove = false;

var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;


function trackballView( x,  y ) {
    var d, a;
    var v = [];

    v[0] = x;  //project x
    v[1] = y;   //project y
  
    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}

function mouseMotion( x,  y)
{
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if(trackingMouse) {
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];
       
     // dx,dy and dz commpute the change in position of x , y and z
      document.getElementById('posX').innerHTML = dx
      document.getElementById('posY').innerHTML = dy
      document.getElementById('posZ').innerHTML = dz

      if (dx || dy || dz) {
	       angle = -0.1 * Math.sqrt(dx*dx + dy*dy + dz*dz);

           //compute the theta

	       axis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
	       axis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
	       axis[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];



         lastPos[0] = curPos[0];  //update the position
	       lastPos[1] = curPos[1]; //update the position
	       lastPos[2] = curPos[2]; //update the position

           document.getElementById('anglE').innerHTML = angle

      }

    }
    render();
}

function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;
    // document.getElementById('startx').innerHTML = startX
    lastPos = trackballView(x, y);

	  trackballMove=true;

}

function stopMotion( x,  y)
{
    trackingMouse = false;
    
    //check if the position is changed or not
    if (startX != x || startY != y) {
    }
    else {
	     angle = 0.0;
	     trackballMove = false;
    }
}


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    button = document.getElementById("ccolor");
    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    // gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    // canvas.addEventListener("click", switchColor, false); //this will change the color onclick canvas
    button.addEventListener("click", switchColor, false);
    function switchColor () {
 
      if (!gl) {
        gl = canvas.getContext("webgl") 
          || canvas.getContext("experimental-webgl");
        if (!gl) {
          alert("Failed to get WebGL context.\n" 
            + "Your browser or device may not support WebGL.");
          return;
        }
        gl.viewport(0, 0, 
          gl.drawingBufferWidth, gl.drawingBufferHeight);
      }
      // Get a random color value using a helper function.
      var color = getRandomColor();
      // Set the clear color to the random color.
      gl.clearColor(color[0], color[1], color[2], 1.0);
      // Clear the context with the newly set color. This is
      // the function call that actually does the drawing.
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
      // Random color helper function. 
      function getRandomColor() {
        return [Math.random(), Math.random(), Math.random()];
      }

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor");
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    rotationMatrix = mat4();
    rotationMatrixLoc = gl.getUniformLocation(program, "uRotationMatrix");
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));


    canvas.addEventListener("mousedown", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      startMotion(x, y);
      document.getElementById('mousex').innerHTML = x
      document.getElementById('mousey').innerHTML = y
    });
  
    canvas.addEventListener("mouseup", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function(event){

      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      mouseMotion(x, y);
      document.getElementById('movex').innerHTML = x
      document.getElementById('movey').innerHTML = y
    } );

    render();

}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
      vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
      vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
      vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
      vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
      vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
      vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
      vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
      vec4( 1.0, 1.0, 1.0, 1.0 )   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push(vertices[indices[i]]);

        // for interpolated colors use
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(trackballMove) {
      axis = normalize(axis);
      rotationMatrix = mult(rotationMatrix, rotate(angle, axis));
      gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
    }
    gl.drawArrays( gl.TRIANGLES, 0, numPositions );
    requestAnimationFrame( render );
}
const heightOutput = document.querySelector('#height')
const widthOutput = document.querySelector('#width')

function reportWindowSize () {
 
  document.getElementById('wWidth').innerHTML = window.innerHeight
  document.getElementById('wHeight').innerHTML = window.innerWidth

}

window.onresize = reportWindowSize