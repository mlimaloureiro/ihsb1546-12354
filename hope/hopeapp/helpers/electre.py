#!/usr/bin/python
# -*- coding: utf-8 -*-
import numpy as np
from hopeapp.helpers import Electre_TRI_hope as ElTRI
from hopeapp.helpers import Electre_III_hope as ElIII
from hopeapp.helpers import Electre_IV_hope as ElIV
import hopeapp.helpers.Normalizacoes_Translaccao as norm

import copy

def transform_matrix(m, matRef, columns, qj, pj, vj, o, weights):
	m_transform = copy.deepcopy(m)

	if len(matRef) > 0:
		matRef_transform = copy.deepcopy(matRef)
	else:
		matRef_transform = []

	for idx, col in enumerate(columns):
		add = False
		use = int(col[0])
		classification = int(col[len(col)-2])
		if use is 1 and classification is 1:
			add = True

		if not add:
			qj.pop(idx)
			pj.pop(idx)
			vj.pop(idx)
			o.pop(idx)
			if len(weights) > 0:
				weights.pop(idx)
			for c in m_transform:
				c.pop(idx)
			if len(matRef) > 0:
				for col in matRef_transform:
					col.pop(idx)

	return m_transform, matRef_transform, qj, pj, vj, o, weights

def build_response(options):
	# Classe Opt
	result = []

	classeAlpha = options['classes'][0]
	classeBeta = options['classes'][1]
	names = options['names']
	output_names = options['output_names']

	response = dict()
	response["data"] = dict()
	response["type"] = options['type']
	response["data"]["alternatives"] = list()
	response["data"]["classes"] = classeAlpha.keys()
	response["data"]["name"] = output_names[0]

	for k, v in classeAlpha.items():
		for idx in v:
			to_append = {"class": k, "name": names[idx]}
			response["data"]["alternatives"].append(to_append)

	result.append(response)

	# Class Pes
	response = dict()
	response["data"] = dict()
	response["type"] = "classview"
	response["data"]["alternatives"] = list()
	response["data"]["classes"] = classeBeta.keys()
	response["data"]["name"] = output_names[1]

	for k, v in classeBeta.items():
		for idx in v:
			to_append = {"class": k, "name": names[idx]}
			response["data"]["alternatives"].append(to_append)

	result.append(response)
	return result

def build_graph_response(options):
	result = []

	names = options['names']
	output_name = options['output_name']
	prevalencia = options['prevalencia']

	response = dict()
	response["data"] = dict()
	response["type"] = "graph"
	response["data"]["altNames"] = names
	response["data"]["data"] = []

	result.append(response)
	return result


def electre_i(options):
	result = {}
	
	m = options['matrix_transform']
	weights = options['weights']
	o = options['o']
	names = options['names']

	limiarfalso = [0 for j in range(6)]
	nObj = norm.NormTrans(m, o, limiarfalso, limiarfalso, limiarfalso)
	o1, m1, aux, aux, aux =  nObj.normalizaRazao()

	m2 = m1 * weights

	x = ElI.ElectreI(m2, o1, weights, s1=-1, s2=-1,)
	
	result['names'] = names
	result['err'] = x.err
	result['prevalencia'] = x.prevalencia
	result['classificacao'] = x.classificacao

	args = {}
	args["output_name"] = "9.1: ELECTRE I - Outranking graph/ELECTRE I - Grafo final"

	response = build_graph_response(args)
	return result


def electre_tri(options):	
	result = {}

	m = options['matrix_transform']
	o = options['o']
	matRef = options['matRef_transform']
	weights = options['weights']
	qj = options['qj']
	pj = options['pj']
	vj = options['vj']
	names = options['names']

	result['names'] = names

	x = ElTRI.ElectreTRI(m, o, matRef, weights, qj, pj, vj)

	result["err"] = x.err
	result["qj"] = qj
	result["pj"] = pj
	result["vj"] = vj
	result["classeOpt"] = x.classeOpt
	result["classePes"] = x.classePes

	# Response transformed
	result["response"] = list()

	args = {}
	args['type'] = "classview"
	args['object'] = x
	args['classes'] = [x.classeOpt, x.classePes]
	args['names'] = names
	args['output_names'] = ["11.2: ELECTRE TRI - optimistic rule allocation/ELECTRE Tri - afectação optimista", "11.1: ELECTRE TRI - pessimistic rule allocation/ELECTRE Tri - afectação pessimista"]
	
	response = build_response(args)

	result['response'] = response

	return result


def electre_iii(options):
	result = {}

	m = options['matrix_transform']
	o = options['o']
	weights = options['weights']
	qj = options['qj']
	pj = options['pj']
	vj = options['vj']
	names = options['names']

	result['names'] = names

	x = ElIII.ElectreIII(m, o, weights, qj, pj, vj)

	result["err"] = x.err
	result["qj"] = qj
	result["pj"] = pj
	result["vj"] = vj
	result["classeDesc"] = x.classeDesc
	result["classeAsc"] = x.classeAsc

	# Response transformed
	result["response"] = list()

	args = {}
	args['type'] = "classview"
	args['classes'] = [x.classeAsc, x.classeDesc]
	args['names'] = names
	args['output_names'] = ["10.2: Ascending distillation/Destilação ascendente", "10.3: Descending distillation/Destilação descendente"]
	
	response = build_response(args)

	result["response"] = response
	result['success'] = True	

	return result

def electre_iv(options):
	result = {}

	m = options['matrix_transform']
	o = options['o']
	qj = options['qj']
	pj = options['pj']
	vj = options['vj']
	names = options['names']

	result['names'] = names

	x = ElIV.ElectreIV(m, o, qj, pj, vj)

	result["err"] = x.err
	result["qj"] = qj
	result["pj"] = pj
	result["vj"] = vj
	result["classeDesc"] = x.classeDesc
	result["classeAsc"] = x.classeAsc

	# Response transformed
	result["response"] = list()

	args = {}
	args['type'] = "classview"
	args['classes'] = [x.classeAsc, x.classeDesc]
	args['names'] = names
	args['output_names'] = ["12.2: Ascending distillation/Destilação ascendente", "12.2: Ascending distillation/Destilação ascendente"]
	
	response = build_response(args)

	result["response"] = response
	result['success'] = True

	return result

