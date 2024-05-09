from borders import Article
from bs4 import BeautifulSoup
from datetime import datetime
import requests
import re
import time
import pandas as pd
from datetime import datetime

# from selenium import webdriver
# from selenium.webdriver import Chrome

from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class web_scraper:
    """class for webscrapers. news scrapers inherit web_scraper and overwrite scrape_page()
    """
    def __init__(self, name, webpages):
        self.name = name
        self.webpages = webpages
        self.articles = []
        self.article_count = 0
        self.useful_articles_count = 0

    def format_headline(self, headline):
        """formats headline to remove html utf-8 chars and used to filter headlines

        Args:
            headline (string): headline to format or reject

        Returns:
            String: formatted headline
            Bool: False if headline is not really a headline
        """
        if headline == None:
            return False
        if len(headline.split()) < 5:
            return False
        if "edition" in headline.lower():
            return False
        if "getty" in headline.lower():
            return False
        if len(headline) > 150:
            return False
        headline = headline.lstrip()
        headline = headline.rstrip()
        headline = headline.replace("0x0D", "")
        headline = headline.replace("0x0A", "")
        headline = headline.replace("0x20", "")
        headline = re.sub('\u00ad', '', headline)
        headline = re.sub('\n', '', headline)
        return headline

    def format_source(self, source):
        """formats the source to ensure source is written as web page address rather than subfolder

        Args:
            source (string): source string

        Returns:
            String: corrected source
            Bool: False if source is empty
        """
        if 'https' in source:
            return source
        if source == "":
            return False
        if source[0] == "/":
            source = source[1:]

        return self.webpages[0]+source

    def format_date(self, date):
        """formats the date so date is consistent

        Args:
            date (datetime): the date as a datetime object

        Returns:
            date: the date as a string
        """
        if not isinstance(date, str):
            date = str(date)
        return date

    def get_page(self, url):
        """gets page from url using BeautifulSoup

        Args:
            url (string): url of webpage

        Returns:
            BeautifulSoup object: lxml string
        """
        response = requests.get(url)
        return BeautifulSoup(response.content, 'lxml')

    def scrape_page(self, url):
        """scrape webpage method to be extended or overwritten. does nothing atm

        Args:
            url (string): url of webpage
        """
        print(f'scraping {url}')

    def scrape_all(self):
        for i in range(len(self.webpages)-1):
            current_article_count = len(self.articles)
            page_url = self.webpages[0] + self.webpages[i+1]
            self.scrape_page(page_url)
            # print(
            #    f"scraping {page_url} : {len(self.articles)-current_article_count}")
        self.article_count = len(self.articles)
        print("Number of articles: ", self.article_count)


class cnn_scraper(web_scraper):
    """web_scraper subclass to scrape cnn

    Args:
        web_scraper (class web_scraper): Parent class
    """

    def scrape_page(self, url):
        """overriten method from web_scraper parent class to scrape cnn

        Args:
            url (string): webpage url
        """
        soup = self.get_page(url)

        news_items_block = soup.select('.scope .container .container__link')
        news_items_date = datetime.today()

        for i in range(len(news_items_block)):
            news_items_headline = news_items_block[i].text
            news_items_source = news_items_block[i].attrs['href']

            headline = self.format_headline(news_items_headline)
            source = self.format_source(news_items_source)
            date = self.format_date(news_items_date)
            if not headline or not source:
                continue
            self.articles.append(Article(headline, source, date))


class bbc_scraper(web_scraper):
    """web_scraper subclass to scrape bbc

    Args:
        web_scraper (class web_scraper): Parent class
    """

    def scrape_page(self, url):
        """overriten method from web_scraper parent class to scrape bbc

        Args:
            url (string): webpage url
        """
        soup = self.get_page(url)

        news_items = soup.select('a[data-testid="internal-link"]')

        for i in range(len(news_items)):

            headline = news_items[i].select("h2")

            if headline != "" and headline != []:
                headline = headline[0].get_text()
            else:
                continue
            date = "-"

            headline = self.format_headline(headline)

            if news_items[i]['href']:
                source = self.format_source(news_items[i]['href'])
            else:
                continue
            if not headline or not source:
                continue
            self.articles.append(Article(headline, source, date))


