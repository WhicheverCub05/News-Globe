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
news_dict['Al Jazeera'] = ['https://www.aljazeera.com/', 'news', 'africa', 'middle-east', 'asia', 'us-canada', 'latin-america', 'europe', 'asia-pacific']
news_dict['The Guardian'] = ['https://www.theguardian.com/', 'international', 'world/middleeast', 'world/africa', 'world/europe-news', 'world/americas', 'world/asia', 'world/australia-news']

news_dict_count = {}
news_dict_count['CNN'] = 0
news_dict_count['BBC'] = 0
news_dict_count['Al Jazeera'] = 0
news_dict_count['The Guardian'] = 0

relevent_articles = 0

def assign_articles_to_country(articles, continents):
    print("\n")
    global relevent_articles
    for article in articles:
        for continent in continents:
            for country in continent.countries.values():
                if country.is_associated(article.headline):
                    country.add_article(article)
                    print(f"added: {article.headline} to {country.name}")
                    relevent_articles += 1



def scrape_the_guardian(url):
    print("\nscraping the guardian ", url)
    articles = []
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'lxml')

    news_item_block = soup.select('li a')
    # news_item_block_most_viewed = soup.select('#most-viewed li a[href]')
        
    for item in news_item_block:

        headline = ""
        source = ""

        if item.get('aria-label'):
            headline = item.get('aria-label')
        else:
            headline = item.text

        if len(headline.split()) < 5:
            continue
        
        headline = headline.lstrip()
        headline = headline.rstrip()
        headline = headline.replace("0x0D", "")
        headline = headline.replace("0x0A", "")
        headline = headline.replace("0x20", "")

        if item.get('href'):
            source = item.get('href')
            if 'https' not in source:
                source = f'https://theguardian.com{source}'
        else:
            continue

        articles.append(Article(headline, source, ""))
        news_dict_count['The Guardian'] += 1

    return articles


def scrape_cnn(url):
    print("\nscraping CNN ", url)
    articles = []

    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'lxml')
    
    news_items_block = soup.select('.scope .container .container__link')
    news_items_date = datetime.today()
    
    for i in range(len(news_items_block)):
        news_items_headline = news_items_block[i].text
        news_items_source = news_items_block[i].attrs['href']

        headline = re.sub('\n', '', news_items_headline)
        date = news_items_date
        source = f"cnn.com{news_items_source}"
        articles.append(Article(headline, date, source))

        news_dict_count['CNN'] += 1

    return articles
    

def scrape_aljazeera(url):
    print("\nscraping Al Jazeera ", url)

    articles = []

    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'lxml')
    
    news_items_content = soup.select('.featured-articles-list__item .u-clickable-card__link', href=True) # .featured-articles-list__item span 
    news_items_date = soup.select(".featured-articles-list__item .gc__date__date .screen-reader-text")
    
    for i in range(len(news_items_content)):
        headline = re.sub('\u00ad', '', news_items_content[i].get_text())
        date = news_items_date[i].get_text()
        source = f"aljazeera.com{news_items_content[i]['href']}"
        articles.append(Article(headline, date, source))

        news_dict_count['Al Jazeera'] += 1

    return articles


def scrape_bbc(url):
    print("\nscraping BBC ", url)
    articles = []

    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'lxml')

    news_items_headline = soup.select('.gel-layout__item .gs-c-promo-heading__title') # .featured-articles-list__item span 
    news_items_date = datetime.today()
    news_items_source = soup.select(".gel-layout__item .gs-c-promo-heading", href=True)

    for i in range(len(news_items_headline)):
        headline = news_items_headline[i].get_text()
        date = news_items_date
        # print(news_items_source[i])
        if news_items_source[i]['href']:
            source = f"bbc.com{news_items_source[i]['href']}"
        else:
            source = ''
        articles.append(Article(headline, date, source))

        news_dict_count['BBC'] += 1

    return articles


def scrape_all_news_pages():
    all_articles = []
    tmp_article_list = [] 
    tmp_article_list.append(scrape_cnn(news_dict.get('CNN')))
    tmp_article_list.append(scrape_bbc(news_dict.get('BBC')))
    
    for i in range(len(news_dict['Al Jazeera'])-1):
        tmp_article_list.append(scrape_aljazeera(news_dict.get('Al Jazeera')[0] + news_dict.get('Al Jazeera')[i+1]))

    for i in range(len(news_dict['The Guardian'])-1):
        tmp_article_list.append(scrape_the_guardian(news_dict.get('The Guardian')[0] + news_dict.get('The Guardian')[i+1]))
    
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

    assign_articles_to_country(articles, borders.continent_list)
    write_articles_to_database(database_file_path, borders.continent_list)

    print("\n")
    
    total_articles = 0
    for name, count in news_dict_count.items():
        print(f'{name}:{count}')
        total_articles += count

    print("total: ", total_articles)
    print("total relevent: ", relevent_articles)


if __name__ == "__main__":

    last_update_date_utc = datetime.utcnow()
    update_news()
    
    while True:
        if (datetime.utcnow().hour - last_update_date_utc.hour) >= 6 :
            update_news()
        break



