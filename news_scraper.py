# For when news apis just won't do
import classes
import json
from datetime import datetime

# defining which news networks  
news_dict = {}
news_dict['CNN'] = 'cnn.com'
news_dict['BBC'] = 'bbc.co.uk'
news_dict['Al Jazeera'] = 'aljazeera.com'


continents = ["ASIA", "AFRICA", "AUSTRALIA", "ANTARTICA", "NORTH_AMERICA", "SOUTH_AMERICA", "EUROPE"]


# example countries
country_list = [country("England", continents(6)), 
                country("USA", continents(4)), 
                country("China", continents(0)), 
                country("Palestine", continents(6))]

database_file_location = 'news_data.json'


def update_news():
    scrape()
    write_articles_to_database()
    print("updating news. ", datetime.utcnow)


def scrape():
    print("scraped")


def open_json_database(location):
    data_file = open(location)
    data = json.load(data_file)
    print("opened: ", location, "\n current data:\n", data)
    return data


def clear_json_database(location):
    print("cleared: ", location) 


def write_articles_to_database(location, *countries):

    data = open_json_database(location)

    clear_json_database(location)
    
    for countries in country_list:
        json.dump(country, indent = 4)
    
    print("updated. data: \n", data)



def __init__():
    last_update_date_utc = datetime.utcnow()
    update_news()
    
    while true:
        if (datetime.utcnow().hour - last_update_date_utc.hour) >= 6 :
            update_news()



__init__()