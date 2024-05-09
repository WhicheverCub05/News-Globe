# For when news apis just won't do
from datetime import datetime
from os import path
import borders
import json
import jsonpickle  # allows for serialization of more complex objects
import scraper_class as sc

database_file_path = 'news_data/news_data.json'

# defining which news networks
news_dict = {}
news_dict['CNN'] = sc.cnn_scraper, ['https://edition.cnn.com/world/', 'africa', 'americas',
                                    'asia', 'australia', 'china', 'europe', 'india', 'middle-east', 'united-kingdom']
news_dict['BBC'] = sc.bbc_scraper, ['https://www.bbc.com/', 'news/world/africa',
                                    'news/world/asia', 'news/world/australia', 'news/world/europe', 'news/world/latin_america', 'news/world/middle_east', 'news/world/us_and_canada']
news_dict['Al Jazeera'] = sc.al_jazeera_scraper, ['https://www.aljazeera.com/', 'news',
                                                  'africa', 'middle-east', 'asia', 'us-canada', 'latin-america', 'europe', 'asia-pacific']
news_dict['The Guardian'] = sc.the_guardian_scraper, ['https://www.theguardian.com/', 'international',
                                                      'world/middleeast', 'world/africa', 'world/europe-news', 'world/americas', 'world/asia', 'australia-news']
news_dict['Euro News'] = sc.euronews_scraper, ['https://www.euronews.com/',
                                               'my-europe', 'my-europe/europe-news', 'news/international', 'programs/world']
news_dict['Africa News'] = sc.africanews_scraper, ['https://www.africanews.com/',
                                                   'news', 'business', 'sport', 'culture', 'science-technology']
news_dict['AP News'] = sc.ap_news_scraper, ['https://apnews.com/hub/', 'asia-pacific',
                                            'latin-america', 'europe', 'africa', 'middle-east', 'china', 'australia']
news_dict['Reuters'] = sc.reuters_scraper, ['https://www.reuters.com/', 'world', 'world/africa',
                                            'world/china', 'world/europe', 'world/india', 'world/japan', 'world/middle-east', 'world/americas']

# counter for how many articles are relevant
total_articles = 0
relevent_articles = 0


def assign_articles_to_country(articles, continents):
    """assigns article to each country 

    Args:
        articles (article): list of all articles to add
        continents (list of continents): all continents to search for countries
    """
    print("\n")
    global relevent_articles
    global total_articles
    for article in articles:
        total_articles += 1
        for continent in continents:
            for country in continent.countries.values():
                if country.is_associated(article.headline):
                    """if "Canada" in article.headline:
                        print(article.headline)
                        print(article.source)
                        print(article.date, " date type ", type(article.date))
                        input()
                    if country.name == "Canada":
                        print(country.articles)
                    """
                    if country.add_article(article):
                        relevent_articles += 1


def scrape_news_page(news_dictionary, news_channel_name):
    """calls news scrape function for news channel and returns all articles

    Args:
        news_channels (dict): dictionary of news sites

    Returns:
        Articles array: all_articles
    """
    all_articles = []

    news_channel = news_dictionary[news_channel_name]

    print(f'scraping {news_channel_name} + {news_channel[1]}')

    news_object = news_channel[0](news_channel_name, news_channel[1])
    news_object.scrape_all()
    all_articles.extend(news_object.articles)
    print(f'article length {len(all_articles)}')
    return all_articles


def scrape_all_news_pages(news_dictionary):
    """calls all news scrape functions and compiles articles into one array

    Args:
        news_channels (dict): dictionary of news sites

    Returns:
        Articles array: All articles
    """
    all_articles = []
    tmp_article_list = []
    print("\n")

    for news_name, news_info in news_dictionary.items():
        print(f"\nname: {news_name}, class {news_info[0]}")

        news_object = news_info[0](news_name, news_info[1])
        news_object.scrape_all()

        all_articles.extend(news_object.articles)

    for article_list in tmp_article_list:
        for article in article_list:
            all_articles.append(article)

    return all_articles


def read_json_database(file_path):
    """Opens and reads .json file

    Args:
        file_path (string): file path of .json file

    Returns:
        String: text on .json file
    """
    data_file = open(file_path)
    data = json.load(data_file)
    print("opened: ", file_path, "\n current data:\n", data)
    return data


def write_articles_to_database(file_path, continents):
    """write all continents with countries and articles to json file 

    Args:
        file_path (string): file path and name
        continents (string): Continent object array 

    Raises:
        Exception: file not found

    """
    if path.isfile(file_path) is False:
        raise Exception("File not found")
        return

    with open(file_path, 'w') as database:
        json_obj = jsonpickle.encode(continents, indent=4, make_refs=False)
        database.write(json_obj)  # type: ignore


def update_news():
    global total_articles
    global revelent_articles
    """updates news and prints number of articles 
    """
    print("updating news. ", datetime.utcnow().strftime(
        '%B %D %Y - %H:%M:%S'))  # was %d

    articles = scrape_all_news_pages(news_dict)
    # articles = scrape_news_page(news_dict, 'AP News')  # for testing

    assign_articles_to_country(articles, borders.continent_list)
    write_articles_to_database(database_file_path, borders.continent_list)

    print("total: ", total_articles)
    print("total relevent: ", relevent_articles)


if __name__ == "__main__":
    """while running, updates news every 6 hours
    """
    borders.get_countries_from_csv(
        "location_data/country_and_continent_codes_amended.csv", borders.continent_list)
    borders.get_cities_from_csv(
        "location_data/capital_and_large_cities.csv", borders.continent_list)

    update_news()
