"""Sestavi A4 dokumenta iz ozadja in nespremenjene podobe iz PDF.

Zagon iz korena projekta: python3 izhod/pripravi_a4.py
Odvisnosti: Pillow ter sistemski knjižnici librsvg in Cairo.
Generirano ozadje je vhodna grafična sestavina, ne rezultat tega skripta.
"""

from pathlib import Path
import base64
import json
import ctypes as ct
import ctypes.util

from PIL import Image


class Rectangle(ct.Structure):
    _fields_ = [(key, ct.c_double) for key in ("x", "y", "width", "height")]


def bind(library, name, arguments, result):
    function = getattr(library, name)
    function.argtypes = arguments
    function.restype = result
    return function


RSVG = ct.CDLL(ctypes.util.find_library("rsvg-2"))
CAIRO = ct.CDLL(ctypes.util.find_library("cairo"))
GOBJECT = ct.CDLL(ctypes.util.find_library("gobject-2.0"))
new_svg = bind(RSVG, "rsvg_handle_new_from_data", [ct.c_char_p, ct.c_size_t, ct.c_void_p], ct.c_void_p)
render_svg = bind(RSVG, "rsvg_handle_render_document", [ct.c_void_p, ct.c_void_p, ct.POINTER(Rectangle), ct.c_void_p], ct.c_int)
new_surface = bind(CAIRO, "cairo_image_surface_create", [ct.c_int, ct.c_int, ct.c_int], ct.c_void_p)
new_context = bind(CAIRO, "cairo_create", [ct.c_void_p], ct.c_void_p)
write_png = bind(CAIRO, "cairo_surface_write_to_png", [ct.c_void_p, ct.c_char_p], ct.c_int)
destroy_context = bind(CAIRO, "cairo_destroy", [ct.c_void_p], None)
destroy_surface = bind(CAIRO, "cairo_surface_destroy", [ct.c_void_p], None)
unref = bind(GOBJECT, "g_object_unref", [ct.c_void_p], None)

ROOT = Path(__file__).resolve().parent
WIDTH, HEIGHT = 2480, 3508


def data_uri(path):
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def document(painting=False):
    background = data_uri(ROOT / "viri/ozadje_generirano.png")
    elements = [f'<image x="0" y="0" width="210" height="297" preserveAspectRatio="none" href="{background}" xlink:href="{background}"/>']
    if painting:
        original = data_uri(ROOT / "viri/Marija_iz_PDF_izvirnik.png")
        picture_width = 67
        picture_height = picture_width * 720 / 464
        x, y = (210 - picture_width) / 2, 27
        elements.append(f'<rect x="{x-0.7}" y="{y-0.7}" width="{picture_width+1.4}" height="{picture_height+1.4}" fill="#F5F1D8" stroke="#BCAF86" stroke-width="0.3"/>')
        elements.append(f'<image x="{x}" y="{y}" width="{picture_width}" height="{picture_height}" preserveAspectRatio="xMidYMid meet" href="{original}" xlink:href="{original}"/>')
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="210mm" height="297mm" viewBox="0 0 210 297">\n'
            + "\n".join(elements) + "\n</svg>\n")


def render(name, svg):
    svg_path = ROOT / f"{name}.svg"
    svg_path.write_text(svg, encoding="utf-8")
    source = svg.encode("utf-8")
    handle = new_svg(source, len(source), None)
    if not handle:
        raise RuntimeError(f"Branje SVG ni uspelo: {name}")
    surface = new_surface(0, WIDTH, HEIGHT)
    context = new_context(surface)
    viewport = Rectangle(0, 0, WIDTH, HEIGHT)
    png_path = ROOT / f"{name}.png"
    try:
        if not render_svg(handle, context, ct.byref(viewport), None):
            raise RuntimeError(f"Upodabljanje ni uspelo: {name}")
        if write_png(surface, str(png_path).encode()) != 0:
            raise RuntimeError(f"Zapis PNG ni uspel: {name}")
    finally:
        destroy_context(context)
        destroy_surface(surface)
        unref(handle)
    # Samo zapis gostote tiskanja in barvnega načina, brez retuširanja.
    with Image.open(png_path) as image:
        image.convert("RGB").save(png_path, dpi=(300, 300))
    with Image.open(png_path) as image:
        image.thumbnail((620, 877), Image.Resampling.LANCZOS)
        image.save(ROOT / "predogledi" / f"{name}_predogled.png")
    return {"datoteka": png_path.name, "sirina_px": WIDTH, "visina_px": HEIGHT,
            "dpi": 300, "format": "A4, pokončno", "besedilo": False,
            "podoba_iz_pdf": name.endswith("z_Marijo")}


if __name__ == "__main__":
    result = [render("A4_samo_ozadje", document()),
              render("A4_ozadje_z_Marijo", document(painting=True))]
    (ROOT / "analiza/izhodne_datoteke.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
