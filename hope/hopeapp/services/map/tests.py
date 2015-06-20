from django.test import TestCase
from django.conf import settings
from hopeapp.services.map.map_service import *
from hopeapp.services.map.repository.mongo_repository import *
from pymongo import *

class MapServiceTestCase(TestCase):

    def setUp(self):

        dbmongo = MongoClient(settings.MONGO_URL)
        self.mongo = dbmongo['test_hope']

        self.repository = MapMongoRepository(connection = self.mongo)
        self.service = MapService(map_repository=self.repository)

        self.mongo.map_attributes.insert({
                'id' : 1,
                'validated' : 1,
                'category_id' : 2,
                'geo' : False,
                'geom': '[{"coords" : "124467,123567"}]'
            })

        self.mongo.map_attributes.insert({
                'id' : 2,
                'validated' : 0,
                'category_id' : 30,
                'geo' : False,
                'geom': '[{"coords" : "23456,12563"}]'
            })

        self.mongo.map_attributes.insert({
                'id' : 3,
                'validated' : 1,
                'category_id' : 120,
                'geo' : True,
                'geom': '[{"coords" : "824725,136835"}]'
            })

        self.mongo.map_attributes.insert({
                'id' : 40,
                'validated' : 0,
                'category_id' : 120,
                'geo' : True,
                'geom': '[{"coords" : "824725,136835"}]'
            })


    def test_filter_map_attributes(self):

        query = self.service.filter({'validated' : 1, 'category_id' : 120})

        # this doesn't give correct length, dunno why
        # qlist = list(query)
        # len(qlist)
        
        length = 0

        for p in query:
            length += 1
            print p

        #print length

        self.assertTrue(query)
        self.assertTrue(length, 1)


    def test_create_map_attributes(self):

        query = self.service.create({
                'id' : 4,
                'validated' : 1,
                'category_id' : 2,
                'geo' : False,
                'geom': '[{"coords" : "124467,123567"}]'
            })

        self.assertTrue(query)

        self.assertTrue('id' in query)
        self.assertEqual(query['id'], 4)

        self.assertTrue('validated' in query)
        self.assertEqual(query['validated'], 1)

        self.assertTrue('category_id' in query)
        self.assertEqual(query['category_id'], 2)

        self.assertTrue('geo' in query)
        self.assertEqual(query['geo'], False)

        self.assertTrue('geom' in query)
        self.assertEqual(query['geom'], '[{"coords" : "124467,123567"}]')


    def test_update_map_attributes(self):
        
        query = self.service.update(ident = 3, options = {
                'geom' : 'esta tudo certo!',
                'validated': 1,
                'geo' : True,
                'category_id' : 230
            })

        self.assertTrue(query)

        self.assertTrue('id' in query)
        self.assertEqual(query['id'], 3)

        self.assertTrue('validated' in query)
        self.assertEqual(query['validated'], 1)

        self.assertTrue('category_id' in query)
        self.assertEqual(query['category_id'], 230)

        self.assertTrue('geo' in query)
        self.assertEqual(query['geo'], True)

        self.assertTrue('geom' in query)
        self.assertEqual(query['geom'], 'esta tudo certo!')

        
    def test_get_map_attributes(self):
        query = self.service.get(ident = 1)

        self.assertTrue(query)

        self.assertTrue('id' in query)
        self.assertEqual(query['id'], 1)

        self.assertTrue('validated' in query)
        self.assertEqual(query['validated'], 1)

        self.assertTrue('category_id' in query)
        self.assertEqual(query['category_id'], 2)

        self.assertTrue('geo' in query)
        self.assertEqual(query['geo'], False)

        self.assertTrue('geom' in query)
        self.assertEqual(query['geom'], '[{"coords" : "124467,123567"}]')

    def test_delete_map_attributes(self):
        q = self.service.delete(ident = 1)
        q = self.service.delete(ident = 2)

        q_all = self.mongo.map_attributes.find()
        
        # lul
        q1 = self.service.get(ident = 2)

        self.assertTrue(q)
        self.assertFalse(q1)
        # total (4) - 1
        self.assertEqual(len(list(q_all)), 2)

    def tearDown(self):
        self.mongo.map_attributes.remove()