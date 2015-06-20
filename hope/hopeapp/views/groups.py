import simplejson
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from hopeapp.helpers.categories import *
from django.http import *
from hopeapp.responses.common_json import *
from django.contrib.auth.decorators import login_required

"""

GROUPS RESTFULL CONTROLLER 

"""
@login_required(login_url='/denied/')
def controller(request, ident):

    if request.method == 'DELETE':
        return remove(request, ident)
    elif request.method == 'GET':
        return get(request, ident)
    elif request.method == 'PUT' or 'POST':
        return create(request)
    else:
        return HttpResponse(INVALID_REQUEST, content_type="json")

@login_required(login_url='/denied/')
def list_all(request):

    groups_object = Group.objects.all()
    if (len(groups_object) > 0):
        result = []

        for group in groups_object:
            # get users in the group
            user_res = []
            userlist = group.user_set.all()

            if len(userlist) > 0:
                for u in userlist:
                    user_res.append({'id': u.id})

            o = {'id': group.id, 'name': group.name, 'userlist': user_res}
            result.append(o)

        return HttpResponse(simplejson.dumps(result), content_type="json")
    else:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")

def remove(request, ident):

    try:
        group = Group.objects.get(id=ident)
        group.delete()
        return HttpResponse(SUCCESS, content_type="json")
    except (Group.DoesNotExist), e:
        return HttpResponse(DOES_NOT_EXIST, content_type="json")


def get(request, ident):

    return list_all(request)


def create(request):

    obj = simplejson.loads(request.body)
    Group.objects.create(name=obj['name'])
    return HttpResponse(SUCCESS, content_type="json")

@login_required(login_url='/denied/')
def user_option(request):

    user = User.objects.get(id=request.POST['user_id'])
    group = Group.objects.get(id=request.POST['group_id'])
    operation = request.POST['operation']

    if int(operation) == 1:
        group.user_set.add(user)
        return HttpResponse(SUCCESS, content_type="json")
    else:
        group.user_set.remove(user)
        return HttpResponse(SUCCESS, content_type="json")