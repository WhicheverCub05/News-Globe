
class article:
    headline = ""
    source = ""
    date = ""
    

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


class country:
    articles = [article]

    def __init__(self, name, continent):
        self.name = ""
        self.continent = ""

    def __str__(self):
        return f"name : {self.name},\n" + f"continent : {self.continent}"

    def add_article(article):
        self.articles.add(article)

    def get_name():
        return self.name