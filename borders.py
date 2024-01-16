
class Article:

    def __init__(self, headline, date, source):
        print("idk article made")
        self.headline = headline
        self.source = source
        self.date = date
        
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
    articles = []

    def __init__(self, name, Continent):
        self.name = name
        self.continent = Continent

    def __str__(self):
        return f"name : {self.name},\n" + f"continent : {self.continent.name}"

    def add_article(article):
        self.articles.add(article)

    def get_name():
        return self.name


class Continent:

    countries = []

    def __init__(self, name):
        self.name = name

    def add_country(Country):
        self.countries.add(Country)

    def get_country(name):
        for country in countries:
            if country.name == name:
                return country



continent_list =   [Continent("ASIA"), 
                    Continent("AFRICA"), 
                    Continent("AUSTRALIA"), 
                    Continent("ANTARTICA"), 
                    Continent("NORTH_AMERICA"), 
                    Continent("SOUTH_AMERICA"), 
                    Continent("EUROPE")]

# example countries
country_list = [Country("England", continent_list[6]), 
                Country("USA", continent_list[4]), 
                Country("China", continent_list[0]), 
                Country("Palestine", continent_list[6])]

# make iteratively and sort my continent

