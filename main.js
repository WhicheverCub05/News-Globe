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
  100
);
camera.position.set(0, 0, 25);
camera.lookAt(20, 0, 0);

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
var globeObject;
var moonObject;
var moonGroup;
function loadGlobe() {
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
        }
      });

      globeObjectMesh.geometry.deleteAttribute('normal');
      globeObjectMesh.geometry = BufferGeometryUtils.mergeVertices(
        globeObjectMesh.geometry
      );
      globeObjectMesh.geometry.computeVertexNormals();

      await renderer.compileAsync(globeObject, camera, scene);
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
    //globeObject.add
    moonObject = gltf.scene.children[0];
    moonObject.scale.multiplyScalar(0.0012);
    //moonObject.position.setX(20);
    moonObject.castShadow = true;
    moonObject.receiveShadow = true;

    console.log('adding moon', moonObject);

    moonGroup = new THREE.Group();
    await renderer.compileAsync(moonObject, camera, scene);
    moonGroup.add(moonObject);
    scene.add(moonGroup);

    moonObject.position.set(30, 0, 0);

    animateMoon();
  });
}

// bool properties of globe
var auto_spin = true;
var night_mode = false;

// get the globe spinning
function animateGlobe() {
  requestAnimationFrame(animateGlobe);
  if (auto_spin == true) {
    globeObject.rotation.y -= 0.0003;
  }
  // helper.update();
  renderer.render(scene, camera);
}

// rotate moon around earth
function animateMoon() {
  requestAnimationFrame(animateMoon);
  moonGroup.rotation.y -= 0.00015;
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
  settingsPanel.close();
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

// search country news (by iso3) using button
var search_country_button = document.getElementById('search_country_button');
search_country_button.addEventListener('click', search_news);

function search_news() {
  var user_country_name = document.getElementById('user_country_name').value;
  console.log('country: ', country);
  var country_message = '';
  if (user_country_name == '') {
    country_message = 'Find your country here';
  } else {
    var country = getCountryByName(user_country_name);

    if (country != 0) {
      country_message = country.name + ' - ' + country.articles.length + ' found';
      if (country.article_count == 0) {
        country_message = 'Found no articles for ' + country.name;
      } else {
        clearNews();
        console.log('country: ', country);
        populateNews(country);
        document.getElementById('news').style.height = '50%';
      }
    } else {
      country_message = "Couldn't find country";
    }
  }
  document.getElementById('country_name').text = country_message;
}

// search country news (by iso3) using 'enter' keypress
var search_country_input = document.getElementById('user_country_name');
search_country_input.addEventListener('keypress', function (event) {
  if (event.key == 'Enter') {
    event.preventDefault();
    search_country_button.click();
  }
});

// update news json file
function updateNews() {
  var pythonScriptPath = './news_scraper.py';
  process.run(['python', pythonScriptPath]);
}

// gets data from the json files onto the webpage. selects which articles to display
function populateNews(country) {
  let article_count = 0;
  console.log('populating news list:', country_name);

  sortArticlesRandom(country.articles);

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
  return true;
}

// randomises the articles order
function sortArticlesRandom(articles) {
  console.log(articles);
  let current_index = articles.length;

  while (current_index != 0) {
    let random_index = Math.floor(Math.random() * current_index);
    current_index--;

    [articles[current_index], articles[random_index]] = [
      articles[random_index],
      articles[current_index],
    ];
  }
  return articles;
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
}

// gets the country object by iso3 code
function getCountryByCode(country_code) {
  country_code = country_code.toLowerCase();
  console.log('looking for:', country_code);
  for (var i = 0; i < data.length; i++) {
    for (const [country_code, country] of Object.entries(data[i].countries)) {
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
  if (renderer) {
    renderer.dispose();
  }
  console.info('This page is reloaded');
} else {
  console.info('This page is not reloaded');
}
