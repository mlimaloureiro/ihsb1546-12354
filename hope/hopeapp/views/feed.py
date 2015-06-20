import simplejson
from django.http import HttpResponse
from django.contrib.auth.models import User
from hopeapp.models import *
from hopeapp.helpers.feed import *
from django.http import *
from hopeapp.responses.common_json import *
from django.contrib.auth.decorators import login_required

# get user reports
# get feeds
@login_required(login_url='/denied/')
def user(request, uid, offset, limit):
    feed = {}
    if int(uid) == 0:
        uid = request.user.id
        feed = get_reports_ordered_by_activity(uid)
        request_user = {}
        request_user['name'] = request.user.username
    else:
        user = User.objects.get(id=uid)
        feed = get_reports_ordered_by_activity(uid)

        request_user = {}
        request_user['name'] = user.username

        er = UserFollow.objects.filter(followed=uid)
        ing = UserFollow.objects.filter(follower=uid)
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

        request_user['following'] = following
        request_user['followers'] = followers
        request_user['occ_following'] = occ_following

    result = {}
    result["user"] = request_user
    result["feeds"] = feed

    return HttpResponse(simplejson.dumps(result), content_type="json")

@login_required(login_url='/denied/')
def report(request, rid, offset, limit):
    feed = get_report_feed(report=rid, limit=limit, offset=offset)
    return HttpResponse(simplejson.dumps(feed), content_type="json")