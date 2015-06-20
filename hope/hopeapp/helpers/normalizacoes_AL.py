# -*- coding: cp1252 -*-
# -------------------- Normalizacoes, ponderacoes   ----------------
# Comentado

import numpy, math, copy
import numpy as np


def ponderaMat(matrix, weights):
    return np.multiply(matrix, weights)

#coloca a matriz com todos os criterios em beneficio por complementacao
def benefit(matrix=None, orientacao=None, maxcrit=None):
    nalt, ncrit = matrix.shape
    matbenefit=np.array(matrix, dtype=np.float64)
    for crit in range(ncrit):
        if orientacao[crit] == 0:
            for alt in range(nalt):
                matbenefit[alt,crit] = maxcrit[crit] - matrix[alt,crit]
    return matbenefit


def normalizaRazao(matrix = None, orientacao  = None, qj = None, pj = None, vj = None ):
    nalt, ncrit = matrix.shape
    maximo = np.float64(np.amax(matrix, axis=0))
    minimo = np.float64(np.amin(matrix, axis=0) * 1.0)
    orientacaoN = [1 for crit in range(ncrit)]
    matrixNormR = np.zeros((nalt,ncrit), dtyppe=float64)
    for crit in range(ncrit):
        if orientacao[crit] > 0:
            if maximo[crit] == 0.0:
                return None, None, None, None, None, 1003, crit, -1
            for a in range(nalt):
                matrixNormR[a,crit] = matrix[a,crit]/maximo[crit]
        else:
            for a in range(nalt):
                if matrix[a,crit] == 0.0:
                    return None, None, None, None, None, 1003, crit, a
                matrixNormR[a,crit] = minimo[crit]/matrix[a,crit]
    return orientacaoN, matrixNormR, None, None, None, 0, -1, -1


def normalizaVE(matrix, orientacao):
    nalt, ncrit = matrix.shape
    matQuad = matrix * np.float64(matrix)
    sumQuad = np.sum(matQuad, axis=0, dtype=np.float64)
    rMS = np.sqrt(sumQuad)
    orientacaoN = [1 for crit in range(ncrit)]
    matrixNormVE = np.zeros((nalt,ncrit), dtype=np.float64)
    for a in range(nalt):
        for crit in range(ncrit):
            if rMS[crit] == 0.0:
                return None, None, None, None, None, 1003, crit, -1
            if orientacao[crit] > 0:
                matrixNormVE[a,crit] = matrix[a,crit]/rMS[crit]
            else:
                matrixNormVE[a,crit] = 1.0 - matrix[a,crit]/rMS[crit]
    pNj = (np.array(pj) / rMS).tolist()
    qNj = (np.array(qj) / rMS).tolist()
    vNj = (np.array(vj) / rMS).tolist()
    return orientacaoN, matrixNormVE, qNj, pNj, vNj, 0, -1, -1

def normalizaWL(matrix, orientacao):
    nalt, ncrit = matrix.shape
    maximo = np.float64(np.amax(matrix, axis=0))
    minimo = np.float64(np.amin(matrix, axis=0))
    delta = maximo - minimo
    orientacaoN = [1 for crit in range(ncrit)]
    matrixNormWL = np.zeros((nalt,ncrit), dtype=np.float64)
    for crit in range(ncrit):
        for a in range(nalt):
        
            if delta[crit] == 0.0:
                return None, None, None, None, None, 1003, crit, -1
            if orientacao[crit] > 0:
                matrixNormWL[a,crit] = (matrix[a,crit] - minimo[crit]) / delta[crit]
            else:
                matrixNormWL[a,crit] = (maximo[crit] - matrix[a,crit]) / delta[crit]
    pNj = (np.array(pj) / delta).tolist()
    qNj = (np.array(qj) / delta).tolist()
    vNj = (np.array(vj) / delta).tolist()
    return orientacaoN, matrixNormWL, qNj, pNj, vNj, 0, -1, -1

def normalizaMau(matrix, orientacao):
    nalt, ncrit = matrix.shape
    maximo = np.float64(np.amax(matrix, axis=0))
    minimo = np.float64(np.amin(matrix, axis=0))
    delta = maximo - minimo
    orientacaoN = [0 for crit in range(ncrit)]
    matrixNormMau = np.zeros((nalt,ncrit), dtype=np.float64)
    for crit in range(ncrit):
        if delta[crit] == 0.0:
            return None, None, None, None, None, 1003, crit, -1
        if orientacao[crit] > 0:
            delta[crit] = -delta[crit]
        for a in range(nalt):
            if orientacao[crit] > 0:
                matrixNormMau[a,crit] = (matrix[a,crit] - maximo[crit]) / delta[crit]
            else:
                matrixNormMau[a,crit] = (matrix[a,crit] - minimo[crit]) / delta[crit]
    pNj = (np.array(pj) / delta).tolist()
    qNj = (np.array(qj) / delta).tolist()
    vNj = (np.array(vj) / delta).tolist()
    return orientacaoN, matrixNormMau, qNj, pNj, vNj, 0, -1, -1

