# Django settings for hope project.
import os
import django

DJANGO_ROOT = os.path.dirname(os.path.realpath(django.__file__))
SITE_ROOT = os.path.dirname(os.path.realpath(__file__))
django_version = django.VERSION


ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

INESC_ENV = 'PRODUCTION'

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',   # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'hope',                         # Or path to database file if using sqlite3.
        'USER': 'hope',                         # Not used with sqlite3.
        'PASSWORD': 'in3sc',                    # Not used with sqlite3.
        'HOST': 'bdmoth.dec.uc.pt',             # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                             # Set to empty string for default. Not used with sqlite3.
        'OPTIONS'  : { 'init_command' : 'SET storage_engine=MYISAM', },
    }
}

DEBUG = True
TEMPLATE_DEBUG = DEBUG

MONGO_URL = 'mongodb://bdmoth.dec.uc.pt:27017'
MONGO_DATABASE = 'hope'
DB_URL = 'bdmoth.dec.uc.pt'
CDN_URL = 'http://webmoth.dec.uc.pt'

# FACEBOOK INTEGRATION
FACEBOOK_APP_ID = "634764129875517"
FACEBOOK_APP_SECRET = "111594acebe4fd2302fb16dc5a6c41e5"

TEMPLATE_CONTEXT_PROCESSORS = [
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
    'django.contrib.messages.context_processors.messages',
    'django_facebook.context_processors.facebook',
]

if django_version >= (1, 4, 0):
    TEMPLATE_CONTEXT_PROCESSORS.append('django.core.context_processors.tz')

#MONGO DB
MONGODB_HOPE = "hope"


# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = []

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'Europe/Lisbon'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = os.path.join(SITE_ROOT, 'media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = '/media/'

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = 'http://webmoth.dec.uc.pt/static/'

ASSETS_URL = '/media/'

LOGIN_URL = '/hope/login/'
LOGIN_REDIRECT_URL = '/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'django_assets.finders.AssetsFinder'
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '&^6zw+o#@0i55_%$ef3cwumgc=n@advuk--5u+pf$8tjtv#7l('

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'hopeapp.middleware.crossdomainxhr.XsSharing',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

XS_SHARING_ALLOWED_ORIGINS = "*"
XS_SHARING_ALLOWED_METHODS = ['POST','GET','OPTIONS', 'PUT', 'DELETE']
XS_SHARING_ALLOWED_HEADERS = "*"

ROOT_URLCONF = 'hope.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'hope.wsgi.application'

TEMPLATE_DIRS = (
    os.path.join(SITE_ROOT, 'templates')
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'hopeapp',
    'south',
    'tokenapi',
    'django_facebook',
    'django_extensions',
    'django_assets',
    'django_nose',
    'django.contrib.admin'
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)

SOUTH_TESTS_MIGRATE = False # To disable migrations and use syncdb instead
SKIP_SOUTH_TESTS = True # To disable South's own unit tests

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'


AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    'django_facebook.auth_backends.FacebookBackend',
    "tokenapi.backends.TokenBackend",
)

AUTH_PROFILE_MODULE = 'django_facebook.FacebookProfile'

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}