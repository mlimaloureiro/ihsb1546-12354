# Interface


class Formatter():

    def __init__(self):
        pass

    def output(self, obj, options={}):
        raise NotImplementedError("Subclass must implement abstract method")
