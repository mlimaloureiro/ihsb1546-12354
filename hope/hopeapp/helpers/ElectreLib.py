# -*- coding: cp1252 -*-
# -------------------- ELECTRE Library   ----------------
# Comentado

import numpy, math, copy
import numpy as np


#Metodos especificos do Electre III
#IMPORTADOR DE MATRIZES DE FICH TEXTO ---  TESTE
def importmat(namemat = "matrixElectreI.txt", delimiter = ','):
    return np.loadtxt(namemat, delimiter)


#Funcoes importantes nos Electre III ou IV

#Funcao (recta descendente) limiar de discriminacao
def s(lamb,yIntercept, slope):
    return float(yIntercept + slope * lamb)

def lambdInicial(delta, B):
    lambd= 0.0
    for a in B:
        for b in B:
            if a != b:
                if (delta[a,b] > lambd):
                    lambd = delta[a,b]
    return lambd

#A alternativa a subordina (ou nao) a alternativa b se na matriz delta (ver abaixo) os elementos (a,b) e (b,a)
#cumprirem (ou nao) a expressao lógica abaixo.
def subordina(a, b, lambd, delta, yIntercept, slope):                   # preferencia nitida
    if (a != b) and (delta[a,b] > lambd ) and (delta[a,b] - delta[b,a] > s(delta[a,b], yIntercept, slope)):
        return True
    return False

def potLambd(a, lambd, D, delta,yIntercept, slope):         # potencia de nivel lambda
    aux=0
    for b in D:
        if (a != b) and subordina(a, b, lambd, delta, yIntercept, slope):
            aux += 1
    return aux

def fraqLambd(a, lambd, D, delta, yIntercept, slope):         # fraqueza de nivel lambda
    aux=0
    for b in D:
        if (a != b) and subordina(b, a, lambd, delta, yIntercept, slope):
            aux += 1
    return aux

def qualLambd(a, lambd, D, delta, yIntercept, slope):         # qualificacao de nivel lambda
    return potLambd(a, lambd, D, delta, yIntercept, slope) - fraqLambd(a, lambd, D, delta, yIntercept, slope)

def nivelSeparacao(D, delta, lambd, yIntercept, slope):         # nivel de separacao de ordem lambda
    aux = []
    for a in D:
        for b in D:
            if (a != b):
                if (delta[a,b] < lambd - s(lambd, yIntercept, slope)):
                    aux.append(delta[a,b])
    if len(aux) == 0:
        return 0.0
    return max(aux)


# E L E C T R E    I
#CALCULO DOS INDICES DE DISCORDANCIA E DA CONCORDANCIA, PARA CADA CRITERIO (crit) ENTRE OS VARIOS
#PARES DE ALTERNATIVAS PRESSOPOE TODOS OS CRITERIOS EM BENEFICIO
def concordancias(matrix=None, weights = None):
    nalt, ncrit = matrix.shape
    concrit=np.zeros((ncrit,nalt,nalt))
    concm=np.zeros((nalt,nalt))
#1 - Comeca por po-los iguais ás diferencas, para cada criterio, entre os valores da alternativas a e b.
    for a in range(nalt):
        for b in range(nalt):
            for crit in range(ncrit):
                if a != b:
                    concrit[crit,a,b] = matrix[a,crit]-matrix[b,crit]


#2 - Calcula a matrizes de concordancia para o par (a,b) de alternativas:
#b) O valor da casa (a,b) da matriz de concordancoa é igual à soma dos pesos dos critérios em que a concorda com b. Esse valor fica em concm[a,b]
    sumweightsaux = np.sum(weights)
    for a in range(nalt):
        for b in range(nalt):
            if a!=b:
                for crit in range(ncrit):
                    if concrit[crit,a,b] >= 0.0:
                        concrit[crit,a,b] = 1.0
                    else:
                        concrit[crit,a,b] = 0.0
                concm[a,b] = np.sum(np.multiply(concrit[ : ,a,b], weights)) / sumweightsaux
    return concm, concrit


