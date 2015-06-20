import simplejson
import requests
import random

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from time import gmtime, strftime
from django.http import HttpResponse
from django.utils.dateformat import DateFormat
from django.contrib.auth.models import User
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from hopeapp.models import *
from hopeapp.helpers.categories import *
from hopeapp.helpers.occurrences import *
from hopeapp.helpers.users import *
from hopeapp.helpers.feed import *
from django.conf import settings
from hopeapp.responses.common_json import *
# occurrences service
from hopeapp.services.occurrence.occurrence_service import *
from hopeapp.services.occurrence.dependencies.formatter import *
from hopeapp.services.occurrence.repository.django_repository import *
# map service
from hopeapp.services.map.map_service import *
from hopeapp.services.map.repository.mongo_repository import *
# connecting to mongoDB
from pymongo import *
dbmongo = MongoClient(settings.MONGO_URL)
mongo = dbmongo[settings.MONGO_DATABASE]


"""
-----------------------
Occurrences controller
-----------------------

NOTICE: In an OOP context, controllers shouldn't directly know 
        about the models and prepare data to return the response object.
        In a future code refactoring, we should create classes that 
        handle what is needed.

        Controllers tipically should be 5 lines long, receive a request and 
        provide the response.
"""
# choose mongo repository dependency injection the conn
map_repository = MapMongoRepository(connection = mongo)
# instantiate the service injecting dependencies
map_service = MapService(map_repository=map_repository)
# choose the repository dependency
occ_repository = OccurrenceDjangoORMRepository()
# create the formatter dependency
occ_formatter = OccurrenceJSONFormatter()
# instantiate a Service injecting dependencies
occurrence_service = OccurrenceService(occurrence_repository=occ_repository, 
                            formatter = occ_formatter)

@login_required(login_url='/denied/')
def controller(request, ident):
    """
        controller(request, ident)
        -------------------
        Description:        Restfull controller to handle occurrences
        Url:                /hope/occurrences/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>,   
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            - Use Django Restfull API

        FLOW:
            1. check if user is authenticated
            2. switch between request.method type
    """

    if request.method == 'DELETE':
        return remove(ident, request)
    elif request.method == 'GET':
        return get(request, ident)
    elif request.method == 'PUT' or 'POST':
        data = simplejson.loads(request.body)
        if data.has_key('id') and data['id'] == 0:
            return create(request)
        else:
            return update(request)

@login_required(login_url='/denied/')
def list(request, category):
    """
        list(request, ident)
        -------------------
        Description:        Return all occurrences of a category
        Url:                /hope/occurrences/all/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            - Check if HTTP Post

        FLOW:
            1. check if user is authenticated
            2. Get occurrences objects fitered by category id
            3. Create data structure for HttpResponse
    """

    if(int(category) == 0):
        resp = occurrence_service.get_all(request_user_id=request.user.id)
    else:
        resp = occurrence_service.get_all_by_category(
            request_user_id=request.user.id, 
            category=int(category))

    return HttpResponse(resp, content_type="json")


def get(request, ident):
    """
        get(request, ident)
        -------------------
        Description:        Return occurrence by id
        Url:                /hope/occurrences/get/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. get occurrence object
            2. create structure for return object
            3. check permissions
            4. get attribute values
            5. fetch photos
    """
    resp = occurrence_service.get_one(occurrence_id=ident,
                           request_user_id=request.user.id)
  
    if resp:
        return HttpResponse(resp, content_type="json")
    else:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")


def create(request):
    """
        create(request)
        -------------------
        Description:        Handler for PUT or POST method
        Url:                /hope/occurrences/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. check if user is authenticated
            2. get user and category object
            3. create occurrence
            4. create permissions
            5. create mongo instance for map attributes
            6. init all schema values
    """

    posted_data = simplejson.loads(request.body)
    coordinate = str(posted_data['geo']['start']['latitude']) + \
        ',' + str(posted_data['geo']['start']['longitude'])
    now = strftime("%Y-%m-%d %H:%M:%S", gmtime())
    # prepare data
    inputs = {
        'category_id'    : posted_data['category_id'],
        'title'          : 'Untitled ' + str(strftime("%d-%m", gmtime())),
        'description'    : '',
        'user'           : request.user.id,
        'coordinate'     : coordinate,
        'validated'      : 0,
        'vote_counter'   : 0,
        'created_at'     : now,
        'updated_at'     : now,
        'bullshit'       : 0,
    }

    # json result
    json_result = occurrence_service.create(inputs = inputs)
    # load it to use
    occurrence_dict = simplejson.loads(json_result)

    occurrence_service.initialize_permissions(occ_id = occurrence_dict['id'])
    occurrence_service.initialize_attributes(
            occ_id = occurrence_dict['id'], 
            category_id = occurrence_dict['category_id']
        )

    map_service.create({
            'id' : occurrence_dict['id'],
            'validated' : 0,
            'category_id' : occurrence_dict['category_id'],
            'geo' : posted_data['geo'],
            'geom': {}
        })

    return HttpResponse(json_result, content_type="json")


