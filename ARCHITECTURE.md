# Architecture feature-first

## Règles utilisées

1. `app/` ne contient que la composition globale : navigation, layout et providers.
2. `features/<feature>/` contient le métier d'un écran : API, types, composants et page.
3. `shared/` ne connaît aucun métier. Il contient le client HTTP, les hooks génériques, le design system et les styles globaux.
4. Une feature peut utiliser une autre feature uniquement lorsqu'il s'agit d'une vraie dépendance métier. Exemple : le formulaire d'un élève charge les classes disponibles.
5. Le CSS spécifique vit à côté du composant ou de la page qu'il habille. Les styles vraiment génériques vivent à côté du composant `shared/ui` correspondant.
6. Il n'y a plus de fichier `EntityTables.tsx`, `FormModal.tsx`, `App.css` ou `services/api.ts` centralisant tous les domaines.

## Exemple

```text
features/professeurs/
├── api/
│   └── professeurs.api.ts
├── components/
│   ├── ProfesseurForm/
│   │   ├── ProfesseurForm.tsx
│   │   └── ProfesseurForm.css
│   └── ProfesseursTable/
│       ├── ProfesseursTable.tsx
│       └── ProfesseursTable.css
├── pages/
│   └── ProfesseursPage/
│       ├── ProfesseursPage.tsx
│       └── ProfesseursPage.css
└── types/
    └── professeur.types.ts
```

Le même principe est utilisé pour `planning`, `classes`, `eleves`, `matieres`, `salles`, `creneaux`, `configs`, `vacances` et `plannings`.

---

# Charte et Règles CSS & Design System

## 1. Principes Fondamentaux de Styling

1. **Dark Theme Universel & Immersif** :
   - L'application est exclusivement conçue en Dark Mode soigné (`color-scheme: dark`).
   - L'arrière-plan global est profond et texturé (canvas `--bg-canvas` `#070d18` et `--bg-canvas-deep` `#050a13` avec des gradients radiaux diffus).
   - **Interdiction formelle** de palettes ou d'éléments clairs (ex. `#fff`, `#f8fafc`, `#e2e8f0`) ou de textes foncés (ex. `#1e293b`, `#334155`, `#64748b`). Tout élément doit s'inscrire dans l'ambiance sombre feutrée du projet.

2. **Source Unique de Vérité Visuelle (`tokens.css` & `globals.css`)** :
   - Toute propriété d'apparence (couleur, surface, bordure, ombre, rayon, police) **doit obligatoirement** référencer une variable CSS définie dans `src/shared/styles/tokens.css`.
   - **Aucune couleur hexadécimale, rgb ou rgba arbitraire** ne doit être déclarée en dur dans les fichiers CSS des composants ou des features.
   - **Aucun nom de variable fantaisiste** (ex. `--color-primary`, `--color-bg-subtle`, `--space-4`, etc. issus de frameworks tiers type Tailwind) ne doit être introduit. Seules les variables de `tokens.css` font foi.

3. **Colocalisation et Responsabilités CSS** :
   - Le composant détient son fichier CSS dédié au même niveau (`MyComponent.tsx` et `MyComponent.css`).
   - Le CSS de composant ne gère que son positionnement interne, sa disposition (flex/grid) et l'application des tokens de styling.
   - Les éléments visuels génériques (boutons, modales, badges, cartes, tableaux) doivent déléguer leur rendu aux composants du dossier `src/shared/ui/`.

---

## 2. Référentiel Officiel des Tokens CSS (`tokens.css`)

### 2.1 Surfaces & Arrière-plans (Backgrounds)
| Variable | Valeur par défaut | Rôle / Usage |
|---|---|---|
| `--bg-canvas` | `#070d18` | Fond de base de la vue / zone principale |
| `--bg-canvas-deep` | `#050a13` | Fond profond html / body |
| `--bg-sidebar` | `rgba(8, 15, 28, 0.86)` | Volet de navigation latérale |
| `--bg-surface` | `rgba(16, 25, 42, 0.72)` | Surface standard de carte ou panneau (avec `backdrop-filter: blur(12px)`) |
| `--bg-surface-raised` | `rgba(20, 31, 51, 0.78)` | Surface surélevée (en-têtes de tableaux, toolbars, tiroirs latéraux) |
| `--bg-surface-soft` | `rgba(12, 21, 36, 0.62)` | Surface discrète ou imbriquée |
| `--bg-input` | `rgba(7, 15, 27, 0.66)` | Fond des contrôles de formulaires (inputs, selects, textareas) |
| `--bg-hover` | `rgba(31, 45, 71, 0.58)` | État de survol interactif des lignes, cartes et items de liste |

