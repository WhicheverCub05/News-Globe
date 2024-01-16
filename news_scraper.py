# For when news apis just won't do
import borders
import json
import jsonpickle # allows for serialization of more complex objects
from datetime import datetime
from os import path

database_file_path = 'news_data.json'

# defining which news networks  
news_dict = {}
news_dict['CNN'] = 'cnn.com'
news_dict['BBC'] = 'bbc.co.uk'
news_dict['Al Jazeera'] = 'aljazeera.com'


def update_news():
    print("updating news. ", datetime.utcnow().strftime('%B %D %Y - %H:%M:%S')) # was %d
    scrape()
    write_articles_to_database(database_file_path, borders.continent_list)


def scrape():
    print("scraped")


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

    for continent in continents:
        for county in continent.countries:
            data.append(jsonpickle.encode(country, indent = 4))

    print("data to write:\n", data)

    print("continents: ", continents)

    """
    with open(file_path, 'w') as database:
        database.write("[\n")
        
        for i in range(len(countries)):
            database.write(json.dumps(countries[i].__dict__, default=vars, indent = 8))
            if i < len(countries) - 1:
                database.write(",")
        
        database.write("\n]")
    """


if __name__ == "__main__":

    last_update_date_utc = datetime.utcnow()
    update_news()
    
    while True:
        if (datetime.utcnow().hour - last_update_date_utc.hour) >= 6 :
            update_news()
        break



