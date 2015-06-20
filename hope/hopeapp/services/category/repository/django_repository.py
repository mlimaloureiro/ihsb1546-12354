from hopeapp.models import *
from hopeapp.interfaces.repository import *
from hopeapp.helpers.categories import *
from django.conf import settings
from hopeapp.responses.common_json import *
from django.core import serializers

# needs to be injected has dependency
from pymongo import *
dbmongo = MongoClient(settings.MONGO_URL)
mongo = dbmongo[settings.MONGO_DATABASE]

class CategoryDjangoORMRepository(Repository):

    def __init__(self, connection = None):
        if connection:
            self.db = connection

    def get(self, ident):
        result = {'success':False}
        cat = {}

        try:
            c = Categories.objects.get(id=ident)

            cat = {
                'parent_id': c.parent_id,
                'user': c.user.id,
                'name': c.name,
                'description': c.description,
                'bullshit': c.bullshit,
                'menu_label': c.menu_label,
                'order': c.order,
                'created_at': str(c.created_at),
                'updated_at': str(c.updated_at)
            }
            result['success'] = True
            result.update(cat)

        except Exception as e:
            result['msg'] = e.message

    	return result

    def get_all(self, options={}):

        result = []
        categories = Categories.objects.all().order_by(options['order_by'])
        
        for c in categories:
            result.append({
                'pk': c.id,
                'fields': {
                    'parent_id': c.parent_id,
                    'user': c.user.id,
                    'name': c.name,
                    'description': c.description,
                    'bullshit': c.bullshit,
                    'menu_label': c.menu_label,
                    'order': c.order,
                    'created_at': str(c.created_at),
                    'updated_at': str(c.updated_at)
                }
            })

    	return result

    def create(self, values={}):
        result = {}

        parent_id = values['parent_id']
        user_id = values['user_id']
        name = values['name']
        desc = values['description']
        label = values['menu_label']
        bullshit = values['bullshit']
        order = values['order']
        updated_at = values['updated_at']

        try:
            user = User.objects.get(id=user_id)

            category = Categories(
                    parent_id=parent_id, 
                    user=user, 
                    name=name,
                    description=desc,
                    menu_label=label, 
                    bullshit=bullshit, 
                    order=0,
                    updated_at=updated_at)

            category.save()

            category_id = category.id
            change_category_order(order, parent_id, category_id)
            
            Permissions.objects.create(
                user=user, 
                category=category_id,
                read=1, 
                write=1)

            result['success'] = True
            result['id'] = category_id
        except Exception as e:
            result['success'] = False
            result['error_msg'] = e.message

    	return result

    def edit(self, ident, data={}):
        category = Categories.objects.get(id=ident)
        category.name = data['name']
        category.description = data['description']
        category.menu_label = data['menu_label']
        category.order = data['order']

        category.save()

        change_category_order(data['order'], category.parent_id, category.id)

    	return {'success': True, 'msg': 'Operation successfully done.'}

    def remove(self, ident):
        try:
            category = Categories.objects.get(id=ident)
            list_childs = Categories.objects.filter(parent_id=ident)
            if len(list_childs) > 0:
                remove_childs(list_childs)
            remove_category(category)
            return json.loads(SUCCESS)
        except Categories.DoesNotExist:
            return json.loads(DOES_NOT_EXIST)

    def remove_fields(self, ids=[]):
        for elem in ids:
            if not remove_field(elem):
                return json.loads(DOES_NOT_EXIST)
    	return json.loads(SUCCESS)

    def get_schema(self, ident):
        try:
            category = Categories.objects.get(id=ident)
            success, fields, parents = find_parent_fields(ident, [], [])
            
            attr = Attributes.objects.filter(category=category).values()
            fields.extend(attr)

            details = {}
            details["name"] = category.name
            details["description"] = category.description
            details["menu_label"] = category.menu_label
            details["order"] = category.order

            new_fields = sorted(fields, key=lambda k: k['order'])
            return {'fields': new_fields, 'parents': parents, 'details': details, 'success': True}
        except Exception as e:
            return {'success': False, 'msg': 'Category does not exist.'}

    def get_all_occurrences(self, ident, options={}):
        result = {}
        list_occurr = []
        list_attrs = []

        success, _fields, parents = find_parent_fields(ident, [], [])

        # if success
        if not success:
            return {'success': False, 'msg': 'Invalid request.'}

        category = Categories.objects.get(id=ident)
        parent = Categories.objects.get(id=category.parent_id)
        occurrs = category.occurrences_set.filter(validated=1)
        attrs = category.attributes_set.all()
        attrs_parent = parent.attributes_set.all()

        childs = get_all_childs(category, [])

        for occ in occurrs:
            list_photos = []
            # get occ photos
            occ_photos = occ.photos_set.all()
            for photo in occ_photos:
                list_photos.append(
                    {'path_small': photo.path_small, 
                     'path_medium': photo.path_medium, 
                     'path_big': photo.path_big})

            if occ.validated:
                list_occurr.append(
                    {'photos': list_photos, 
                     'id': occ.id, 
                     'score': 0, 
                     'user_id': occ.user_id, 
                     'occ_selected': True, 
                     'coordinate': occ.coordinate,
                     'title': occ.title, 
                     'description': occ.description, 
                     'validated': occ.validated, 
                     'vote_counter': occ.vote_counter, 
                     'created_at': str(occ.created_at)})

        # get child occurrences
        for child in childs:
            occurrs = child.occurrences_set.all()
            for occ in occurrs:
                list_photos = []
                # get occ photos
                occ_photos = occ.photos_set.all()
                for photo in occ_photos:
                    list_photos.append(
                        {'path_small': photo.path_small, 
                         'path_medium': photo.path_medium, 
                         'path_big': photo.path_big})

                if occ.validated:
                    list_occurr.append(
                        {'photos': list_photos, 
                         'id': occ.id, 
                         'score': 0, 
                         'user_id': occ.user_id, 
                         'occ_selected': True, 
                         'coordinate': occ.coordinate,
                         'title': occ.title, 
                         'description': occ.description, 
                         'validated': occ.validated, 
                         'vote_counter': occ.vote_counter, 
                         'created_at': str(occ.created_at)})

        # get attributes
        for attr in attrs:
            list_attrs.append(
                {'id': attr.id, 
                 'name': attr.name, 
                 'type': attr.a_type})

        for attr in attrs_parent:
            list_attrs.append(
                {'id': attr.id, 
                 'name': attr.name, 
                 'type': attr.a_type})

        list_attrs.append(
            {'id': "followers", 
             "name": "Followers", 
             "type": "cost"})

        result['occurrences'] = list_occurr
        result['attrs'] = list_attrs
        result['success'] = True
        result['parents'] = parents

    	return result

    def get_childs(self, ident):
        try:
            categories_list = Categories.objects.filter(
                parent_id=ident).order_by('order')
            result = serializers.serialize('json', categories_list)
        except Categories.DoesNotExist:
            obj = json.loads(DOES_NOT_EXIST)
            return obj
        else:
            return result

    def edit_values(self, ident, fields=[]):
        for field in fields_edit:
            attr = Attributes.objects.get(id=field["id"])
            attr.order = field["order"]
            attr.name = field["name"]
            attr.data_type = field["data_type"]
            attr.max_value = field["max"]
            attr.min_value = field["min"]
            attr.a_type = field["a_type"]
            attr.scale = field["scale"]
            attr.save()

    	return {"success":True}

    def add_fields(self, ident, data=[]):
        try:
            fids = []
            for field in data:
                newid = add_field(ident, field)
                fids.append(newid)
        except Attributes.DoesNotExist:
            return json.loads(INVALID_REQUEST)
        else:
            return {'success': True, 'msg': 'Successfully created new fields.', 'ids': fids}