### 2.2 Typographie & Hiérarchie de Texte
- **Police globale** : `--font-sans` (`'Outfit', Inter, ui-sans-serif, system-ui, sans-serif`)
- **Échelle des contrastes de texte** :
  | Variable | Valeur | Usage |
  |---|---|---|
  | `--text-primary` | `#f3f7fd` | Titres, données principales, libellés actifs |
  | `--text-secondary` | `#b5c0d0` | Textes de corps, sous-titres, valeurs d'attributs |
  | `--text-muted` | `#7a899f` | Métadonnées, labels secondaires, en-têtes de colonnes |
  | `--text-faint` | `#56657a` | Éléments décoratifs, textes estompés, hints discrets |

### 2.3 Marque & Accents Thématiques
| Variable | Valeur | Usage |
|---|---|---|
| `--primary` | `#7477f5` | Couleur dominante de l'application (Indigo Plannif) |
| `--primary-hover` | `#8588ff` | Survol des boutons et liens primaires |
| `--primary-strong` | `#5e61e8` | État actif / pressé des éléments primaires |
| `--primary-soft` | `rgba(116, 119, 245, 0.13)` | Fond des badges primaires, surlignages et pills actifs |
| `--primary-ring` | `rgba(116, 119, 245, 0.16)` | Halo de focus et bordures d'accentuation |
| `--accent-cyan` | `#45c5f5` | Accent secondaire froid (séances de type 1, tags info) |
| `--accent-violet` | `#a878f5` | Accent secondaire chaud (séances de type 4, options) |

### 2.4 Retours Sémantiques (Feedback)
| Rôle | Couleur pleine | Fond translucide (`-soft`) | Usage |
|---|---|---|---|
| **Succès** | `--success: #45d5a3` | `--success-soft: rgba(69, 213, 163, 0.10)` | Score optimal (0 hard), opérations validées |
| **Avertissement** | `--warning: #f6c760` | `--warning-soft: rgba(246, 199, 96, 0.10)` | Alertes d'inconfort, score souple à surveiller |
| **Danger / Erreur** | `--danger: #fb7f94` | `--danger-soft: rgba(251, 127, 148, 0.10)` | Conflits durs (hard < 0), échecs solver, suppression |
| **Information** | `--info: #45c5f5` | `--info-soft: rgba(69, 197, 245, 0.10)` | Indicateurs d'état, badges informatifs |

