# -*- coding: cp1252 -*-
# -------------------- Normalizacoes, ponderacoes   ----------------
# Comentado

import numpy, math, copy
import numpy as np

INFINITESIMAL = 1.0e-12
MAXFLOAT = 1.0e12

def PonderaMat(matrix, weights):
    return np.multiply(matrix, weights)

def SumPond(orientacao, matrix, weights):
    nalt, ncrit = matrix.shape
    if nalt <= 1:
        return (1003, -1, -1), None         #menos de 2 alternativas
    if ncrit < 1:
        return (1003, -1, -1), None         #menos de 1 criterio
    if len(weights) != ncrit:
        return (1003, -1, -1), None         #numero de pesos diferente do numero de criterios
    if sum(weights) == ncrit:
        return (1003, -1, -1), None         #numero de pesos com soma nula
    if len(orientacao) != ncrit:
        return (1003, -1, -1), None         #numero de orientacoes diferente do numero de criterios

    mat = np.matrix(matrix, dtype = np.float)
    w   = np.matrix(weights)
    for crit in range(ncrit):
        if orientacao[crit] < 1:
            w[crit] = -w[crit]
    return (0, -1, -1), np.reshape(mat * w, (1,nalt)).tolist()


#coloca a matriz com todos os criterios em beneficio por complementacao
def benefit(matrix=None, orientacao=None, maxcrit=None):
    nalt, ncrit = matrix.shape
    if len(orientacao) != ncrit:
        return (1003,-1,-1), None                   # numero de orientacoes diferente do numero de criterios
    matbenefit=np.array(matrix, dtype=np.float64)
    for crit in range(ncrit):
        if orientacao[crit] == 0:
            for alt in range(nalt):
                matbenefit[alt,crit] = maxcrit[crit] - float(matrix[alt,crit])
    return (0,-1,-1), matbenefit