def update(request):
    """
            update(request)
            -------------------
            Description:        Handler for PUT or POST method
            Url:                /hope/occurrences/{id}
            Return:             HttpResponse Object
            Author:             Miguel Loureiro <mlimaloureiro@outlook.com>,
                                Andre Goncalves <andre@goncalves.me>
            Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                                Andre Goncalves <andre@goncalves.me>

            TODO:
                - Verify if user can update

            FLOW:
                1. check user permissions
                2. get occurrence and update default values
                3. update values from schema values
                4. update mongo object for map attributes
    """

    obj = simplejson.loads(request.body)

    if(has_write_permission(obj['default_values']['id'], request.user.id)):

        default_values = obj['default_values']  # dict
        schema_values = obj['schema_values']  # array of dict
        shape_coordinates = obj['geom']

        # update default values
        q = Occurrences.objects.filter(id=default_values['id'])

        occurrence = q[0]

        aux_occurrence = 0
        # test if we are publishing or only editing
        if occurrence.validated == 1:
            aux_occurrence = 1

        occurrence.title = default_values['title']
        occurrence.vote_counter = default_values['vote_counter']
        occurrence.description = default_values['description']
        occurrence.validated = default_values['validated']
        occurrence.coordinate = default_values['coordinate']
        occurrence.save()

        if occurrence.validated == 1 and aux_occurrence == 0:
            user_published_report(
                int(request.user.id), int(default_values['id']))
        else:
            user_edited_report(
                int(request.user.id), int(default_values['id']))

        # update value from schema values
        for field in schema_values:
            attr_value = AttributeValue.objects.get(id=field['id'])
            attr_value.value = field['value']
            attr_value.save()

        """ THIS IS TO BE REMOVED """
        if not map_service.get(ident = int(default_values['id'])):

            map_service.create({
                'id' : int(default_values['id']),
                'validated' : default_values['validated'],
                'category_id' : obj['default_values']['category_id'],
                'geo' : default_values['coordinate'],
                'geom': shape_coordinates
            })

        else:

            if 'destroy_shapes' in obj:
                map_service.update(ident = int(default_values['id']), options = {
                            'geom' : {}
                        })
            else:
                map_service.update(ident = int(default_values['id']), options = {
                        'geom' : shape_coordinates,
                        'validated': default_values['validated'],
                        'geo' : default_values['coordinate'],
                        'category_id' : obj['default_values']['category_id']
                    })

        return HttpResponse(SUCCESS, content_type="json")
    else:
        return HttpResponse(PERMISSION_DENIED, content_type="json")


def remove(ident, request):
    """
        remove(ident, request)
        -------------------
        Description:        Handler for DELETE method
        Url:                /hope/occurrences/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>,
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. check user permissions
            2. get occurrence and schema values
            3. get occurrence permissions
            4. delete occurrence and delete from mongo
    """

    if(has_write_permission(ident, request.user.id)):
        try:
            occ = Occurrences.objects.get(id=ident)
            AttributeValue.objects.filter(occurrence=occ).delete()
            Votes.objects.filter(occurrence=occ).delete()
            PermissionsOccurrences.objects.filter(occurrence=occ.id).delete()
            OccurrencesReforce.objects.filter(occurrence=occ).delete()

            # delete from mongo
            map_service.delete(ident = int(ident))

            mongo.feed.remove({'report_id': int(occ.id)})

            occ.delete()
            return HttpResponse(SUCCESS, content_type="json")
        except (Occurrences.DoesNotExist):
            return HttpResponse(DOES_NOT_EXIST, content_type="json")
    else:
        return HttpResponse(PERMISSION_DENIED, content_type="json")

@csrf_exempt
def insert_video(request, ident):
    """
        insert_video(request, ident)
        -------------------
        Description:        Associate a video url to the occurrence
        Url:                /hope/occurrences/insert_video/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>

        TODO:
            - create restfull controller and service to handle videos
    """

    if(request.method == 'POST'):
        if(has_write_permission(ident, request.user.id)):

            occ = Occurrences.objects.get(id = ident)
            # hard coded 
            video = Videos(occurrence = occ, url = request.POST['video_url'])
            video.save()

            return HttpResponse(SUCCESS, content_type="json")
        else:
            return HttpResponse(PERMISSION_DENIED, content_type="json")
    else:
        return HttpResponse(INVALID_REQUEST, content_type="json")