### 2.5 Bordures, Rayons & Ombres
- **Bordures** :
  - `--border-subtle` : `rgba(166, 183, 207, 0.085)` (séparateurs discrets, lignes de tableaux)
  - `--border-default` : `rgba(166, 183, 207, 0.14)` (contour standard de cartes et d'inputs)
  - `--border-strong` : `rgba(166, 183, 207, 0.23)` (survol et contours accentués)
  - `--ring-soft` : `rgba(255, 255, 255, 0.04)` (rehaut interne 1px)
- **Rayons de courbure (Border Radius)** :
  - `--radius-xs: 6px` : Badges ultra-compacts, boutons d'action rapide, checkboxes
  - `--radius-sm: 9px` : Boutons standards, champs input, sous-blocs
  - `--radius-md: 13px` : Cartes de données, switcher d'onglets, tiroirs
  - `--radius-lg: 17px` : Grands conteneurs de calendrier, fenêtres modales
  - `--radius-xl: 22px` : Pillules flottantes, bannières arrondies
- **Ombres** : `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-primary`.
- **Transitions** : `--transition: 160ms ease` pour tout effet de survol.

---

## 3. Normes d'Utilisation des Composants Partagés (`shared/ui/`)

Pour garantir une expérience utilisateur uniforme et éviter les duplications stylistiques :

### 3.1 Boutons (`<Button>` / `.button`)
- Utiliser systématiquement `<Button variant="...">` au lieu d'une balise `<button>` avec CSS personnalisé.
- Variantes disponibles :
  - `primary` : Action majeure d'une vue (ex. "Optimiser le planning", "Enregistrer").
  - `secondary` : Action neutre (contour `--border-default`, fond sombre).
  - `ghost` : Bouton discret sans bordure, survol transparent.
  - `danger` : Action destructive ou alerte rouge (suppression, réinitialisation).
  - `icon` : Bouton carré (32x32) centré sur une icône.

### 3.2 Modales (`<Modal>` / `.modal`)
- Tout dialogue ou fenêtre popup doit réutiliser `<Modal>` :
  ```tsx
  <Modal isOpen={isOpen} onClose={onClose} title="Titre" subtitle="Sous-titre" size="sm|md|lg">
    <div className="modal__body">...</div>
    <div className="modal__footer">...</div>
  </Modal>
  ```
- Structure CSS associée : `.modal-backdrop` (blur sombre), `.modal` (dégradé sombre 16px radius), `.form-grid`, `.form-field`, `.form-control`.
- **Interdiction formelle** de recréer un overlay personnalisé avec des styles déconnectés du design system.

### 3.3 Tableaux de Données (`<DataTable>` / `.entity-table`)
- Tout affichage tabulaire doit s'insérer dans `.data-card` avec `.table-scroll` et `.entity-table`.
- En-têtes sticky avec fond `--bg-canvas-deep` translucide, bordure inférieure `--border-default`, et survol de ligne subtil `rgba(255, 255, 255, 0.018)`.

### 3.4 Formulaires & Contrôles
- Inputs, selects et textareas doivent respecter la classe `.form-control` : fond `--bg-input`, bordure `--border-default`, texte `--text-primary`, outline `--primary` au focus.

---

## 4. Anti-Patterns CSS Proscrits (Garde-fous Qualité)

| Pratique Proscrite ❌ | Justification / Problème | Règle de Remplacement ✅ |
|---|---|---|
| `background: white;` ou `#f8fafc` | Éblouit l'utilisateur, casse le dark mode, apparence de bogue | Utiliser `var(--bg-surface)` ou `var(--bg-surface-raised)` |
| `color: #1e293b;` ou `#334155` | Texte noir/foncé invisible sur fond sombre | Utiliser `var(--text-primary)` ou `var(--text-secondary)` |
| `var(--color-primary, #2563eb)` | Token étranger Tailwind, bleu non conforme à la marque | Utiliser `var(--primary, #7477f5)` |
| `var(--color-border, #e2e8f0)` | Bordure claire issue d'un template light mode | Utiliser `var(--border-default)` |
| `border-radius: 8px;`, `14px;` etc. en dur | Fragmentation des rayons de courbure | Utiliser `var(--radius-sm)` (9px) ou `var(--radius-md)` (13px) |
| Recréation d'une modale ad-hoc avec son propre backdrop | Manque d'uniformité, comportements de focus et fermeture disparates | Réutiliser `<Modal>` du dossier `shared/ui/Modal` |
| `outline: none` sans compensation `:focus-visible` | Accessibilité clavier rompue | Conserver la règle globale de `globals.css` (`outline: 2px solid #898bff;`) |

---

## 5. Synthèse des Écarts Identifiés sur les Derniers Ajouts (Audit CSS)

Lors de la revue front-end des composants ajoutés récemment, les écarts suivants ont été recensés et devront être normalisés :

1. **`SolverProgressModal` (`SolverProgressModal.css`)** :
   - Présence de tokens étrangers : `--space-4`, `--color-bg-subtle`, `--color-border`, `--color-primary`, `--color-text-muted`.
   - Utilisation de styles light mode en dur : fond blanc `#ffffff`, gris clair `#f8fafc` / `#e2e8f0`, vert clair `#f0fdf4`, rouge clair `#fef2f2`, bleu `#eff6ff`.
   - Non-utilisation de `<Modal>` et `<Button>` du dossier `shared/ui`.

2. **`SeancesNonPlanifieesModal` (`SeancesNonPlanifieesModal.css`)** :
   - Textes sombres `#1e293b` et `#334155` hérités de fallbacks light mode.
   - Tableau personnalisé avec en-tête `#f8fafc` et bordures `#e2e8f0` au lieu de `.entity-table`.
   - Pills de statut stylisés avec des fonds clairs `#f1f5f9` au lieu du composant `<Badge>`.

3. **`QuickReschedulePopover` (`QuickReschedulePopover.css`)** :
   - Gradients sombres codés en hexadécimal dur (`#16243d`, `#0b1424`) au lieu de `--bg-surface-raised`.
   - Bordures et rayons hétérogènes (14px, 6px, 8px) au lieu de `--radius-sm` et `--radius-md`.
   - Boutons de jours et créneaux stylisés ad-hoc sans réutiliser les tokens d'interaction `--bg-hover` et `--primary`.

4. **`PlanningStats` (`PlanningStats.css`)** :
   - Bannières d'alerte avec couleurs hexadécimales dures (`#f6c760`, `#45d5a3`) au lieu des tokens `--warning`, `--warning-soft`, `--success`, `--success-soft`.
   - Rayons de 10px et 8px au lieu de l'échelle canonique `--radius-sm` (9px) / `--radius-md` (13px).

5. **`PlanningPage` (`PlanningPage.css`)** :
   - Bannière des séances non planifiées avec `color: var(--text-color, #1e293b);` (fallback texte foncé sur fond sombre).

6. **`SessionCard` (`SessionCard.css`)** :
   - Micro-boutons d'actions rapides et variantes de cartes contenant plusieurs couleurs hexadécimales en dur (`#8184ff`, `#e8edf5`, `#bdc7d5`, `#f4f7fb`, `#929fb2`) au lieu de mapper sur `--text-primary`, `--text-muted`, `--primary-hover` et les variantes `--accent-*`.