# ELECTRE III  e  ELECTRE TRI

#Calcula a matriz de credibilidades sendo dadas:
#    a mesma matriz [alnernativas, criterios] duas vezes  (Electre III)
#    uma matriz [alternativas/perfis, criterios], e outra de [perfis/alternativas, criterios]  (Electre TRI)
#    ou entao uma matriz [perfis, criterios]  duas vezes (para o caso do teste aos perfis)     (Electre TRI)
# PRESSUPOE TODOS OS CRITERIOS EM BENEFICIO

def concordancia(matA=None, matB=None, weight= None, qj=None, pj=None, vj=None):
    nA, ncrit = matA.shape
    nB, ncrit1 = matB.shape

    if ncrit != ncrit1:
        return None, None

    concrit = np.ones((ncrit,nA,nB))    # matrizes de concordancias, critério a critério
    discrit = np.zeros((ncrit,nA,nB))   # matrizes de discordancia, critério a critério
    concmat = np.zeros((nA,nB))         # matriz de concordancias

    for crit in range(ncrit):
        for a in range(nA):
            for b in range(nB):
#Concordancia Cj(a,b)
                concrit[crit,a,b] = matA[a,crit] - matB[b,crit] + pj[crit]
                if matA[a,crit] + qj[crit] >= matB[b,crit]:                   # caso o lim indiferenca seja maior que o de preferencia, o lim indiferenca nao produz efeito
                    concrit[crit,a,b] = 1.0
                elif matA[a,crit] + pj[crit] < matB[b,crit]:
                    concrit[crit,a,b] = 0.0
                else:
                    concrit[crit,a,b] /= (pj[crit] - qj[crit])
#Concordancia Cj(a,b)
                discrit[crit,a,b] = matA[a,crit] - matB[b,crit] + pj[crit]
                if  matA[a,crit] + vj[crit] < matB[b,crit]:                   # caso o lim veto seja menor que o de preferencia, o lim veto nao produz efeito
                    discrit[crit,a,b] = 1.0
                elif  matA[a,crit] + pj[crit] >= matB[b,crit]:
                    discrit[crit,a,b] = 0.0
                else:
                    discrit[crit,a,b] /= (pj[crit] - vj[crit])

# b) - Calcula a matriz, concmat.  C(a,b),  de indices globais de concordancia.
#
    for a in range(nA):
        for b in range(nB):
            concmat[a,b] = np.sum(np.multiply(concrit[:,a,b],weight))
    concmat = concmat / np.sum(weight)

    return concmat, discrit


#--------------------------------------------------------------------------------------
#FUNCOES ELECTRE IV

#Metodos especificos do Electre IV Maystre
# A funcao fMi esta relacionada com a relacao Minj e indica para quantos criterios a Minj b é verdade
#A relacao a Minj b é verdade se a e b forem indiferentes quanto ao critério j, mas o valor de a em j for superior ao de b
# Pressupoe todos os critérios transformados em beneficio
def fMi(a, b, ncrit, q, p, v, matrix):
    aux = 0
    for j in range(ncrit):
        dif = matrix[a,j] - matrix[b,j]
        if dif > 0 and dif <= q[j]:
            aux += 1
    return aux

# A funcao fMq esta relacionada com a relacao Qj e indica para quantos criterios a Qjb,
# ou seja para quantos criterios a é fracamente preferivel a b
# Pressupoe todos os critérios transformados em beneficio
def fMq(a, b, ncrit, q, p, v, matrix):
    aux = 0
    for j in range(ncrit):
        dif = matrix[a,j] - matrix[b,j]
        if dif > q[j] and dif <= p[j]:
            aux += 1
    return aux

