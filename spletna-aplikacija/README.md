# Plakete za različne priložnosti

Spletna aplikacija za Župnijo Črnomelj. Uporablja neposredno kopijo datoteke `izhod/A4_ozadje_z_Marijo.svg` kot ozadje. Besedilo je postavljeno po vzoru `IMG_8981.JPG`, vključno z izmerjenimi temno rjavimi in skoraj črnimi barvami.

## GitHub Pages

Aplikacijo odpri na naslovu **https://dejanban.github.io/ines_vabilo_zupnija/**. Če GitHub Pages objavlja vejo **main** in mapo **/ (root)**, začetni `index.html` samodejno odpre aplikacijo v `spletna-aplikacija/dist/`. V korenu je tudi `.nojekyll`, zato se objavlja neposredna statična vsebina in začetna stran ni ustvarjena iz README.

Podprta je tudi objava prek **GitHub Actions**: potek `.github/workflows/pages.yml` ob pushu na `main` preveri JavaScript in izvoz PDF ter prebere način objave Pages. Če je izbran način Actions, objavi samo vsebino `spletna-aplikacija/dist`; pri objavi iz veje dodatni korak objave preskoči. Preverjanje in morebitno objavo lahko sprožiš ročno prek **Actions → Deploy to GitHub Pages → Run workflow**. Obstoječo objavo iz veje lahko ohraniš.

Vse poti do slik, pisav in modulov so relativne, zato aplikacija pravilno deluje tudi pod potjo `/ines_vabilo_zupnija/`. Izvorne slike, analiza, preizkusi in lokalne datoteke se ne dodajo v spletni paket. Objavljena aplikacija ne potrebuje dodatnih API ključev ali strežniškega dela.

Datoteke aplikacije so del glavnega repozitorija. Lokalna zgodovina prejšnje objave Sites je ohranjena v prezrti mapi `.local/sites-source.git` v korenu projekta; v GitHub ni vključena kot gnezdeni repozitorij ali podmodul.

## Lokalni zagon

Iz korena projekta zaženi:

```sh
python3 spletna-aplikacija/serve.py
```

Odpri **http://localhost:8000**. Za druga vrata dodaj številko, na primer `python3 spletna-aplikacija/serve.py 8080`. Aplikacijo odpri prek strežnika; neposredno odpiranje `index.html` prek `file://` zaradi modulov in pisav ni podprto. Za delovanje niso potrebni Node.js, npm, zunanje storitve ali namestitev knjižnic.

## Uporaba

1. V tabelo vpiši po enega prejemnika oziroma par na vrstico. Dodatne vrstice doda gumb **Dodaj prejemnika** ali tipka Enter. Seznam lahko tudi prilepiš iz preglednice.
2. Predogled vedno prikazuje prvega izpolnjenega prejemnika. Prazne vrstice se pri izvozu preskočijo; enaka imena se ohranijo, če so vpisana večkrat.
3. Uredi **Naslov plakete**, spodnje besedilo in vrstico s krajem, datumom in podpisom. Privzeti naslov »PLAKETA ZA / OBLETNICO POROKE« lahko zamenjaš za poljubno drugo priložnost. Naslov podpira do dve vrstici in se ob daljšem besedilu samodejno pomanjša. Nova vrstica v besedilu določi prelom, prazna vrstica razmik med odstavki. Imena in daljša besedila se samodejno prilagajajo razpoložljivemu prostoru. Če se besedilo ne more več berljivo prilegati, je prenos onemogočen in prikazana napaka.
4. **Prenesi PDF** neposredno prenese en večstranski PDF. Za vsakega prejemnika vsebuje eno A4 stran z njegovim imenom. Med generiranjem je prikazan napredek, na voljo je preklic.

Osnutek se shranjuje samo v lokalno shrambo trenutnega brskalnika, vključno z naslovom. Imena in urejena besedila se ne pošiljajo strežniku. Obstoječi osnutki brez naslova dobijo privzeti naslov, ostali podatki ostanejo ohranjeni. Če lokalna shramba ni dovoljena, aplikacija še vedno deluje do zaprtja strani. **Povrni izvirno besedilo** povrne naslov, besedilo in podpis ter ohrani seznam prejemnikov.

## Pisave in tisk

Točne izvirne pisave iz JPG-ja ni mogoče potrditi. Aplikacija prednostno uporabi Times New Roman in Monotype Corsiva, če sta nameščeni na računalniku. Kot priloženi nadomestni pisavi sta uporabljeni Liberation Serif (navadna in krepka) ter Italianno. V razdelku **Pisave in izvirna predloga** lahko uporabnik naloži svoji datoteki TTF, OTF, WOFF ali WOFF2. Naloženi pisavi se uporabita v predogledu in PDF-ju; veljata do ponovnega nalaganja strani. Licence priloženih pisav so v `dist/assets/`.

Predogled in izvoz uporabljata skupno funkcijo postavitve v `certificate.mjs`. Položaji so zapisani v koordinatah referenčne slike 382 × 512 in preslikani na A4. Barvi naslova `#2D1C03` in besedila `#2E2D29` izhajata iz analize izvirnika. Prejemnik ima temen kaligrafski zapis. Naslov je urejljiv ter ohrani izvirno barvo in krepko serifno pisavo.

PDF ima fizične strani **210 × 297 mm**. Vsaka stran je v PDF vgrajena kot kakovostna JPEG upodobitev skupnega platna **2480 × 3508 pik** pri približno 300 dpi. Besedilo je zato del slike, s čimer se ohrani isti prikaz pisav tudi na računalniku brez nameščenih pisav; v PDF ni samostojno izbirljivo. PDF ne doda podrobnosti prvotnim rastrskim slikam. Pri tiskanju izberi **dejansko velikost / 100 %**, papir A4.

## Datoteke in preverjanje

- `dist/`: celotna aplikacija za poljuben statični spletni strežnik; brez CDN in zunanjih izvajalnih odvisnosti.
- `dist/app.mjs`: tabela, urejanje, lokalni osnutek, nalaganje pisav in prenos.
- `dist/certificate.mjs`: skupna postavitev predogleda in izhodnih strani.
- `dist/pdf.mjs`: izdelava večstranskega PDF-ja neposredno v brskalniku.
- `.openai/hosting.json`: identiteta zasebne aplikacije Sites.
- `tests/core.mjs`: preverjanje seznama, uvoza in strukture PDF-ja z neodvisnima orodjema Poppler.
- `tests/browser.py`: dejanski brskalniški preizkus s Firefox WebDriverjem. Preveri urejanje, šumnike, prvi predogled, večstranski prenos, prazne vrstice, prelivanje, osnutek, pisave, mobilni pogled in preklic. Rezultati in posnetki se shranijo v prezrto mapo `test-results/`.

Za osnovne preizkuse je potreben Node.js in Poppler: `node --test spletna-aplikacija/tests/core.mjs`. Brskalniški preizkus dodatno potrebuje zagnana lokalni strežnik na vratih 8000 in geckodriver na vratih 4444 ter Pillow; pot do Firefoxa je nastavljena v preizkusni skripti.
