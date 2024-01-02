import * as THREE from 'three';

// camera and scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

const lineCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
lineCamera.position.set( 0, 0, 100 );
lineCamera.lookAt( 0, 0, 0 );

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// cube params
const cubeGeometry = new THREE.BoxGeometry( 2, 1, 1 );
const cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
scene.add( cube );

// adding lines
const lineMaterial = new THREE.LineBasicMaterial( { color:0x0000ff } );
const points = [];
points.push( new THREE.Vector3( -10, 0, 0 ) ); // adding vectors
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0) );

const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add( line );



function animateCube() {
	requestAnimationFrame( animateCube );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
	renderer.render( scene, lineCamera ); // was just camera
}


function animateLine() {
    requestAnimationFrame( animateLine );
    line.rotation.z += 0.01;
    line.rotation.x += 0.01;
    renderer.render( scene, lineCamera )
}

renderer.render(scene, lineCamera)
animateCube();
animateLine();