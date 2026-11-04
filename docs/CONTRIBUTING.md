# Jak pracować z repozytorium

Strona jest statyczna (HTML, CSS, JS bez bundlera). `main` to produkcja: każdy push na `main` wdraża stronę na klefas.me.

## Model gałęzi

Używamy GitHub Flow: jedna długo żyjąca gałąź `main` i krótkie gałęzie robocze, każda na jedno zadanie.

| Prefiks    | Do czego                         | Przykład                  |
| ---------- | -------------------------------- | ------------------------- |
| `feat/`    | nowa funkcja lub sekcja          | `feat/about-section`      |
| `fix/`     | poprawka błędu                   | `fix/mobile-mail-link`    |
| `content/` | teksty, linki, tłumaczenia       | `content/en-translation`  |
| `docs/`    | dokumentacja                     | `docs/readme`             |
| `chore/`   | CI, narzędzia, zależności        | `chore/ci-validation`     |

Zasady:

1. Nie commitujemy bezpośrednio do `main`. Każda zmiana idzie przez pull request.
2. PR jest mały i dotyczy jednego tematu. Tytuł w stylu `feat: dodaj sekcję "O mnie"`.
3. CI (`CI / validate`) musi przejść przed scaleniem.
4. Scalamy przez **Squash and merge**, a gałąź robocza jest usuwana po scaleniu.
5. Po scaleniu `main` wdraża się sam (workflow `static.yml`).

## Ustawienia GitHuba do włączenia ręcznie

Tego nie da się zapisać w repozytorium. Trzeba to ustawić w **Settings**:

- **Branches → Add rule** dla `main`: wymagaj pull requesta oraz sprawdzenia `validate`.
- **General → Pull Requests**: zostaw tylko "Allow squash merging" i włącz "Automatically delete head branches".
- **Pages**: źródło ustaw na "GitHub Actions".

## Lokalna walidacja

```bash
npx html-validate@9 --config .htmlvalidate.json "**/*.html"
```
