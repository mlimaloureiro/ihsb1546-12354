import simplejson
from hopeapp.interfaces.formatter import *
from django.utils.dateformat import DateFormat

class OccurrenceXMLFormatter(Formatter):

    def __init__(self):
        pass


class CategoryHTMLFormatter(Formatter):

    def __init__(self):
        pass


class CategoryJSONFormatter(Formatter):

    def __init__(self):
        pass

    def output(self, obj, options={}):
        if 'single' in options:
            return self._format_json_single(obj, options)
        else:
            return self._format_json_list(obj, options)

    def _format_json_single(self, obj, options):
        if 'msg' in options:
            obj['msg'] = options['msg']
    	return simplejson.dumps(obj)
    	
    def _format_json_list(self, obj, options):
   		return simplejson.dumps(obj)