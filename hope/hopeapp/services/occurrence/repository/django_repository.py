from hopeapp.models import *
from hopeapp.interfaces.repository import *
from hopeapp.helpers.occurrences import *
from hopeapp.helpers.categories import *
from django.conf import settings
# needs to be injected has dependency
from pymongo import *
dbmongo = MongoClient(settings.MONGO_URL)
mongo = dbmongo[settings.MONGO_DATABASE]

class OccurrenceDjangoORMRepository(Repository):
    # returns an {'default_values', 'schema_values',}

    def __init__(self, connection = None):
        if connection:
            self.db = connection

    def create(self, values = {}):

        category_id = values['category_id']
        title = values['title']
        description = values['description']
        user = User.objects.get(id = values['user'])
        category = Categories.objects.get(id = category_id)
        coordinate = values['coordinate']
        validated = values['validated']
        vote_counter = values['vote_counter']
        created_at = values['created_at']
        updated_at = values['updated_at']
        bullshit = values['bullshit']

        # save the occurrence
        occ = Occurrences(
                user        = user, 
                category    = category, 
                title       = title, 
                description = description,
                coordinate  = coordinate,
                validated   = validated, 
                vote_counter= vote_counter, 
                created_at  = created_at, 
                updated_at  = updated_at, 
                bullshit    = bullshit)

        occ.save()

        return {
            'id': occ.id, 
            'user_id': occ.user_id, 
            'category_id': category_id, 
            'coordinate': occ.coordinate, 
            'title': occ.title,
            'description': occ.description, 
            'category_name': category.name, 
            'validated': occ.validated, 
            'vote_counter': occ.vote_counter}

    def get(self, ident, options={}):
        try:

            user = options['request_user_id']
            occ = Occurrences.objects.get(id=ident)
            category_name = occ.category.name
            permission = has_write_permission(ident, user)
            following = is_following(occ, user)

            default_values =  {'is_following':	following,
                               'is_owner'    :   is_owner(ident, user),
                               'id'          :	occ.id,
                               'user_id'	 :	occ.user_id,
                               'permission'  :	permission, 
                               'user_name'	 :	occ.user.username,
                               'created_at'  :	str(occ.created_at),
                               'category_id' :	occ.category_id,
                               'Category'	 :	category_name,
                               'coordinate'  :	occ.coordinate,
                               'title'	     :	occ.title,
                               'description' :	occ.description,
                               'validated'	 :	occ.validated,
                               'vote_counter':	occ.vote_counter
                            }

            """ THIS IS TO GO OUT """
            map_values = mongo.map_attributes.find_one({'id': int(ident)})

            if not map_values:
                map_values = {'geo': False, 'geom': False}

            # remove object id, we dont need it and it's not json serializable
            map_values['_id'] = ''
            """ --- """

            result = {'default_values' 	: 	default_values,
                      'geo'				: 	map_values['geo'],
                      'geom'			: 	map_values['geom'],
                      }

            return result
        except Occurrences.DoesNotExist:
            return []

    def get_custom_attributes(self, occ_id):

        result = []
        occ = Occurrences.objects.get(id = occ_id)
        # get values rows from the occurrence custom attributes
        schema_values = occ.attributevalue_set.all()
        # build the objects adding the attr name
        for s in schema_values:
            # get name
            qname = Attributes.objects.get(id=s.attribute_id)
            attr = {'id'            : s.id,
                    'attribute_id'  : s.attribute_id,
                    'name'          : qname.name,
                    'value'         : s.value
                    }
            result.append(attr)
        return result

    def get_photos(self, occ_id):

        result = []
        occ = Occurrences.objects.get(id = occ_id)
        photos_q = Photos.objects.filter(occurrence=occ)
        for p in photos_q:
            cur = {'id'             :   p.id,
                   'path_small'     :   settings.STATIC_URL + p.path_small,
                   'path_medium'    :   settings.STATIC_URL + p.path_medium,
                   'path_big'       :   settings.STATIC_URL + p.path_big
                   }
            result.append(cur)
        return result

    def get_videos(self, occ_id):

        result = []
        occ = Occurrences.objects.get(id = occ_id)
        videos_q = Videos.objects.filter(occurrence=occ)
        for p in videos_q:
            cur = {'id': p.id, 'url': p.url}
            result.append(cur)
        return result

    def initialize_attributes(self, occ_id, category_id):

        try:
            
            occ = Occurrences.objects.get(id = occ_id)
            # get all parent custom attributes
            fields, parents = find_parent_fields(category_id, [], [])

            # get all own custom attributes
            attr = Attributes.objects.filter(category = occ.category)
            
            # start all parent custom attributes with ''
            for field in fields:
                value = AttributeValue(
                            attribute=Attributes.objects.get(id=field['id']),
                            occurrence=occ, 
                            value='',
                            bullshit = 0)
                value.save()

            # start all own custom attributes with ''
            for field in attr:
                value = AttributeValue(
                            attribute=field, 
                            occurrence=occ, 
                            value='',
                            bullshit = 0)
                value.save()

            return True
        except:
            return False

    def initialize_permissions(self, occ_id):

        try:
            occ = Occurrences.objects.get(id = occ_id)
            # add permission
            permission = PermissionsOccurrences(
                            user=occ.user.id,
                            occurrence=occ.id, 
                            read=1, 
                            write=1)

            permission.save()

            return permission
        except:
            return False

    def filter(self, order_by, params={}):
        if(order_by):
            return Occurrences.objects.filter(**params).order_by(order_by)

        return Occurrences.objects.filter(**params)