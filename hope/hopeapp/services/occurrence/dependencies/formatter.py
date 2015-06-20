import simplejson
from hopeapp.interfaces.formatter import *
from hopeapp.helpers.occurrences import *
from django.utils.dateformat import DateFormat

# Format the output


class OccurrenceXMLFormatter(Formatter):

    def __init__(self):
        pass


class OccurrenceHTMLFormatter(Formatter):

    def __init__(self):
        pass


class OccurrenceJSONFormatter(Formatter):

    def __init__(self):
        pass

    # with options['single'] we can now
    # if we need to format only one or
    # a list
    def output(self, obj, options={}):
        if 'single' in options:
            return self._format_json_single(obj, options)
        else:
            return self._format_json_list(obj, options)

    def _format_json_list(self, obj, options):
        if (len(obj) > 0):
            result = []

            for occ in obj:
                df = DateFormat(occ.created_at)
                new_date = df.format('m/d/Y H:i:s')

                o = {	'is_owner': is_owner(occ.id, options['request_user_id']),
                      'id': occ.id,
                      'user_id': occ.user_id,
                      'created_at': str(new_date),
                      'coordinate': occ.coordinate,
                      'category_id': occ.category_id,
                      'category_name': occ.category.name,
                      'title': occ.title,
                      'description': occ.description,
                      'validated': occ.validated,
                      'vote_counter': occ.vote_counter
                      }
                result.append(o)

            return simplejson.dumps(result)
        else:
            return simplejson.dumps({'Success': False})

    def _format_json_single(self, obj, options):
        return simplejson.dumps(obj)
