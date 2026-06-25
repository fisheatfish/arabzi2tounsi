import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import HeroSection from './components/sections/HeroSection.jsx'
import ChapterSection from './components/sections/ChapterSection.jsx'
import FooterSection from './components/sections/FooterSection.jsx'

import TokenizationDemo from './components/chapters/TokenizationDemo.jsx'
import EmbeddingDemo from './components/chapters/EmbeddingDemo.jsx'
import AttentionDemo from './components/chapters/AttentionDemo.jsx'
import TransformerDemo from './components/chapters/TransformerDemo.jsx'
import LoraDemo from './components/chapters/LoraDemo.jsx'
import TrainingDemo from './components/chapters/TrainingDemo.jsx'
import ResultsDemo from './components/chapters/ResultsDemo.jsx'

gsap.registerPlugin(ScrollTrigger)

const NAV_ITEMS = [
  { id: 'hero', label: 'Intro' },
  { id: 'tokens', label: '01 Tokens' },
  { id: 'embeddings', label: '02 Embed' },
  { id: 'attention', label: '03 Attention' },
  { id: 'transformer', label: '04 Transformer' },
  { id: 'lora', label: '05 LoRA' },
  { id: 'training', label: '06 Training' },
  { id: 'results', label: '07 Résultats' },
]

