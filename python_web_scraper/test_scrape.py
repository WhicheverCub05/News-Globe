from bs4 import BeautifulSoup
import requests
import news_scraper as ns
import scraper_class as sc
from borders import Article

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver import FirefoxOptions
from selenium.webdriver import ChromeOptions


def testScrape(news_name):
    news_dict_object = ns.news_dict[news_name]
    news_class = news_dict_object[0]
    news_url_array = news_dict_object[1]

    news_object = news_class(news_name, news_url_array)

    news_object.scrape_all()
    print(news_object.articles)
    print('number of articles: ', news_object.article_count)


def seleniumScrapeWait():
    driver = webdriver.Firefox()
    driver.get("http://somedomain/url_that_delays_loading")
    try:
        element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "myDynamicElement"))
        )
        print("success")
        print(element)
    finally:
        driver.quit()


# seleniumScrapeWait()


def seleniumExample(url):

    opts = FirefoxOptions()
    opts.add_argument("--headless")
    driver = webdriver.Firefox(options=opts)
    driver.get(url)
    try:
        print("trying")
        page = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located(
                (By.ID, "main-content"))
        )
        print("success")
        news_items = page.find_elements(
            By.TAG_NAME, "li")
        # tags = tag_boxes.__getattribute__("text")
        for article_box in news_items:
            print("\n", article_box)
            # headline = article_box.find_element(
            #    By.TAG_NAME, "h3").find_element(By.TAG_NAME, "a").text
            # print(headline)
    except TimeoutException:
        print(f"{url} has timed out")
    finally:
        driver.close()
        driver.quit()

    # download_box = driver.find_elements(
    #     By.CLASS_NAME, "small-widget download-widget")
    # print("download box:", download_box)


testScrape("BBC")

# for debugging - https://www.educative.io/answers/beautiful-soup-select