def normalizaJK(matrix, orientacao):
    nalt, ncrit = matrix.shape
    maximo = np.float64(np.amax(matrix, axis=0))
    minimo = np.float64(np.amin(matrix, axis=0))
    pNj = np.array(pj)
    qNj = np.array(qj)
    vNj = np.array(vj)
    orientacaoN = [1 for crit in range(ncrit)]
    matrixNormJK = np.zeros((nalt,ncrit), dtype=np.float64)
    for crit in range(ncrit):
        if orientacao[crit] > 0:
            if maximo[crit] == 0.0:
                return None, None, None, None, None, 1003, crit, -1
            pNj /= maximo[crit]
            qNj /= maximo[crit]
            vNj /= maximo[crit]
            for a in range(nalt):
                matrixNormJK[a,crit] = 1.0 - math.fabs((maximo[crit] - matrix[a,crit]) / maximo[crit])
        else:
            if minimo[crit] == 0.0:
                return None, None, None, None, None, 1003, crit, -1
            pNj /= minimo[crit]
            qNj /= minimo[crit]
            vNj /= minimo[crit]        
            for a in range(nalt):
                matrixNormJK[a,crit] = 1-0 - math.fabs((minimo[crit] - matrix[a,crit]) / minimo[crit])
    pNj = pNj.tolist()
    qNj = qNj.tolist()
    vNj = vNj.tolist()    
    return orientacaoN, matrixNormJK, qNj, pNj, vNj, 0, -1, -1


def normalizaNL(matrix, orientacao):
    nalt, ncrit = matrix.shape
    maximo = np.float64(np.amax(matrix, axis=0))
    minimo = np.float64(np.amin(matrix, axis=0))
    orientacaoN = [1 for crit in range(ncrit)]
    matrixNormNL = np.zeros((nalt,ncrit))
    for crit in range(ncrit):
        if orientacao[crit] > 0:
            if maximo[crit] == 0.0:
                return None, None, None, None, None, 1003, crit, -1
            for a in range(nalt):
                matrixNormNL[a,crit] = ((matrix[a,crit]) / maximo[crit]) * ((matrix[a,crit]) / maximo[crit])
        else:
            for a in range(nalt):
                if matrix[a,crit] == 0.0:
                    return None, None, None, None, None, 1003, crit, a
                matrixNormNL[a,crit] = (minimo[crit] / (matrix[a,crit])) * (minimo[crit] / (matrix[a,crit]))
    return orientacaoN, matrixNormNL, None, None, None, 0, -1, -1


def normalizaLN(matrix, orientacao):
    nalt, ncrit = matrix.shape
    matlog = np.zeros((nalt,ncrit))
    logprodcol = np.prod(matrix,axis=0, dtype = np.float64)
    orientacaoN = [1 for crit in range(ncrit)]
    matrixNormLN = np.zeros((nalt,ncrit), dtype=np.float64)
    for crit in range(ncrit):
        if logprodcol[crit] <= 0.0:
            return None, None, None, None, None, 1003, crit, -1
        logprodcol[crit] = math.log(logprodcol[crit])
        if orientacao[crit] > 0:
            for a in range(nalt):
                if matrix[a,crit] <= 0.:
                    return None, None, None, None, None, 1003, crit, a
                matlog[a,crit] = math.log(matlog[a,crit])
                matrixNormLN[a,crit] = matlog[a,crit] / logprodcol[crit]
        else:
            if (logprodcol[crit] <= 0.0) or (nalt <= 1):
                return None, None, None, None, None, 1003, crit, -1
            for a in range(nalt):
                if matrix[a,crit] <= 0.:
                    return None, None, None, None, None, 1003, crit, a
                matlog[a,crit] = math.log(matlog[a,crit])
                matrixNormLN[a,crit] = (logprodcol[crit] - matlog[a,crit]) / ((logprodcol[crit]) * (nalt-1))
    return orientacaoN, matrixNormLN, None, None, None, 0, -1, -1


def normalizaN3(matrix, orientacao):
    nalt, ncrit = matrix.shape
    maximo = np.float64(np.amax(matrix, axis=0))
    matrixNormN3 = np.zeros((nalt,ncrit), dtype=np.float64)
    for crit in range(ncrit):
        if maximo[crit] == 0.0:
            return None, None, None, None, None, 1003, crit, -1
        for a in range(nalt):
            if orientacao[crit] > 0:
                matrixNormN3[a,crit] = matrix[a,crit] / maximo[crit]
            else:
                matrixNormN3[a,crit] = 1.0 - matrix[a,crit] / maximo[crit]
    orientacaoN = [1 for crit in range(ncrit)]
    pNj = (np.array(pj) / maximo).tolist()
    qNj = (np.array(qj) / maximo).tolist()
    vNj = (np.array(vj) / maximo).tolist()
    return orientacaoN, matrixNormJK, qNj, pNj, vNj, 0, -1, -1