@csrf_exempt
def remove_video(request, ident):
    """
        remove_video(request, ident)
        -------------------
        Description:        Associate a video url to the occurrence
        Url:                /hope/occurrences/delete_video/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>

        TODO:
            - create restfull controller and service to handle videos
    """

    if(request.method == 'POST'):
        if(has_write_permission(ident, request.user.id)):

            video = Videos.objects.get(id = request.POST['video_id'])
            video.delete()

            return HttpResponse(SUCCESS, content_type="json")
        else:
            return HttpResponse(PERMISSION_DENIED, content_type="json")
    else:
        return HttpResponse(INVALID_REQUEST, content_type="json")

@csrf_exempt
def upload_files(request, ident):
    """
        upload_files(request, ident)
        -------------------
        Description:        Get uploaded files and write them to CDN server
        Url:                /hope/occurrences/upload/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            - CSRF Token
            - create restfull controller to handle photos

        FLOW:
            1. check user permissions
            2. open file
            3. post file to CDN server
            4. update feed
    """

    if(request.method == 'POST'):
        if(has_write_permission(ident, request.user.id)):

            url = settings.CDN_URL + "/hope/index.php"

            if(request.FILES):
                f = TempFile(temp=request.FILES['file'])
                f.save()

            files = {'file': open(f.temp.path, 'rb')}
            payload = {'id_occurrence': ident,
                       'randomFactor': random.randint(0, 1000)}
            r = requests.post(url, files=files, data=payload)

            user_added_photo(int(request.user.id), int(ident))

            return HttpResponse(simplejson.dumps(
                    {'success': True, 
                     'response': r.text}))
        else:
            return HttpResponse(PERMISSION_DENIED, content_type="json")
    else:
        return HttpResponse(INVALID_REQUEST, content_type="json")

def remove_photo(request, ident):
    """
            remove_photo(request, ident)
            -------------------
            Description:       	Remove photo by id
            Url:                /hope/occurrences/remove_photo/{id}
            Return:             HttpResponse Object
            Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                                Andre Goncalves <andre@goncalves.me>
            Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                                Andre Goncalves <andre@goncalves.me>

            TODO:
                - check if session user has write permissions
                - create restfull controller to handle photos

            FLOW:
                1. create request structure
                2. post request to CDN server.
    """

    payload = {'id_photo': ident, 'remove_photo': '1'}
    url = settings.CDN_URL + "/hope/index.php"
    r = requests.post(url, data=payload)
    return HttpResponse(simplejson.dumps({'success': True, 'response': r.text}))


@login_required(login_url='/denied/')
def followers(request, ident):
    """
        followers(request, ident)
        -------------------
        Description:        Get occurrence followers
        Url:                /hope/occurrences/followers/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. check user permissions
            2. get occurrence and occurrencereforce objects
            3. create followers list structure
            4. get permissions
            5. create structure for result object
    """

    occ = Occurrences.objects.get(id=ident)
    q = OccurrencesReforce.objects.filter(occurrence=occ)
    followers = []
    users_followed = []

    if(q.exists()):

        for follower in q:
            # get permission
            perm = has_write_permission(ident, follower.user.id)
            aux = {
                'id': follower.user.id, 
                'username': follower.user.username, 
                'email': follower.user.email,
                'first_name': follower.user.first_name, 
                'last_name': follower.user.last_name, 
                'permission': perm}
            followers.append(aux)

            if user_is_following(request.user.id, follower.user.id):
                users_followed.append(follower.user.id)

        result = {'followers': followers, 'users_followed': users_followed}

        return HttpResponse(simplejson.dumps(result), content_type="json")

    else:
        return HttpResponse(NO_FOLLOWERS, content_type="json")    

@login_required(login_url='/denied/')
def follow(request, ident):
    """
        follow(request, ident)
        -------------------
        Description:        Follow occurrence
        Url:                /hope/occurrences/follow/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. check if user is authenticated
            2. get occurrence and user objects
            3. check if following
            4. follow report and update feed
    """
    user = User.objects.get(id=request.user.id)
    occ = Occurrences.objects.get(id=ident)

    if not is_following(occ, user):
        follow = OccurrencesReforce(user=user, occurrence=occ)
        follow.save()
        occ.vote_counter += 1
        occ.save()

        user_followed_report(int(request.user.id), int(occ.id))

        return HttpResponse(FOLLOW_SUCCESS, content_type="json")
    else:
        return HttpResponse(FOLLOW_ALREADY, content_type="json")


