
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
        return f"headline : {self.headline},\n" + f"source : {self.source},\n" + f"date : {self.date}"

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

    def __init__(self, name):
        self.name = name
        self.continent = ""
        self.article = []
        
    def __str__(self):
        return f"name : {self.name},\n" + f"continent : {self.continent}"

    def set_continent(self, continent):
        self.continent = continent
    
    def get_continent():
        return self.continent

    def add_article(article):
        self.articles.add(article)

    def get_name():
        return self.name


class Continent:

    def __init__(self, name):
        self.name = name
        self.countries = []

    def add_country(self, Country):
        for country in Country:
            print(f"{self.name} adding country:", country.name)
            country.set_continent(self.name)
            self.countries.append(country)
            

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


# countries
asia_country_list = ["China", "Russia"]
africa_country_list = []
australia_country_list = []
antartica_country_list = []
north_america_country_list = ["US"]
south_america_country_list = []
europe_country_list = ["England", "Palestine"]


continent_list =   [Continent("ASIA"), 
                    Continent("AFRICA"), 
                    Continent("AUSTRALIA"), 
                    Continent("ANTARTICA"), 
                    Continent("NORTH_AMERICA"), 
                    Continent("SOUTH_AMERICA"), 
                    Continent("EUROPE")]


continent_list[0].add_country(make_countries_from_country_list(asia_country_list)) 
continent_list[1].add_country(make_countries_from_country_list(africa_country_list)) 
continent_list[2].add_country(make_countries_from_country_list(australia_country_list)) 
continent_list[3].add_country(make_countries_from_country_list(antartica_country_list)) 
continent_list[4].add_country(make_countries_from_country_list(north_america_country_list)) 
continent_list[5].add_country(make_countries_from_country_list(south_america_country_list)) 
continent_list[6].add_country(make_countries_from_country_list(europe_country_list))

print("\n ================ \n")
