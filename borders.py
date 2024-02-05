import pandas as pd

class Article:

    def __init__(self, headline, date, source):
        self.headline = headline
        self.date = date
        self.source = source
        
    # use __str__ for user
    def __str__(self):
        return f"headline : {self.headline}"

    # use __repr__ instead of __str__ for debugging
    def __repr__(self):
        return f"headline: {self.headline}\n" + f"source: {self.source}\n" + f"date: {self.date},\n"

    def set_headline(headline):
        self.headline = headline

    def set_source(source):
        self.source = source

    def set_date(date):
        self.date = date

    def get_headline():
        return self.headline

    def get_source():
        return self.source
    
    def get_date():
        return self.date


class Country:

    def __init__(self, name, code):
        self.name = name
        self.code = code
        # self.continent = ""
        self.articles = []
        self.cities = []
        
    def __str__(self):
        return f"name : {self.name}\n"
    
    def add_article(self, article):
        self.articles.append(article)

    def add_city(self, city):
        # print(f"{self.name} adding city:", city)
        self.cities.append(city)

    def get_name():
        return self.name

    def get_code():
        return self.code

    def is_associated(self, text):
        # checks if country is associated with content of text due to its name or city names
        if self.name.lower() in text.lower():
            return True
        else:
            for city in self.cities:
                if city.lower() in text.lower():
                    return True

        return False


class Continent:

    def __init__(self, name, code):
        self.name = name
        self.code = code
        self.countries = {}


    def add_country(self, country):
        # print(f"{self.name} adding country:", country.name)
        self.countries[country.code] = country
            

    def get_country(name):
        for country in countries:
            if country.name == name:
                return country
            

def make_countries_from_country_list(countries):
    country_objects_list = []
    for country in countries:
        country_objects_list.append(Country(country))
    return country_objects_list


def get_continent_from_list(name):
    for continent in continent_list:
        if lower(continent.name) == lower(name):
            return continent


def get_country_from_list(name):
    for continent in continent_list:
        for country in continent.countries:
            if lower(country) == lower(name):
                return country


continent_list =   [Continent("ASIA", "AS"), 
                    Continent("AFRICA", "AF"),  
                    Continent("ANTARTICA", "AN"), 
                    Continent("NORTH_AMERICA", "NA"), 
                    Continent("SOUTH_AMERICA", "SA"),
                    Continent("EUROPE", "EU"), 
                    Continent("OCEANIA", "OC")]


def get_countries_from_csv(file_path, continent_list):

    print("Populating continents with cities from:", file_path)
    
    try:
        countries_file = pd.read_csv(file_path, keep_default_na=False)
    
    except FileNotFoundError:
        print(f"file {file_path} does not exist. please check spelling")
        exit()

    except e:
        print("Error while trying to read file")
        exit()

    for row in range(len(countries_file)):
        continent_code = countries_file['Continent_Code'][row]
        country_name = countries_file['Country_Name'][row]
        country_code = countries_file['Three_Letter_Country_Code'][row]
        for continent in continent_list:
            if continent.code == continent_code:
                continent.add_country(Country(country_name, country_code)) 
                
    print("complete\n")


def get_cities_from_csv(file_path, continent_list):
    print("Populating countries with cities from:", file_path)

    try:
        cities_file = pd.read_csv(file_path)
    
    except FileNotFoundError:
        print(f"file {file_path} does not exist. please check spelling")
        exit()

    except e:
        print("Error while trying to read file")
        exit()

    for row in range(len(cities_file)):
        country_code = cities_file["iso3"][row]
        city_name = cities_file["city_ascii"][row]

        for continent in continent_list:
            if country_code in continent.countries:
                continent.countries[country_code].add_city(city_name)

    print("complete\n")


get_countries_from_csv("country_and_continent_codes_amended.csv", continent_list)
get_cities_from_csv("capital_and_large_cities.csv", continent_list)