class al_jazeera_scraper(web_scraper):
    """web_scraper subclass to scrape al jazeera

    Args:
        web_scraper (class web_scraper): Parent class
    """

    def scrape_page(self, url):
        """overriten method from web_scraper parent class to scrape al jazeera

        Args:
            url (string): webpage url
        """
        soup = self.get_page(url)

        # .featured-articles-list__item span
        news_items_content = soup.select('.u-clickable-card__link')
        news_items_date = soup.select(".gc__date__date .screen-reader-text")

        for i in range(len(news_items_content)):
            headline = self.format_headline(news_items_content[i].get_text())
            source = self.format_source(news_items_content[i]['href'])
            date = "-"
            if i <= len(date):
                date = self.format_date(news_items_date[i].get_text())

            if not headline or not source:
                continue
            self.articles.append(Article(headline, source, date))


class the_guardian_scraper(web_scraper):
    """web_scraper subclass to scrape the guardian

    Args:
        web_scraper (class web_scraper): Parent class
    """

    def scrape_page(self, url):
        """overriten method from web_scraper parent class to scrape the guardian

        Args:
            url (string): webpage url
        """
        soup = self.get_page(url)

        news_item_block = soup.select('li a')
        # news_item_block_most_viewed = soup.select('#most-viewed li a[href]')

        for item in news_item_block:

            if item.get('aria-label'):
                headline = item.get('aria-label')
            else:
                headline = item.text

            headline = self.format_headline(headline)

            if item.get('href'):
                source = self.format_source(item.get('href'))
            else:
                continue
            if not headline or not source:
                continue
            self.articles.append(Article(headline, source, "-"))


class euronews_scraper(web_scraper):
    """web_scraper subclass to scrape euronews

    Args:
        web_scraper (class web_scraper): Parent class
    """

    def scrape_page(self, url):
        """overriten method from web_scraper parent class to scrape euronews

        Args:
            url (string): webpage url
        """
        soup = self.get_page(url)

        news_item_block = soup.select('article a')

        for item in news_item_block:
            headline = item.get('aria-label')

            if headline == None:
                continue

            headline = self.format_headline(headline)

            if item.get('href'):
                source = self.format_source(item.get('href'))
            else:
                continue
            if not headline or not source:
                continue
            self.articles.append(Article(headline, source, ""))


class africanews_scraper(web_scraper):
    """web_scraper subclass to scrape africanews

    Args:
        web_scraper (class web_scraper): Parent class
    """

    def scrape_page(self, url):
        """overriten method from web_scraper parent class to scrape africanews

        Args:
            url (string): webpage url
        """
        soup = self.get_page(url)

        news_item_block = soup.select('article a')

        for item in news_item_block:
            headline = self.format_headline(item.text)
            source = self.format_source(item.get('href'))

            if not headline or not source:
                continue
            self.articles.append(Article(headline, source, ""))


class ap_news_scraper(web_scraper):
    """web_scraper subclass to scrape ap news

    Args:
        web_scraper (class web_scraper): Parent class
    """

    def scrape_page(self, url):
        """overritten method from web_scraper parent to scrape ap news

        Args:
            url (string): webpage url
        """
        soup = self.get_page(url)

        news_item_block = soup.select('.PagePromo-content')

        for item in news_item_block:
            headline = self.format_headline(item.select("bsp-custom-headline a span")
                                            [0].getText())
            source = self.format_source(
                item.select("bsp-custom-headline a")[0].get('href'))

            if (item.select(".PagePromo-date bsp-timestamp")):
                timestamp = item.select(
                    ".PagePromo-date bsp-timestamp")[0].get('data-timestamp')
                date = str(datetime.fromtimestamp((int(timestamp))//1000)) # type: ignore
            else:
                date = ""

            if not headline or not source:
                continue
            self.articles.append(Article(headline, source, date))


class reuters_scraper(web_scraper):
    """web_scraper subclass to scrape reuters

    Args:
        web_scraper (class web_scraper): Parent class
    """

    def scrape_page(self, url):
        """ <still developing> overriten method from web_scraper parent class to scrape reuters. uses selenium to scrape javascript

        Args:
            url (string): webpage url
        """
        return 0
