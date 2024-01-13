# For when news apis just won't do

from datetime import datetime

# defining which news networks  
news_dict['CNN'] = 'cnn.com'
news_dict['BBC'] = 'bbc.co.uk'
news_dict['Al Jazeera'] = 'aljazeera.com'


def update_news():
    scrape()
    write_to_json()
    last_update_date = datetime.now()
    print("updated", last_update_date)


def scrape():
    print("scraped")


def write_to_json():
    # open read/write news_data.json
    # for each news cycle update news_data
    print("updated")


def __init__():
    last_update_date_utc = datetime.utcnow()
    while true:
        if (datetime.utcnow().hour - last_update_date_utc.hour) >= 6 :
            update_news()


__init__()