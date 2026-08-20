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
