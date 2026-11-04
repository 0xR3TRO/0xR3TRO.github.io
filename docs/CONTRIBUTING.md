# Jak pracować z repozytorium

Strona jest statyczna (HTML, CSS, JS bez bundlera). Gałąź `main` to produkcja: każdy push na `main` wdraża stronę na klefas.me.

## Gałęzie

| Gałąź        | Rola                                     | Tworzona z | Wraca do                  |
| ------------ | ---------------------------------------- | ---------- | ------------------------- |
| `main`       | produkcja, tylko stabilny kod            | —          | —                         |
| `develop`    | integracja kolejnych zmian (opcjonalna)  | `main`     | `main` (wydanie)          |
| `feature/*`  | nowa funkcja, sekcja lub treść           | `develop`  | `develop`                 |
| `bugfix/*`   | poprawka błędu znalezionego w `develop`  | `develop`  | `develop`                 |
| `hotfix/*`   | pilna poprawka błędu na produkcji        | `main`     | `main`, potem do `develop`|

Nazwa gałęzi: `rodzaj/krotki-opis` małymi literami, słowa łączone myślnikiem, najlepiej 2–3 słowa (`feature/about-section`, `bugfix/mail-link`, `hotfix/broken-redirect`). Bez imion, dat i nazw generowanych automatycznie.

## Przebieg pracy

1. `feature/*` i `bugfix/*`: odgałęzienie od `develop`, pull request do `develop`, **Squash and merge**, usunięcie gałęzi.
2. Wydanie: pull request `develop` → `main`, scalany zwykłym **merge commit** (bez squasha, żeby historia obu gałęzi się nie rozjeżdżała). Po scaleniu strona wdraża się sama.
3. `hotfix/*`: odgałęzienie od `main`, pull request do `main` (merge commit), a następnie scalenie `main` z powrotem do `develop`.
4. Nie commitujemy bezpośrednio do `main` ani do `develop`. CI (`CI / validate`) musi przejść przed scaleniem.

Jeśli `develop` okaże się zbędna, wystarczy ją usunąć: `feature/*` i `bugfix/*` będą wtedy wychodzić z `main` i wracać do `main`.

## Ustawienia GitHuba do włączenia ręcznie

Tego nie da się zapisać w repozytorium. Trzeba to ustawić w **Settings**:

- **Branches → Add rule** dla `main` i `develop`: wymagaj pull requesta oraz sprawdzenia `validate`.
- **General → Pull Requests**: zostaw squash i merge commit, włącz "Automatically delete head branches".
- **Pages**: źródło ustaw na "GitHub Actions". Domyślna gałąź zostaje `main`, więc nowy PR trzeba kierować na `develop` ręcznie.

## Lokalna walidacja

```bash
npx html-validate@9 --config .htmlvalidate.json "**/*.html"
```
