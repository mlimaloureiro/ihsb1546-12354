from django.db import models
from django.db.models import *
from django.contrib.auth.models import User

class LocationPreferences(models.Model):

    user = models.ForeignKey(User)
    location_lat = models.CharField(max_length=15)
    location_lng = models.CharField(max_length=15)
    location_string = models.CharField(max_length=300)
    location_view_radius = models.IntegerField()

class Categories(models.Model):

    parent_id = models.IntegerField()
    #user = models.ForeignKey(settings.AUTH_USER_MODEL)
    user = models.ForeignKey(User)
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=2000)
    bullshit = models.IntegerField()
    menu_label = models.CharField(max_length=150)
    order = models.IntegerField()
    updated_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now=True)

class Occurrences(models.Model):

    #user = models.ForeignKey(settings.AUTH_USER_MODEL)
    user = models.ForeignKey(User)
    category = models.ForeignKey(Categories)
    coordinate = models.CharField(max_length=75)
    title = models.CharField(max_length=250)
    description = models.CharField(max_length=2000)
    vote_counter = models.IntegerField()
    mongo_id = models.CharField(max_length=100)
    validated = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    bullshit = models.IntegerField()

class Attributes(models.Model):

    category = models.ForeignKey(Categories)
    name = models.CharField(max_length=150)
    order = models.IntegerField()

    ATTR_CHOICES = (
        ('CLASSIFICATION', 'classification'),
        ('BENEFIT', 'benefit'),
        ('COST', 'cost'),
        ('IDENTIFICATION', 'identification'),
        ('CONNECTION', 'connection')
    )

    a_type = models.CharField(max_length=15, choices=ATTR_CHOICES)

    max_value = models.IntegerField()
    min_value = models.IntegerField()
    scale = models.IntegerField()
    data_type = models.CharField(max_length=100)
    visible = models.IntegerField()
    bullshit = models.IntegerField()

    NULL_CHOICES = (
        ('TRUE', 'true'),
        ('FALSE', 'false')
    )

    nullable = models.CharField(max_length=10, choices=NULL_CHOICES)

class AttributeValue(models.Model):

    attribute = ForeignKey(Attributes)
    occurrence = ForeignKey(Occurrences)
    value = models.CharField(max_length=10000)
    bullshit = models.IntegerField()

class Votes(models.Model):

    #user = models.ForeignKey(settings.AUTH_USER_MODEL)
    user = models.ForeignKey(User)
    occurrence = models.ForeignKey(Occurrences)
    created_at = models.DateTimeField(auto_now=True)

class Photos(models.Model):

    occurrence = models.ForeignKey(Occurrences)
    path_small = models.CharField(max_length=200)
    path_medium = models.CharField(max_length=200)
    path_big = models.CharField(max_length=200)

class Permissions(models.Model):

    #user = models.ForeignKey(settings.AUTH_USER_MODEL)
    user = models.ForeignKey(User)
    category = models.IntegerField()
    read = models.IntegerField()
    write = models.IntegerField()

class PermissionsOccurrences(models.Model):

    user = models.IntegerField()
    occurrence = models.IntegerField()
    read = models.IntegerField()
    write = models.IntegerField()

class OccurrencesReforce(models.Model):

    #user = models.ForeignKey(settings.AUTH_USER_MODEL)
    user = models.ForeignKey(User)
    occurrence = models.ForeignKey(Occurrences)

class UserFollow(models.Model):

    follower = models.IntegerField()
    followed = models.IntegerField()

class AppGroups(models.Model):
    user = models.ForeignKey(User)
    #user = models.ForeignKey(settings.AUTH_USER_MODEL)
    name = models.CharField(max_length=250)

class Memberships(models.Model):
    user = models.ForeignKey(User)
    #user = models.ForeignKey(settings.AUTH_USER_MODEL)
    group = models.ForeignKey(AppGroups)
    created_at = models.DateTimeField()

class TempFile(models.Model):

    temp = models.FileField(upload_to='temp')

class Videos(models.Model):
    
    occurrence = models.ForeignKey(Occurrences)
    url = models.CharField(max_length=300)

