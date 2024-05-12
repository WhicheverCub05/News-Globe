// this js file controls functions that allow a country or area to be selected by a mouse pointer

import * as THREE from 'three';
import * as Scene3D from './scene_3D.js';

// following https://sbcode.net/threejs/raycaster/

const raycaster = new THREE.Raycaster();
const sceneMeshes = Scene3D.sceneMeshes;
// go from here !!!!!

document.addEventListener('mousedown', onAreaMouse, false);
// document.addEventListener('mousemove', onAreaMouse, false);

function onAreaMouse(event) {
  event.preventDefault();
  // var mouseYOnMouse = event.clientY - window.HalfY;
  // var mouseXOnMouse = event.clientX - window.HalfX;

  var vector = new THREE.Vector3(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
    0.5
  );

  var raycaster = new THREE.Raycaster(
    Scene3D.globeCamera.position,
    vector.sub(Scene3D.globeCamera.position).normalize()
  );

  console.log(Scene3D.scene);
  var intersects = raycaster.intersectObjects(Scene3D.scene[2], true); // circle elements that are being selected
  console.log(intersects);
  if (intersects.length > 0) {
    console.log('I just clicked the moon');
    alert('Mouse on Circle');
  }
}
