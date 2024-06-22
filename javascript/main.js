import * as bootstrap from 'bootstrap';
import { GUI } from 'dat.gui';
import data from '../news_data/news_data.json' with { type: 'json' };
import * as Scene3D from './scene_3D.js';
// import * as Scene3D from './scene_3D_test.js';
// import {
//   userSelectedCountryISO,
//   onAreaMouse,
//   onPointerMove,
// } from './area_selector.js';

// import {
//   userSelectedCountryISO,
//   onAreaMouseClick,
//   onAreaMouseHover,
//   onPointerMove,
// } from './area_selector_test.js';

// event listener for mouse
//document.addEventListener('click', onAreaMouseClick, false);
//document.addEventListener('mousemove', onAreaMouseHover, false);
//document.addEventListener('mousemove', onPointerMove);

// search country news (by iso3) using button
var searchCountryButton = document.getElementById('search_country_button');
searchCountryButton.addEventListener('click', getUserTypedCountry);

// open/close about about sidebar
var aboutButton = document.getElementById('aboutSidebarButton');
aboutButton.addEventListener('click', toggleAboutMenu);

// search country news (by iso3) using 'enter' keypress
var searchCountryInput = document.getElementById('user_country_name');
searchCountryInput.addEventListener('keypress', function (event) {
  if (event.key == 'Enter') {
    event.preventDefault();
    searchCountryButton.click();
  }
});

function toggleAboutMenu() {
  var aboutSidebarStatus =
    document.getElementById('aboutSidebar').style.display;
  if (aboutSidebarStatus == 'none' || aboutSidebarStatus == '') {
    document.getElementById('aboutSidebar').style.display = 'block';
  } else {
    document.getElementById('aboutSidebar').style.display = 'none';
  }
}
// shows the news for the country selected
function optionsMenu() {
  const settingsPanel = new GUI(); // {width:300}
  const newsFolder = settingsPanel.addFolder('News');
  const settingsFolder = settingsPanel.addFolder('Graphic');

  var settings = {
    nightMode: false,
    autoSpin: true,
    refreshNews: function () {
      console.log('Refresh News');
    },
  };
  newsFolder
    .add(settings, 'refreshNews')
    .name('refresh')
    .onChange(updateNewsPython);
  settingsFolder
    .add(settings, 'nightMode')
    .name('night mode')
    .onChange(Scene3D.toggleNightGlobe);
  settingsFolder
    .add(settings, 'autoSpin')
    .name('auto spin')
    .onChange(Scene3D.toggleAutoSpin);
  settingsPanel.close();
}

function getUserTypedCountry() {
  var userCountryName = document.getElementById('user_country_name').value;
  if (userCountryName == '') {
    countryMessage = 'Find your country here';
  } else {
    var country = getCountryByName(userCountryName);
    populateNewsTitle(country);
    if (country != 0) {
      populateNews(country);
    }
  }
}

// seach country when suer clicks a country
export function getUserSelectedCountry() {
  var country = getCountryByISO(userSelectedCountryISO);
  if (country != 0) {
    populateNewsTitle(country);
    populateNews(country);
  }
}

// update news json file
function updateNewsPython() {
  var pythonScriptPath = './news_scraper.py';
  process.run(['python', pythonScriptPath]);
}

function populateNewsTitle(country) {
  var countryMessage = '';
  if (country != 0) {
    clearNews();
    if (country.articles.length == 0) {
      countryMessage = 'Found no articles for ' + country.name;
      document.getElementById('news').style.height = '15%';
    } else {
      countryMessage =
        country.name + ' - ' + country.articles.length + ' found';

      document.getElementById('news').style.height = '50%';
    }
  } else {
    countryMessage = "Couldn't find country";
  }
  document.getElementById('country_name').text = countryMessage;
}

// gets data from the json files onto the webpage. selects which articles to display
function populateNews(country) {
  let articleCount = 0;

  sortArticlesRandom(country.articles);

  const dFrag = document.createDocumentFragment();
  for (let articleIndex in country.articles) {
    if (country.articles[articleIndex].headline) {
      const newArticle = document.createElement('div');
      newArticle.setAttribute('id', 'article');

      let headline = document.createElement('news_headline');
      let source = document.createElement('news_source');
      // date = document.createElement('news_date');

      headline.textContent = country.articles[articleIndex].headline + '\n';
      source.textContent = country.articles[articleIndex].source;
      source.setAttribute('href', country.articles[articleIndex].source);
      //date.textContent = country.articles[articleIndex].date;

      newArticle.appendChild(headline);
      newArticle.appendChild(source);
      //newArticle.appendChild(date);

      dFrag.appendChild(newArticle);
      articleCount += 1;
    }
  }
  document.getElementById('news').appendChild(dFrag);
  return true;
}

// randomises the articles order
function sortArticlesRandom(articles) {
  let currentIndex = articles.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [articles[currentIndex], articles[randomIndex]] = [
      articles[randomIndex],
      articles[currentIndex],
    ];
  }
  return articles;
}

// removes current articles on display so another country's articles can take place
function clearNews() {
  // find all id="article" and delete them
  const newsBox = document.getElementById('news');
  let allArticles = document.querySelectorAll('div[id=article]');
  for (let article of allArticles) {
    article.remove();
  }
}

// gets the country object by iso3 code
function getCountryByISO(countryCode) {
  countryCode = countryCode.toLowerCase();
  console.log('looking for:', countryCode);
  for (var i = 0; i < data.length; i++) {
    for (const [name, country] of Object.entries(data[i].countries)) {
      if (country.code.toLowerCase().includes(countryCode.toLowerCase())) {
        return country;
      }
    }
  }
  return 0;
}

// gets the country object by name
function getCountryByName(countryName) {
  countryName = countryName.toLowerCase();
  console.log('looking for:', countryName);
  for (var i = 0; i < data.length; i++) {
    for (const [name, country] of Object.entries(data[i].countries)) {
      if (country.name.toLowerCase().includes(countryName)) {
        return country;
      }
    }
  }
  return 0;
}

// init bruv
function init() {
  Scene3D.loadGlobe();
  Scene3D.animate();
  optionsMenu();
}

init();

// clearing renderer cache when reloaded
if (window.performance) {
  console.info('window.performance works fine on this browser');
}
if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
  if (Scene3D.renderer) {
    Scene3D.renderer.dispose();
  }
  console.info('This page is reloaded');
} else {
  console.info('This page is not reloaded');
}
