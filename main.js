import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import * as Popper from '@popperjs/core';
import * as bootstrap from 'bootstrap';
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import Stats from 'three/addons/libs/stats.module.js';
import data from './news_data/news_data.json' assert { type: 'json' };

// trying to prevent cache compiling when webpage restarted
THREE.Cache.enabled = false;

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// camera and scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  1,
  50
);
camera.position.set(0, 0, 25);
camera.lookAt(20, 0, 0);

// adding spotlight
const dirLight = new THREE.DirectionalLight(0xffffff, 3.5);
dirLight.position.set(-25, 12, 10); // when geometry is smooth, do 20, 12, 10, else 3, 5, 10
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
  clearNews();
  populateNews(code);
}

// search country news (by iso3) using 'enter' keypress
var search_country_input = document.getElementById('user_country_code');
search_country_input.addEventListener('keypress', function (event) {
  if (event.key == 'Enter') {
    event.preventDefault();
    search_country_button.click();
  }
});

// open/close about about sidebar
var about_button = document.getElementById('aboutSidebarButton');
about_button.addEventListener('click', toggleAboutMenu);
function toggleAboutMenu() {
  var aboutSidebarStatus =
    document.getElementById('aboutSidebar').style.display;
  console.log(aboutSidebarStatus);
  if (aboutSidebarStatus == 'none' || aboutSidebarStatus == '') {
    document.getElementById('aboutSidebar').style.display = 'block';
    console.log('opening about sidebar');
  } else {
    document.getElementById('aboutSidebar').style.display = 'none';
    console.log('closing about sidebar');
  }
}

// framerate stats
const stats = new Stats();
stats.position = 'bottom-left';
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
      globeScene.getObjectByName('Sphere').geometry.scale = (0.05, 1, 2);

      var globeSceneMesh;
      globeScene.traverse(function (child) {
        if (child.isMesh) {
          globeSceneMesh = child;
        }
      });
      await renderer.compileAsync(globeScene, camera, scene);

      globeSceneMesh.geometry.deleteAttribute('normal');
      globeSceneMesh.geometry = BufferGeometryUtils.mergeVertices(
        globeSceneMesh.geometry
      );
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
    globeScene.rotation.y += 0.0003;
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
function populateNews(country_name) {
  let article_count = 0;
  const country_name_display = document.getElementById('country_name');
  console.log('populating news list:', country_name);
  if (country_name == '') {
    return;
  }
  const country = getCountryByName(country_name);

  if (country) {
    country_name_display.text = country.name;
  } else {
    country_name_display.text = "Can't find country. Please try again";
    return 0;
  }

  const dFrag = document.createDocumentFragment();
  for (let article_index in country.articles) {
    if (country.articles[article_index].headline) {
      const new_article = document.createElement('div');
      new_article.setAttribute('id', 'article');

      let headline = document.createElement('news_headline');
      let source = document.createElement('news_source');
      // date = document.createElement('news_date');

      headline.textContent = country.articles[article_index].headline + '\n';
      source.textContent = country.articles[article_index].source;
      source.setAttribute('href', country.articles[article_index].source);
      //date.textContent = country.articles[article_index].date;

      new_article.appendChild(headline);
      new_article.appendChild(source);
      //new_article.appendChild(date);

      dFrag.appendChild(new_article);
      article_count += 1;
    }
  }
  document.getElementById('news').appendChild(dFrag);
  console.log('articles added: ', article_count);
}

// removes current articles on display so another country's articles can take place
function clearNews() {
  // find all id="article" and delete them
  const news_box = document.getElementById('news');
  let total_articles = 0;
  let deleted_articles = 0;
  let all_articles = document.querySelectorAll('div[id=article]');
  for (let article of all_articles) {
    article.remove();
    deleted_articles += 1;
  }

  console.log('new_box total children: ', total_articles);
  console.log('news box: ', news_box);
  console.log('deleted articles: ', deleted_articles);

  console.log('=========================');
}

// gets the country object by iso3 code
function getCountryByCode(country_code) {
  country_code = country_code.toLowerCase();
  console.log('looking for:', country_code);
  for (var i = 0; i < data.length; i++) {
    for (const [code, country] of Object.entries(data[i].countries)) {
      if (country.code.toLowerCase() == country_code) {
        return country;
      }
    }
  }
  return 0;
}

// gets the country object by name
function getCountryByName(country_name) {
  country_name = country_name.toLowerCase();
  console.log('looking for:', country_name);
  for (var i = 0; i < data.length; i++) {
    for (const [name, country] of Object.entries(data[i].countries)) {
      //console.log(country.name);
      if (country.name.toLowerCase().includes(country_name)) {
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

// clearing renderer cache when reloaded
if (window.performance) {
  console.info('window.performance works fine on this browser');
}
if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
  renderer.dispose();
  console.info('This page is reloaded');
} else {
  console.info('This page is not reloaded');
}

// unloads HTML
//window.addEventListener('onunload', function () {
//  document.documentElement.innerHTML = '';
//});
