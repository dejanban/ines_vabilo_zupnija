# Pregled izvirnikov in oblikovanja

## Pregledane datoteke

- `README.md`: vsebuje samo naslov projekta `ines_vabilo_zupnija`.
- `IMG_8981.JPG`: rastrska predloga plakete za obletnico poroke, 382 × 512 pik, RGB, JPEG. Zapisana gostota je 72 dpi, vendar fizična velikost izvirnega dokumenta iz tega ni zanesljivo določljiva. Na voljo ni izvornega dokumenta z urejevalnimi plastmi.
- `Photo_2026-11-15_180405.pdf`: ena stran, PDF 1.3, 111 × 173 točk oziroma približno 39,16 × 61,03 mm. Vsebuje eno vdelano barvno sliko JPEG, 464 × 720 pik pri približno 300 dpi; nima besedilne plasti, vdelanih pisav, obrazcev ali šifriranja.
- Mapa `.git` vsebuje tehnične podatke repozitorija in ni del grafične predloge. Izvirne vsebinske datoteke ostanejo ohranjene.

Kontrolne vsote SHA-256 in velikosti izvirnih vsebinskih datotek so v `vhodne_datoteke.json`. Tehnični izpisi PDF so shranjeni posebej.

## Kaj piše na predlogi

```text
PLAKETA ZA
OBLETNICO POROKE

[Ime in Priimek jubilantov]

Plaketo podeljuje Župnija Črnomelj
za 5. obletnico poroke.

Hvala za vajino zvestobo, ljubezen in pričevanje.
Naj Gospod še naprej spremlja vajino pot.

Črnomelj, 22. 11. 2026 | Janez Žakelj, župnik
```

Prepis je nastal z vizualnim pregledom JPG. Samostojna različica za kopiranje je v `besedilo_plakete.txt`. Ohranjen je tudi nadomestni zapis imena v oglatih oklepajih; imeni jubilantov v izvirniku nista navedeni.

## Pisave

Natančnega imena pisave ni mogoče dokazati: JPG vsebuje samo slikovne pike, PDF pa vsebuje samo drugo sliko in ne izvirnega besedila plakete. Spodaj so vizualne ocene za ponovno postavitev, ne potrjene identifikacije.

| Del | Vidne značilnosti | Najbližja ocenjena pisava | Gotovost |
| --- | --- | --- | --- |
| Naslov v dveh vrsticah | Klasična serifna pisava, krepko, velike črke, sredinska poravnava | Times New Roman Bold oziroma zelo sorodna serifna pisava | Srednja |
| `[Ime in Priimek jubilantov]` | Poševna kaligrafska pisava, povezane poteze in okrašene velike začetnice | Monotype Corsiva oziroma sorodna kaligrafska pisava | Nizka do srednja |
| Osrednje besedilo | Navadna serifna pisava, sredinska poravnava | Times New Roman Regular oziroma sorodna serifna pisava | Srednja |
| Kraj, datum in podpis | Manjša navadna serifna pisava | Times New Roman Regular oziroma sorodna serifna pisava | Srednja |

Če se postavitev ponovno sestavlja na A4, je smiselno začeti približno z 22–24 pt za naslov, 27–30 pt za imeni, 16–17 pt za besedilo in 13–14 pt za nogo. To so predlogi za novo A4 postavitev, ne izmerjene izvirne velikosti. Končni ozadji nimata besedila, zato ne zahtevata nameščenih pisav.

## Barve

Izmerjene barve veljajo za priloženi JPG, ki je stisnjen in ima teksturo ter zglajene robove. Niso izvirne oblikovalske ali tiskarske specifikacije. CMYK in Pantone nista določljiva brez izvornega dokumenta in ciljnega tiskarskega profila.

| Element | HEX | RGB |
| --- | --- | --- |
| Svetlo kremno ozadje, zgoraj levo | `#F5F1D8` | 245, 241, 216 |
| Svetlo kremno ozadje, spodaj na sredini | `#F3F1D8` | 243, 241, 216 |
| Temno rjav naslov | `#2D1C03` | 45, 28, 3 |
| Skoraj črno osrednje besedilo | `#2E2D29` | 46, 45, 41 |
| Temno rjav okrasni rob | `#42341C` | 66, 52, 28 |
| Temno modro-zelen plašč na prvotni mali podobi | `#0F343A` | 15, 52, 58 |

Za svetla polja je uporabljena mediana vzorčenega pravokotnika. Za naslov, besedilo in okvir je uporabljena mediana najtemnejših 10 % pikslov v izbranem območju. Koordinate in metode so v `barve.json`; izhodišče koordinat je zgornji levi vogal JPG. Barvni vtis: svetlo kremni pergament, temno rjave vitice in grozdi ter skoraj črno besedilo.

Na neposredni PNG pretvorbi PDF so dodatno izmerjeni naslednji vzorci. Zaradi senčenja, bleščanja kron in teksture so to reprezentativni vzorci iz navedenih območij, ne enotne barve celotnega motiva. Podrobnosti so v `barve_pdf.json`.

