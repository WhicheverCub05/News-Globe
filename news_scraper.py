# For when news apis just won't do
from borders import Continent
from borders import Country
from borders import Article

from bs4 import BeautifulSoup
import requests
import borders
import json
import jsonpickle # allows for serialization of more complex objects
from datetime import datetime
from os import path

database_file_path = 'news_data.json'

# defining which news networks  
news_dict = {}
news_dict['CNN'] = 'https://edition.cnn.com/world'
news_dict['BBC'] = 'https://www.bbc.com/news'
news_dict['Al Jazeera'] = 'https://www.aljazeera.com/news/'


def scrape_all_news_pages():
    # for each news network
    print("scraping pages")
    response = requests.get(news_dict.get('Al Jazeera'))
    soup = BeautifulSoup(response.content, 'html.parser')

    headline = soup.select('span span')
    news_items = soup.select('li.featured-articles-list__item ')

    print("news items read:", news_items[0]['.href'])

    for i in range(len(news_items)):
        article = json.load(news_items[i])
        print(f"{article}, {headline[i].text}")


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

    clear_json_database(file_path)
    
    data = []
    
    #print("shit:", json.dumps(countries.__dict__))

    print("continents: ", str(continents))

    with open(file_path, 'w') as database:
        database.write(jsonpickle.encode(continents, indent = 4))


def update_news():
    print("updating news. ", datetime.utcnow().strftime('%B %D %Y - %H:%M:%S')) # was %d
    scrape_all_news_pages()
    write_articles_to_database(database_file_path, borders.continent_list)


if __name__ == "__main__":

    last_update_date_utc = datetime.utcnow()
    update_news()
    
    while True:
        if (datetime.utcnow().hour - last_update_date_utc.hour) >= 6 :
            update_news()
        break



