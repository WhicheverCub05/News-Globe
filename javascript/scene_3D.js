// this javascript file handles the loading and properties of elements of the 3D scene

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
// import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import Stats from 'three/addons/libs/stats.module.js';
// import * as AreaSelector from './area_selector.js';

// trying to prevent cache compiling when webpage restarted
THREE.Cache.enabled = false;

// renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// globeCamera and scene
export const scene = new THREE.Scene();
export const globeCamera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  1,
  100
);
globeCamera.position.set(0, 0, 25);
globeCamera.lookAt(20, 0, 0);

// adding spotlight
const dirLight = new THREE.DirectionalLight(0xffffff, 3.5);
dirLight.position.set(-25, 12, 10); // when geometry is smooth, do 20, 12, 10, else 3, 5, 10
dirLight.castShadow = false;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = 2;
dirLight.shadow.camera.left = 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 4;

// add light to globeCamera
globeCamera.add(dirLight);
scene.add(globeCamera);

// window resizer
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  globeCamera.aspect = window.innerWidth / window.innerHeight;
  globeCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  //renderer.render(globeCamera, scene);
}

// framerate stats
const stats = new Stats();
stats.position = 'bottom-left';
// document.body.appendChild(stats.dom);

// Orbit controls
const controls = new OrbitControls(globeCamera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.minDistance = 6;
controls.maxDistance = 40;

// load the globe
export const sceneMeshes = [];

var globeObject;
var moonObject;
var moonGroup;
export function loadGlobe() {
  const loader = new GLTFLoader();
  loader.load(
    'models/World.glb',
    async function (gltf) {
      globeObject = gltf.scene.children[0];
      globeObject.castShadow = true;
      globeObject.receiveShadow = true;
      globeObject.emissiveIntensity = 12;
      globeObject.scale.multiplyScalar(5);
      // try to get cloud layer to spin at different speed

      var globeObjectMesh;
      globeObject.traverse(function (child) {
        if (child.isMesh) {
          globeObjectMesh = child;
          sceneMeshes.push(globeObjectMesh);
        }
      });

      globeObjectMesh.geometry.deleteAttribute('normal');
      globeObjectMesh.geometry = BufferGeometryUtils.mergeVertices(
        globeObjectMesh.geometry
      );
      globeObjectMesh.geometry.computeVertexNormals();

      await renderer.compileAsync(globeObject, globeCamera, scene);
      scene.add(globeObject);
      console.log('adding globe', globeObject);
      // scene.add(helper);
      animateGlobe();
    },
    function (xhr) {
      // console.log((xhr.loaded / xhr.total) * 100, ' % loaded');
      if (xhr.loaded >= xhr.total) {
        let loading_bar = document.getElementById('loading_bay');
        if (loading_bar) {
          loading_bar.remove();
        }
      }
    },
    function (error) {
      console.log('an error happened', error);
    }
  );
  loader.load('models/NASA_moon.glb', async function (gltf) {
    moonObject = gltf.scene.children[0];
    moonObject.scale.multiplyScalar(0.0012);
    //moonObject.position.setX(20);
    moonObject.castShadow = true;
    moonObject.receiveShadow = true;

    console.log('adding moon', moonObject);

    var moonObjectMesh;
    moonObjectMesh.traverse(function (child) {
      if (child.isMesh) {
        moonObjectMesh = child;
        sceneMeshes.push(moonObjectMesh);
      }
    });

    moonGroup = new THREE.Group();
    await renderer.compileAsync(moonObject, globeCamera, scene);
    moonGroup.add(moonObject);
    scene.add(moonGroup);

    moonObject.position.set(30, 0, 0);

    animateMoon();
  });
}

// bool properties of globe
export var auto_spin = true;
export var night_mode = false;

// get the globe spinning
function animateGlobe() {
  requestAnimationFrame(animateGlobe);
  if (auto_spin == true) {
    globeObject.rotation.y -= 0.0003;
  }
  // helper.update();
  renderer.render(scene, globeCamera);
}

// rotate moon around earth
function animateMoon() {
  requestAnimationFrame(animateMoon);
  moonGroup.rotation.y -= 0.00015;
  renderer.render(scene, globeCamera);
}

// render nightglobe
export function toggleNightGlobe() {
  // maybe just change lights?
  if (night_mode == true) {
    night_mode = false;
  } else {
    night_mode = true;
  }
  // call function(bol night_globe) that switched globe
  console.log('toggle night globe. now:', night_mode);
}

// change state of spin or animation
export function toggleAutoSpin() {
  if (auto_spin == true) {
    auto_spin = false;
  } else {
    auto_spin = true;
    animateGlobe();
  }
  console.log('toggle auto spin. now:', auto_spin);
}

// keeps globe animation updates
export function animate() {
  requestAnimationFrame(animate);
  controls.update();
  stats.update();
  renderer.render(scene, globeCamera);
}
