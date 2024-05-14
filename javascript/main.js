import * as bootstrap from 'bootstrap';
import { GUI } from 'dat.gui';
import data from '../news_data/news_data.json' assert { type: 'json' };
import * as Scene3D from './scene_3D.js';

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
    .onChange(Scene3D.toggleNightGlobe);
  settingsFolder
    .add(settings, 'auto_spin')
    .name('auto spin')
    .onChange(Scene3D.toggleAutoSpin);
  settingsPanel.close();
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
      if (country.article_count == 0) {
        country_message = 'Found no articles for ' + country.name;
      } else {
        country_message =
          country.name + ' - ' + country.articles.length + ' found';
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
