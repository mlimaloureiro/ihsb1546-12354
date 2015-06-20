#!/usr/bin/python
# -*- coding: utf-8 -*-

import simplejson
import requests

from time import gmtime, strftime
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth.models import User
from hopeapp.models import *
from hopeapp.helpers.categories import *
from django.http import *
from django_facebook import *
from django_facebook.utils import *
from django.utils.dateformat import DateFormat
from hopeapp.helpers.occurrences import *
from hopeapp.helpers.users import *
from hopeapp.helpers.feed import *


# connecting to mongoDB
from pymongo import *
dbmongo = MongoClient(settings.MONGO_URL)
mongo = dbmongo.hope


@csrf_exempt
def controller(request, ident):
    if request.method == 'GET':
        print "IDENT " + ident
        if(int(ident) == 0):
            return main_reports(request)
        else:
            return get_occurrence(request, ident)

    elif request.method == 'PUT' or 'POST':
        return create(request)
    else:
        return HttpResponse(simplejson.dumps(
            {'success': False, 'msg': 'Invalid request method.'}),
            content_type="json")

#
# Create new occurrence
# TODO : get request userid
#


@csrf_exempt
def create(request):
    # mobile version: the user enters the report title

    obj = simplejson.loads(request.body)
    user_id = obj['user']

    user = User.objects.get(id=user_id)

    cat_id = obj['category_id']
    cat = Categories.objects.get(id=cat_id)

    title = obj['title']
    description = obj['desc']
    coordinates = obj['coords']
    attributes_in = obj['attributes']

    created_at = strftime("%Y-%m-%d %H:%M:%S", gmtime())
    updated_at = created_at

    # save the occurrence
    occ = Occurrences(
        user=user, 
        category=cat, 
        title=title,
        coordinate=coordinates, 
        validated=0,
        vote_counter=0, 
        created_at=created_at, 
        updated_at=updated_at, 
        bullshit=0, 
        description=description)
    occ.save()

    # add permission
    permission = PermissionsOccurrences(
        user=user_id, occurrence=occ.id, read=1, write=1)
    permission.save()

    # get category
    category = Categories.objects.get(id=occ.category_id)
    category_name = category.name

    # create mongo instance for map attributes
    mongo.map_attributes.insert(
        {'id': occ.id, 'category_id': cat_id, 'geo': obj['geo'], 'geom': {}})

    # init all schema values to '' so that they're auto displayed on fetch
    success, fields, parents = find_parent_fields(cat_id, [], [])
    attrs = Attributes.objects.filter(category=cat)

    for field in fields:
        new_value = ""
        for at in attributes_in:
            if int(at["id"]) == field["id"]:
                new_value = at["value"]
                break
        value = AttributeValue(attribute=Attributes.objects.get(
            id=field['id']), occurrence=occ, value=new_value)
        value.save()

    for attr in attrs:
        new_value = ""
        for at in attributes_in:
            if int(at["id"]) == attr.id:
                new_value = at["value"]
                break

        value = AttributeValue(attribute=attr, occurrence=occ, value=new_value)
        value.save()

    result = {
        'id': occ.id, 
        'user_id': occ.user_id, 
        'category_id': cat_id, 
        'coordinate': occ.coordinate, 
        'title': occ.title,
        'description': occ.description, 
        'category_name': category_name, 
        'validated': occ.validated, 
        'vote_counter': occ.vote_counter
        }

    return HttpResponse(simplejson.dumps(
        {'success': True, 
         'result': result,
         'msg': "Successfully create new occurrence"}), 
        content_type="json")


@csrf_exempt
def get_user(request, ident):
    try:
        user_or_profile_model = get_model_for_attribute('facebook_id')
        other_facebook_accounts = user_or_profile_model.objects.filter(
            facebook_id=ident)

        user_id = other_facebook_accounts[0].user_id

        return HttpResponse(simplejson.dumps(
            {'success': True, 
             'user_id': user_id}))
    except Exception as e:
        return HttpResponse(simplejson.dumps(
            {"success": False, 
             "Exception": str(e.message)}))

#
# Vote on occurrence with id = ident
# TODO: get request user id
#


