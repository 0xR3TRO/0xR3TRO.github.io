# 🚀 klefas.me

> Moja osobista strona internetowa — aktualnie w budowie.

[![Deploy](https://github.com/0xR3TRO/0xR3TRO.github.io/actions/workflows/static.yml/badge.svg)](https://github.com/0xR3TRO/0xR3TRO.github.io/actions/workflows/static.yml)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fklefas.me&label=klefas.me)](https://klefas.me)

## 🌐 Live

**[klefas.me](https://klefas.me)**

Projekty pod tą samą domeną (osobne repozytoria):

- [klefas.me/arcade](https://klefas.me/arcade/) — R3TRO Arcade, 14 gier w przeglądarce ([kod](https://github.com/0xR3TRO/arcade))
- [klefas.me/lab](https://klefas.me/lab/) — R3TRO Lab, 24 małe aplikacje i eksperymenty UI ([kod](https://github.com/0xR3TRO/lab))
- [klefas.me/budgetly](https://klefas.me/budgetly/) — Budgetly, budżet domowy w przeglądarce ([kod](https://github.com/0xR3TRO/budgetly))

## ✨ Funkcje

- 🎨 **Automatyczny motyw ciemny/jasny** — detekcja preferencji systemowych + ręczny przełącznik
- 🧩 **Projekty** — karty prowadzące do R3TRO Arcade, R3TRO Lab i Budgetly
- 💻 **Animacja pisania** — efekt terminala z humorystycznymi komendami
- 🌌 **Particle background** — animowane cząsteczki z połączeniami
- 🔨 **Animowane paski budowlane** — bo strona jest _w budowie_!
- 📱 **W pełni responsywna** — mobile-first design
- 🔗 **Linki** — GitHub, e-mail
- ↪️ **Przekierowania** — stare adresy `/r3tro-arcade/` i `/web-lab/` prowadzą do nowych

## 🛠️ Stack technologiczny

- **HTML5** + **CSS3** + **JavaScript** (Vanilla)
- **GitHub Pages** + **GitHub Actions** (Static HTML deploy)
- **Fonty Inter i JetBrains Mono** hostowane na stronie — przeglądarka nie łączy się z Google
- Zero zależności, zero frameworków

## 📁 Struktura

```
├── index.html          # Cała strona (single-file)
├── 404.html            # Strona błędu + przekierowania starych adresów
├── fonts/              # Fonty (SIL OFL 1.1) i fonts.css
├── r3tro-arcade/       # Przekierowanie na /arcade/
├── web-lab/            # Przekierowanie na /lab/
├── CNAME               # Domena klefas.me
├── .nojekyll           # Wyłącz Jekyll na GitHub Pages
├── .github/
│   └── workflows/
│       └── static.yml  # GitHub Actions — deploy
└── README.md
```

## 🚀 Deploy

Strona deployuje się automatycznie przez GitHub Actions po każdym pushu do gałęzi `main`.

## 📜 Licencja

Kod strony: [MIT](LICENSE). Treści (teksty, nazwa i wygląd marki): zastrzeżone, zob. [NOTICE.md](NOTICE.md). Fonty: SIL Open Font License 1.1, zob. `fonts/OFL-*.txt`.