class NormTrans:
    def __init__(self, matrix={}, orientacao = {}, qj = None, pj = None, vj = None, s2=-1, k_1 = 10):
        self.matrix = np.array(matrix, dtype=np.float64)
        self.nalt, self.ncrit = matrix.shape
        self.maximoOrg = np.float64(np.amax(matrix, axis=0))
        self.minimoOrg = np.float64(np.amin(matrix, axis=0))
        self.maximo = np.array(self.maximoOrg, dtype = np.float64)
        self.minimo = np.array(self.minimoOrg, dtype = np.float64)
        self.orientacaoOrg = copy.deepcopy(orientacao)
        self.qjOrg = (np.array(qj))
        self.pjOrg = (np.array(pj))
        self.vjOrg = (np.array(vj))
        self.err = (0, -1, -1)             # Erro Geral, 0 = no error
        self.errUlt = (0, -1, -1)          # Erro da ultima cahamada, 0 = no error
        for crit in range(self.ncrit):
            if self.maximo[crit] - self.minimo[crit] > MAXFLOAT:
                self.err = (1003, crit, -1)   #criterio com amplitude exagerada
            if self.minimo[crit] <= 0.0:
                for a in range(nalt):
                    self.matrix[a,crit] -= self.minimo[crit] + INFINITESIMAL
                self.maximo[crit] -= self.minimo[crit] + INFINITESIMAL
            elif self.maximo[crit] == 0.0:
                self.err = (1003, crit, -1)   #criterio com todos os valores nulos
                for a in range(nalt):
                    self.matrix[a,crit] = INFINITESIMAL
                self.maximo[crit] = INFINITESIMAL


        # COLOCAR MAIS ERROS:
        # 1 - orientacao, maximo e minimo devem ter ncrit casas
        # 2 - self.matrix deve ter pelo menos duas alternativas (self.nalt >= 2)
        # 3 - self.matrix deve ter pelo menos um criterio (self.ncrit >= 1)
        # 4 - As dimensoes de qj, pj e vj devem ser ncrit  ------------
        # 5 - DEvemos ter qj[crit] < pj[crit] < vj[crit]   ------------ FAZER METODO QUE DA BOOLEAN
        # 6 - Os perfis constituem uma matriz de k_1 perfis por ncrit criterios ---------------- METODO VERIFICAR PERFIS
        # 7 - Convem k_1 >= 1                                                   ----------------

        return None


    def normalizaRazao(self):              # SO TUDO POSITIVO   Normalizacao de Razao
        orientacaoN = [1 for crit in range(self.ncrit)]
        matrixNormR = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            if self.orientacaoOrg[crit] > 0:
                for a in range(self.nalt):
                    matrixNormR[a,crit] = self.matrix[a,crit]/self.maximo[crit]
            else:
                for a in range(self.nalt):
                    matrixNormR[a,crit] = self.minimo[crit]/self.matrix[a,crit]
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormR, None, None, None


    def normalizaVE(self):
        matQuad = self.matrix * self.matrix
        sumQuad = np.sum(matQuad, axis=0)
        rMS = np.sqrt(sumQuad)
        orientacaoN = [1 for crit in range(self.ncrit)]
        matrixNormVE = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            if self.orientacaoOrg[crit] > 0:
                for a in range(self.nalt):
                    matrixNormVE[a,crit] = self.matrix[a,crit]/rMS[crit]
            else:
                for a in range(self.nalt):
                    matrixNormVE[a,crit] = 1.0 - self.matrix[a,crit]/rMS[crit]
        pNj = (self.pjOrg / rMS).tolist()
        qNj = (self.qjOrg / rMS).tolist()
        vNj = (self.vjOrg / rMS).tolist()
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormVE, qNj, pNj, vNj

    def normalizaWL(self):
        delta = self.maximo - self.minimo
        orientacaoN = [1 for crit in range(self.ncrit)]
        matrixNormWL = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            if delta[crit] == 0.0:
                self.errUlt = (1003, crit, -1)
                return None, None, None, None, None     # não admite self.maximo = self.minimo -- corresponde a criterios com todos os valores iguais
            if self.orientacaoOrg[crit] > 0:
                for a in range(self.nalt):
                    matrixNormWL[a,crit] = (self.matrix[a,crit] - self.minimo[crit]) / delta[crit]
            else:
                for a in range(self.nalt):
                    matrixNormWL[a,crit] = (self.maximo[crit] - self.matrix[a,crit]) / delta[crit]
        pNj = (self.pjOrg / delta).tolist()
        qNj = (self.qjOrg / delta).tolist()
        vNj = (self.vjOrg / delta).tolist()
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormWL, qNj, pNj, vNj


    def normalizaMau(self):
        delta = self.maximo - self.minimo
        orientacaoN = [0 for crit in range(self.ncrit)]
        matrixNormMau = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            if delta[crit] == 0.0:
                self.errUlt = (1003, crit, -1)
                return None, None, None, None, None      # não admite self.maximo = self.minimo -- corresponde a criterios com todos os valores iguais
            if self.orientacaoOrg[crit] > 0:
                for a in range(self.nalt):
                    matrixNormMau[a,crit] = (self.maximo[crit] - self.matrix[a,crit]) / delta[crit]
            else:
                for a in range(self.nalt):
                    matrixNormMau[a,crit] = (self.matrix[a,crit] - self.minimo[crit]) / delta[crit]
        pNj = (self.pjOrg / delta).tolist()
        qNj = (self.qjOrg / delta).tolist()
        vNj = (self.vjOrg / delta).tolist()
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormMau, qNj, pNj, vNj


    def normalizaJK(self):              # SO TUDO POSITIVO; se criterio de custo, a sua amplitude deve ser <= 1
        pNj = np.array(self.pjOrg)
        qNj = np.array(self.qjOrg)
        vNj = np.array(self.vjOrg)
        orientacaoN = [1 for crit in range(self.ncrit)]
        matrixNormJK = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            if self.orientacaoOrg[crit] > 0:
                absMax = math.fabs(self.maximo[crit])
                pNj[crit] /= absMax
                qNj[crit] /= absMax
                vNj[crit] /= absMax
                for a in range(self.nalt):
                    matrixNormJK[a,crit] = 1.0 - (self.maximo[crit] - self.matrix[a,crit]) / absMax
            else:
                absMin = math.fabs(self.minimo[crit])
                pNj[crit] /= absMin
                qNj[crit] /= absMin
                vNj[crit] /= absMin
                for a in range(self.nalt):
                    matrixNormJK[a,crit] = 1.0 - (self.matrix[a,crit] - self.minimo[crit]) / absMin
        pNj = pNj.tolist()
        qNj = qNj.tolist()
        vNj = vNj.tolist()
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormJK, qNj, pNj, vNj


    def normalizaNL(self):              # SO TUDO POSITIVO
        orientacaoN = [1 for crit in range(self.ncrit)]
        matrixNormNL = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            if self.orientacaoOrg[crit] > 0:
                for a in range(self.nalt):
                    aux = self.matrix[a,crit] / self.maximo[crit]
                    matrixNormNL[a,crit] = aux * aux
            else:
                for a in range(self.nalt):
                    aux = self.minimo[crit] / self.matrix[a,crit]
                    matrixNormNL[a,crit] = aux * aux
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormNL, None, None, None        #Nao tem conversao de limiares


    def normalizaLN(self):
        matlog = np.log(self.matrix)
        logprodcol = np.prod(self.matrix,axis=0)
        orientacaoN = [1 for crit in range(self.ncrit)]
        matrixNormLN = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            logprodcol[crit] = math.log(logprodcol[crit])
            if self.orientacaoOrg[crit] > 0:
                for a in range(self.nalt):
                    matrixNormLN[a,crit] = matlog[a,crit] / logprodcol[crit]
            else:
                for a in range(self.nalt):
                    matrixNormLN[a,crit] = (logprodcol[crit] - matlog[a,crit]) / ((logprodcol[crit]) * (self.nalt-1))
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormLN, None, None, None    #Nao tem conversao de limiares


    def normalizaN3(self):              # SO TUDO POSITIVO
        matrixNormN3 = np.zeros((self.nalt,self.ncrit))
        orientacaoN = [1 for crit in range(self.ncrit)]
        for crit in range(self.ncrit):
            if self.orientacaoOrg[crit] > 0:
                for a in range(self.nalt):
                    matrixNormN3[a,crit] = self.matrix[a,crit] / self.maximo[crit]
            else:
                for a in range(self.nalt):
                    matrixNormN3[a,crit] = 1.0 - self.matrix[a,crit] / self.maximo[crit]
        pNj = (self.pjOrg / self.maximo).tolist()
        qNj = (self.qjOrg / self.maximo).tolist()
        vNj = (self.vjOrg / self.maximo).tolist()
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormN3, qNj, pNj, vNj


    def normalizaN4(self):              # SO TUDO POSITIVO
        orientacaoN = copy.deepcopy(self.orientacaoOrg)
        sumCrit = np.sum(self.matrix, axis=0)
        matrixNormN4 = np.zeros((self.nalt,self.ncrit))       # MANTEM AS ORIENTACOES DOS CRITERIOS
        for crit in range(self.ncrit):
            for a in range(self.nalt):
                matrixNormN4[a,crit] = self.matrix[a,crit] / sumCrit[crit]
        pNj = (self.pjOrg / sumCrit).tolist()
        qNj = (self.qjOrg / sumCrit).tolist()
        vNj = (self.vjOrg / sumCrit).tolist()
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormN4, qNj, pNj, vNj


    def normalizaL1(self):                          # Se se usar a matriz original exige cada criterio com valores do mesmo sinal
        matAbs = np.fabs(self.matrix)               # Será também prevenir sumAbs[crit] == 0 com return abrupto
        sumAbs = np.sum(matAbs, axis=0)
        orientacaoN = copy.deepcopy(self.orientacaoOrg)       # MANTEM AS ORIENTACOES DOS CRITERIOS
        matrixNormL1 = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            for a in range(self.nalt):
                matrixNormL1[a,crit] = self.matrix[a,crit]/sumAbs[crit]
        pNj = (self.pjOrg / sumAbs).tolist()
        qNj = (self.qjOrg / sumAbs).tolist()
        vNj = (self.vjOrg / sumAbs).tolist()
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormL1, qNj, pNj, vNj


    def normalizaL2(self):              # SO TUDO POSITIVO
        matQuad = np.sqr(self.matrix)
        sumQuad = np.sum(matQuad, axis=0)
        rMS = np.sqrt(sumQuad)
        orientacaoN = copy.deepcopy(self.orientacaoOrg)       # MANTEM AS ORIENTACOES DOS CRITERIOS
        matrixNormL2 = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            for a in range(self.nalt):
                matrixNormL2[a,crit] = self.matrix[a,crit]/rMS[crit]
        pNj = (self.pjOrg / rMS).tolist()
        qNj = (self.qjOrg / rMS).tolist()
        vNj = (self.vjOrg / rMS).tolist()
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormL2, qNj, pNj, vNj


    def normalizaL1D(self):              # SO TUDO POSITIVO
        pNj = np.array(self.pjOrg)
        qNj = np.array(self.qjOrg)
        vNj = np.array(self.vjOrg)
        sumCrit = np.sum(self.matrix, axis=0)
        orientacaoN = [1 for crit in range(self.ncrit)]
        matrixNormL1D = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            den = sumCrit[crit] - (self.minimo[crit] * self.nalt)                     #NOTA: den >= 0
            if den == 0.0:
                self.errUlt = (0, crit, -1)
                return None, None, None, None, None, None      # cada critério não pode ter todos os valores iguais
            pNj[crit] /= den
            qNj[crit] /= den
            vNj[crit] /= den
            if self.orientacaoOrg[crit] > 0:
                for a in range(self.nalt):
                    matrixNormL1D[a,crit] = (self.matrix[a,crit] - self.minimo[crit])/den
            else:
                for a in range(self.nalt):
                    matrixNormL1D[a,crit] = (self.maximo[crit] - self.matrix[a,crit])/den
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormL1D, qNj, pNj, vNj


    def normalizaL2D(self):
        pNj = np.array(self.pjOrg)
        qNj = np.array(self.qjOrg)
        vNj = np.array(self.vjOrg)
        matQuad = self.matrix * self.matrix
        sumCritQuad = np.sum(matQuad, axis=0)
        sumCrit = np.sum(self.matrix, axis=0)
        orientacaoN = [1 for crit in range(self.ncrit)]
        matrixNormL2D = np.zeros((self.nalt,self.ncrit))
        for crit in range(self.ncrit):
            den = sumCritQuad[crit] - 2.0 * sumCrit[crit] * self.minimo[crit] + self.nalt * self.minimo[crit] * self.minimo[crit]
            den = math.sqrt(den)
            if den == 0.0:
                self.errUlt = (1003, crit, -1)
                return None, None, None, None, None      # criterio com todos os valores iguais
            pNj[crit] /= den
            qNj[crit] /= den
            vNj[crit] /= den
            if self.orientacaoOrg[crit] > 0:
                for a in range(self.nalt):
                    matrixNormL2D[a,crit] = (self.matrix[a,crit] - self.minimo[crit])/den
            else:
                for a in range(self.nalt):
                    matrixNormL2D[a,crit] = (self.maximo[crit] - self.matrix[a,crit])/den
        self.errUlt = (0, -1, -1)
        return orientacaoN, matrixNormL2D, qNj, pNj, vNj