export default function App() {
  const [activeSection, setActiveSection] = useState('hero')
  const [progress, setProgress] = useState(0)

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement
      const scrolled = doc.scrollTop / (doc.scrollHeight - doc.clientHeight)
      setProgress(scrolled * 100)

      // Active section detection
      for (const { id } of NAV_ITEMS) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= 80 && rect.bottom > 80) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div>
      {/* Progress bar */}
      <div
        id="progress-bar"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      {/* Navigation */}
      <nav>
        <span className="font-black text-base mr-4" style={{ color: '#FF6B6B' }}>
          arabzi2tounsi
        </span>
        <div className="flex gap-1 flex-wrap">
          {NAV_ITEMS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-link ${activeSection === id ? 'active' : ''}`}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main style={{ paddingTop: 0 }}>
        {/* HERO */}
        <HeroSection />

        {/* 01 — TOKENISATION */}
        <ChapterSection
          id="tokens"
          lessonNum="Leçon 01"
          title="Tokenisation :"
          titleAccent="découper le texte"
          description="Le modèle ne lit pas des mots entiers. Il découpe le texte en tokens — fragments de mots, lettres, sous-mots — et convertit chacun en un entier (ID). SmolLM2 utilise BPE avec ~49 000 tokens dans son vocabulaire."
          points={[
            { title: 'Byte Pair Encoding (BPE)', body: 'Les tokens fréquents ont un ID court. Les séquences rares sont découpées en sous-unités.' },
            { title: 'Espace = token ▁', body: 'Un espace avant un mot est encodé comme préfixe ▁ dans le token suivant.' },
            { title: 'Arabizi spécial', body: 'Les chiffres phonétiques (9=ق, 7=ح, 3=ع) sont traités comme caractères ASCII distincts.' },
          ]}
          takeaway="À ce stade, le texte n'est qu'une liste d'entiers. Aucune signification encore — juste des IDs."
          bgColor="#FFFDF5"
          accentColor="#FFD93D"
          textureClass="texture-grid"
          badgeRotate="rotate-2"
          rightContent={<TokenizationDemo />}
        />

        {/* 02 — EMBEDDINGS */}
        <ChapterSection
          id="embeddings"
          lessonNum="Leçon 02"
          title="Embeddings :"
          titleAccent="tokens → vecteurs"
          description="Chaque ID de token est transformé en un vecteur de 576 nombres réels. Ce vecteur encode la signification sémantique du token. Des tokens proches sémantiquement ont des vecteurs proches dans l'espace."
          points={[
            { title: 'Espace vectoriel ℝ⁵⁷⁶', body: 'SmolLM2 utilise 576 dimensions. GPT-4 utilise ~12 288 dimensions.' },
            { title: 'Embedding de position (RoPE)', body: 'On additionne un vecteur de position. Le modèle sait ainsi que le 3e token n\'est pas le 1er même si identique.' },
            { title: 'Similarité cosinus', body: '"sbeh" et "bislema" sont proches dans l\'espace. "ma" (négation) est loin des salutations.' },
          ]}
          takeaway="Survole les points dans la visualisation — les clusters montrent que le modèle a appris à regrouper les tokens sémantiquement similaires."
          bgColor="#FFF9E6"
          accentColor="#C4B5FD"
          textureClass="texture-dots"
          badgeRotate="-rotate-1"
          rightContent={<EmbeddingDemo />}
        />

        {/* 03 — ATTENTION */}
        <ChapterSection
          id="attention"
          lessonNum="Leçon 03"
          title="Attention :"
          titleAccent="chaque token regarde les autres"
          description={"Le mécanisme d'attention permet à chaque token de peser l'importance des autres tokens. Pour \"ma n9addarch\", le token \"n9add\" doit regarder \"ma\" pour comprendre la négation."}
          points={[
            { title: 'Query, Key, Value (Q, K, V)', body: 'Chaque token génère 3 vecteurs. Score = Q·Kᵀ/√d_k puis softmax sur les V.' },
            { title: 'Multi-head (15 têtes)', body: 'SmolLM2 calcule 15 attentions en parallèle. Chaque tête capte un aspect différent du contexte.' },
            { title: 'Causal masking', body: 'Lors de la génération, chaque token ne peut regarder que les tokens précédents (pas le futur).' },
          ]}
          takeaway="Clique sur une ligne de la matrice pour voir comment ce token distribue son attention sur les autres."
          bgColor="#FFFDF5"
          accentColor="#93C5FD"
          textureClass="texture-grid"
          badgeRotate="rotate-1"
          rightContent={<AttentionDemo />}
        />

        {/* 04 — TRANSFORMER */}
        <ChapterSection
          id="transformer"
          lessonNum="Leçon 04"
          title="Bloc Transformer :"
          titleAccent="tout s'assemble"
          description="Un bloc transformer combine attention multi-têtes + MLP Feed-Forward + connexions résiduelles + normalisation. SmolLM2-360M empile 32 blocs identiques. Clique sur chaque composant."
          points={[
            { title: 'Connexion résiduelle', body: 'x = x + f(x). Le gradient highway qui permet d\'entraîner 32 couches sans vanishing gradient.' },
            { title: 'MLP = mémoire du modèle', body: '576→1536→576 avec SiLU. C\'est là que résident les associations tokenconcept.' },
            { title: 'LayerNorm', body: 'Normalise les activations avant chaque opération. Essentiel pour la stabilité.' },
          ]}
          takeaway="Les 32 premières couches capturent la syntaxe. Les dernières comprennent la sémantique. C'est une pyramide de représentations."
          bgColor="#FFF9E6"
          accentColor="#FDB877"
          textureClass="texture-dots"
          badgeRotate="-rotate-2"
          rightContent={<TransformerDemo />}
        />

        {/* 05 — LORA */}
        <ChapterSection
          id="lora"
          lessonNum="Leçon 05"
          title="LoRA :"
          titleAccent="fine-tuner sans tout toucher"
          description="Entraîner 360M paramètres depuis zéro est impossible sur un GPU gratuit. LoRA gèle le modèle et ajoute de petites matrices A×B. Pour r=8, on n'entraîne que ~16 000 paramètres — 0.0045% du modèle."
          points={[
            { title: 'Rang faible (r=8)', body: 'ΔW ≈ A×B où A est (d×r) et B est (r×d). Pour d=576, r=8 : 576×8 + 8×576 = 9 216 params/couche.' },
            { title: 'B initialisé à 0', body: 'Au départ, A×B = 0. Le modèle commence exactement comme le modèle de base — aucun impact initial.' },
            { title: 'Scaling α/r', body: 'Le facteur α/r = 16/8 = 2 contrôle l\'amplitude des modifications. Plus α est grand, plus LoRA a d\'impact.' },
          ]}
          takeaway="LoRA est aussi efficace qu'un fine-tuning complet pour les tâches de style ou de format — avec 1000× moins de paramètres entraînés."
          bgColor="#FFFDF5"
          accentColor="#86EFAC"
          textureClass="texture-grid"
          badgeRotate="rotate-1"
          rightContent={<LoraDemo />}
        />

        {/* 06 — TRAINING */}
        <ChapterSection
          id="training"
          lessonNum="Leçon 06"
          title="Entraînement :"
          titleAccent="minimiser la perte"
          description="À chaque batch de 4 exemples, le modèle prédit le prochain token, calcule la cross-entropy loss, et ajuste uniquement les poids LoRA via backpropagation. 1 082 exemples × 3 epochs ≈ 810 steps."
          points={[
            { title: 'Cross-entropy loss', body: 'Mesure à quel point la distribution prédite diffère de la cible. Diminue à mesure que le modèle apprend.' },
            { title: 'Optimiseur AdamW', body: 'Adam + weight decay. Learning rate 2e-4 avec warmup. Le standard pour le fine-tuning LLM.' },
            { title: 'SFT masking', body: 'La perte est calculée uniquement sur les tokens assistant. System + user sont masqués (loss = 0).' },
          ]}
          takeaway="Rejoue les epochs pour voir la loss chuter. L'overfitting léger en epoch 3 (train < val) est normal et attendu avec un petit dataset."
          bgColor="#FFF9E6"
          accentColor="#FF6B6B"
          textureClass="texture-dots"
          badgeRotate="-rotate-1"
          rightContent={<TrainingDemo />}
        />

        {/* 07 — RÉSULTATS */}
        <ChapterSection
          id="results"
          lessonNum="Résultats"
          title="Avant / Après :"
          titleAccent="le fine-tuning en action"
          description="Évaluation sur 135 exemples de test (hold-out). Métrique : CER (Character Error Rate). 0 = parfait, 1+ = inutile. Le modèle de base recrache l'arabizi. Le modèle fine-tuné produit systématiquement du script arabe."
          points={[
            { title: 'CER : 2.72 → 0.26', body: 'Réduction de ×10. Le modèle a appris le format de sortie cible en seulement 3 epochs.' },
            { title: '0 → 14 exact match', body: '10.4% d\'exactitude parfaite. Semble faible mais chaque erreur porte sur 1-2 caractères.' },
            { title: 'Erreurs résiduelles', body: 'Confusions خ/ك, ن/ع. Problème de dataset, pas d\'architecture — plus de données résoudrait ça.' },
          ]}
          takeaway="Le levier #1 n'est pas l'architecture — c'est la quantité et qualité des données. ~3 000 exemples devraient réduire le CER sous 0.08."
          bgColor="#FFFDF5"
          accentColor="#FFD93D"
          textureClass="texture-grid"
          badgeRotate="rotate-2"
          rightContent={<ResultsDemo />}
        />
      </main>

      <FooterSection />
    </div>
  )
}
