import simplejson
from django.http import HttpResponse
from django.contrib.auth.models import User
from hopeapp.models import *
from hopeapp.helpers.categories import *
from hopeapp.helpers.occurrences import *
from django.conf import settings
from hopeapp.responses.common_json import *
from django.contrib.auth.decorators import login_required
# connecting to mongoDB
from pymongo import *
dbmongo = MongoClient(settings.MONGO_URL)
mongo = dbmongo.hope

"""

BULLSHIT RESTFULL CONTROLLER 

"""
@login_required(login_url='/denied/')
def controller(request, ident):
    if request.method == 'DELETE':
        return remove(ident, request)
    elif request.method == 'GET':
        return get(request, ident)
    elif request.method == 'PUT' or 'POST':
        return create(request)
    else:
        return HttpResponse(INVALID_REQUEST, content_type="json")

@login_required(login_url='/denied/')
def list(request, category):
    occurrences_objects = Occurrences.objects.filter(
        category_id=category,
        bullshit=1).order_by('created_at')
    
    if (len(occurrences_objects) > 0):
        result = []
        for occ in occurrences_objects:
            attribute_values = []
            schema_values = occ.attributevalue_set.all()

            # build the objects adding the attr name
            for s in schema_values:
                # get name
                qname = Attributes.objects.get(id=s.attribute_id)
                attr = {'id': s.id, 
                        'attribute_id': s.attribute_id,
                        'name': qname.name, 
                        'value': s.value}
                attribute_values.append(attr)

            o = {'id': occ.id, 
                 'user_id': occ.user_id, 
                 'title': occ.title,
                 'schema_values': attribute_values}
            
            result.append(o)

        return HttpResponse(simplejson.dumps(result), content_type="json")
    else:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")

# TODO : fetch photos
def get(request, ident):
    try:
        q = Occurrences.objects.filter(id=ident)
        attribute_values = []

        # get values rows from the occurrence custom attributes
        schema_values = q[0].attributevalue_set.all()
        
        # build the objects adding the attr name
        for s in schema_values:
            # get name
            qname = Attributes.objects.get(id=s.attribute_id)
            attr = {'id': s.id,
                    'attribute_id': s.attribute_id,
                    'name': qname.name,
                    'value': s.value}
            attribute_values.append(attr)

        result = {'schema_values': attribute_values}

        return HttpResponse(simplejson.dumps(result), content_type="json")
    except Occurrences.DoesNotExist:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")

# TODO : get request userid

@login_required(login_url='/denied/')
def create(request):

    obj = simplejson.loads(request.POST.get('schema_values'))

    cat_id = request.POST.get('category_id')
    bullshit = 1
    user = User.objects.get(id=request.user.id)
    cat = Categories.objects.get(id=cat_id)
    title = request.POST.get('title')

    schema_values = obj  # array of dict

    # save the occurrence
    occ = Occurrences(
        user=user,
        category=cat,
        title=title,
        bullshit=bullshit, 
        validated=0)
    occ.save()

    # add permission
    permission = PermissionsOccurrences(
        user=request.user.id, 
        occurrence=occ.id, 
        read=1, 
        write=1)
    permission.save()

    # init all schema values to '' so that they're auto displayed on fetch
    fields, parents = find_parent_fields(cat_id, [], [])

    for field in schema_values:
        value = AttributeValue(
            attribute=Attributes.objects.get(id=field['attribute_id']),
            occurrence=occ, 
            value=field['value'], 
            bullshit=1)
        value.save()

    return HttpResponse(simplejson.dumps(
        {'success': True, 
         'msg': 'Object created.', 
         'cat_id': cat_id}), 
        content_type="json")

# TODO: verify if the request user can delete
def remove(ident, request):
    try:
        occ = Occurrences.objects.get(id=ident)
        AttributeValue.objects.filter(occurrence=occ).delete()
        PermissionsOccurrences.objects.filter(occurrence=occ.id).delete()
        occ.delete()
        return HttpResponse(SUCCESS, content_type="json")
    except (Occurrences.DoesNotExist):
        return HttpResponse(DOES_NOT_EXIST, content_type="json")
