import pandas as pd


class Article:
    """Article class which stores information about an article (headline, source, date)
    """
    def __init__(self, headline, source, date):
        self.headline = headline
        self.date = date
        self.source = source

    # use __str__ for user
    def __str__(self):
        return f"headline : {self.headline}"

    # use __repr__ instead of __str__ for debugging
    def __repr__(self):
        return f"headline: {self.headline}\n" + f"source: {self.source}\n" + f"date: {self.date},\n"


class Country:
    """Country class which stores array of articles country info like cities 
    """
    def __init__(self, name, code):
        self.name = name
        self.code = code
        # self.continent = ""
        self.articles = []
        self.cities = []

    def __str__(self):
        return f"name : {self.name}\n"

    def add_article(self, new_article):
        if len(self.articles) < 1:
            self.articles.append(new_article)
        else:
            for article in self.articles:
                if new_article.headline == article.headline:
                    return False

            self.articles.append(new_article)
        return True

    def add_city(self, city):
        # print(f"{self.name} adding city:", city)
        self.cities.append(city)

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
    """Continent class which stores array of countries 
    """
    def __init__(self, name, code):
        self.name = name
        self.code = code
        self.countries = {}

    def add_country(self, country):
        # print(f"{self.name} adding country:", country.name)
        self.countries[country.code] = country

    def get_country(self, name):
        for country in self.countries:
            if country.name == name:
                return country


def make_countries_from_country_list(countries):
    country_objects_list = []
    for country in countries:
        country_objects_list.append(Country(country)) # type: ignore
    return country_objects_list


def get_continent_from_list(name):
    for continent in continent_list:
        if continent.name.lower() == name.lower():
            return continent


def get_country_from_list(name):
    for continent in continent_list:
        for country in continent.countries:
            if country.lower() == name.lower():
                return country


continent_list = [Continent("ASIA", "AS"),
                  Continent("AFRICA", "AF"),
                  Continent("ANTARTICA", "AN"),
                  Continent("NORTH_AMERICA", "NA"),
                  Continent("SOUTH_AMERICA", "SA"),
                  Continent("EUROPE", "EU"),
                  Continent("OCEANIA", "OC")]


def get_countries_from_csv(file_path, continent_list):
    """reads csv file with country information 

    Args:
        file_path (_type_): _description_
        continent_list (_type_): _description_
    """
    print("Populating continents with cities from:", file_path)

    try:
        countries_file = pd.read_csv(file_path, keep_default_na=False)

    except FileNotFoundError:
        print(f"file {file_path} does not exist. please check spelling")
        exit()

    except Exception as e:
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

    except Exception as e:
        print("Error while trying to read file")
        exit()

    for row in range(len(cities_file)):
        country_code = cities_file["iso3"][row]
        city_name = cities_file["city_ascii"][row]

        for continent in continent_list:
            if country_code in continent.countries:
                continent.countries[country_code].add_city(city_name)

    print("complete\n")



