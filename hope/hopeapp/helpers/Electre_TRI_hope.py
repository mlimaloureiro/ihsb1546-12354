# -*- coding: cp1252 -*-
# -------------------- ELECTRE TRI   ----------------
# Comentado


import numpy, math, copy
import numpy as np
import Normalizacoes_Translaccao as norm
import ElectreLib as El

#Metodo Electre TRI começa aqui.
# NOTA: SO SAO DADOS k-1 PERFIS DE REFERENCIA. O PERFIL DE ZEROS NAO E DADO NEM O PERFIL SUPERIOR
# O No de criterios é o mesmo quer para os perfis quer para as alternativas
class ElectreTRI:
    def __init__(self, matrix=None, orientacao = None, matRef=None, weights=None, qj=None, pj=None, vj=None, lambd=0.75):
        self.matrix = np.array(matrix, np.float64)         # copia da matriz fornecida
        self.nalt, self.ncrit = self.matrix.shape       # numero de alternativas, num de criterios
        self.matRef = np.array(matRef, np.float64)         # copia da matriz fornecida
        self.nK_1, self.ncrit = self.matRef.shape       # numero de alternativas de referencia, tirando a "superior" e a de "zeros"
        self.nK = self.nK_1 + 1                         # número de classes
        self.orientacao = np.array(orientacao).tolist()        # orientacoes: 0 se custo, 1 se beneficio
        self.weight = np.array(weights, np.float64).tolist()            # copia do vector de pesos
        self.qj = np.array(qj, np.float64).tolist()                      # copia do vector de limiares de indiferenca
        self.pj = np.array(pj, np.float64).tolist()                       # copia do vector de limiares de prevalencia
        self.vj = np.array(vj, np.float64).tolist()                  # copia do vector de limiares de veto
        self.lambd = lambd + 0.0
# 1) - Testa a ver se dados consistentes:

        self.err = self.teste(self.matrix, self.matRef, self.weight, self.qj, self.pj, self.vj, self.lambd)
        if self.err[0] != 0:
                    return None

        self.matbenefit = np.zeros((self.nalt,self.ncrit))                            # matriz com os criterios todos em beneficio
        self.matRefbenefit = np.zeros((self.nK_1,self.ncrit))                            # matriz de referencia com os criterios todos em beneficio
        self.deltaAB = np.zeros((self.nalt, self.nalt,self.nK_1))     # matriz de credibilidade difusa (em relacao aos perfis de referencia)
        self.deltaBA = np.zeros((self.nalt, self.nK_1, self.nalt))     # matriz de credibilidade difusa (em relacao as alternativasa)
        self.classeOpt = {}                             # dicionário com a classificacao optimista
        self.classePes = {}
        self.interseccaoClasses = {}                    # matriz (em forma de dicionario de sets) de interseccao das classes Opt e Pess
        self.err = (0, -1, -1)

        self.maxcrit = np.amax(self.matrix, axis = 0).tolist()        # vector coms as notas máximos dos criterios


        self.err, self.matbenefit = norm.benefit(self.matrix, self.orientacao, self.maxcrit)
        if self.err[0] != 0:
            return None
        self.err, self.matRefbenefit = norm.benefit(self.matRef, self.orientacao, self.maxcrit)      # define matrizes com tudo em beneficio
        if self.err[0] != 0:
            return None

        self.deltaBB, aux = El.credibilidade(self.matRefbenefit, self.matRefbenefit, self.weight, self.qj, self.pj, self.vj)

        self.err = self.testaPerfis()
        if self.err[0] != 0:
            return None

        self.deltaAB, aux = El.credibilidade(self.matbenefit, self.matRefbenefit, self.weight, self.qj, self.pj, self.vj)
        self.deltaBA, aux = El.credibilidade(self.matRefbenefit, self.matbenefit, self.weight, self.qj, self.pj, self.vj)


# Pessimistic Segmentation:
# a) poe vazias as nK classes, tanto da segmentacao pessimista como optimista
        for k in range(1, self.nK+1, 1):
            self.classeOpt[k] = set([])
            self.classePes[k] = set([])

# b) Segmentacoes Pessimista e Optimista
        for a in range(self.nalt):
# Pessimista
            k = self.nK_1-1
            while k >= 0 and self.deltaAB[a,k] < self.lambd:
                k -= 1
            self.classePes[k+2] = self.classePes[k+2] | set([a])

#Optimista
            k = 0
            while k < self.nK_1 and self.compare(k,a,self.deltaBA, self.deltaAB) != "Best":
                k += 1
            self.classeOpt[k+1] = self.classeOpt[k+1] | set([a])

# c) "Matriz (em forma de dicionario) de interseccao das classes"

        for i in range(self.nK):
            for j in range(self.nK):
                self.interseccaoClasses[i+1,j+1] = self.classeOpt[i+1] & self.classePes[j+1]

        return None


    def compare(self,a,b,deltaAB, deltaBA):
        if deltaAB[a,b] >= self.lambd:
            if deltaBA[b,a] >= self.lambd:
                return "Indiference"
            return "Best"
        else:
            if deltaBA[b,a] >= self.lambd:
                return "Worst"
            return "Equivalent"

    def teste(self, mat, matperfis, weight, qj, pj, vj, lambd):
        nalt, ncrit = mat.shape
        nK_1, ncrit1 = matperfis.shape

        if not (lambd >= 0.5 and lambd <= 1):
            return 1003, -1, -1             # lambd fora do intervalo [0.5, 1]
        if ncrit != ncrit1:
            return 1003, -1, -1             # perffis com numero de criterios diferente do das alternativas
        if ncrit < 1 or ncrit1 < 1:
            return 1003, -1, -1             # menos de 1 criterio
        if nalt < 2:
                    return 1003, -1, -1             # menos de 2 alternativas
        lenp = len(pj)
        lenq = len(qj)
        lenv = len(vj)
        if lenq != ncrit or lenp != ncrit or lenv != ncrit:
            return 1003, -1, -1             # vector de limiar com tamanho incorrecto

        return (0, -1, -1)


    def testaPerfis(self):
        if self.nK_1 == 1:
            return (0, -1, -1)                      # so um perfil

        for k in range(self.nK_1):
            for k1 in range(self.nK_1):
                if k != k1:
                    if self.deltaBB[k,k1] < self.lambd and self.deltaBB[k1,k] < self.lambd:
                        return (1003, k+1, k1+1)                                # perfis (k+1 e k1+1) equivalentes


        for k in range(self.nK_1-1):
            if self.compare(k+1,k,self.deltaBB, self.deltaBB) != "Best":
                return (1003, k+1, k+2)                                          # perfil (k+2) nao é >> que perfil (k+1)
        return (0, -1, -1)

