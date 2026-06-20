import json
import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = "HuggingFaceTB/SmolLM2-360M-Instruct"
ADAPTER_PATH = "output/final"

with open("data/test.jsonl") as f:
    test_data = [json.loads(line) for line in f]

device = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)


def generate(model, messages):
    # On retire le message assistant pour ne garder que system + user
    prompt = tokenizer.apply_chat_template(
        messages[:-1], tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=32,
            do_sample=False,  # greedy : sortie déterministe
        )
    generated_ids = output[0][inputs["input_ids"].shape[1]:]
    return tokenizer.decode(generated_ids, skip_special_tokens=True).strip()


# Chargement du modèle de base
base_model = AutoModelForCausalLM.from_pretrained(MODEL_ID).to(device)
base_model.eval()

# Évaluation du modèle de base
results = []
for ex in test_data:
    user_input = ex["messages"][1]["content"]
    reference = ex["messages"][2]["content"]
    pred_base = generate(base_model, ex["messages"])
    results.append({"input": user_input, "reference": reference, "base": pred_base})

# Chargement de l'adaptateur LoRA par-dessus le modèle de base
ft_model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)
ft_model.eval()

# Évaluation du modèle fine-tuné
for i, ex in enumerate(test_data):
    results[i]["ft"] = generate(ft_model, ex["messages"])

# Affichage
print(f"\n{'INPUT':<25} {'RÉFÉRENCE':<20} {'BASE':<25} {'FINE-TUNÉ':<25}")
print("-" * 95)
for r in results:
    print(f"{r['input']:<25} {r['reference']:<20} {r['base']:<25} {r['ft']:<25}")

exact_base = sum(r["base"] == r["reference"] for r in results)
exact_ft = sum(r["ft"] == r["reference"] for r in results)
n = len(results)

print(f"\nExact match — Base : {exact_base}/{n} | Fine-tuné : {exact_ft}/{n}")
