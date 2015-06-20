# -*- coding: cp1252 -*-
# -------------------- ELECTRE IV Maystre   ----------------
# Comentado


import numpy, math, copy
import numpy as np
import Normalizacoes_Translaccao as norm
import ElectreLib as El

#Metodo Electre I começa aqui, com a matrizPesada que é obtida da matriz inicial depois de alguma das transformaçoes possiveis
# É também multiplicada a matriz das notas pelos pesos (mas isso é variante, pode nºao ser feita esta multiplicaçao -- ver Maystre)
# Se os limiares de concordancia, s1, ou de discordancia, s2, ao calculados pelas medias.
# se algum dos cq, cc, cp e cv for None, não é usado. NOTA: NAO É USADA A SUB-DOMINANCIA
class ElectreIV:
    def __init__(self, matrix=None, orientacao = None, qj=None, pj=None, vj=None, yIntercept = 0.3, slope = -0.15, cq=1.0, cc=0.8, cp=0.6, cv=0.35):
        self.matrix = np.array(matrix, np.float64)             # copia da matriz fornecida
        self.nalt, self.ncrit = self.matrix.shape              # numero de alternativas, num de criterios
        self.orientacao = np.array(orientacao).tolist()        # orientacoes: 0 se custo, 1 se beneficio
        self.credibilidades = [cq, cc, cp, cv, 0.0]            # copia do vector de credibilidades
        self.qj = np.array(qj, np.float64).tolist()            # copia do vector de limiares de indiferenca
        self.pj = np.array(pj, np.float64).tolist()            # copia do vector de limiares de prevalencia
        self.vj = np.array(vj, np.float64).tolist()            # copia do vector de limiares de veto

        self.amplv = None                                      # vector de amplitudes dos criterios na matriz fornecida (e tb na matbenefit)
        self.classificacao = None
        self.matbenefit = np.zeros((self.nalt,self.ncrit))                            # matriz com os criterios todos em beneficio
        self.delta = np.zeros((self.nalt, self.nalt))     # matriz de credibilidade difusa
        self.classeDesc = {}                            # dicionário resultante da destilacao descendente
        self.classeAsc = {}                             # dicionário resultante da destilacao ascendente
        self.f = []                                     # interseccao das destilacoes
        self.maxcrit = None        # vector coms as notas máximos dos criterios
        self.matbenefit = None

        self.err = self.teste(self.matrix, orientacao, qj, pj, vj)    # testa consistencia dos dados
        if self.err[0] != 0:
            return None
        self.err = (0, -1, -1)

#Metodo Electre IV começa aqui, com a matrizTrabalho que é obtida da matriz inicial depois de alguma das transformaçoes possiveis
# É também multiplicada a matriz das notas pelos pesos (mas isso é variante, pode nºao ser feita esta multiplicaçao -- ver Maystre)

#Determina, para cada critério(coluna) o máximo e o minimo valor, e a amplitude (diferenca entre os dois)
        self.maxcrit = np.amax(self.matrix, axis = 0).tolist()

#CALCULO DAS matrizes de concordancia e de discordancia, PARA CADA CRITERIO (crit) ENTRE OS VÀRIOS PARES DE ALTERNATIVAS
#1 - Comeca por po-los iguais ás diferencas, para cada criterio, entre os valores da alternativa i e j.
# a) Coloca todos os critérios a maximizar, complementando os valores nas várias alternativas ao máximo (se o critério for a minimizar)

        self.err, self.matbenefit = norm.benefit(self.matrix, self.orientacao, self.maxcrit)
        

# 3 - Calculo da matriz de credibilidade (difusa), delta. Esta matriz é tb quadrada, nalt X nalt
# cria a matriz e poe-na na forma de lista (sai do numpy)
        for a in range(self.nalt):
            for b in range(self.nalt):       #  calculo de  lC[a,b]:
                if a != b:
                    if not (self.credibilidades[0] is None) and El.fSq(a, b, self.ncrit, qj, pj, vj, self.matbenefit):
                        self.delta[a,b] = self.credibilidades[0]
                    elif not (self.credibilidades[1] is None) and El.fSc(a, b, self.ncrit, qj, pj, vj, self.matbenefit):
                        self.delta[a,b] = self.credibilidades[1]
                    elif not (self.credibilidades[2] is None) and El.fSp(a, b, self.ncrit, qj, pj, vj, self.matbenefit):
                        self.delta[a,b] = self.credibilidades[2]
                    elif not (self.credibilidades[3] is None) and El.fSv(a, b, self.ncrit, qj, pj, vj, self.matbenefit):
                        self.delta[a,b] = self.credibilidades[3]
                    else:
                        self.delta[a,b] = 0.0
# 4 -- Destilacoes
# Criacao do set vazio, e de dois sets , com as alternativas, um para a destilacao ascendente e o outro para a descendente
        vazio = frozenset([])
        Bdesc = set(range(self.nalt))
        Basc = set(range(self.nalt))

