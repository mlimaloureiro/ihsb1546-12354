from django.test import TestCase
from hopeapp.services.category.category_service import *
from hopeapp.services.category.dependencies.formatter import *
from hopeapp.services.category.repository.django_repository import *
from django.utils.dateparse import parse_datetime
from hopeapp.models import *
import datetime
import pytz
import simplejson as json

class CategoryServiceTestCase(TestCase):

    def setUp(self):
        self.formatter = CategoryJSONFormatter()
        self.repository = CategoryDjangoORMRepository()

        self.service = CategoryService(
            category_repository=self.repository,
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

        self.occ_10 = Occurrences.objects.create(
            user=self.user_4,
            category=self.category_5,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #10",
            description="Descricao ocorrencia #10",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        self.occ_11 = Occurrences.objects.create(
            user=self.user_4,
            category=self.category_5,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #11",
            description="Descricao ocorrencia #11",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=self.dates,
            created_at=self.dates,
            bullshit=0
        )

        # Attribute values
        self.attrvalue_0 = AttributeValue.objects.create(
            attribute = self.attribute_7,
            occurrence = self.occ_1,
            value = "1",
            bullshit = 1
        )

        self.attrvalue_0 = AttributeValue.objects.create(
            attribute = self.attribute_7,
            occurrence = self.occ_1,
            value = "2",
            bullshit = 1
        )

        self.attrvalue_0 = AttributeValue.objects.create(
            attribute = self.attribute_8,
            occurrence = self.occ_1,
            value = "10",
            bullshit = 1
        )

        self.attrvalue_0 = AttributeValue.objects.create(
            attribute = self.attribute_8,
            occurrence = self.occ_1,
            value = "9",
            bullshit = 1
        )

    # the same as validated
    def test_get_all_occurrences_by_category_id(self):
        occ_all = self.service.get_all_occurrences(self.category_5.id)
        result = json.loads(occ_all)

        self.assertEqual(len(result['occurrences']), 3)
        self.assertTrue('parents' in result)
        self.assertEqual(len(result['parents']), 3)

        for parent in result['parents']:
            self.assertTrue('name' in parent)
            self.assertTrue('id' in parent)

        self.assertTrue('occurrences' in result)
        for occ in result['occurrences']:
            self.assertTrue('description' in occ)
            self.assertTrue('photos' in occ)
            self.assertTrue('vote_counter' in occ)
            self.assertTrue('occ_selected' in occ)
            self.assertTrue('id' in occ)
            self.assertTrue('validated' in occ)
            self.assertTrue('user_id' in occ)
            self.assertTrue('title' in occ)
            self.assertTrue('created_at' in occ)
            self.assertTrue('score' in occ)
            self.assertTrue('coordinate' in occ)

        self.assertTrue('success' in result)
        self.assertTrue('attrs' in result)

    def test_get_category_by_id(self):
        cat = self.service.get(self.category_5.id)
        category = json.loads(cat)

        self.assertTrue('parent_id' in category)
        self.assertEqual(category['parent_id'], self.category_5.parent_id)
        self.assertTrue('user' in category)
        self.assertEqual(category['user'], self.user_4.id)
        self.assertTrue('name' in category)
        self.assertEqual(category['name'], 'Category #5')
        self.assertTrue('description' in category)
        self.assertEqual(category['description'], 'Description Category #5')
        self.assertTrue('menu_label' in category)
        self.assertEqual(category['menu_label'], 'Category #5')
        self.assertTrue('order' in category)
        self.assertEqual(category['order'], 1)
        self.assertTrue('bullshit' in category)
        self.assertEqual(category['bullshit'], 0)

    def test_get_all_categories(self):
        cats = self.service.get_all('order')
        categories = json.loads(cats)

        self.assertEqual(len(categories), 6)
        for category in categories:
            self.assertTrue('pk' in category)
            self.assertTrue('fields' in category)
            self.assertTrue('parent_id' in category["fields"])
            self.assertTrue('user' in category["fields"])
            self.assertTrue('name' in category["fields"])
            self.assertTrue('description' in category["fields"])
            self.assertTrue('menu_label' in category["fields"])
            self.assertTrue('order' in category["fields"])
            self.assertTrue('bullshit' in category["fields"])    


    def test_create_category(self):
        inputs = {
            'parent_id': self.category_0.id,
            'user_id': self.user_4.id,
            'name': "New category",
            'description': "New category description",
            'menu_label': "New category label",
            'bullshit': 0,
            'order': 1,
            'updated_at': self.dates
        }

        cat = self.service.create(inputs)
        category = json.loads(cat)

        self.assertTrue('success' in category)
        self.assertTrue('id' in category)

        cat_id = category['id']

        cat_obj = Categories.objects.get(id=cat_id)

        self.assertEqual(cat_obj.parent_id, self.category_0.id)
        self.assertEqual(cat_obj.user_id, self.user_4.id)
        self.assertEqual(cat_obj.name, "New category")
        self.assertEqual(cat_obj.description, "New category description")
        self.assertEqual(cat_obj.menu_label, "New category label")
        self.assertEqual(cat_obj.bullshit, 0)
        self.assertEqual(cat_obj.order, 1)
        self.assertEqual(cat_obj.updated_at, self.dates)

    def test_edit_category(self):
        options = {}
        data = {}
        data['name'] = 'New name for cat 5'
        data['description'] = 'New description for cat 5'
        data['menu_label'] = 'New menu label for cat 5'
        data['order'] = 1

        options['id'] = self.category_5.id
        options['data'] = data
        
        obj = self.service.edit(options)

        # Get instance for edited category
        category = Categories.objects.get(id=self.category_5.id)

        self.assertTrue('success' in obj)
        self.assertEqual(category.name, data['name'])
        self.assertEqual(category.description, data['description'])
        self.assertEqual(category.menu_label, data['menu_label'])
        self.assertEqual(category.order, data['order'])

    def test_remove_category(self):
        cat_id = self.category_4.id
        
        obj = self.service.remove(cat_id)

        self.assertTrue("success" in obj)
        self.assertTrue('msg' in obj)
        self.assertEqual(len(Categories.objects.filter(id=cat_id)), 0)
        








