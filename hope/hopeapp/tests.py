"""
SperoBox tests
"""
import datetime
from django.utils.dateparse import parse_datetime
from time import gmtime, strftime
import simplejson as json
from django.test import TestCase
from hopeapp.models import *
from django.test.client import RequestFactory
from hopeapp.views.mobile import follow
import pytz


class CategoriesViewsTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            username="andre", password="andre", email="andre@goncalves.me")
        self.naive = parse_datetime("2013-10-06 18:29:45")
        self.category_0 = Categories.objects.create(
            parent_id=0,
            user=self.user,
            name="Category #1",
            description="Description Category #1",
            bullshit=0,
            menu_label="Category #1",
            order=1,
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None)
        )

        self.category_1 = Categories.objects.create(
            parent_id=1,
            user=self.user,
            name="Category #1",
            description="Description Category #1",
            bullshit=0,
            menu_label="Category #1",
            order=1,
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None)
        )

        self.schema_1 = Attributes.objects.create(
            category=self.category_1,
            name="Impacto Ambiental",
            order=0,
            a_type="benefit",
            max_value=10,
            min_value=1,
            scale=0,
            data_type="integer",
            visible=1,
            bullshit=0,
            nullable='true'
        )

        self.occ_1 = Occurrences.objects.create(
            user=self.user,
            category=self.category_1,
            coordinate="40.2112, 8.4292",
            title="Ocorrencia de Teste #1",
            description="Descricao ocorrencia #1",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            bullshit=0
        )

        self.occ_2 = Occurrences.objects.create(
            user=self.user,
            category=self.category_1,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            bullshit=0
        )

    def test_schema(self):
        resp = self.client.get(
            "/hope/categories/schema/" + str(self.schema_1.id) + "/")
        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        self.assertEqual(data["success"], True)
        self.assertTrue('fields' in data)
        self.assertTrue('parents' in data)
        self.assertTrue('details' in data)

    def test_occurrences(self):
        resp = self.client.get(
            "/hope/categories/occurrences/" + str(self.category_1.id) + "/")
        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        self.assertEqual(data["success"], True)
        self.assertTrue('occurrences' in data)
        for occ in data['occurrences']:
            self.assertTrue('photos' in occ)
            for photo in occ['photos']:
                self.assertTrue('path_small' in photo)
                self.assertTrue('path_medium' in photo)
                self.assertTrue('path_big' in photo)
            self.assertTrue('id' in occ)
            self.assertTrue('score' in occ)
            self.assertTrue('user_id' in occ)
            self.assertTrue('occ_selected' in occ)
            self.assertTrue('coordinate' in occ)
            self.assertTrue('title' in occ)
            self.assertTrue('description' in occ)
            self.assertTrue('validated' in occ)
            self.assertTrue('vote_counter' in occ)
            self.assertTrue('created_at' in occ)

        self.assertTrue('attrs' in data)
        for attr in data['attrs']:
            self.assertTrue('id' in attr)
            self.assertTrue('name' in attr)
            self.assertTrue('type' in attr)

        self.assertTrue('parents' in data)
        for parent in data['parents']:
            self.assertTrue('name' in parent)
            self.assertTrue('id' in parent)


class MobileViewsTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            username="andre", password="andre", email="andre@goncalves.me")
        self.factory = RequestFactory()
        self.naive = parse_datetime("2013-10-06 18:29:45")
        self.category_0 = Categories.objects.create(
            parent_id=0,
            user=self.user,
            name="Category #1",
            description="Description Category #1",
            bullshit=0,
            menu_label="Category #1",
            order=1,
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None)
        )

        self.category_1 = Categories.objects.create(
            parent_id=1,
            user=self.user,
            name="Category #1",
            description="Description Category #1",
            bullshit=0,
            menu_label="Category #1",
            order=1,
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None)
        )

        self.schema_1 = Attributes.objects.create(
            category=self.category_1,
            name="Impacto Ambiental",
            order=0,
            a_type="benefit",
            max_value=10,
            min_value=1,
            scale=0,
            data_type="integer",
            visible=1,
            bullshit=0,
            nullable='true'
        )

        self.occ_1 = Occurrences.objects.create(
            user=self.user,
            category=self.category_1,
            coordinate="40.2112, 8.4292",
            title="Ocorrencia de Teste #1",
            description="Descricao ocorrencia #1",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            bullshit=0
        )

        self.occ_2 = Occurrences.objects.create(
            user=self.user,
            category=self.category_1,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            bullshit=0
        )

        self.photo_1 = Photos.objects.create(
            occurrence=self.occ_1,
            path_small="small_1.png",
            path_medium="medium_1.png",
            path_big="big_1.png"
        )
        self.photo_2 = Photos.objects.create(
            occurrence=self.occ_1,
            path_small="small_2.png",
            path_medium="medium_2.png",
            path_big="big_2.png"
        )

    def test_photos(self):
        resp = self.client.get(
            "/hope/mobile/photos/" + str(self.occ_1.id) + "/")
        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)

        self.assertEqual(self.occ_1.photos_set.count(), 2)
        # TODO
        # FIX to return SUCCESS
        for photo in data:
            self.assertTrue('small_' in photo['path_small'])
            self.assertTrue('medium_' in photo['path_medium'])
            self.assertTrue('big_' in photo['path_big'])
            self.assertTrue('id' in photo)
            self.assertTrue('path_small' in photo)
            self.assertTrue('path_medium' in photo)
            self.assertTrue('path_big' in photo)

    def test_categories(self):
        resp = self.client.get("/hope/mobile/categories/")
        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        # TODO
        # FIX to return SUCCESS
        for cat in data:
            self.assertTrue('id' in cat)
            self.assertTrue('name' in cat)
            self.assertTrue('fields' in cat)

    def test_get_categories(self):
        resp = self.client.get(
            "/hope/mobile/categories/" + str(self.category_1.id) + "/")
        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        self.assertEqual(data["success"], True)
        self.assertTrue('id' in data)
        self.assertTrue('name' in data)

    def test_main_reports(self):
        resp = self.client.get("/hope/mobile/reports/")
        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        self.assertEqual(data["success"], True)
        self.assertTrue('top' in data)
        for occ in data['top']:
            self.assertTrue('id_occ' in occ)
            self.assertTrue('user_id' in occ)
            self.assertTrue('created_at' in occ)
            self.assertTrue('coordinate' in occ)
            self.assertTrue('category_id' in occ)
            self.assertTrue('category_name' in occ)
            self.assertTrue('title' in occ)
            self.assertTrue('description' in occ)
            self.assertTrue('vote_counter' in occ)
            self.assertTrue('picture' in occ)
        self.assertTrue('last' in data)
        for occ in data['last']:
            self.assertTrue('id_occ' in occ)
            self.assertTrue('user_id' in occ)
            self.assertTrue('created_at' in occ)
            self.assertTrue('coordinate' in occ)
            self.assertTrue('category_id' in occ)
            self.assertTrue('category_name' in occ)
            self.assertTrue('title' in occ)
            self.assertTrue('description' in occ)
            self.assertTrue('vote_counter' in occ)
            self.assertTrue('picture' in occ)

    def test_get_ocurrence(self):
        resp = self.client.get(
            "/hope/mobile/get_occ/" + str(self.occ_1.id) + "/")
        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        self.assertEqual(data["success"], True)
        self.assertTrue('occurrence' in data)
        self.assertTrue('id_occ' in data['occurrence'])
        self.assertTrue('user_id' in data['occurrence'])
        self.assertTrue('created_at' in data['occurrence'])
        self.assertTrue('coordinate' in data['occurrence'])
        self.assertTrue('category_id' in data['occurrence'])
        self.assertTrue('category_name' in data['occurrence'])
        self.assertTrue('title' in data['occurrence'])
        self.assertTrue('description' in data['occurrence'])
        self.assertTrue('vote_counter' in data['occurrence'])
        self.assertTrue('photos' in data['occurrence'])

        for photo in data['occurrence']['photos']:
            self.assertTrue('path_small' in photo)
            self.assertTrue('path_medium' in photo)
            self.assertTrue('path_big' in photo)

    def test_follow(self):
        req = self.factory.post(
            "/hope/mobile/follow/" + str(self.occ_1.id) + "/", {'follow': 'true'})
        req.user = self.user
        resp = follow(req, self.occ_1.id)
        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        self.assertEqual(data['success'], True)
        self.assertTrue('msg' in data)


class DSSViewsTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            username="andre", password="andre", email="andre@goncalves.me")
        self.factory = RequestFactory()
        self.naive = parse_datetime("2013-10-06 18:29:45")
        self.category_0 = Categories.objects.create(
            parent_id=0,
            user=self.user,
            name="Category #1",
            description="Description Category #1",
            bullshit=0,
            menu_label="Category #1",
            order=1,
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None)
        )

        self.category_1 = Categories.objects.create(
            parent_id=1,
            user=self.user,
            name="Category #1",
            description="Description Category #1",
            bullshit=0,
            menu_label="Category #1",
            order=1,
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None)
        )

        self.schema_1 = Attributes.objects.create(
            category=self.category_1,
            name="Impacto Ambiental",
            order=0,
            a_type="cost",
            max_value=10,
            min_value=1,
            scale=0,
            data_type="integer",
            visible=1,
            bullshit=0,
            nullable='true'
        )

        self.schema_2 = Attributes.objects.create(
            category=self.category_1,
            name="Gravidade",
            order=0,
            a_type="cost",
            max_value=10,
            min_value=1,
            scale=0,
            data_type="integer",
            visible=1,
            bullshit=0,
            nullable='true'
        )

        self.occ_1 = Occurrences.objects.create(
            user=self.user,
            category=self.category_1,
            coordinate="40.2112, 8.4292",
            title="Ocorrencia de Teste #1",
            description="Descricao ocorrencia #1",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            bullshit=0
        )

        self.occ_2 = Occurrences.objects.create(
            user=self.user,
            category=self.category_1,
            coordinate="40.3112, 8.5292",
            title="Ocorrencia de Teste #2",
            description="Descricao ocorrencia #2",
            vote_counter=1,
            mongo_id=1,
            validated=1,
            updated_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            created_at=pytz.timezone(
                "Europe/Lisbon").localize(self.naive, is_dst=None),
            bullshit=0
        )

        # TEST values
        # attr1 for occ2 < occ1
        # attr2 for occ2 = occ1
        # Result must be: score higher for occ1
        # occ1 more priority to be fixed

        self.attr1_val_occ1 = AttributeValue.objects.create(
            attribute=self.schema_1,
            occurrence=self.occ_1,
            value="5",
            bullshit=0
        )

        self.attr1_val_occ2 = AttributeValue.objects.create(
            attribute=self.schema_1,
            occurrence=self.occ_2,
            value="1",
            bullshit=0
        )

        self.attr2_val_occ1 = AttributeValue.objects.create(
            attribute=self.schema_2,
            occurrence=self.occ_1,
            value="5",
            bullshit=0
        )

        self.attr2_val_occ2 = AttributeValue.objects.create(
            attribute=self.schema_2,
            occurrence=self.occ_2,
            value="5",
            bullshit=0
        )

    def test_decision(self):
        w = [
            {'id': self.schema_1.id, 'type':
                self.schema_1.a_type, 'value': 0.5},
            {'id': self.schema_2.id, 'type': self.schema_2.a_type, 'value': 0.5}]
        occ_ids = [self.occ_1.id, self.occ_2.id]

        resp = self.client.post("/hope/support/" + str(self.category_1.id)
                                + "/", {'attrs': json.dumps(w), 'occ_ids': json.dumps(occ_ids)})
        print resp['Location']
        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        # print data
        self.assertEqual(data['success'], True)
        self.assertTrue('output_attrs' in data)
        self.assertTrue('madness' in data)
        self.assertTrue('scores' in data)
        self.assertTrue('super_madness' in data)
        self.assertTrue(len(data['scores']) is 2)
        self.assertTrue(data['scores'][0] > data['scores'][1])
        self.assertEqual(data['scores'][0], 1.0)
        self.assertEqual(data['scores'][1], 0.6)

    def test_decision_invert(self):
        # TEST values
        # attr1 for occ2 > occ1
        # attr2 for occ2 = occ1
        # Result must be: score higher for occ2
        # occ2 more priority to be fixed

        self.attr1_val_occ2.value = "5"
        self.attr1_val_occ2.save()
        self.attr1_val_occ1.value = "1"
        self.attr1_val_occ1.save()

        w = [
            {'id': self.schema_1.id, 'type':
                self.schema_1.a_type, 'value': 0.5},
            {'id': self.schema_2.id, 'type': self.schema_2.a_type, 'value': 0.5}]
        occ_ids = [self.occ_1.id, self.occ_2.id]

        resp = self.client.post("/hope/support/" + str(self.category_1.id)
                                + "/", {'attrs': json.dumps(w), 'occ_ids': json.dumps(occ_ids)})

        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        # print data
        self.assertEqual(data['success'], True)
        self.assertTrue('output_attrs' in data)
        self.assertTrue('madness' in data)
        self.assertTrue('scores' in data)
        self.assertTrue('super_madness' in data)
        self.assertTrue(len(data['scores']) is 2)
        self.assertTrue(data['scores'][0] < data['scores'][1])
        self.assertEqual(data['scores'][0], 0.6)
        self.assertEqual(data['scores'][1], 1.0)

    def test_decision_equal(self):
        # TEST values
        # attr1 for occ2 = occ1
        # attr2 for occ2 = occ1
        # Result must be: same scores
        # same priority to be fixed

        self.attr1_val_occ2.value = "5"
        self.attr1_val_occ2.save()
        self.attr1_val_occ1.value = "5"
        self.attr1_val_occ1.save()

        w = [
            {'id': self.schema_1.id, 'type':
                self.schema_1.a_type, 'value': 0.5},
            {'id': self.schema_2.id, 'type': self.schema_2.a_type, 'value': 0.5}]
        occ_ids = [self.occ_1.id, self.occ_2.id]

        resp = self.client.post("/hope/support/" + str(self.category_1.id)
                                + "/", {'attrs': json.dumps(w), 'occ_ids': json.dumps(occ_ids)})

        self.assertEqual(resp.status_code, 200)
        json_string = resp.content
        data = json.loads(json_string)
        self.assertEqual(data['success'], True)
        self.assertTrue('output_attrs' in data)
        self.assertTrue('madness' in data)
        self.assertTrue('scores' in data)
        self.assertTrue('super_madness' in data)
        self.assertEqual(len(data['scores']), 2)
        self.assertEqual(data['scores'][0], data['scores'][1])
        self.assertEqual(data['scores'][0], 1.0)
        self.assertEqual(data['scores'][1], 1.0)
