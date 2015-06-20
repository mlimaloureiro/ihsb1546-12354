# interface
class Repository():

    # returns array
    def create(self, options={}):
        raise NotImplementedError("Subclass must implement abstract method")

    # returns array
    def get(self, ident, options={}):
        raise NotImplementedError("Subclass must implement abstract method")

    # returns array
    def filter(self, order_by, params={}):
        raise NotImplementedError("Subclass must implement abstract method")

    # returns bool
    def delete(self, ident, params={}):
        raise NotImplementedError("Subclass must implement abstract method")

    # returns bool
    def update(self, ident, params={}):
        raise NotImplementedError("Subclass must implement abstract method")
