from hopeapp.models import *
from django.conf import settings
import datetime
from pymongo import *
import simplejson

dbmongo = MongoClient(settings.MONGO_URL)
mongo = dbmongo[settings.MONGO_DATABASE]

# follow report
# create report
# edit report details
# edit report location
# follow user


def user_followed_report(user, report):
    userObject = User.objects.get(id=user)
    mongo.feed.insert(
        {'type': 'user_followed_report', 
         'user_id': int(user), 
         'username': userObject.username, 
         'report_id': int(report), 
         'time': datetime.datetime.utcnow()})


def user_edited_report(user, report):
    userObject = User.objects.get(id=user)
    mongo.feed.insert(
        {'type': 'user_edited_report', 
        'user_id': int(user), 
        'username': userObject.username, 
        'report_id': int(report), 
        'time': datetime.datetime.utcnow()})


def user_edited_report_location(user, report):
    userObject = User.objects.get(id=user)
    mongo.feed.insert(
        {'type': 'user_edited_report_location', 
         'user_id': int(user), 
         'username': userObject.username, 
         'report_id': int(report), 
         'time': datetime.datetime.utcnow()})


def user_published_report(user, report):
    userObject = User.objects.get(id=user)
    mongo.feed.insert(
        {'type': 'user_published_report', 
         'user_id': int(user), 
         'username': userObject.username, 
         'report_id': int(report), 
         'time': datetime.datetime.utcnow()})


def user_added_photo(user, report):
    userObject = User.objects.get(id=user)
    mongo.feed.insert(
        {'type': 'user_added_photo', 
         'user_id': int(user), 
         'username': userObject.username, 
         'report_id': int(report), 
         'time': datetime.datetime.utcnow()})


def user_followed_user(user, followed):
    follower = User.objects.get(id=user)
    followedObject = User.objects.get(id=followed)

    mongo.feed.insert(
        {'type': 'user_followed_user', 
         'user_id': int(user), 
         'followed_id': int(followed), 
         'followed_username': followedObject.username, 
         'user_username': follower.username, 
         'time': datetime.datetime.utcnow()})


""" GETTERS """

# ISTO VAI REBENTAR UM DIA


def get_user_feed(user, offset, limit):

    result = []
    feed = mongo.feed.find({'user_id': int(user)}).skip(
        int(offset)).limit(int(limit)).sort('time', -1)

    for f in feed:
        f['_id'] = ''
        result.append(verbose(f))  # get the object with readable variables

    return result


# ISTO VAI REBENTAR UM DIA

def get_reports_ordered_by_activity(user):
    print "user"
    print user
    report_set = mongo.feed.find(
        {'user_id': int(user)}, {'report_id': 1}).sort('time', -1)

    # aux list to get report ids
    report_list = []

    final_result = []

    # print "report_set"
    # print report_set

    for r in report_set:
        if 'report_id' in r and r['report_id'] not in report_list:
            report_list.append(r['report_id'])

    # print "report list"
    # print report_list

    for r in report_list:
        report = {}
        report['report_id'] = r
        report['feed'] = get_report_feed(report=r, offset=0, limit=3)
        print "report feed"
        print report
        if len(report['feed']) > 0:
            report['report_title'] = report['feed'][0]['report_title']
            photos = Occurrences.objects.get(id=r).photos_set.all()
            if len(photos) > 0:
                report['path_photo'] = photos[0].path_medium
            else:
                report['path_photo'] = None

            report['time'] = report['feed'][0]['time']
            final_result.append(report)

    return final_result


def get_report_feed(report, offset, limit):

    result = []
    feed = mongo.feed.find({'report_id': int(report)}).skip(
        int(offset)).limit(int(limit)).sort('time', -1)
    for f in feed:
        if 'report_id' in f:
            report = Occurrences.objects.get(id=int(f['report_id']))
            if report.validated == 1:
                result.append(verbose(f, report))
    return result


def delete_report_from_feed(report):
    mongo.feed.remove({'report_id': int(report)})


# method that gets readable variables
def verbose(feed, report):
    feed['report_title'] = report.title
    feed['time'] = simplejson.dumps(feed['time'].strftime('%Y-%m-%dT%H:%M:%S'))
    feed['_id'] = ''

    return feed
