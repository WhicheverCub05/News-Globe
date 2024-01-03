import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// camera and scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );

// renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );
//window.addEventListener( 'resize', onWindowResize );

//controlls
//const controls = new OrbitControls(camera, renderer.domElement)

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

// bool properties of cube and line 
const auto_spin = true;

/*

// adding hemi light
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
hemiLight.position.set( 0, 5, 0 );
scene.add( hemiLight );

// adding spotlight
const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
dirLight.position.set( - 3, 10, - 10 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add( dirLight );

*/

function animateCube() {
	requestAnimationFrame( animateCube );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
	renderer.render( scene, camera ); // was just camera
}


function animateLine() {
    if (auto_spin == true) {    
        requestAnimationFrame( animateLine );
        line.rotation.z += 0.01;
        line.rotation.x += 0.01;
        renderer.render( scene, camera )

    }
}


function showNews() {
    const newsPanel = new GUI(); // {width:300}
    const newsFolder = newsPanel.addFolder('Headlines')
    const settingsFolder = newsPanel.addFolder('Settings')
    
    newsFolder.open();
    settingsFolder.open();

    var settings = {
        night_mode: false,
        auto_spin: true
    };

    settingsFolder.add(settings, "night_mode").name("night mode");
    settingsFolder.add(auto_spin).name("auto spin");
    

    
}


function toggleNightGlobe() {
    // render nightglobe
    // maybe change state of function 
    // like addglobe (night or day or whatever)
}


function toggleAutoSpin() {
    // change state of spin or animation
}



renderer.render(scene, camera)
animateCube();
animateLine();
showNews();