@csrf_exempt
def vote(request, ident):
    try:
        # get user and occurrence by id
        # TODO: get request.user.id
        obj = simplejson.loads(request.body)
        user_id = obj['user']

        user = User.objects.get(id=user_id)
        occ = Occurrences.objects.get(id=ident)

        created_at = strftime("%Y-%m-%d %H:%M:%S", gmtime())

        # create new vote relation
        vote = Votes(user=user, occurrence=occ, created_at=created_at)
        vote.save()
        # inc vote counter
        occ.vote_counter += 1
        occ.save()

    except (Occurrences.DoesNotExist, 
            User.DoesNotExist, 
            Votes.DoesNotExist), e:
        return HttpResponse(simplejson.dumps(
            {'success': False, 
             'error_msg': "Something went wrong."}))

    else:
        return HttpResponse(simplejson.dumps(
            {'success': True, 
             'msg': "Successfully added new vote.",
             'id': vote.id}))

#
# Get votes for occurrence id
#


def votes(request, ident):
    result = []

    try:
        occurr = Occurrences.objects.get(id=ident)
        votes = Votes.objects.filter(occurrence=occurr)

        for vote in votes:
            result.append(
                {"id": vote.id, 
                "created_at": vote.created_at, 
                "user_id": vote.user.id})

        return HttpResponse(simplejson.dumps(result), content_type='json')

    except Occurrences.DoesNotExist:
        return HttpResponse(simplejson.dumps(
            {"success": False}), content_type='json')
#
# Get photos url's
#


def photos(request, ident):
    try:
        result = []
        occurr = Occurrences.objects.get(id=ident)
        photos = Photos.objects.filter(occurrence=occurr)

        for photo in photos:
            result.append(
                {'id': photo.id, 
                 'path_small': photo.path_small,
                 'path_medium': photo.path_medium,
                 'path_big': photo.path_big})

        return HttpResponse(simplejson.dumps(result), content_type='json')
    except Occurrences.DoesNotExist:
        return HttpResponse(simplejson.dumps(
            {'success': False}), 
            content_type='json')


#
# Get occurrence by id
#
def occurrence(request, ident):
    try:
        occurr = Occurrences.objects.get(id=ident)
        result = {
            "id": occurr.id, 
            "title": occurr.title,
            "coords": occurr.coordinate, 
            "description": occurr.description,
            "votes": occurr.vote_counter}

        attrs = []

        schema_values = occurr.attributevalue_set.all()
        for schema in schema_values:
            attr = Attributes.objects.get(id=schema.attribute_id)
            add_attr = {'id': schema.id, 
                        'attribute_id': schema.attribute_id,
                        'name': attr.name, 
                        'value': schema.value}
            attrs.append(add_attr)

        result['schema'] = attrs

        result['success'] = True
        return HttpResponse(simplejson.dumps(result), content_type="json")

    except Occurrences.DoesNotExist:
        return HttpResponse(simplejson.dumps(
            {'success': False}), content_type="json")

#
# Get list of occurrences names ids and coords
#


def occurrences(request):
    result = []
    occurrs = Occurrences.objects.all()

    if len(occurrs) > 0:
        for occurr in occurrs:
            occ_add = {
                "id": occurr.id, 
                "title": occurr.title,
                "coords": occurr.coordinate, 
                "description": occurr.description,
                "votes": occurr.vote_counter}
            attrs = []

            schema_values = occurr.attributevalue_set.all()
            for schema in schema_values:
                attr = Attributes.objects.get(id=schema.attribute_id)
                add_attr = {'id': schema.id, 
                            'attribute_id': schema.attribute_id, 
                            'name': attr.name, 
                            'value': schema.value}
                attrs.append(add_attr)

            occ_add['schema'] = attrs

            result.append(occ_add)

        return HttpResponse(simplejson.dumps(result), content_type="json")
    else:
        # if there is no occurrences
        return HttpResponse(simplejson.dumps(
            {'success': False, 
             'error_msg': "Something went wrong."}), 
            content_type="json")

#
# Get categories names and ids
#


def categories(request):
    result = []
    categories = Categories.objects.all()

    # create result list if more than zero categories
    if len(categories) > 0:
        for category in categories:
            success, fields, parents = find_parent_fields(category.id, [], [])
            result.append(
                {'id': category.id, 'name': category.name, 'fields': fields})

        #result["success"] = True
        return HttpResponse(simplejson.dumps(result), content_type="json")

    # if there is no categories
    return HttpResponse(simplejson.dumps(
        {"success": False,
         "error_msg": "Something went wrong."}),
        content_type="json")

#
# Get category by id
#


def get(request, ident):
    try:
        category = Categories.objects.get(id=ident)
        result = {'id': category.id, 'name': category.name}
        result['success'] = True
        return HttpResponse(simplejson.dumps(result), content_type="json")

    except Categories.DoesNotExist:
        return HttpResponse(simplejson.dumps(
            {'success': False}),
            content_type="json")


