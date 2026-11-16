# Priprava plaket · Župnija Črnomelj

Spletna aplikacija za pripravo plaket z urejljivim naslovom, besedilom in podpisom, več prejemniki ter prenosom vseh plaket v enem PDF-ju.

## [Odpri aplikacijo za pripravo plaket](https://dejanban.github.io/ines_vabilo_zupnija/)

Aplikacijo odpri z zgornjo povezavo GitHub Pages. Stran repozitorija na `github.com` prikazuje izvorne datoteke in dokumentacijo.

Objava podpira oba načina GitHub Pages:

- **Deploy from a branch → main → / (root):** začetni `index.html` odpre aplikacijo v `spletna-aplikacija/dist/`. Datoteka `.nojekyll` omogoči neposredno streženje statičnih datotek.
- **GitHub Actions:** potek [Deploy to GitHub Pages](https://github.com/dejanban/ines_vabilo_zupnija/actions/workflows/pages.yml) preveri aplikacijo, prepozna izbrani način objave in pri načinu Actions objavi samo mapo `spletna-aplikacija/dist`. Pri objavi iz veje dodatni korak objave preskoči.

Obstoječe objave iz veje ni treba prestavljati na Actions. Ob naslednjem pushu se začetna stran posodobi skupaj z aplikacijo. Nastavitve so v [Settings → Pages](https://github.com/dejanban/ines_vabilo_zupnija/settings/pages).

Pripravljene A4 slike, pretvorba PDF v PNG in pregled vsebine, pisav ter barv so v mapi [izhod](izhod/README.md).

Glavni izdelek: [A4 ozadje brez besedila z zamenjano podobo iz PDF](izhod/A4_ozadje_z_Marijo.png).

Spletna aplikacija za vnos prejemnikov, urejanje besedila in prenos vseh plaket v enem PDF-ju je v mapi [spletna-aplikacija](spletna-aplikacija/README.md). Lokalni zagon: `python3 spletna-aplikacija/serve.py`, nato odpri `http://localhost:8000`.
