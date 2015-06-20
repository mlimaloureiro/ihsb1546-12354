# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Categories'
        db.create_table('hopeapp_categories', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('parent_id', self.gf('django.db.models.fields.IntegerField')()),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['auth.User'])),
            ('name', self.gf('django.db.models.fields.CharField')
             (max_length=150)),
            ('description', self.gf('django.db.models.fields.CharField')
             (max_length=2000)),
            ('bullshit', self.gf('django.db.models.fields.IntegerField')()),
            ('menu_label', self.gf('django.db.models.fields.CharField')
             (max_length=150)),
            ('order', self.gf('django.db.models.fields.IntegerField')()),
            ('updated_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')
             (auto_now=True, blank=True)),
        ))
        db.send_create_signal('hopeapp', ['Categories'])

        # Adding model 'Occurrences'
        db.create_table('hopeapp_occurrences', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['auth.User'])),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['hopeapp.Categories'])),
            ('coordinate', self.gf('django.db.models.fields.CharField')
             (max_length=75)),
            ('title', self.gf('django.db.models.fields.CharField')
             (max_length=250)),
            ('description', self.gf('django.db.models.fields.CharField')
             (max_length=2000)),
            ('vote_counter',
             self.gf('django.db.models.fields.IntegerField')()),
            ('mongo_id', self.gf('django.db.models.fields.CharField')
             (max_length=100)),
            ('validated', self.gf('django.db.models.fields.IntegerField')()),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('updated_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('bullshit', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal('hopeapp', ['Occurrences'])

        # Adding model 'Attributes'
        db.create_table('hopeapp_attributes', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['hopeapp.Categories'])),
            ('name', self.gf('django.db.models.fields.CharField')
             (max_length=150)),
            ('order', self.gf('django.db.models.fields.IntegerField')()),
            ('a_type', self.gf('django.db.models.fields.CharField')
             (max_length=15)),
            ('max_value', self.gf('django.db.models.fields.IntegerField')()),
            ('min_value', self.gf('django.db.models.fields.IntegerField')()),
            ('scale', self.gf('django.db.models.fields.IntegerField')()),
            ('data_type', self.gf('django.db.models.fields.CharField')
             (max_length=100)),
            ('visible', self.gf('django.db.models.fields.IntegerField')()),
            ('bullshit', self.gf('django.db.models.fields.IntegerField')()),
            ('nullable', self.gf('django.db.models.fields.CharField')
             (max_length=10)),
        ))
        db.send_create_signal('hopeapp', ['Attributes'])

        # Adding model 'AttributeValue'
        db.create_table('hopeapp_attributevalue', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('attribute', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['hopeapp.Attributes'])),
            ('occurrence', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['hopeapp.Occurrences'])),
            ('value', self.gf('django.db.models.fields.CharField')
             (max_length=10000)),
            ('bullshit', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal('hopeapp', ['AttributeValue'])

        # Adding model 'Votes'
        db.create_table('hopeapp_votes', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['auth.User'])),
            ('occurrence', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['hopeapp.Occurrences'])),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')
             (auto_now=True, blank=True)),
        ))
        db.send_create_signal('hopeapp', ['Votes'])

        # Adding model 'Photos'
        db.create_table('hopeapp_photos', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('occurrence', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['hopeapp.Occurrences'])),
            ('path_small', self.gf('django.db.models.fields.CharField')
             (max_length=200)),
            ('path_medium', self.gf('django.db.models.fields.CharField')
             (max_length=200)),
            ('path_big', self.gf('django.db.models.fields.CharField')
             (max_length=200)),
        ))
        db.send_create_signal('hopeapp', ['Photos'])

        # Adding model 'Permissions'
        db.create_table('hopeapp_permissions', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['auth.User'])),
            ('category', self.gf('django.db.models.fields.IntegerField')()),
            ('read', self.gf('django.db.models.fields.IntegerField')()),
            ('write', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal('hopeapp', ['Permissions'])

        # Adding model 'PermissionsOccurrences'
        db.create_table('hopeapp_permissionsoccurrences', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('user', self.gf('django.db.models.fields.IntegerField')()),
            ('occurrence', self.gf('django.db.models.fields.IntegerField')()),
            ('read', self.gf('django.db.models.fields.IntegerField')()),
            ('write', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal('hopeapp', ['PermissionsOccurrences'])

        # Adding model 'OccurrencesReforce'
        db.create_table('hopeapp_occurrencesreforce', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['auth.User'])),
            ('occurrence', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['hopeapp.Occurrences'])),
        ))
        db.send_create_signal('hopeapp', ['OccurrencesReforce'])

        # Adding model 'UserFollow'
        db.create_table('hopeapp_userfollow', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('follower', self.gf('django.db.models.fields.IntegerField')()),
            ('followed', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal('hopeapp', ['UserFollow'])

        # Adding model 'AppGroups'
        db.create_table('hopeapp_appgroups', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['auth.User'])),
            ('name', self.gf('django.db.models.fields.CharField')
             (max_length=250)),
        ))
        db.send_create_signal('hopeapp', ['AppGroups'])

        # Adding model 'Memberships'
        db.create_table('hopeapp_memberships', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['auth.User'])),
            ('group', self.gf('django.db.models.fields.related.ForeignKey')
             (to=orm['hopeapp.AppGroups'])),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal('hopeapp', ['Memberships'])

        # Adding model 'TempFile'
        db.create_table('hopeapp_tempfile', (
            ('id', self.gf('django.db.models.fields.AutoField')
             (primary_key=True)),
            ('temp', self.gf('django.db.models.fields.files.FileField')
             (max_length=100)),
        ))
        db.send_create_signal('hopeapp', ['TempFile'])

    def backwards(self, orm):
        # Deleting model 'Categories'
        db.delete_table('hopeapp_categories')

        # Deleting model 'Occurrences'
        db.delete_table('hopeapp_occurrences')

        # Deleting model 'Attributes'
        db.delete_table('hopeapp_attributes')

        # Deleting model 'AttributeValue'
        db.delete_table('hopeapp_attributevalue')

        # Deleting model 'Votes'
        db.delete_table('hopeapp_votes')

        # Deleting model 'Photos'
        db.delete_table('hopeapp_photos')

        # Deleting model 'Permissions'
        db.delete_table('hopeapp_permissions')

        # Deleting model 'PermissionsOccurrences'
        db.delete_table('hopeapp_permissionsoccurrences')

        # Deleting model 'OccurrencesReforce'
        db.delete_table('hopeapp_occurrencesreforce')

        # Deleting model 'UserFollow'
        db.delete_table('hopeapp_userfollow')

        # Deleting model 'AppGroups'
        db.delete_table('hopeapp_appgroups')

        # Deleting model 'Memberships'
        db.delete_table('hopeapp_memberships')

        # Deleting model 'TempFile'
        db.delete_table('hopeapp_tempfile')

    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'hopeapp.appgroups': {
            'Meta': {'object_name': 'AppGroups'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'hopeapp.attributes': {
            'Meta': {'object_name': 'Attributes'},
            'a_type': ('django.db.models.fields.CharField', [], {'max_length': '15'}),
            'bullshit': ('django.db.models.fields.IntegerField', [], {}),
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['hopeapp.Categories']"}),
            'data_type': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'max_value': ('django.db.models.fields.IntegerField', [], {}),
            'min_value': ('django.db.models.fields.IntegerField', [], {}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'nullable': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'order': ('django.db.models.fields.IntegerField', [], {}),
            'scale': ('django.db.models.fields.IntegerField', [], {}),
            'visible': ('django.db.models.fields.IntegerField', [], {})
        },
        'hopeapp.attributevalue': {
            'Meta': {'object_name': 'AttributeValue'},
            'attribute': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['hopeapp.Attributes']"}),
            'bullshit': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'occurrence': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['hopeapp.Occurrences']"}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '10000'})
        },
        'hopeapp.categories': {
            'Meta': {'object_name': 'Categories'},
            'bullshit': ('django.db.models.fields.IntegerField', [], {}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '2000'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'menu_label': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'order': ('django.db.models.fields.IntegerField', [], {}),
            'parent_id': ('django.db.models.fields.IntegerField', [], {}),
            'updated_at': ('django.db.models.fields.DateTimeField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'hopeapp.memberships': {
            'Meta': {'object_name': 'Memberships'},
            'created_at': ('django.db.models.fields.DateTimeField', [], {}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['hopeapp.AppGroups']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'hopeapp.occurrences': {
            'Meta': {'object_name': 'Occurrences'},
            'bullshit': ('django.db.models.fields.IntegerField', [], {}),
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['hopeapp.Categories']"}),
            'coordinate': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '2000'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mongo_id': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'updated_at': ('django.db.models.fields.DateTimeField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'validated': ('django.db.models.fields.IntegerField', [], {}),
            'vote_counter': ('django.db.models.fields.IntegerField', [], {})
        },
        'hopeapp.occurrencesreforce': {
            'Meta': {'object_name': 'OccurrencesReforce'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'occurrence': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['hopeapp.Occurrences']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'hopeapp.permissions': {
            'Meta': {'object_name': 'Permissions'},
            'category': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'read': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'write': ('django.db.models.fields.IntegerField', [], {})
        },
        'hopeapp.permissionsoccurrences': {
            'Meta': {'object_name': 'PermissionsOccurrences'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'occurrence': ('django.db.models.fields.IntegerField', [], {}),
            'read': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.IntegerField', [], {}),
            'write': ('django.db.models.fields.IntegerField', [], {})
        },
        'hopeapp.photos': {
            'Meta': {'object_name': 'Photos'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'occurrence': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['hopeapp.Occurrences']"}),
            'path_big': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'path_medium': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'path_small': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'hopeapp.tempfile': {
            'Meta': {'object_name': 'TempFile'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'temp': ('django.db.models.fields.files.FileField', [], {'max_length': '100'})
        },
        'hopeapp.userfollow': {
            'Meta': {'object_name': 'UserFollow'},
            'followed': ('django.db.models.fields.IntegerField', [], {}),
            'follower': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'hopeapp.votes': {
            'Meta': {'object_name': 'Votes'},
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'occurrence': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['hopeapp.Occurrences']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        }
    }

    complete_apps = ['hopeapp']