def photo():
    pass


def main_reports(request):
    result = {}
    result["success"] = False
    path = settings.CDN_URL + "/static/"

    top_occs = Occurrences.objects.filter(
        bullshit=0, validated=1).order_by('-vote_counter')
    last_occs = Occurrences.objects.filter(
        bullshit=0, validated=1).order_by('-created_at')

    top = []
    last = []

    limit_top = 15
    limit_last = 15
    if len(top_occs) < limit_top:
        limit_top = len(top_occs)

    if len(last_occs) < limit_last:
        limit_last = len(last_occs)

    for occ in top_occs[0:limit_top]:
        df = DateFormat(occ.created_at)
        new_date = df.format('m/d/Y H:i:s')

        occ_photos = occ.photos_set.all()
        occ_photo = None
        if len(occ_photos) > 0:
            occ_photo = occ_photos[0].path_small
            occ_photo = path + occ_photo
        top.append(
            {'id_occ': occ.id,
             'user_id': occ.user_id,
             'created_at': str(new_date), 
             'coordinate': occ.coordinate, 
             'category_id': occ.category_id,
             'category_name': occ.category.name, 
             'title': occ.title, 
             'description': occ.description, 
             'vote_counter': occ.vote_counter, 
             'picture': occ_photo})

    for occ in last_occs[0:limit_last]:
        df = DateFormat(occ.created_at)
        new_date = df.format('m/d/Y H:i:s')
        occ_photos = occ.photos_set.all()
        occ_photo = None
        if len(occ_photos) > 0:
            occ_photo = occ_photos[0].path_small
            occ_photo = path + occ_photo
        last.append(
            {'id_occ': occ.id, 
             'user_id': occ.user_id, 
             'created_at': str(new_date), 
             'coordinate': occ.coordinate, 
             'category_id': occ.category_id,
             'category_name': occ.category.name, 
             'title': occ.title, 
             'description': occ.description, 
             'vote_counter': occ.vote_counter, 
             'picture': occ_photo})

    result["top"] = top
    result["last"] = last
    result["success"] = True

    return HttpResponse(simplejson.dumps(result), content_type="json")


def get_occurrence(request, ident, user):
    result = {}
    result["success"] = False
    path = settings.CDN_URL + "/static/"

    occ = Occurrences.objects.get(id=int(ident))

    df = DateFormat(occ.created_at)
    new_date = df.format('m/d/Y H:i:s')
    result["occurrence"] = {'id_occ': occ.id, 
                            'user_id': occ.user_id, 
                            'created_at': str(new_date), 
                            'coordinate': occ.coordinate, 
                            'category_id': occ.category_id, 
                            'category_name': occ.category.name, 
                            'title': occ.title, 
                            'description': occ.description, 
                            'vote_counter': occ.vote_counter}
    occ_photos = occ.photos_set.all()
    result["occurrence"]["photos"] = []
    userObj = User.objects.get(id=int(user))
    result["occurrence"]["is_following"] = is_following(occ, userObj)

    for photo in occ_photos:
        result["occurrence"]["photos"].append(
            {"path_small": path + photo.path_small,
             "path_big": path + photo.path_big,
             "path_medium": path + photo.path_medium})

    result["success"] = True
    return HttpResponse(simplejson.dumps(result), content_type="json")


@csrf_exempt
def follow(request, ident, user):

    userObj = User.objects.get(id=int(user))
    occObj = Occurrences.objects.get(id=int(ident))

    if is_following(occObj, userObj) == False:
        follow = OccurrencesReforce(user=userObj, occurrence=occObj)
        follow.save()
        occObj.vote_counter += 1
        occObj.save()

        user_followed_report(user, ident)

        return HttpResponse(simplejson.dumps(
            {'success': True,
             'msg': 'Following.'}),
            content_type="json")
    else:
        return HttpResponse(simplejson.dumps(
            {'success': False,
             'msg': 'Already following.'}),
            content_type="json")


@csrf_exempt
def upload_files(request, ident):
    if(request.method == 'POST'):

        url = settings.CDN_URL + "/hope/index.php"

        if(request.FILES):
            f = TempFile(temp=request.FILES['file'])
            f.save()

        files = {'file': open(f.temp.path, 'rb')}
        payload = {'id_occurrence': ident}
        r = requests.post(url, files=files, data=payload)

        return HttpResponse(simplejson.dumps(
            {'success': True,
             'response': r.text}))

    else:
        return HttpResponse(simplejson.dumps(
            {'success': False,
             'msg': 'Invalid request method.'}),
            content_type="json")
