import simplejson
from django.core import serializers
from django.http import HttpResponse
from django.utils.dateformat import DateFormat
from django.contrib.auth.models import User
from hopeapp.helpers.users import *
from hopeapp.helpers.occurrences import *
from hopeapp.models import *
from hopeapp.helpers.feed import *
from hopeapp.responses.common_json import *
from django.contrib.auth.decorators import login_required

@login_required(login_url='/denied/')
def list(request):
    
    users_object = User.objects.all()
    if (len(users_object) > 0):
        result = []

        for user in users_object:
            o = {'id': user.id, 'name': user.username}
            result.append(o)

        return HttpResponse(simplejson.dumps(result), content_type="json")
    else:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")
    
@login_required(login_url='/denied/')
def get(request, ident):

    try:
        user = User.objects.get(id=ident)
        # wrap numa lista para ser iteravel
        res = serializers.serialize('json', [user, ])
        return HttpResponse(res, content_type="json")
    except User.DoesNotExist:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")

# need to add backend validators
def create(request):

    if request.method == 'POST':
        username = request.POST.get('username')
        firstname = request.POST.get('first_name')
        lastname = request.POST.get('last_name')
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = User.objects.create_user(username, email, password)
        user.first_name = firstname
        user.last_name = lastname
        user.save()

        return HttpResponse(SUCCESS, content_type="json")
    else:
        return HttpResponse(INVALID_REQUEST, content_type="json")


def update(data):

    if request.method == 'POST':
        return False
    return True


def categories(request, ident):

    try:
        user = User.objects.get(id=request.user.id)
        cat = Categories.objects.filter(user=user)
        res = serializers.serialize('json', cat)
        return HttpResponse(res, content_type="json")
    except User.DoesNotExist:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")


def groups(request, ident):

    try:
        user = User.objects.get(id=request.user.id)
        groups = Memberships.objects.filter(user=user)
        res = serializers.serialize('json', groups)
        return HttpResponse(res, content_type="json")
    except User.DoesNotExist:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")


def permissions(request, ident):

    try:
        user = User.objects.get(id=ident)
        perms = user.permissions_set.all()
        # wrap numa lista para ser iteravel
        res = serializers.serialize('json', perms)
        return HttpResponse(res, content_type="json")
    except User.DoesNotExist:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")

@login_required(login_url='/denied/')
def occurrences(request):

    user = User.objects.get(id=request.user.id)

    occurrences_objects = Occurrences.objects.filter(
        user=user, bullshit=0).order_by('created_at')
    forcing_objects = OccurrencesReforce.objects.filter(user=user)

    result = []

    # query for own occurrences
    if (len(occurrences_objects) > 0):
        for occ in occurrences_objects:
            df = DateFormat(occ.created_at)
            new_date = df.format('m/d/Y H:i:s')

            o = {'is_owner': 1, 
                 'id': occ.id, 
                 'user_id': occ.user_id, 
                 'user_name': user.username, 
                 'created_at': str(new_date), 
                 'coordinate': occ.coordinate, 
                 'category_id': occ.category_id, 
                 'forced': 0, 
                 'category_name': occ.category.name, 
                 'title': occ.title, 
                 'description': occ.description, 
                 'validated': occ.validated, 
                 'vote_counter': occ.vote_counter}
            result.append(o)

    # query for occurrences user follows
    if(forcing_objects.exists()):
        for forcing in forcing_objects:
            occ = forcing.occurrence

            df = DateFormat(occ.created_at)
            new_date = df.format('m/d/Y H:i:s')

            perm = has_write_permission(occ.id, request.user.id)

            o = {'permission': perm,
                 'is_owner': 0, 
                 'id': occ.id, 
                 'user_id': occ.user_id, 
                 'user_name': occ.user.username, 
                 'created_at': str(new_date), 
                 'coordinate': occ.coordinate, 
                 'category_id': occ.category_id, 
                 'forced': 1, 
                 'category_name': occ.category.name, 
                 'title': occ.title, 
                 'description': occ.description, 
                 'validated': occ.validated, 
                 'vote_counter': occ.vote_counter}
            result.append(o)

    return HttpResponse(simplejson.dumps(result), content_type="json")

@login_required(login_url='/denied/')
def count_occurrences(request):

    result = 0

    user = User.objects.get(id=request.user.id)

    forcing_objects = OccurrencesReforce.objects.filter(user=user)
    occurrences_objects = Occurrences.objects.filter(
        user=user, bullshit=0).order_by('created_at')

    result = len(occurrences_objects)

    if(forcing_objects.exists()):
        result += len(forcing_objects)

    return HttpResponse(simplejson.dumps({'count': result}))


# following
@login_required(login_url='/denied/')
def follow(request, to_follow):

    if not user_is_following(request.user.id, to_follow):
        UserFollow.objects.create(
            follower=request.user.id, followed=to_follow)
        user_followed_user(int(request.user.id), int(to_follow))

        return HttpResponse(FOLLOW_SUCCESS, content_type="json")
    else:
        return HttpResponse(FOLLOW_ALREADY, content_type="json")


def unfollow(request, to_unfollow):

    if user_is_following(request.user.id, to_unfollow):
        UserFollow.objects.filter(
            follower=request.user.id, followed=to_unfollow).delete()
        return HttpResponse(UNFOLLOW_SUCCESS, content_type="json")
    else:
        return HttpResponse(UNFOLLOW_ERROR, content_type="json")
    

def info(request):

    # request with small data set for user to be used in client side
    er = UserFollow.objects.filter(followed=request.user.id)
    ing = UserFollow.objects.filter(follower=request.user.id)
    occurrences_objects = OccurrencesReforce.objects.filter(
        user=request.user.id)

    followers = []
    following = []
    occ_following = []

    if(len(er) > 0):
        for u in er:
            followers.append({'id': u.follower})

    if(len(ing) > 0):
        for u in ing:
            following.append({'id': u.followed})

    if(len(occurrences_objects) > 0):
        for occ in occurrences_objects:
            occ_following.append({'id': occ.occurrence_id})

    return HttpResponse(simplejson.dumps(
            {'id': request.user.id, 
             'following': following, 
             'followers': followers, 
             'occurrences_following': occ_following}), 
            content_type='json')