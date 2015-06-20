#!/usr/bin/python
# -*- coding: utf-8 -*-

import csv
import simplejson
from django.http import HttpResponse
from hopeapp.models import Categories
from hopeapp.helpers.categories import *
from hopeapp.helpers.decision_support import *
from django.http import *
from hopeapp.responses.common_json import *
from django.views.decorators.csrf import csrf_exempt

from hopeapp.services.category.category_service import *
from hopeapp.services.category.dependencies.formatter import *
from hopeapp.services.category.repository.django_repository import *

# category repository dependency
cat_repository = CategoryDjangoORMRepository()


@csrf_exempt
def export_csv(request, ident):
    cat_id = ident

    data = cat_repository.get_all_occurrences(cat_id)

    attributes = data["attrs"]
    occurrences = data["occurrences"]
    success = data["success"]

    if success:
        # build CSV file
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="occurrences.csv"'
        writer = csv.writer(response)

        # Enabled header
        csv_enabled_header = [1 for i in range(len(attributes)+1)]
        writer.writerow(csv_enabled_header)

        # Attribute identification/class
        csv_id_attr = ["id"]
        for i in range(len(attributes)):
            csv_id_attr.append("class")
        writer.writerow(csv_id_attr)

        # Bullshit
        # User
        writer.writerow(["user" for i in range(len(attributes)+1)])
        # Cenas 
        writer.writerow(["cenas" for i in range(len(attributes)+1)])
        # User
        writer.writerow(["user" for i in range(len(attributes)+1)])
        # Default
        writer.writerow(["default" for i in range(len(attributes)+1)])
        
        # Orientation
        csv_orientation_header = [0]
        for attr in attributes:
            if attr["type"] == "cost":
                csv_orientation_header.append(0)
            else:
                csv_orientation_header.append(1)

        writer.writerow(csv_orientation_header)

        # Separator
        writer.writerow(["#" for i in range(len(attributes)+1)])

        # Matrix header
        csv_header = ['Occurrence_id']

        for attr in attributes:
            csv_header.append(attr['name'].encode('utf8'))

        writer.writerow(csv_header)

        for occ in occurrences:
            row = [occ['id']]
            for attr in attributes:
                if attr['id'] != "followers":
                    a = AttributeValue.objects.get(occurrence_id=occ['id'], attribute_id=attr['id'])
                    row.append(a.value)
            row.append(occ['vote_counter'])
            writer.writerow(row)

        return response
    else:
        return HttpResponse(DOES_NOT_EXIST, content_type='json')


def decision(request, ident):
    """
        decision(request, ident)
        -------------------
        Description:        Returns decision support results for a 
                            set of occurrences
        Url:                /hope/support/{id}
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            - Create a view to handle diferent algorithms
            - Return dict {"occ_id":value}

        FLOW:
            1. prepare response data structures
            2. find all attributes
            3. create data structure with attributes values
            4. use helper algorithms to create results
            5. return occurrences ids with scores
    """

    if request.method == 'POST':
        result = {}
        weights = simplejson.loads(request.POST.get('attrs'))
        occ_ids = simplejson.loads(request.POST.get('occ_ids'))
        # print "input occs:"
        # print occ_ids

        category = Categories.objects.get(id=ident)
        parent = Categories.objects.get(id=category.parent_id)

        attrs = category.attributes_set.filter(visible=1)
        attrs_parent = parent.attributes_set.filter(visible=1)

        occurrs = []
        for occ_id in occ_ids:
            get_occ = Occurrences.objects.filter(
                id__exact=occ_id, validated=1)[0]
            occurrs.append(get_occ)

        # print "fetch occs:"
        # print [occurr.id for occurr in occurrs]

        scores = []

        lines = {}

        # MADNESS
        output_attrs = []
        output_occurrs = []

        for occ in occurrs:
            lines[occ.title] = []
            attributes = \
                occ.attributevalue_set.filter(attribute__in=attrs)
            for attr in attributes:
                lines[occ.title].append(attr.value)

            p_attributes = \
                occ.attributevalue_set.filter(attribute__in=attrs_parent)
            for attr in p_attributes:
                lines[occ.title].append(attr.value)

            if occ.vote_counter > 0:
                lines[occ.title].append(occ.vote_counter)
            else:
                lines[occ.title].append(1)

            output_occurrs.append({'id': occ.id, 'title': occ.title})
            output_attrs.append(lines[occ.title])

        # lines and columns created

        T_madness, orientacao = PesagemSimples(output_attrs, weights)
        SUPER_madness = TOPSIS(output_attrs, weights)
        # TODO

        # use helper T algorithms
        # return occurrences with scores

        scores = [sum(elem) for elem in T_madness]

        #result['occ_ids'] = occ_ids
        result['success'] = True
        #result['lines'] = lines
        result['madness'] = T_madness
        result['output_attrs'] = output_attrs
        result['scores'] = scores
        result['super_madness'] = SUPER_madness
        #result['orientacao'] = orientacao
        #result['weights'] = weights
        ###result['matriz'] = mm

        return HttpResponse(simplejson.dumps(result), content_type='json')
    else:
        return HttpResponse(INVALID_REQUEST, content_type='json')
