from datasets import load_dataset
from peft import LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import SFTConfig, SFTTrainer

MODEL_ID = "HuggingFaceTB/SmolLM2-360M-Instruct"

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(MODEL_ID)

# Adaptateurs LoRA injectés sur les couches d'attention
# r=8 : rang des matrices, suffisant pour une tâche simple
# lora_alpha=16 : scaling = alpha/r = 2
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

train_dataset = load_dataset("json", data_files="data/train.jsonl", split="train")
val_dataset = load_dataset("json", data_files="data/val.jsonl", split="train")

args = SFTConfig(
    output_dir="output/",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-4,
    warmup_steps=5,
    logging_steps=5,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    max_length=128,  # nos exemples sont courts, inutile d'aller plus loin
    fp16=True,       # passer à bf16=True sur A100 (bf16=True est le défaut dans TRL récent)
    report_to="none",
)

# SFTTrainer applique automatiquement le chat template du modèle
# et calcule la loss uniquement sur les tokens de l'assistant
trainer = SFTTrainer(
    model=model,
    args=args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    peft_config=lora_config,
)

trainer.train()

# Sauvegarde uniquement l'adaptateur LoRA (quelques Mo, pas les 360M du modèle de base)
trainer.save_model("output/final")
print("Adaptateur sauvegardé dans output/final/")
