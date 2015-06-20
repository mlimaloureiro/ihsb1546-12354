#!/usr/bin/python
# -*- coding: utf-8 -*-

import simplejson

from django.core import serializers
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext, loader

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response
from hopeapp.models import Categories, Permissions, Attributes, \
    AttributeValue
from hopeapp.helpers.categories import *
from django.http import *

import math
import numpy


def maax(l):
    aux = l[0]
    j = 0
    for i in range(1, len(l)):
        if l[i] > aux:
            (aux, j) = (l[i], i)
    return (j, aux)


def minx(l):
    aux = l[0]
    j = 0
    for i in range(1, len(l)):
        if l[i] < aux:
            (aux, j) = (l[i], i)
    return (j, aux)


# nalt = num alternativas
# ncrit = num criterios
# orientacao explicado em baixo
# - 0 -> beneficio
# - 1 -> custo
# automaticamente poe a matriz toda em beneficio

def normalizaRazao(
    matriz,
    nalt,
    ncrit,
    orientacao,
    ):

    maximo = []
    minimo = []
    for crit in range(ncrit):
        (lixo, aux) = maax([matriz[i][crit] for i in range(nalt)])
        maximo.append(aux)
        (lixo, aux) = minx([matriz[i][crit] for i in range(nalt)])
        minimo.append(aux)

    matrizNormR = matriz
    for i in range(nalt):
        for crit in range(ncrit):
            if orientacao[crit] == 1:
                matrizNormR[i][crit] = matriz[i][crit] / (maximo[crit]*1.0)
            else:
                matrizNormR[i][crit] = minimo[crit] / (matriz[i][crit]*1.0)
    orient = [1 for crit in range(ncrit)]
    return (orient, matrizNormR)


def normalizaEuclideana(
    matriz,
    nalt,
    ncrit,
    orientacao,
    ):

    mediaQuadraticaColuna = []
    for crit in range(ncrit):
        aux = 0
        for alt in range(nalt):
            aux += matriz[alt][crit] * matriz[alt][crit]
        mediaQuadraticaColuna.append(math.sqrt(aux))

    matrizNormE = matriz
    for i in range(nalt):
        for crit in range(ncrit):
            matrizNormE[i][crit] = matriz[i][crit] \
                / mediaQuadraticaColuna[crit]
    return (orientacao, matrizNormE)


def PesagemSimples(data, weights):
    matriz = []

    for line in data:
        append_elem = [float(elem) for elem in line]
        matriz.append(append_elem)

    w = []
    orientacao = []
    
    for attr in weights:
        w.append(attr['value'])

        # cost = 00
        # benefit = 01
        if attr['type'] == 0:
            orientacao.append(0)
        else:
            orientacao.append(1)

    
    (nalt, ncrit) = (len(matriz), len(w))

    matrizPesada = numpy.zeros((nalt, ncrit)).tolist()
    ideal = numpy.zeros(ncrit).tolist()
    nadir = numpy.zeros(ncrit).tolist()
    indProx = []
    classificacao = []

    (orientacao, matrizNorm) = normalizaRazao(matriz, nalt, ncrit,
            orientacao)

    matrizEstudo = matrizNorm
    #print "MATRIZ NORM"
    #print matrizNorm

    for alt in range(nalt):
        for crit in range(ncrit):
            matrizPesada[alt][crit] = matrizEstudo[alt][crit] * w[crit]

    #print "MATRIZ PESADA"
    #print matrizPesada

    return matrizPesada, orientacao


def TOPSIS(data, weights):
    matriz = []

    for line in data:
        append_elem = [float(elem) for elem in line]
        matriz.append(append_elem)

    w = []
    orientacao = []
    
    for attr in weights:
        w.append(attr['value'])

        if attr['type'] == 0:
            orientacao.append(0)
        else:
            orientacao.append(1)

    
    (nalt, ncrit) = (len(matriz), len(w))

    matrizPesada = numpy.zeros((nalt, ncrit)).tolist()
    ideal = numpy.zeros(ncrit).tolist()
    nadir = numpy.zeros(ncrit).tolist()
    indProx = []
    classificacao = []

    (orientacao, matrizNorm) = normalizaEuclideana(matriz, nalt, ncrit,
            orientacao)

    matrizEstudo = matrizNorm

    for alt in range(nalt):
        for crit in range(ncrit):
            matrizPesada[alt][crit] = matrizEstudo[alt][crit] * w[crit]

    #-------------------------------------------------------------------------------
    # 2 - Determinacao dos pontos ideal e nadir (anti-ideal). Aqui as orientacoes contam. O ideal é constituido pelos melhores valores
    #   dos varios critério; o nadir pelos piores valores dos criterios. Portanto tanto o nadir como o ideal sao vectores cuja dimensao é o numero
    # de criterios.

    # 2a - Comeca por determinar o máximo e o mínimo valor de cada criterio
    for crit in range(ncrit):
        lixo, maxaux = maax([matrizPesada[i][crit] for i in range(nalt)])
        lixo, minaux = minx([matrizPesada[i][crit] for i in range(nalt)])

    # 2b - Determina os vectores ideal e nadir. O componente do ideal num criterio de beneficio é o máximo, num criterio de custo, o mínimo
    # Para o nadir passa-se o inverso (cuidado que o que vem a seguir está dentro do ciclo for)
        if orientacao[crit] == 1:
            ideal[crit] = maxaux
            nadir[crit] = minaux
        else:
            ideal[crit] = minaux
            nadir[crit] = maxaux

    #3 - Cada linha da matrizPesada é um vector com os valores da alternativa correspondente a essa linha nos diferentes critérios.
    #a) Trata-se agora de determinar a distancia (euclideana) desse vector ao nadir e a distancia ao ideal.
    for alt in range(nalt):
        distIdeal = distNadir = 0
        for crit in range(ncrit):
            aux = (matrizPesada[alt][crit] - ideal[crit])
            distIdeal += aux * aux
            aux = (matrizPesada[alt][crit] - nadir[crit])
            distNadir += aux * aux
        distIdeal = math.sqrt(distIdeal)
        distNadir = math.sqrt(distNadir)

        #b) e agora um indice de afastamento do ideal que é o indicador que vai permitir classificar as alternativas. Quanto maior melhor
        # Está no intervalo [0; 1].
        aux = distIdeal + distNadir
        if aux > 0:
            indProx.append([distNadir / aux, alt])
        else:
            indProx.append([0, alt])    # se a soma das duas distancias for nula, o nadir e o ideal coincidem
                                            #o que significa que todas as alternativas sao iguais
    
    #classificacao.append([indProx[0][1]])
    #i = 1
    #classAux = 0
    #while i < nalt:
    #    if indProx[i][0] == indProx[i-1][0]:
    #        classificacao[classAux].append(indProx[i][1])
    #    else:
    #        classAux += 1
    #        classificacao.append([indProx[i][1]])

    return indProx
