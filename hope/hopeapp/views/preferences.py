import simplejson
from django.conf import settings
from django.http import HttpResponse
from hopeapp.models import *
from hopeapp.helpers.categories import *
# connecting to mongoDB
from pymongo import *
dbmongo = MongoClient(settings.MONGO_URL)
mongo = dbmongo.hope

# TODO: make query with geom != '' instead of handle the result
# 
def get(request, ident):
    shapes_values = []
    shapes = mongo.map_attributes.find({'category_id': str(ident)})

    for s in shapes:
        if (len(s['geom']) > 0):
            obj = {'geom': s['geom'], 'id': s['id']}
            shapes_values.append(obj)

    return HttpResponse(simplejson.dumps(shapes_values), content_type="json")


def destroy_shapes(request, ident):
    return HttpResponse('ok')
