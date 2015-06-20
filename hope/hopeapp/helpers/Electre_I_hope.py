# -*- coding: cp1252 -*-
# -------------------- ELECTRE I   ----------------
# Comentado


import numpy, math, copy
import numpy as np
import Normalizacoes_Translaccao as norm
import ElectreLib as El

#Metodo Electre I começa aqui, com a matrizPesada que é obtida da matriz inicial depois de alguma das transformaçoes possiveis
# É também multiplicada a matriz das notas pelos pesos (mas isso é variante, pode nºao ser feita esta multiplicaçao -- ver Maystre)
# Se os limiares de concordancia, s1, ou de discordancia, s2, ao calculados pelas medias.
class ElectreI:
    def __init__(self, matrix={}, orientacao = {}, weights={}, s1=-1, s2=-1):
        self.err = (0, -1, -1)                          # codigo de erro -- 1o codigo, os dois outros são localizacao
        self.matrix = copy.deepcopy(matrix)             # copia da matriz fornecida
        self.nalt, self.ncrit = self.matrix.shape       # numero de alternativas, num de criterios
        self.orientacao = copy.deepcopy(orientacao)     # orientacoes: 0 se custo, 1 se beneficio
        self.weight = copy.deepcopy(weights)            # copia do vector de pesos
        self.amplv = {}                                 # vector de amplitudes dos criterios na matriz fornecida (e tb na matbenefit)
        self.limiarConcordancia = s1
        self.limiarDiscordancia = s2
        self.concmat = {}                               # matriz de concordancias
        self.discmat = np.zeros((self.nalt,self.nalt))  # matriz de discordancias
        self.matbenefit = {}                            # matriz de com todos os criterios em beneficio por complementacao
        self.bconcmat = np.zeros((self.nalt,self.nalt))  # matriz binaria de concordancias
        self.bdiscmat = np.zeros((self.nalt,self.nalt))  # matriz binaria de discordancias
        self.prevalencia = np.zeros((self.nalt,self.nalt))  # matriz de prevalencias        RESULTADO + IMPORTANTE
        self.classificacao = {}                          # vector com a classificacao final    RESULTADO IMPORTANTE

        self.err = self.teste(matrix, orientacao, weights)    # testa consistencia dos dados
        if self.err[0] != 0:
            return None
        self.err = (0, -1, -1)

        self.maxcrit = np.amax(self.matrix, axis = 0).tolist()
        self.mincrit = np.amin(self.matrix, axis = 0).tolist()
        self.amplv= np.subtract(self.maxcrit,self.mincrit).tolist()

        self.err, self.matbenefit = norm.benefit(self.matrix, self.orientacao, self.maxcrit)


#MATRIZES DE CONCORDANCIA e DE DISCORDANCIA
        self.concmat, self.concrit = El.concordancias(self.matbenefit, self.weight)

        discrit=np.zeros((self.nalt,self.nalt,self.ncrit))
        for a in range(self.nalt):
            for b in range(self.nalt):
                critmaxdif, difmax  = 0.0, 0.0
                for crit in range(self.ncrit):
                    discrit[a,b,crit] = self.matbenefit[a,crit]-self.matbenefit[b,crit]
                    if discrit[a,b,crit] < 0:
                        discrit[a,b,crit] = -discrit[a,b,crit]
                        if discrit[a,b,crit] > difmax:
                            difmax = discrit[a,b,crit]
                            critmaxdif = crit
                    else:
                        discrit[a,b,crit] = 0.0
#                aux = np.amax((discrit[a,b,:]))
                if difmax > 0:
                    self.discmat[a,b] = np.amax((discrit[a,b,:])) / self.amplv[critmaxdif]            # Posivel divisao por zero ? (Acho que não)
                else:
                    self.discmat[a,b] = 0.0

#4 - DETERMINACAO DAS RELACOES E SUBORDINACAO # a) S1 - limiar de concordancia; s2 - limiar de discordancia. estes valores podem ser fornecidos, mas deve ser, s1 >= 0.5; s2 <= 0.5
# b) Caso os imiares de con/discordancia sejam negativos, são calculados pela media, caso contrario ficam como foram dados..
        if self.limiarConcordancia < 0:
            self.limiarConcordancia = np.sum(self.concmat) / self.nalt / (self.nalt-1)

        if self.limiarDiscordancia < 0:
            self.limiarDiscordancia = np.sum(self.discmat) / self.nalt / (self.nalt-1)

#c) Determinacao das matrizes binarias de concordancia, de discordancia e de prevalencia
#      o elemento (i,j) da matriz binaria de concordancia (discordancia tem valor 1, se o indice de concordancia (discordancia) for >= s1
#(<= s2)
        for a in range(self.nalt):
            for b in range(self.nalt):
                if a != b:
                    if self.concmat[a,b] >= self.limiarConcordancia:
                        self.bconcmat[a,b] = 1
                    if self.discmat[a,b] <= self.limiarDiscordancia:
                        self.bdiscmat[a,b] = 1

#MATRIZ DE PREVALENCIA
# a casa (i,j) da matriz binaria de prevalencia é 1 se as casas (i,j) das matrizes bin concordancia e de discordancia forem AMBAS 1
        self.prevalencia = np.multiply(self.bconcmat,self.bdiscmat)

#5- CLASSIFICACAO FINAL
# a classificacoa da alternativa i é a diferenca entre as somas da linha i e da coluna i da matriz de prevalencia
        self.classificacao = np.subtract(np.sum(self.bconcmat, axis=1), np.sum(self.bdiscmat, axis=0))

        return None


    def teste(self, mat, orientacao, weights, s1=-1, s2=-1):
        nalt, ncrit = mat.shape

        if len(orientacao) != ncrit:
            return (1003, -1, -1)             # numero de orientacoes diferente do numero de criterios
        if len(weights) != ncrit:
            return (1003, -1, -1)             # numero de pesos diferente do numero de criterios
        if ncrit < 1:
            return (1003, -1, -1)             # menos de 1 criterio
        if nalt < 2:
            return (1003, -1, -1)             # menos de 2 alternativas
        if s1 != -1:
            if s1 < 0.5 or s1 > 1.0:
                return (1003, -1, -1)         # limiar de concordancia fora de [0, 1]
        if s2 != -1:
            if s1 < 0.0 or s1 > 1.0:
                return (1003, -1, -1)         # limiar de discordancia fora de [0, 1]

        return (0, -1, -1)