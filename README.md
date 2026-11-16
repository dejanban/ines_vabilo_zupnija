# Plakete za obletnico poroke · Župnija Črnomelj

Spletna aplikacija za pripravo plaket z več prejemniki in prenosom vseh plaket v enem PDF-ju.

**Naslov po vključitvi GitHub Pages:** [dejanban.github.io/ines_vabilo_zupnija](https://dejanban.github.io/ines_vabilo_zupnija/).

Za prvo objavo v [Settings → Pages](https://github.com/dejanban/ines_vabilo_zupnija/settings/pages) kot **Source** izberi **GitHub Actions**. Nato v [Actions → Deploy to GitHub Pages](https://github.com/dejanban/ines_vabilo_zupnija/actions/workflows/pages.yml) izberi **Run workflow**, če se objava ni zagnala že ob pushu. Vsak naslednji push na `main` preveri aplikacijo in samodejno objavi mapo `spletna-aplikacija/dist`.

Pripravljene A4 slike, pretvorba PDF v PNG in pregled vsebine, pisav ter barv so v mapi [izhod](izhod/README.md).

Glavni izdelek: [A4 ozadje brez besedila z zamenjano podobo iz PDF](izhod/A4_ozadje_z_Marijo.png).

Spletna aplikacija za vnos prejemnikov, urejanje besedila in prenos vseh plaket v enem PDF-ju je v mapi [spletna-aplikacija](spletna-aplikacija/README.md). Lokalni zagon: `python3 spletna-aplikacija/serve.py`, nato odpri `http://localhost:8000`.
