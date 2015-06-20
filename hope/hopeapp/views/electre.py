#!/usr/bin/python
# -*- coding: utf-8 -*-

from json import dumps, loads, JSONEncoder, JSONDecoder
from django.http import HttpResponse

from hopeapp.helpers.electre import *
from hopeapp.responses.common_json import *
from django.conf import settings
import pickle
from django.views.decorators.csrf import csrf_exempt

class PythonObjectEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

@csrf_exempt
def electre(request, ident):
	if request.method == "POST":
		result = {}
		
		options = {}

		postData = loads(request.POST['data'])
		
		# Post Data
		data = postData['data']
		matrix = postData['matrix']

		# Matrix
		matrix_data = matrix['data']
		columns = matrix['columns']
		activeRows = matrix['activeRows']
		
		# Matrix Ref
		if 'alternatives' in data:
			matRef = data['alternatives']
		else:
			matRef = []

		if 'pesos' in data:
			weights = data['pesos']

		o = data['sentidos']
		
		qj = [float(num) for num in data['lai']]
		pj = [float(num) for num in data['lap']]
		vj = [float(num) for num in data['lav']]

		options['matrix_data'] = matrix_data
		options['columns'] = columns
		options['activeRows'] = activeRows
		options['matRef'] = matRef
		options['o'] = o
		options['weights'] = weights
		options['qj'] = qj
		options['pj'] = pj
		options['vj'] = vj

		matrix_transform, matRef_transform, qj, pj, vj, o, weights = transform_matrix(matrix_data, matRef, columns, qj, pj, vj, o, weights)

		options['matrix_transform'] = matrix_transform
		if len(matRef) > 0:
			options['matRef_transform'] = matRef_transform
		if len(weights) > 0:
			options['weights'] = weights

		names = [elem[0] for elem in matrix_data]
		options['names'] = names

		if ident == "1":
			result = electre_i(options)
		elif ident == "3":
			result = electre_iii(options)
		elif ident == "4":
			result = electre_iv(options)
		elif ident == "33":
			result = electre_tri(options)
		else:
			result = INVALID_REQUEST

		result['success'] = True
		return HttpResponse(dumps(result, cls=PythonObjectEncoder), content_type="json")
	else:
		return HttpResponse(INVALID_REQUEST, content_type="json")

