import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import Stats from 'three/addons/libs/stats.module.js';
import data from './news_data.json' assert {type : 'json'};

// renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

// camera and scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 150 );
camera.position.set( 0, 0, 25 );
camera.lookAt( 0, 0, 0 );


// adding spotlight
const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
dirLight.position.set( 3, 5, 10 );
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
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    //renderer.render(camera, scene);
}

// framerate stats
const stats = new Stats()
document.body.appendChild(stats.dom)


// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.minDistance = 6;
controls.maxDistance = 40; 

// load the globe
var globeModel;
function loadGlobe(){

    const loader = new GLTFLoader();
    loader.load(
        'models/World.glb',
        async function(gltf) {
            globeModel = gltf.scene;
            globeModel.scale.multiplyScalar(5);
            
            /* adding subdivisions - https://discourse.threejs.org/t/how-to-subdivide-gltf-mesh/11609/3
            var subdivisions = 2;
            var modifier = new SubdivisionModifier(subdivisions);
            globeModel.traverse ( function (child) {
                if (child.isMesh) {
                    child.geometry = modifier.modify(child.geometry);
                }
            });
            */
            // try to get cloud layer to spin at different speed
            await renderer.compileAsync(globeModel, camera, scene);
            
            scene.add(globeModel);
            renderer.render(scene, camera);
            animateGlobe();
        },
        function(xhr) {
            console.log((xhr.loaded/xhr.total * 100), ' % loaded');
        },
        function(error) {
            console.log('an error happened', error);
        }
    );
}


// bool properties of globe 
var auto_spin = true;
var night_mode = false;


// get the globe spinning
function animateGlobe() {
    requestAnimationFrame( animateGlobe );
    if (auto_spin == true) { 
        globeModel.rotation.y += 0.0005;
    }
    renderer.render( scene, camera )
}

// shows the news for the country selected
function showGUI() {
    
    const settingsPanel = new GUI(); // {width:300}
    const newsFolder = settingsPanel.addFolder('News')
    const settingsFolder = settingsPanel.addFolder('Graphic')
    
    // newsFolder.open();
    // settingsFolder.open();

    var settings = {
        night_mode: false,
        auto_spin: true,
        refreshNews: function() {
            console.log("Refresh News"); 
        }
    };
    newsFolder.add(settings, "refreshNews").name("refresh");
    settingsFolder.add(settings, "night_mode").name("night mode").onChange(toggleNightGlobe);
    settingsFolder.add(settings, "auto_spin").name("auto spin").onChange(toggleAutoSpin);
}


// render nightglobe
function toggleNightGlobe() {
    // maybe just change lights?
    if (night_mode == true) {
        night_mode = false;
    } else { night_mode = true; }
    // call function(bol night_globe) that switched globe
    console.log("toggle night globe. now:", night_mode);
}


// change state of spin or animation
function toggleAutoSpin() {
    if (auto_spin == true) {
        auto_spin = false;
    } else {
         auto_spin = true;
         animateGlobe(); 
    }

    console.log("toggle auto spin. now:", auto_spin);
}

// keeps globe animation updates
function animate() {
    requestAnimationFrame( animate );
    controls.update();
    stats.update();
    renderer.render(scene, camera);
    
}

// init bruv
function init() {
    showGUI();
    populateNews('PKG');
    loadGlobe();
}

const countryList = ['Antarctica', 'Albania'];

// update news json file
function updateNews() {
    // request for each country
    for (country in countryList) {
        var url = 'https://newsapi.org/v2/top-headlines?' +
            `country=&${country}` +
            'apiKey=000ea7fadd624916bbae5b365cae8929';
        var req = new Request(url);
        fetch(req)
            .then(function(response) {
                console.log(response.json());
                // add to json file https://stackoverflow.com/questions/36856232/write-add-data-in-json-file-using-node-js
        })
    }
}


// gets data from the json files onto the webpage. selects which articles to display
function populateNews(country_code) {
    // var continent_list = fetchDataFromJson(data);
    console.log("Im in populateNews()")
    console.log("Example North Korea News")
    
    var articles = []; 
    var country;

    console.log("data[0]['countries']", data[0]["countries"]);
    console.log("data[0].countries", data[0].countries.ARE.articles[0].headline);

    console.log("data[] countries length", data[0].countries.length);

    for (let i=0; i < data.length; i++) {
        for (let j=0; j < data[i]["countries"].length; j++) {
            if (data[i][country_code] == country_code) {
                country = data[i][country_code]
                articles = country.articles
            }
        }
    }

    console.log("What country is this?:", country_name)
}

//
// function fetchDataFromJson(data) {
//    var continents = JSON.parse(data);
//    return continents;
// }


function writeNewsToNewsGUI(articles) {
    
}

init();
animate();