| Element na podobi iz PDF | HEX | RGB |
| --- | --- | --- |
| Temno ozadje | `#2C2A2A` | 44, 42, 42 |
| Zlata krona | `#B69868` | 182, 152, 104 |
| Koža obraza | `#E1C49D` | 225, 196, 157 |
| Modro-zelen plašč | `#455556` | 69, 85, 86 |
| Rdeča obleka | `#9F4030` | 159, 64, 48 |
| Rjavo-zlata senca plašča | `#7C502F` | 124, 80, 47 |

## Slike in razporeditev

Prvotni JPG ima razmerje 0,7461, A4 pa 0,7071. Predlogo je treba za A4 prilagoditi po višini in razporeditvi, ne zgolj raztegniti brez upoštevanja oblike motiva.

Okrasni okvir sestavljajo simetrične vitice vinske trte, listi in grozdi. Na vrhu sta navznoter obrnjeni okrasni veji; stranski vitici segata do spodnjih vogalov. Podoba Marije z Jezusom je v zgornji sredini v ozkem svetlem okvirju, približno na koordinatah x=130–252 in y=47–215 izvirnega JPG. Pod njo so naslov, imeni, štiri vrstice besedila ter kraj, datum in podpis na dnu.

PDF prikazuje drugačno podobo: kronana Marija in kronani Jezus, glavi blizu skupaj, Marijina rdeča obleka in modro-zelen plašč, temno ozadje ter zlate krone. V PDF ni berljivega besedila. Na podobi so vidni sledovi teksture, drobne temne poškodbe in fotografski šum; ti so del vhodne slike.

## Pretvorba PDF

- `../viri/Photo_2026-11-15_180405.png`: celotna stran PDF, neposredno upodobljena s Poppler `pdftoppm` pri 300 dpi; 463 × 721 pik. Razlika od velikosti vdelane slike je posledica velikosti strani in zaokroževanja pri upodabljanju.
- `../viri/pdf_vdelana_slika-000.jpg`: neposredno izvzeti izvirni JPEG iz PDF, brez ponovnega stiskanja JPEG.
- `../viri/Marija_iz_PDF_izvirnik.png`: PNG iz neposredno izvzetega JPEG, 464 × 720 pik. Pretvorba v PNG ne doda podrobnosti; ohrani dekodirane slikovne pike izvirnika.

Za podobo velikosti približno 67 × 104 mm na A4 je dejanska izvorna ločljivost približno 176 dpi. Končni 300-dpi izvoz strani ne more povrniti manjkajočih podrobnosti izvirne podobe.

## Priprava ozadij

Okvir in pergament sta rekonstruirana po JPG z vgrajenim orodjem `image_gen` po veščini `imagegen`. Uspešno uporabljeni poziv je v `prompt_blank.txt`, izvirni rezultat orodja pa v `../viri/ozadje_generirano.png` (1055 × 1491 pik). To je nova rekonstrukcija po vzoru izvirnika, ne vektorski izvoz istega okrasnega okvirja. Drobne poteze okraskov se zato razlikujejo od JPG. `prompt_main.txt` je ohranjen zapis začetnega neuspelega poskusa celotne kompozicije; ta poskus ni ustvaril končnega izdelka.

Končna A4 dokumenta sta sestavljena kot SVG in upodobljena s knjižnicama librsvg/Cairo. V dokument z Marijo je neposredno vključena datoteka `Marija_iz_PDF_izvirnik.png`, brez generativne spremembe motiva, retuše ali obrezovanja. Ohranjeno je njeno razmerje 464 : 720; podoba meri približno 67 × 103,97 mm, je vodoravno na sredini in se začne 27 mm od zgornjega roba. Dodan je tanek svetlo zlat okvir. Samostojna SVG dokumenta imata vgrajene slikovne datoteke in nista odvisna od zunanjih povezav. Sestavo je mogoče ponoviti z `python3 izhod/pripravi_a4.py` iz korena projekta.

Prva različica je ozadje brez besedila z zamenjano podobo iz PDF na vrhu. Druga različica ima samo pergament in okrasni okvir, tudi brez podobe. Namen obeh je poznejši vnos besedila. Končni tiskovni PNG je A4 pokončno, 2480 × 3508 pik, z zapisano gostoto 300 dpi (210 × 297 mm z običajnim zaokroževanjem na cele slikovne pike). To ni 3-mm različica z dodatkom za porezavo.

Predogleda obeh končnih izdelkov sta bila vizualno pregledana: besedila ni, okvir ni odrezan in zamenjana podoba je v zgornji sredini. Tehnične preveritve so v `preverjanje.txt`. Izhodni 300-dpi PNG je povečana upodobitev vhodnih rastrskih sestavin; zapis 300 dpi ne pomeni, da ima vsaka sestavina toliko izvornih podrobnosti.
