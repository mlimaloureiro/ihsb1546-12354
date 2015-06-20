from hopeapp.interfaces.repository import *

class MapMongoRepository(Repository):
    
    def __init__(self, connection = None):
        if connection:
            self.db = connection

    # returns map object
    def create(self, options={}):
        if self.db.map_attributes.insert(options):
            return self.db.map_attributes.find_one({'id': options['id']})
        else:
            return False

    # returns object
    def get(self, ident, options={}):
        return self.db.map_attributes.find_one({'id' : ident})

    # returns object
    def filter(self, options={}):
        return self.db.map_attributes.find(options)

    # returns bool
    def delete(self, ident, options={}):
        return self.db.map_attributes.remove({'id' : ident})

    # returns object
    def update(self, ident, options={}):
        model = self.db.map_attributes.find_one({'id' : ident})
        
        # if attrs exists in map attributes, update it
        for p in options:
            if p in model:
                model[p] = options[p]

        self.db.map_attributes.save(model)
        return model
