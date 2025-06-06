# Come si calcola l'IMU

Il calcolo dell’IMU si basa su tre elementi fondamentali:

1. **Rendita catastale rivalutata**
2. **Moltiplicatore catastale (coefficiente)**
3. **Aliquota comunale**

---

## 1. Rendita catastale rivalutata

La rendita catastale viene rivalutata del **5%**:

rendita_rivalutata = rendita_catastale × 1,05

---

## 2. Moltiplicatore catastale

Ogni categoria catastale ha un **coefficiente di moltiplicazione**.  
Il valore ottenuto dalla rendita rivalutata va moltiplicato per il coefficiente.

| Categoria       | Moltiplicatore |
|----------------|----------------|
| A (escluse A/10) | 160           |
| A/10           | 80             |
| B              | 140            |
| C/1            | 55             |
| C/2, C/6, C/7  | 160            |
| C/3–C/5        | 140            |
| D/1–D/9        | 65             |
| D/5            | 80             |
| D/10 (rurali)  | 40             |
| E              | 80             |

Formula:

base_imponibile = rendita_rivalutata × moltiplicatore

---

## 3. Aliquota comunale

L’aliquota viene stabilita dal Comune nella propria delibera IMU annuale.  
È espressa in percentuale (es. 0,86%).

Formula finale:

IMU = base_imponibile × aliquota / 100

---

## ✅ Esempio di calcolo

- Categoria: A/2  
- Rendita catastale: €630  
- Aliquota: 0,86%

1. Rivalutazione: `630 × 1,05 = 661,50`  
2. Moltiplicatore: `661,50 × 160 = 105840`  
3. IMU: `105840 × 0,0086 = €910,22`

---

## Considerazioni aggiuntive

- L’importo IMU va **diviso per quota di possesso e mesi di proprietà**.
- Per l’abitazione principale **non di lusso**, l’IMU **non si applica**.
- Alcune **pertinenze** possono seguire il regime agevolato (vedi file `condizioni-uso.md`).

---




