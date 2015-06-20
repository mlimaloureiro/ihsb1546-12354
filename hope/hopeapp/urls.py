from django.conf.urls import *
from django.contrib.auth import *

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
(r'^hope/login/$', 'django.contrib.auth.views.login',{'template_name': 'main/login.html'}),
(r'^hope/logout/$', 'django.contrib.auth.views.logout_then_login',{'login_url': '/'}),
(r'^hope/validate/$','hopeapp.views.validate_password'),
(r'^hope/facebook/', include('django_facebook.urls')),
(r'^hope/admin/', include(admin.site.urls)),
(r'^hope/accounts/',include('allauth.urls')))


urlpatterns += patterns('hopeapp.views',
(r'^$', 'landing'),
(r'^denied/$', 'denied'),
(r'^mobile/$', 'mobile_download'),
(r'^landingpage/$', 'landingpage'),
(r'^roads/$', 'roadsredirect'),
(r'^make-the-difference/$', 'makedifference'),
(r'^request_udid/$', 'request_udid'),
(r'^codebits_hook/', 'codebits_hook'),
(r'^hope/register/$', 'register'),
# list all categories
# create category
(r'^hope/categories/create/$', 'categories.create'),
(r'^hope/categories/(?P<ident>\w+)/$', 'categories.get'),
(r'^hope/categories/$', 'categories.list'),
(r'^hope/categories/remove_fields/$', 'categories.remove_fields'),
(r'^hope/categories/edit/(?P<ident>\w+)/$', 'categories.edit'),
(r'^hope/categories/edit_values/(?P<ident>\w+)/$', 'categories.edit_values'),
(r'^hope/categories/childs/(?P<ident>\w+)/$','categories.childs'),
(r'^hope/categories/remove/(?P<ident>\w+)/$','categories.remove'),
# fetch schema
(r'^hope/categories/schema/(?P<ident>\w+)/$','categories.schema'),
# add new attribute
(r'^hope/categories/field/(?P<ident>\w+)/$','categories.field'),
# add new attribute
(r'^hope/categories/occurrences/(?P<ident>\w+)/$','categories.occurrences'),

# ELECTRE Algorithms
(r'^hope/electre/(?P<ident>\w+)/$','electre.electre'),

# DSS Spero
(r'^hope/support/export/(?P<ident>\w+)/$','decision_support.export_csv'),
(r'^hope/support/(?P<ident>\w+)/$','decision_support.decision'),



# shape resourceful controller
(r'^hope/shapes/(?P<ident>\w+)$', 'shapes.get'),
# shape resourceful controller
(r'^hope/shapes/destroy/(?P<ident>\w+)/$','shapes.destroy_shapes'),

# list all occurrences
(r'^hope/occurrences/all/(?P<category>\d+)/$','occurrences.list'),
(r'^hope/occurrences/upload/(?P<ident>\d+)/$','occurrences.upload_files'),
(r'^hope/occurrences/remove_photo/(?P<ident>\d+)/$','occurrences.remove_photo'), 
(r'^hope/occurrences/insert_video/(?P<ident>\d+)/$','occurrences.insert_video'),
(r'^hope/occurrences/remove_video/(?P<ident>\d+)/$','occurrences.remove_video'), 
# list all occurrences
(r'^hope/occurrences/get/(?P<ident>\w+)/$','occurrences.get'),
# list all occurrences
(r'^hope/occurrences/latest/(?P<page>\w+)/(?P<cat>\w+)$','occurrences.latest'),
(r'^hope/occurrences/top/(?P<page>\w+)/(?P<cat>\w+)$','occurrences.top_reports'),
# list all occurrences
(r'^hope/occurrences/follow/(?P<ident>\w+)/$','occurrences.follow'),
# list all occurrences
(r'^hope/occurrences/followers/(?P<ident>\w+)/$','occurrences.followers'),
# list all occurrences
(r'^hope/occurrences/unfollow/(?P<ident>\w+)/$','occurrences.unfollow'),
(r'^hope/occurrences/update_permission/(?P<ident>\w+)/(?P<perm>\w+)/(?P<user_id>\w+)/$','occurrences.update_permission'),
# controller
(r'^hope/occurrences/(?P<ident>\d+)/$','occurrences.controller'),
(r'^hope/users/$', 'users.list'),  # list all users
(r'^hope/users/info/$', 'users.info'),
(r'^hope/users/occurrences/$', 'users.occurrences'),
(r'^hope/users/create/$', 'users.create'),
(r'^hope/users/(?P<ident>\w+)/$', 'users.get'),
(r'^hope/users/occurrences/count$','users.count_occurrences'),
# get categories owned by the user
(r'^hope/users/categories/(?P<ident>\w+)/$', 'users.categories'),
# get user groups
(r'^hope/users/groups/(?P<ident>\w+)/$','users.groups'),
# get user groups
(r'^hope/users/follow/(?P<to_follow>\w+)/$','users.follow'),
# get user groups
(r'^hope/users/unfollow/(?P<to_unfollow>\w+)/$','users.unfollow'),

# get user permissions
(r'^hope/users/permissions/(?P<ident>\w+)/$','users.permissions'),

# create new report on mobile
(r'^hope/mobile/create/$', 'mobile.create'),
# fetch photo by id
(r'^hope/mobile/photo/$', 'mobile.photo'),
(r'^hope/mobile/vote/$', 'mobile.vote'),
# fetch photos by occurr id
(r'^hope/mobile/get_user/(?P<ident>\w+)/$', 'mobile.get_user'),
# fetch photos by occurr id
(r'^hope/mobile/photos/(?P<ident>\w+)/$', 'mobile.photos'),
# fetch votes
(r'^hope/mobile/votes/(?P<ident>\w+)/$', 'mobile.votes'),
(r'^hope/mobile/categories/$', 'mobile.categories'),
(r'^hope/mobile/reports/$', 'mobile.main_reports'),
(r'^hope/mobile/get_occ/(?P<ident>\w+)/(?P<user>\w+)/$', 'mobile.get_occurrence'),
(r'^hope/mobile/getocc/(?P<ident>\w+)/(?P<user>\w+)/$', 'mobile.get_occurrence'),
(r'^hope/mobile/occurrences/$', 'mobile.occurrences'),
(r'^hope/mobile/occurrences/(?P<ident>\w+)/$', 'mobile.occurrence'),
(r'^hope/mobile/categories/(?P<ident>\w+)/$', 'mobile.get'),
(r'^hope/mobile/vote/(?P<ident>\w+)/$', 'mobile.vote'),
(r'^hope/mobile/follow/(?P<ident>\w+)/(?P<user>\w+)/$', 'mobile.follow'),
(r'^hope/mobile/uploadfiles/(?P<ident>\w+)/$', 'mobile.upload_files'),
(r'^hope/mobile/api/(?P<ident>\w+)/$', 'mobile.controller'),


# create category
(r'^hope/bullshit/create/$', 'bullshit.create'),
# DELETE category
(r'^hope/bullshit/delete/$', 'bullshit.remove'),
# create category
(r'^hope/bullshit/(?P<category>\d+)/$', 'bullshit.list'),
# controller
(r'^hope/groups/(?P<ident>\d+)/$', 'groups.controller'),
# add/removes users
(r'^hope/groups/operation/$', 'groups.user_option'),

# add/removes users
(r'^hope/feed/user/(?P<uid>\d+)/(?P<offset>\d+)/(?P<limit>\d+)$', 'feed.user'),
# add/removes users
(r'^hope/feed/report/(?P<rid>\d+)/(?P<offset>\d+)/(?P<limit>\d+)$', 'feed.report'),
)
