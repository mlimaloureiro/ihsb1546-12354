from django.conf.urls import *
from hope import settings
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    (r'^', include('hopeapp.urls')),
    (r'', include('tokenapi.urls'))
)

if settings.DEBUG:
	from django.views.static import serve
	_media_url = settings.MEDIA_URL
	if _media_url.startswith('/'):
		_media_url = _media_url[1:]
		urlpatterns += patterns('',
			(r'^%s(?P<path>.*)$' % _media_url,
			serve,
			{'document_root': settings.MEDIA_ROOT}))
	del(_media_url, serve)
