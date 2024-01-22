# For when news apis just won't do
from borders import Continent
from borders import Country
from borders import Article

from bs4 import BeautifulSoup
from datetime import datetime
from os import path
import requests
import borders
import json
import jsonpickle # allows for serialization of more complex objects
import re

database_file_path = 'news_data.json'

# defining which news networks  
news_dict = {}
news_dict['CNN'] = 'https://edition.cnn.com/world'
news_dict['BBC'] = 'https://www.bbc.com/news'
news_dict['Al Jazeera'] = 'https://www.aljazeera.com/news/'


def assign_articles_to_country(articles, continents):
    for article in articles:
        for continent in continents:
            for country in continent.countries.values():
                if country.is_associated(article.headline):
                    country.add_article(article)
                    print(f"added: {article.headline} to {country.name}")


def scrape_aljazeera(url):
    print("scraping Al Jazeera")
    articles = []

    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'lxml')
    
    news_items_headline = soup.select('.featured-articles-list__item .u-clickable-card__link', href=True) # .featured-articles-list__item span 
    news_items_date = soup.select(".featured-articles-list__item .gc__date__date .screen-reader-text")
    news_items_source = soup.select(".featured-articles-list__item .gc__date__date .screen-reader-text")

    for i in range(len(news_items_headline)):
        headline = re.sub('\u00ad', '', news_items_headline[i].get_text())
        date = news_items_date[i].get_text()
        source = f"aljazeera.com{news_items_headline[i]['href']}"
        articles.append(Article(headline, date, source))
 
    return articles


def scrape_bbc(url):
    print("\nscraping BBC")
    articles = []

    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'lxml')

    news_items_headline = soup.select('.gel-layout__item .gs-c-promo-heading__title') # .featured-articles-list__item span 
    news_items_date = datetime.today()
    news_items_source = soup.select(".gel-layout__item .gs-c-promo-heading", href=True)

    for i in range(len(news_items_headline)):
        headline = news_items_headline[i].get_text()
        date = news_items_date
        source = f"bbc.com{news_items_source[i]['href']}"
        articles.append(Article(headline, date, source))

    return articles


def scrape_all_news_pages():
    all_articles = []
    tmp_article_list = [] 
    tmp_article_list.append(scrape_bbc(news_dict.get('BBC')))
    tmp_article_list.append(scrape_aljazeera(news_dict.get('Al Jazeera')))
    
    for article_list in tmp_article_list:
        for article in article_list:
            all_articles.append(article)
            
    return all_articles


def read_json_database(file_path):
    data_file = open(file_path)
    data = json.load(data_file)
    print("opened: ", file_path, "\n current data:\n", data)
    return data


def clear_json_database(file_path):
    print("cleared:", file_path)


def write_articles_to_database(file_path, continents):
    if path.isfile(file_path) is False:
        raise Exception("File not found")
        return 0
        
    with open(file_path, 'w') as database:
        database.write(jsonpickle.encode(continents, indent = 4))


def update_news():
    print("updating news. ", datetime.utcnow().strftime('%B %D %Y - %H:%M:%S')) # was %d
    articles = scrape_all_news_pages()
    for article in articles:
        print(article)
    assign_articles_to_country(articles, borders.continent_list)
    write_articles_to_database(database_file_path, borders.continent_list)


if __name__ == "__main__":

    last_update_date_utc = datetime.utcnow()
    update_news()
    
    while True:
        if (datetime.utcnow().hour - last_update_date_utc.hour) >= 6 :
            update_news()
        break