@login_required(login_url='/denied/')
def unfollow(request, ident):
    """
        unfollow(request, ident)
        -------------------
        Description:        Unfollow occurrence
        Url:                /hope/occurrences/unfollow/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. check if user is authenticated
            2. get occurrence and user objects
            3. check if following
            4. unfollow report
    """

    user = User.objects.get(id=request.user.id)
    occ = Occurrences.objects.get(id=ident)

    if is_following(occ, user):
        follow = OccurrencesReforce.objects.get(
            user=user, occurrence=occ)
        follow.delete()
        occ.vote_counter -= 1
        occ.save()
        return HttpResponse(UNFOLLOW_SUCCESS, content_type="json")
    else:
        return HttpResponse(UNFOLLOW_ERROR, content_type="json")


@login_required(login_url='/denied/')
def update_permission(request, ident, perm, user_id):
    """
        update_permission(request, ident, perm, user_id)
        -------------------
        Description:        Update user permissions
        Url:                /hope/occurrences/update_permission/{id}/{per}/{uid}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. check if user is authenticated
            2. get user object
            3. check permissions
            4. update permissions
    """

    user = User.objects.get(id=request.user.id)

    if is_owner(ident, user):
        # if we have a record already, update it
        if(has_permission_record(ident, user_id)):
            p = PermissionsOccurrences.objects.get(
                user=user_id, occurrence=ident)
            p.write = perm
            p.save()
            return HttpResponse(SUCCESS, content_type="json")
        else:
            p = PermissionsOccurrences(
                user=user_id, occurrence=ident, read=1, write=perm)
            p.save()
            return HttpResponse(SUCCESS, content_type="json")
    else:
        return HttpResponse(PERMISSION_DENIED, content_type="json")

@login_required(login_url='/denied/')
def latest(request, page, cat):
    """
        latest(request, page, cat)
        -------------------
        Description:        Return latest occurrences by creation date
        Url:                /hope/occurrences/latest/{page}/{cat}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. check if user is authenticated
            2. get occurrences by category id
            3. get paginator
            4. create occurrences list structure
    """

    if int(cat) == 0:
        occurrences = Occurrences.objects.filter(
            bullshit=0, validated=1).order_by('-created_at')
    else:
        category = Categories.objects.get(id=int(cat))
        occurrences = Occurrences.objects.filter(
                        bullshit=0, 
                        validated=1, 
                        category=category).order_by('-created_at')

    paginator = Paginator(occurrences, 15)

    try:
        page = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page
        page = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of
        # results.
        page = paginator.page(paginator.num_pages)

    occ_list = page.object_list

    if (len(occ_list) > 0):
        result = []

        for occ in occ_list:

            df = DateFormat(occ.created_at)
            new_date = df.format('m/d/Y H:i:s')

            o = {'is_owner': is_owner(occ.id, request.user.id), 
                 'id': occ.id, 
                 'user_id': occ.user_id, 
                 'created_at': str(new_date), 
                 'coordinate': occ.coordinate, 
                 'category_id': occ.category_id, 
                 'category_name': occ.category.name, 
                 'title': occ.title, 
                 'description': occ.description, 
                 'validated': occ.validated, 
                 'vote_counter': occ.vote_counter}
            result.append(o)

        occurrences = {'result': result}

        return HttpResponse(simplejson.dumps(occurrences), content_type="json")
    else:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")

@login_required(login_url='/denied/')
def top_reports(request, page, cat):
    """
        top_reports(request, page, cat)
        -------------------
        Description:        Return top occurrences ordered by vote_counter
        Url:                /hope/occurrences/top/{page}/{cat}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. check if user is authenticated
            2. get occurrences by category id and ordered by vote_counter
            3. get paginator
            4. create occurrences list structure
    """

    if int(cat) == 0:
        occurrences = Occurrences.objects.filter(
            bullshit=0, validated=1).order_by('-vote_counter')
    else:
        category = Categories.objects.get(id=int(cat))
        occurrences = Occurrences.objects.filter(
            bullshit=0, validated=1, category=category)

    paginator = Paginator(occurrences, 10)

    try:
        page = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page
        page = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of
        # results.
        page = paginator.page(paginator.num_pages)

    occ_list = page.object_list

    if (len(occ_list) > 0):
        result = []

        for occ in occ_list:
            df = DateFormat(occ.created_at)
            new_date = df.format('m/d/Y H:i:s')

            o = {'is_owner': is_owner(occ.id, request.user.id), 
                 'id': occ.id, 'user_id': occ.user_id, 
                 'created_at': str(new_date), 
                 'coordinate': occ.coordinate, 
                 'category_id': occ.category_id, 
                 'category_name': occ.category.name, 
                 'title': occ.title, 
                 'description': occ.description, 
                 'validated': occ.validated, 
                 'vote_counter': occ.vote_counter}
            result.append(o)

        occurrences = {'result': result}

        return HttpResponse(simplejson.dumps(occurrences), content_type="json")
    else:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")