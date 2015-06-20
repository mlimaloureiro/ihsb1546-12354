from django.test import TestCase
from hopeapp.services.occurrence.occurrence_service import *
from hopeapp.services.occurrence.dependencies.formatter import *
from hopeapp.services.occurrence.repository.django_repository import *
from hopeapp.services.map.map_service import *
from hopeapp.services.map.repository.mongo_repository import *
from django.utils.dateparse import parse_datetime
from hopeapp.models import *
import pytz
import simplejson as json

class OccurrenceServiceTestCase(TestCase):

    def setUp(self):
        self.formatter = OccurrenceJSONFormatter()
        self.repository = OccurrenceDjangoORMRepository()

        self.service = OccurrenceService(
            occurrence_repository=self.repository,
            formatter=self.formatter)

        self.naive = parse_datetime("2013-10-06 18:29:45")
        self.dates = pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None)

        # mock users
        # 3 users
        # user_1 has 3 occurrence
        # user_2 has 4 occurrences
        # user_3 has 0 occurrences
        self.user_1 = User.objects.create(
            username="andre", password="password", email="andre@goncalves.me")
        self.user_2 = User.objects.create(
            username="angelo", password="password", email="angelo@miguel.me")
        self.user_3 = User.objects.create(
            username="miguel", password="password", email="miguel@angelo.me")
        self.user_4 = User.objects.create(
            username="tralhao", password="password", email="tralhao@angelo.me")
        # mock categories
        # 4 categories
        # category_0 is father of category_1 and category_3
        # category_1 is father of category_2
        self.category_0 = Categories.objects.create(
            parent_id=0,
            user=self.user_1,
            name="Category #0",
            description="Description Category #0",
            bullshit=0,
            menu_label="Category #0",
            order=1,
            created_at=self.dates,
            updated_at=self.dates
        )

        self.category_1 = Categories.objects.create(
            parent_id=self.category_0.id,
            user=self.user_1,
            name="Category #1",
            description="Description Category #1",
            bullshit=0,
            menu_label="Category #1",
            order=1,
            created_at=self.dates,
            updated_at=self.dates
        )

        self.category_2 = Categories.objects.create(
            parent_id=self.category_1.id,
            user=self.user_2,
            name="Category #2",
            description="Description Category #2",
            bullshit=0,
            menu_label="Category #2",
            order=1,
            created_at=self.dates,
            updated_at=self.dates
        )

        self.category_3 = Categories.objects.create(
            parent_id=self.category_0.id,
            user=self.user_3,
            name="Category #3",
            description="Description Category #3",
            bullshit=0,
            menu_label="Category #3",
            order=1,
            created_at=self.dates,
            updated_at=self.dates
        )

        self.category_4 = Categories.objects.create(
            parent_id=self.category_1.id,
            user=self.user_4,
            name="Category #4",
            description="Description Category #4",
            bullshit=0,
            menu_label="Category #4",
            order=1,
            created_at=self.dates,
            updated_at=self.dates
        )

        self.category_5 = Categories.objects.create(
            parent_id=self.category_4.id,
            user=self.user_4,
            name="Category #5",
            description="Description Category #5",
            bullshit=0,
            menu_label="Category #5",
            order=1,
            created_at=self.dates,
            updated_at=self.dates
        )

        self.attribute_1 = Attributes.objects.create(
            category = self.category_0,
            name = 'gravidade',
            order = 1,
            a_type = 'cost',
            min_value = 1,
            max_value = 10,
            scale = 1,
            data_type = 'string',
            nullable = 0,
            visible = 1,
            bullshit = 0
        )

        self.attribute_2 = Attributes.objects.create(
            category = self.category_0,
            name = 'impacto ambiental',
            order = 1,
            a_type = 'cost',
            min_value = 1,
            max_value = 10,
            scale = 1,
            data_type = 'string',
            nullable = 0,
            visible = 1,
            bullshit = 0      
        )

        self.attribute_3 = Attributes.objects.create(
            category = self.category_1,
            name = 'dimensao',
            order = 1,
            a_type = 'cost',
            min_value = 1,
            max_value = 10,
            scale = 1,
            data_type = 'string',
            nullable = 0,
            visible = 1,
            bullshit = 0
        )

        self.attribute_4 = Attributes.objects.create(
            category = self.category_2,
            name = 'custo',
            order = 1,
            a_type = 'cost',
            min_value = 1,
            max_value = 10,
            scale = 1,
            data_type = 'string',
            nullable = 0,
            visible = 1,
            bullshit = 0
        )

        self.attribute_5 = Attributes.objects.create(
            category = self.category_3,
            name = 'coisas',
            order = 1,
            a_type = 'cost',
            min_value = 1,
            max_value = 10,
            scale = 1,
            data_type = 'string',
            nullable = 0,
            visible = 1,
            bullshit = 0
        )

        self.attribute_6 = Attributes.objects.create(
            category = self.category_3,
            name = 'infinitas',
            order = 1,
            a_type = 'cost',
            min_value = 1,
            max_value = 10,
            scale = 1,
            data_type = 'string',
            nullable = 0,
            visible = 1,
            bullshit = 0
        )

        self.attribute_7 = Attributes.objects.create(
            category = self.category_4,
            name = 'cenas',
            order = 1,
            a_type = 'cost',
            min_value = 1,
            max_value = 10,
            scale = 1,
            data_type = 'string',
            nullable = 0,
            visible = 1,
            bullshit = 0
        )

        self.attribute_8 = Attributes.objects.create(
            category = self.category_4,
            name = 'lindas',
            order = 1,
            a_type = 'cost',
            min_value = 1,
            max_value = 10,
            scale = 1,
            data_type = 'string',
            nullable = 0,
            visible = 1,
            bullshit = 0
        )

        # mock occurrences
        # 5 validated and 2 unvalidated
        # occ_1 category_0 user_1
        # occ_2 category_1 user_1
        # occ_3 category_1 user_1
        # occ_4 category_2 user_2
        # occ_5 category_0 user_2
        # occ_6 category_1 user_2
        # occ_7 category_1 user_2

        self.occ_1 = Occurrences.objects.create(
            user=self.user_1,
            category=self.category_0,
            coordinate="40.2112, 8.4292",
            title="Ocorrencia de Teste #1",
            description="Descricao ocorrencia #1",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        self.occ_2 = Occurrences.objects.create(
            user=self.user_1,
            category=self.category_1,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        self.occ_3 = Occurrences.objects.create(
            user=self.user_1,
            category=self.category_1,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        self.occ_4 = Occurrences.objects.create(
            user=self.user_2,
            category=self.category_2,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        self.occ_5 = Occurrences.objects.create(
            user=self.user_2,
            category=self.category_0,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        self.occ_6 = Occurrences.objects.create(
            user=self.user_2,
            category=self.category_1,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=0,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        self.occ_7 = Occurrences.objects.create(
            user=self.user_2,
            category=self.category_1,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=0,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        self.occ_8 = Occurrences.objects.create(
            user=self.user_4,
            category=self.category_1,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        self.occ_9 = Occurrences.objects.create(
            user=self.user_4,
            category=self.category_5,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #9",
            description="Descricao ocorrencia #9",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

    # the same as validated
    def test_get_all_occurrences_ordered_by(self):
        occ_all = self.service.get_all(
            request_user_id=self.user_1.id, order_by='created_at')
        result = json.loads(occ_all)

        # test if we have the right number of occ
        self.assertEqual(len(result), 7)
        # test properties

        self.assertTrue('is_owner' in result[0])
        self.assertTrue('id' in result[0])
        self.assertTrue('user_id' in result[0])
        self.assertTrue('created_at' in result[0])
        self.assertTrue('coordinate' in result[0])
        self.assertTrue('category_id' in result[0])
        self.assertTrue('category_name' in result[0])
        self.assertTrue('title' in result[0])
        self.assertTrue('description' in result[0])
        self.assertTrue('validated' in result[0])
        self.assertTrue('vote_counter' in result[0])

    def test_get_all_unvalidated_occurrences(self):
        occ_all = self.service.get_all(request_user_id=self.user_1.id,
                                       order_by='created_at',
                                       validated=0)

        result = json.loads(occ_all)

        # test if we have the right number of occ
        self.assertEqual(len(result), 2)

        self.assertTrue('is_owner' in result[0])
        self.assertTrue('id' in result[0])
        self.assertTrue('user_id' in result[0])
        self.assertTrue('created_at' in result[0])
        self.assertTrue('coordinate' in result[0])
        self.assertTrue('category_id' in result[0])
        self.assertTrue('category_name' in result[0])
        self.assertTrue('title' in result[0])
        self.assertTrue('description' in result[0])
        self.assertTrue('validated' in result[0])
        self.assertTrue('vote_counter' in result[0])

    # the validated ones
    def test_get_all_occurrences_by_category(self):
        occ_all = self.service.get_all_by_category(
            request_user_id=self.user_1.id,
            category=self.category_1.id)
        result = json.loads(occ_all)

        # test if we have the right number of occ
        self.assertEqual(len(result), 3)

        self.assertTrue('is_owner' in result[0])
        self.assertTrue('id' in result[0])
        self.assertTrue('user_id' in result[0])
        self.assertTrue('created_at' in result[0])
        self.assertTrue('coordinate' in result[0])
        self.assertTrue('category_id' in result[0])
        self.assertTrue('category_name' in result[0])
        self.assertTrue('title' in result[0])
        self.assertTrue('description' in result[0])
        self.assertTrue('validated' in result[0])
        self.assertTrue('vote_counter' in result[0])

    def test_get_one_occurrence(self):
        occ = self.service.get_one(
            occurrence_id=self.occ_2.id, request_user_id=self.user_1.id)

        self.assertTrue(occ)
        self.assertTrue('default_values' in occ)
        self.assertTrue('schema_values' in occ)
        self.assertTrue('geo' in occ)
        self.assertTrue('geom' in occ)
        self.assertTrue('photos' in occ)
        self.assertTrue('videos' in occ)

    def test_get_occurrence_custom_attributes(self):
        pass

    def test_create_occurrence(self):
        inputs = {
            'category_id' : self.category_0.id,
            'title'       : 'WORKING',
            'description' : 'AI ESTA ELE',
            'user'        : self.user_1.id,
            'coordinate'  : '40.201428,-8.410431',
            'validated'   : 1,
            'vote_counter': 0,
            'created_at'  : self.dates,
            'updated_at'  : self.dates,
            'bullshit'    : 0
        }
        
        query = self.service.create(inputs)
        occ = json.loads(query)

        self.assertTrue(occ)
        self.assertTrue('id' in occ)

        self.assertTrue('user_id' in occ)
        self.assertEqual(self.user_1.id, occ['user_id']) 

        self.assertTrue('category_id' in occ)
        self.assertEqual(self.category_0.id, occ['category_id'])

        self.assertTrue('coordinate' in occ)
        self.assertEqual('40.201428,-8.410431', occ['coordinate'])
        
        self.assertTrue('description' in occ)
        self.assertEqual('AI ESTA ELE',occ['description'])

        self.assertTrue('category_name' in occ)
        self.assertEqual(self.category_0.name, occ['category_name'])

        self.assertTrue('validated' in occ)
        self.assertEqual(1, occ['validated'])

        self.assertTrue('vote_counter' in occ)
        self.assertEqual(0, occ['vote_counter'])      


    def test_initialize_attributes(self):
        test = self.service.initialize_attributes(
                        self.occ_4.id,
                        self.occ_4.category.id)

        self.assertTrue(test)

        query = self.service.get_one(occurrence_id=self.occ_4.id, 
                                     request_user_id=self.user_1.id)

        occ = json.loads(query)

        # lets now see if they are initialized
        self.assertTrue('schema_values' in occ)

        # aux
        names = []

        for field in occ['schema_values']:
            names.append(field['name'])

        #
        # Caution on this, we are only proving
        # that the schema was created
        # not that it has initialized with ''
        #
        self.assertEquals(4, len(names))
        self.assertTrue('custo' in names)
        self.assertTrue('dimensao' in names)
        self.assertTrue('gravidade' in names)
        self.assertTrue('impacto ambiental' in names)


        #
        #   Test category with no attributes
        #   but with parent attributes
        #
        test2 = self.service.initialize_attributes(
                        self.occ_9.id,
                        self.occ_9.category.id)
        self.assertTrue(test2)

        query = self.service.get_one(occurrence_id=self.occ_9.id, 
                                     request_user_id=self.user_1.id)

        occ = json.loads(query)

        # lets now see if they are initialized
        self.assertTrue('schema_values' in occ)

        # aux
        names = []

        for field in occ['schema_values']:
            names.append(field['name'])

        self.assertEquals(5, len(names))
        self.assertTrue('cenas' in names)
        self.assertTrue('lindas' in names)
        self.assertTrue('dimensao' in names)
        self.assertTrue('gravidade' in names)
        self.assertTrue('impacto ambiental' in names)

    def test_initialize_permissions(self):

        perm = self.service.initialize_permissions(occ_id=self.occ_9.id)
        self.assertTrue(perm)
        self.assertEqual(self.occ_9.user.id, perm.user)
        self.assertEqual(self.occ_9.id, perm.occurrence)
        self.assertEqual(1, perm.read)        
        self.assertEqual(1, perm.write)