# A funcao fMp esta relacionada com a relacao Pj e indica para quantos criterios alt1 Pj alt2 é verdade
# # ou seja para quantos criterios a é estritamente preferivel a b
# Pressupoe todos os critérios transformados em beneficio
def fMp(a, b, ncrit, q, p, v, matrix):
    aux = 0
    for j in range(ncrit):
        dif = matrix[a,j] - matrix[b,j]
        if dif > p[j]:
            aux += 1
    return aux

#Retorna True se a relacao (a Sq b) for verdadeira (Quasi dominancia)
#(assume beneficio em todos os criterios)
def fSq(a, b, ncrit, q, p, v, matrix):              #Quasi-dominancia
    aux = 1 + fMi(a, b, ncrit, q, p, v, matrix) + fMq(a, b, ncrit, q, p, v, matrix) + fMp(a, b, ncrit, q, p, v, matrix)
    return (fMp(b, a, ncrit, q, p, v, matrix) + fMq(b, a, ncrit, q, p, v, matrix) == 0) and \
           (fMi(b, a, ncrit, q, p, v, matrix) <= aux)


#Retorna True se a relacao (a Sc b) for verdadeira (Dominancia Canónica)
#(assume beneficio em todos os criterios)
def fSc(a, b, ncrit, q, p, v, matrix):              #Dominancia Canónica
    miab = fMi(a, b, ncrit, q, p, v, matrix)
    miba = fMi(b, a, ncrit, q, p, v, matrix)
    mqab = fMq(a, b, ncrit, q, p, v, matrix)
    mqba = fMq(b, a, ncrit, q, p, v, matrix)
    mpab = fMp(a, b, ncrit, q, p, v, matrix)
    mpba = fMp(b, a, ncrit, q, p, v, matrix)
    aux = 1 + miab + mqab + mpab

    return (mpba == 0) and (mqba <= mpab) and (mqba + miba <= aux)


#Retorna True se a relacao (a Sp b) for verdadeira (pseudo dominancia)
#(assume beneficio em todos os criterios)
def fSp(a, b, ncrit, q, p, v, matrix):              #Pseudo Dominancia
    return (fMp(b, a,ncrit, q, p, v, matrix) == 0) and \
           (fMq(b, a,ncrit, q, p, v, matrix) <= fMq(a, b,ncrit, q, p, v, matrix) + fMp(a, b,ncrit, q, p, v, matrix))


#RetornaTrue se a relacao (a Sv b) for verdadeira (assume beneficio em todos os criterios)
def fSv(a, b, ncrit, q, p, v, matrix):                  #Veto Dominancia
    if (fMp(b, a, ncrit, q, p, v, matrix) == 0):
        return True
    if (fMq(b, a, ncrit, q, p, v, matrix) == 1) and (fMp(a, b, ncrit, q, p, v, matrix) >= ncrit / 2.0):
        for j in range(ncrit):
            if matrix[b,j] - matrix[a,j] > v[j]:
                return False
        return True
    return False


# ELECTRE TRI

# Calculo da matriz de credibilidade, delta.
#
def credibilidade(matA=None, matB=None, weight= None, qj=None, pj=None, vj=None):                # Tambem serve para ELECTRE III
    nA, ncrit = matA.shape
    nB, ncrit1 = matB.shape

    delta = np.zeros((nA,nB))

    if ncrit != ncrit1:
        return None

    concmat, discrit = concordancia(matA, matB, weight, qj, pj, vj)  # matriz de concordancias
    if (concmat is None):
        return None

    for a in range(nA):
        for b in range(nB):       #  calculo de  lC[a,b]:
            aux = concmat[a,b]
            if aux >= 1.0:
                aux = 1.0
            else:
                for crit in range(ncrit):
                    if (discrit[crit,a,b] > concmat[a,b]):
                        aux *= (1.0 - discrit[crit,a,b]) / (1.0 - concmat[a,b])
            delta[a,b] = aux         # b) calcula as matrizes de concordancia, Cj(a,b), e de discordancia, Dj(a,b), para cada criterio em que b varre os perfis
    return delta, concmat

