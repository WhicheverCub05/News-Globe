import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import * as Popper from '@popperjs/core';
import * as bootstrap from 'bootstrap';
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import Stats from 'three/addons/libs/stats.module.js';
import data from './news_data/news_data.json' with { type: 'json' };

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// camera and scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  150
);
camera.position.set(0, 0, 25);
camera.lookAt(20, 0, 0);

// adding spotlight
const dirLight = new THREE.DirectionalLight(0xe6ecf5, 4);
dirLight.position.set(20, 12, 10); // when geometry is smooth, do 20, 12, 10, else 3, 5, 10
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = 2;
dirLight.shadow.camera.left = 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 4;

// add light to camera
camera.add(dirLight);
scene.add(camera);

// window resizer
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  //renderer.render(camera, scene);
}

// search country news (by iso3) using button 
var search_country_button = document.getElementById('search_country_button');
search_country_button.addEventListener('click', search_news);
function search_news() {
  var code = document.getElementById('user_country_code').value;
  populateNews(code);
}

// search country news (by iso3) using 'enter' keypress 
var search_country_input = document.getElementById('user_country_code');
search_country_input.addEventListener('keypress', function(event) {
  if (event.key == "Enter") {
    event.preventDefault();
    search_country_button.click();
  }
});

// open/close about sidebar
var sidebarButton = document.getElementById('sidebarCollapse');
sidebarButton.addEventListener('click', toggleNav);
function toggleNav() {
  var sidebarStatus = document.getElementById('sidebar').style.display;
  console.log(sidebarStatus)
  if (sidebarStatus == 'none' || sidebarStatus == "") {
    document.getElementById('sidebar').style.display = 'block';
    console.log("opening sidebar")
  } else {
    document.getElementById('sidebar').style.display = 'none';
    console.log("closing sidebar")
  }
}

// framerate stats
const stats = new Stats();
stats.position = "bottom-left"
// document.body.appendChild(stats.dom);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.minDistance = 6;
controls.maxDistance = 40;

// load the globe
var globeScene;
function loadGlobe() {
  const loader = new GLTFLoader();
  loader.load(
    'models/World.glb',
    async function (gltf) {
      globeScene = gltf.scene;
      globeScene.scale.multiplyScalar(5);
      // try to get cloud layer to spin at different speed
      // globeScene.fog = new THREE.Fog(0xcccccc, 10, 15 );
      globeScene.getObjectByName("Sphere").geometry.scale = (0.05, 1, 2);
      console.log(globeScene.getObjectByName("Sphere").geometry)
      
      var globeSceneMesh
      globeScene.traverse(function (child) {
        if (child.isMesh) {
          console.log(child)
          globeSceneMesh = child
        }
      });
      await renderer.compileAsync(globeScene, camera, scene);
      
      globeSceneMesh.geometry.deleteAttribute('normal')
      globeSceneMesh.geometry = BufferGeometryUtils.mergeVertices(globeSceneMesh.geometry)
      globeSceneMesh.geometry.computeVertexNormals();
      // globeSceneMesh.geometry.normalizeNormals();
      // window.helper = new VertexNormalsHelper( globeSceneMesh, 0.3, 0xff0000 );
      
      scene.add(globeScene);
      // scene.add(helper);
      renderer.render(scene, camera);
      animateGlobe();
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100, ' % loaded');
    },
    function (error) {
      console.log('an error happened', error);
    }
  );
}

// bool properties of globe
var auto_spin = true;
var night_mode = false;

// get the globe spinning
function animateGlobe() {
  requestAnimationFrame(animateGlobe);
  if (auto_spin == true) {
    globeScene.rotation.y += 0.0005;
  }
  // helper.update();
  renderer.render(scene, camera);
}

// shows the news for the country selected
function optionsMenu() {
  const settingsPanel = new GUI(); // {width:300}
  const newsFolder = settingsPanel.addFolder('News');
  const settingsFolder = settingsPanel.addFolder('Graphic');

  var settings = {
    night_mode: false,
    auto_spin: true,
    refreshNews: function () {
      console.log('Refresh News');
    },
  };
  newsFolder.add(settings, 'refreshNews').name('refresh').onChange(updateNews);
  settingsFolder
    .add(settings, 'night_mode')
    .name('night mode')
    .onChange(toggleNightGlobe);
  settingsFolder
    .add(settings, 'auto_spin')
    .name('auto spin')
    .onChange(toggleAutoSpin);
    settingsPanel.close;
}

// render nightglobe
function toggleNightGlobe() {
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
function toggleAutoSpin() {
  if (auto_spin == true) {
    auto_spin = false;
  } else {
    auto_spin = true;
    animateGlobe();
  }

  console.log('toggle auto spin. now:', auto_spin);
}

// keeps globe animation updates
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  stats.update();
  renderer.render(scene, camera);
}

// update news json file
function updateNews() {
  var pythonScriptPath = './news_scraper.py';
  process.run(['python', pythonScriptPath]);
}

// gets data from the json files onto the webpage. selects which articles to display
function populateNews(country_code) {
  console.log('populating news:', country_code);
  if (country_code == '') {
    return;
  }
  const country = getCountry(country_code);

  for (var i = 0; i < 3; i++) {
    var article = country.articles[i];
    document.getElementById(`nh${i + 1}`).innerHTML = article.headline;
    document.getElementById(`sc${i + 1}`).innerHTML = article.source;
    document.getElementById(`sc${i + 1}`).href = article.source;
    document.getElementById(`dt${i + 1}`).innerHTML = article.date;
  }
}

function getCountry(country_code) {
  console.log('looking for:', country_code);
  for (var i = 0; i < data.length; i++) {
    for (const [code, country] of Object.entries(data[i].countries)) {
      if (country.code == country_code) {
        return country;
      }
    }
  }
  return 0;
}

// init bruv
function init() {
  loadGlobe();
  optionsMenu();
}

init();
animate();