# Usa-se também dois dicionarios. cada value é um set de alternativas. O indice será kdesc. Em kdesc==1 estao as "melhores"
# alternativas na deslilacao descendente e assim sucessivamente
# classeAsc é similar, o indice é kasc e diz respeito à destilacao ascendente
# a) Destilacao descendente
        kdesc = 1
        self.classeDesc={}
        while len(Bdesc) > 0:
            D = Bdesc | vazio                           # copia o que resta de B para a lista auxiliar D
            lambd = El.lambdInicial(self.delta, D)  # valor inicial de lambd
            while (len(D) > 1) and (lambd > 0):
                lambd = El.nivelSeparacao(D, self.delta, lambd, yIntercept, slope)  # nivel de separacao
                q = [[El.qualLambd(a, lambd, D, self.delta, yIntercept, slope),a] for a in D]       #q e uma lista que indica a qualificacao de nivel lambda de cada alternativa de D
                qmax = max([q[i][0] for i in range(len(q))])                      # determina o maior valor em q
#Deixa em D somente as alternativas correspondentes a qmax
                D = set([])
                for i in range(len(q)):
                    if q[i][0] == qmax:
                        D = D | set([q[i][1]])
            self.classeDesc[kdesc] = D | vazio
            Bdesc = Bdesc - D           # retira de self.Bdesc as alternativa já destiladas (as que estao em D)
            kdesc +=1

# b) Destilacao ascendente
        kasc = 1
        self.classeAsc={}
        while len(Basc) > 0:
            D = Basc | vazio                           # copia o que resta de B para a lista auxiliar D
            lambd = El.lambdInicial(self.delta, D)  # valor inicial de lambd
            while (len(D) > 1) and (lambd > 0.0):
                lambd = El.nivelSeparacao(D, self.delta, lambd, yIntercept, slope)  # nivel de separacao
                q = [[El.qualLambd(a, lambd, D, self.delta, yIntercept, slope),a] for a in D]                          #q e uma lista que indica a qualificacao de nivel lambda de cada alternativa de D
                qmin = min([q[i][0] for i in range(len(q))])                       # determina o menor valor em q
#Deixa em D somente as alternativas correspondentes a qmin
                D = set([])
                for i in range(len(q)):
                    if q[i][0] == qmin:
                        D = D | set([q[i][1]])
            self.classeAsc[kasc] = D | vazio
            Basc = Basc - D     # retira de Basc as alternativa já destiladas (as que estao em D)
            kasc +=1
            
# Inverte ordem do resultado da destilacoa ascendente, de forma à pior ficar no fim:
            j = len(self.classeAsc)
            for i in range(1, j / 2 + 1, 1):
                aux = self.classeAsc[i]
                self.classeAsc[i] = self.classeAsc[j]
                self.classeAsc[j] = aux
                j -= 1            

# c) Filtra os resultados das duas destilacoes de forma a eliminar eventuais elementos vazios
#    Os novos dicionarios ficam com indices 1, 2, 3, etc.
        for key in self.classeDesc.keys():
            if len(self.classeDesc[key]) == 0:
                del self.classeDesc[key]
        keys = self.classeDesc.keys()
        keys.sort()
        lst = [self.classeDesc[key] for key in keys]
        kdesc = 0
        self.classeDesc = {}
        for key in range(len(lst)):
            kdesc += 1
            self.classeDesc[kdesc] = lst[key] | vazio

        for key in self.classeAsc.keys():
            if len(self.classeAsc[key]) == 0:
                del self.classeAsc[key]
        keys = list(self.classeAsc)
        keys.sort()
        lst = [self.classeAsc[key] for key in keys]
        kasc = 0
        self.classeAsc = {}
        for key in range(len(lst)):
            kasc += 1
            self.classeAsc[kasc] = lst[key] | vazio


# NOTA:
# Tanto os grafos das ordenacoes totais resultantes das destilacoes podem obter-se imediatamente. Por exemplo de classeDesc:
#  classeDesc[1] --> classeDesc[2] --> classeDesc[3] --> ...
# 5 - SINTESE - Interseccao das destilacoes
# a) Criacao da lista de interseccoes, f[k]  (talvez seja melhor usar-se aqui uma lista de listas e nao um dicionario)
        self.f = []
        for i in self.classeDesc.keys():
            for j in self.classeAsc.keys():
                setAux = self.classeDesc[i] & self.classeAsc[j]
                if len(setAux) > 0:
                    self.f.append([i+j, [i,j], setAux])

#b) ordena a lista pelas somas crescentes
            self.f.sort(key = lambda tripleto: tripleto[0])

# c) Amplia as listas com as ordens dos elementos subordinados

        for k in range(len(self.f)):
            for m in range(k+1,len(self.f)):
                if self.f[k][1][0] >= self.f[m][1][0] and self.f[k][1][1] >= self.f[m][1][1]:
                    self.f[m].append(k)
                elif self.f[k][1][0] <= self.f[m][1][0] and self.f[k][1][1] <= self.f[m][1][1]:
                    self.f[k].append(m)

        return None
#  FIM Agora é só construir o grafo


    def teste(self, mat, orientacao, qj, pj, vj):
        nalt, ncrit = mat.shape

        if len(orientacao) != ncrit:
            return (1003, -1, -1)             # numero de orientacoes diferente do numero de criterios
        if ncrit < 1:
            return (1003, -1, -1)             # menos de 1 criterio
        if nalt < 2:
            return (1003, -1, -1)             # menos de 2 alternativas
        lenp = len(pj)
        lenq = len(qj)
        lenv = len(vj)
        if lenq != ncrit or lenp != ncrit or lenv != ncrit:
            return  (1003, -1, -1)             # vector de limiar com tamanho incorrecto

        return (0, -1, -1)