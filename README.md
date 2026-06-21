# arabzi2tounsi

Fine-tuning d'un petit LLM pour translittérer le tunisien écrit en Arabizi (latin) vers le script arabe.

**Exemple**
```
sbeh el khir  →  صباح الخير
nheb nrou7    →  نحب نروح
ma n9addarch  →  ما نقدرش
```

---

## Objectif pédagogique

Ce projet est un tutoriel complet de fine-tuning SFT (Supervised Fine-Tuning) avec LoRA sur un cas concret et simple. Il couvre :

- Construction d'un dataset au format chat
- Fine-tuning avec LoRA via PEFT + TRL
- Évaluation quantitative (CER) et qualitative

---

## Stack

| Composant | Choix |
|-----------|-------|
| Modèle de base | `HuggingFaceTB/SmolLM2-360M-Instruct` |
| Fine-tuning | LoRA (`r=8`, `alpha=16`) via PEFT |
| Trainer | `SFTTrainer` (TRL) |
| GPU | Google Colab T4 |

---

## Dataset

791 paires Arabizi → arabe tunisien oral, construites manuellement.
Couvre : salutations, verbes conjugués, négations, questions, famille, émotions, vie quotidienne.

Format :
```json
{"input": "kifeh 7alek", "output": "كيفاش حالك"}
```

---

## Architecture

```mermaid
flowchart TD

    subgraph D["① Données"]
        DS[("dataset.jsonl\n791 exemples")] --> PREP["01_prepare_dataset.py\nseed=42"]
        PREP --> TR["train.jsonl\n633 ex. — 80%"]
        PREP --> VA["val.jsonl\n79 ex. — 10%"]
        PREP --> TE["test.jsonl\n79 ex. — 10%"]
    end

    subgraph F["② Format chat — SFTTrainer applique le template"]
        SYS["system\nTu convertis l'Arabizi vers l'arabe tunisien..."]
        USR["user\nsbeh el khir"]
        AST["assistant\nscript arabe — loss calculée ici seulement"]
        SYS --> USR --> AST
    end

    subgraph L["③ LoRA — principe par couche d'attention"]
        X(["x — input"]) --> W["W · x\ngele — 1 048 576 params"]
        X                --> A["A  1024 x 8\nentrainable"]
        A                --> B["B  8 x 1024\nentrainable"]
        B                --> SC["x alpha/r\n16/8 = 2"]
        W  --> SUM{"+"}
        SC --> SUM
        SUM --> OUT(["sortie = W·x + B·A·x·2"])
    end

    subgraph M["④ SmolLM2-360M — architecture"]
        EMB["Token Embedding — gele"]
        subgraph BLK["Transformer Block x 24"]
            subgraph ATN["Multi-Head Attention — LoRA injecte ici"]
                QP["q_proj gele + LoRA entrainable"]
                KP["k_proj gele + LoRA entrainable"]
                VP["v_proj gele + LoRA entrainable"]
                OP["o_proj gele + LoRA entrainable"]
            end
            FFN["Feed-Forward Network — gele"]
            ATN --> FFN
        end
        LMH["LM Head — gele"]
        EMB --> BLK --> LMH
    end

    subgraph C["⑤ SFTConfig"]
        P1["num_train_epochs: 3"]
        P2["per_device_train_batch_size: 4"]
        P3["learning_rate: 2e-4"]
        P4["max_length: 128"]
        P5["fp16: True"]
        P6["LoRA — r: 8  alpha: 16\ntarget: q k v o _proj"]
    end

    subgraph R["⑥ Resultats"]
        SV["output/final/\nadaptateur LoRA — 16K params\nsur 360M total"]
        EV["CER base : 2.72  →  CER ft : 0.26\nExact match : 0/135  →  14/135"]
        SV --> EV
    end

    TR        -->|"exemples d'entrainement"| F
    F         -->|"sequences tokenisees"| M
    L         -.->|"injecte x24"| ATN
    C         -->|"hyperparametres"| M
    VA        -->|"eval loss / epoch"| M
    M         --> SV
```

Points clés :
- **Gele** : les 360M poids du modèle de base ne sont pas modifiés
- **Entrainable** : seulement les matrices A et B de LoRA (~16K params)
- La loss est calculée uniquement sur les tokens `assistant`, pas sur le system ni le user
- L'adaptateur sauvegardé est indépendant du modèle de base

---

## Résultats

Métrique : **CER** (Character Error Rate) — 0 = parfait, 1+ = mauvais.

| Modèle | CER moyen | Exact match |
|--------|-----------|-------------|
| Base (sans fine-tuning) | 2.72 | 0 / 135 |
| Fine-tuné (3 epochs, LoRA) | 0.26 | 14 / 135 |

Le modèle de base recrache l'Arabizi ou hallucine. Le modèle fine-tuné produit systématiquement du script arabe, avec des erreurs résiduelles sur les caractères proches (خ/ك, ن/ع).

---

## Reproduire

**Prérequis** : Python 3.13+, `uv`

```bash
# 1. Installer les dépendances
uv sync

# 2. Préparer les splits (train / val / test)
uv run python 01_prepare_dataset.py

# 3. Fine-tuning (recommandé sur GPU)
uv run python 02_train.py

# 4. Évaluation base vs fine-tuné
uv run python 03_evaluate.py
```

Sur **Google Colab** (GPU T4 gratuit) : ouvrir `colab_run.ipynb` et suivre les cellules dans l'ordre.

---

## Limites et pistes d'amélioration

- 791 exemples → CER 0.26 : encore trop élevé pour un usage réel
- Augmenter le dataset à ~3000 exemples serait le levier principal
- La tâche est simple mais le modèle confond encore des caractères proches (خ/ك, ن/ع)
- Prochaine étape possible : explorer DPO si on veut affiner les préférences de sortie
