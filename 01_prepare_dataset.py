import json
import random

SYSTEM_PROMPT = (
    "Tu convertis du tunisien écrit en latin arabe (Arabizi) vers l'arabe tunisien"
    " en script arabe. Réponds uniquement avec la version en script arabe."
)

random.seed(42)

with open("data/dataset.jsonl") as f:
    raw = [json.loads(line) for line in f]

random.shuffle(raw)

n = len(raw)
n_test = int(n * 0.10)
n_val = int(n * 0.10)
n_train = n - n_test - n_val

splits = {
    "train": raw[:n_train],
    "val": raw[n_train : n_train + n_val],
    "test": raw[n_train + n_val :],
}

for split_name, examples in splits.items():
    with open(f"data/{split_name}.jsonl", "w") as f:
        for ex in examples:
            record = {
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": ex["input"]},
                    {"role": "assistant", "content": ex["output"]},
                ]
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

print(f"train: {n_train} | val: {n_val} | test: {n_test}")