def normalizaN4(matrix, orientacao):
    nalt, ncrit = matrix.shape
    sumCrit = np.sum(matrix, axis=0, dtype=np.float64)
    orientacaoN = copy.deepcopy(orientacao)
    matrixNormN4 = np.zeros((nalt,ncrit), dtype=np.float64)
    for crit in range(ncrit):
        if sumCrit[crit] == 0.0:
            return None, None, None, None, None, 1003, crit, -1
        for a in range(nalt):
            matrixNormN4[a,crit] = (matrix[a,crit]*1.0) / sumCrit[crit]
    pNj = (np.array(pj) / sumCrit).tolist()
    qNj = (np.array(qj) / sumCrit).tolist()
    vNj = (np.array(vj) / sumCrit).tolist()    
    return orientacaoN, matrixNormN4, qNj, pNj, vNj, 0, -1, -1


def normalizaL1(matrix, orientacao):
    nalt, ncrit = matrix.shape
    matAbs = np.float64(np.fabs(matrix))
    sumAbs = np.sum(matAbs, axis=0)
    matrixNormL1 = np.zeros((nalt,ncrit), dtype=np.float64)
    for a in range(nalt):
        for crit in range(ncrit):
            if orientacao[crit] > 0:
                if sumAbs[crit] == 0:
                    matrixNormL1[a,crit] = 0
                elif matrixNormL1[a,crit] >= 0.0:
                    matrixNormL1[a,crit] = matrix[a,crit]/sumAbs[crit]
                else:
                    matrixNormL1[a,crit] = 1.0 + matrix[a,crit]/sumAbs[crit]
            else:
                if sumAbs[crit] == 0:
                    matrixNormL1[a,crit] = 1
                elif matrixNormL1[a,crit] >= 0.0:
                    matrixNormL1[a,crit] = 1.0 - matrix[a,crit]/sumAbs[crit]
                else:
                    matrixNormL1[a,crit] = - matrix[a,crit]/sumAbs[crit]
    orientacaoN = [1 for crit in range(ncrit)]
    return orientacaoN, matrixNormL1

def normalizaL2(matrix, orientacao):
    nalt, ncrit = matrix.shape
    sumQuad = np.float64(np.sum(matrix * 1.0, axis=0, dtype=np.float64))
    sumQuad = sumQuad * sumQuad
    rMS = np.sqrt(sumQuad)
    orientacaoN = [1 for crit in range(ncrit)]
    matrixNormL2 = np.zeros((nalt,ncrit), dtype=np.float64)
    for a in range(nalt):
        for crit in range(ncrit):
            if orientacao[crit] > 0:
                if sumQuad[crit] == 0:
                    matrixNormL2[a,crit] = 0
                elif matrixNormL2[a,crit] >= 0.0:
                    matrixNormL2[a,crit] = matrix[a,crit]/rMSs[crit]
                else:
                    matrixNormL2[a,crit] = 1.0 + matrix[a,crit]/rMS[crit]
            else:
                if sumQuad[crit] == 0:
                    matrixNormL2[a,crit] = 1
                elif matrixNormL2[a,crit] >= 0.0:
                    matrixNormL2[a,crit] = 1.0 - matrix[a,crit]/rMS[crit]
                else:
                    matrixNormL2[a,crit] = - matrix[a,crit]/rMS[crit]
    return orientacaoN, matrixNormL2


def normalizaL2D(matrix, orientacao):
    nalt, ncrit = matrix.shape
    maximo = np.float64(np.amax(matrix, axis=0))
    minimo = np.float64(np.amin(matrix, axis=0))
    sumCrit = np.sum(matrix, axis=0, dtype=np.float64)
    delta = sumCrit - minimo
    matrixNormL1D = np.zeros((nalt,ncrit), dtype=np.float64)
    for a in range(nalt):
        for crit in range(ncrit):
            if sumCrit[crit] == 0:
                matrixNormL1D[a,crit] = 0
            elif orientacao[crit] > 0:
                matrixNormL1D[a,crit] = (matrix[a,crit] - minimo[crit])/delta[crit]
            else:
                matrixNormL2D[a,crit] = (maximo[crit] - matrix[a,crit])/delta[crit]
    return orientacaoN, matrixNormL2D


def normalizaL2D(matrix, orientacao):
    nalt, ncrit = matrix.shape
    maximo = np.float64(np.amax(matrix, axis=0))
    minimo = np.float64(np.amin(matrix, axis=0))
    sumCrit = np.sum(matrix, axis=0, dtype=np.float64)
    aux = (sumCrit - minimo) * (sumCrit - minimo)
    rMS = np.sqrt(aux)
    matrixNormL2D = np.zeros((nalt,ncrit), dtype=np.float64)
    for a in range(nalt):
        for crit in range(ncrit):
            if sumCrit[crit] == 0:
                matrixNormL2D[a,crit] = 0
            elif orientacao[crit] > 0:
                matrixNormL2D[a,crit] = (matrix[a,crit] - minimo[crit])/rMS[crit]
            else:
                matrixNormL2D[a,crit] = (maximo[crit] - matrix[a,crit])/rMS[crit]
    return orientacaoN, matrixNormL2D


