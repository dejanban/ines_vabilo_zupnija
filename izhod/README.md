# Pripravljene datoteke

Glavna datoteka je [A4_ozadje_z_Marijo.png](A4_ozadje_z_Marijo.png): A4 pokončno, 2480 × 3508 pik, 300 dpi, brez besedila, z okvirjem in podobo neposredno iz PDF.

- [A4_samo_ozadje.png](A4_samo_ozadje.png): samo kremno ozadje in okrasni okvir, brez besedila in podobe.
- [A4_belo_ozadje_z_Marijo.png](A4_belo_ozadje_z_Marijo.png): belo ozadje z ohranjenim okrasnim okvirjem in izvirno Marijino podobo, A4, 300 dpi. Na voljo sta tudi [predogled](predogledi/A4_belo_ozadje_z_Marijo_predogled.png) in [samostojni SVG](A4_belo_ozadje_z_Marijo.svg). Bela podlaga je pripravljena s filtrom obstoječega ozadja v SVG, brez generativnih sprememb Marijine podobe. Ponovna priprava: `python3 izhod/pripravi_a4.py`.
- [PNG celotne strani PDF](viri/Photo_2026-11-15_180405.png): neposredna pretvorba pri 300 dpi.
- [Izvirna podoba iz PDF kot PNG](viri/Marija_iz_PDF_izvirnik.png): 464 × 720 pik, brez generativnih sprememb.
- [Celoten pregled](analiza/pregled.md): prepis besedila, ocena pisav, barve HEX/RGB, razporeditev in tehnični podatki.
- [Besedilo za kopiranje](analiza/besedilo_plakete.txt).
- [Uporabljeni poziv za image_gen](analiza/prompt_blank.txt): rekonstrukcija okvirja in pergamenta po JPG. Končna podoba iz PDF je vgrajena neposredno v SVG.
- [Preverjanje rezultatov](analiza/preverjanje.txt).

Različici [z Marijo](A4_ozadje_z_Marijo.svg) in [samo z ozadjem](A4_samo_ozadje.svg) sta na voljo tudi kot samostojna A4 dokumenta SVG za poznejšo postavitev. Vse slikovne sestavine so vgrajene v dokumenta.

Pisave so vizualno ocenjene, ker izvirna plaketa obstaja samo kot majhen JPG. Najbližji oceni sta Times New Roman za naslov in glavno besedilo ter Monotype Corsiva za imeni. Točne pisave iz teh datotek ni mogoče potrditi. Barve so vzorčene iz predloženih slik. Okvir je nova rekonstrukcija po vzoru izvirnika; podoba iz PDF ostaja izvirna.

Pri tiskanju izberi A4 in dejansko velikost oziroma 100 %. Izvirne vhodne datoteke v korenu projekta so ohranjene.
