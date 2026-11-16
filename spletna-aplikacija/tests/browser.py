"""End-to-end checks against a running Firefox WebDriver and local server.

Start serve.py on :8000 and geckodriver on :4444, then run this file.
Only fictional recipient data is used. Results are saved outside tracked source.
"""
import base64
import json
from pathlib import Path
import subprocess
import tempfile
import time
import urllib.request

BASE = 'http://127.0.0.1:4444'
ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / 'test-results'
RESULTS.mkdir(exist_ok=True)
DOWNLOADS = Path(tempfile.mkdtemp(prefix='downloads-', dir=RESULTS))
FIREFOX = '/snap/firefox/8107/usr/lib/firefox/firefox'
session = None
checks = []


def call(method, path, data=None):
    raw = json.dumps(data).encode() if data is not None else None
    request = urllib.request.Request(BASE + path, data=raw, method=method, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            result = json.load(response)['value']
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode()) from error
    if isinstance(result, dict) and 'error' in result:
        raise RuntimeError(result)
    return result


def command(path, data=None, method='POST'):
    return call(method, f'/session/{session}' + path, data)


def js(script, *arguments):
    return command('/execute/sync', {'script': script, 'args': list(arguments)})


def wait(script, timeout=30):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if js(script):
            return
        time.sleep(.15)
    raise AssertionError(f'Browser condition timed out: {script}')


def fill(selector, text):
    js('const n=document.querySelector(arguments[0]);n.value=arguments[1];n.dispatchEvent(new Event("input",{bubbles:true}));', selector, text)


def screenshot(name):
    raw = command('/screenshot', method='GET')
    (RESULTS / name).write_bytes(base64.b64decode(raw))


try:
    response = call('POST', '/session', {'capabilities': {'alwaysMatch': {'browserName': 'firefox', 'moz:firefoxOptions': {
        'binary': FIREFOX, 'args': ['-headless'], 'prefs': {
            'browser.download.folderList': 2, 'browser.download.dir': str(DOWNLOADS),
            'browser.helperApps.neverAsk.saveToDisk': 'application/pdf', 'pdfjs.disabled': True,
            'browser.download.alwaysOpenPanel': False,
        }}}}})
    session = response['sessionId']
    command('/window/rect', {'width': 1440, 'height': 1300})
    command('/url', {'url': 'http://127.0.0.1:8000'})
    wait('return document.querySelector("#loading-message").hidden')
    assert js('return document.querySelector("#download").disabled')
    assert js('return document.querySelector("#recipient-count").textContent') == '0'
    checks.append('Prazna tabela: predogled ima nadomestno ime, prenos je onemogočen.')

    fill('#recipient-rows input', 'Ana in Janez Novak')
    js('document.querySelector("#add-recipient").click()')
    fill('#recipient-rows tr:nth-child(2) input', 'Marija in Jože Kovač')
    js('document.querySelector("#add-recipient").click()')
    wait('return document.querySelector("#recipient-count").textContent==="2" && !document.querySelector("#download").disabled')
    assert 'Ana in Janez Novak' in js('return document.querySelector("#preview").getAttribute("aria-label")')
    checks.append('Tabela: 2 izpolnjena prejemnika in prazna vrstica pomenijo 2 strani; predogled kaže prvega.')

    body = js('return document.querySelector("#body-text").value').replace('5. obletnico', '10. obletnico')
    footer = 'Črnomelj, 23. 11. 2026 | Janez Žakelj, župnik'
    fill('#body-text', body)
    fill('#footer-text', footer)
    wait('return !document.querySelector("#download").disabled')
    screenshot('desktop.png')
    raw = js('return document.querySelector("#preview").toDataURL("image/png").split(",")[1]')
    (RESULTS / 'preview.png').write_bytes(base64.b64decode(raw))

    js('document.querySelector("#download").click()')
    wait('return document.querySelector("#feedback").textContent.startsWith("PDF je pripravljen:")', 90)
    target = DOWNLOADS / 'plakete-crnomelj-2.pdf'
    deadline = time.monotonic() + 20
    while not target.exists() and time.monotonic() < deadline:
        time.sleep(.1)
    assert target.exists()
    info = subprocess.check_output(['pdfinfo', str(target)], text=True)
    assert 'Pages:           2' in info, info
    assert '595.276 x 841.89 pts (A4)' in info, info
    (RESULTS / 'pdfinfo.txt').write_text(info)
    subprocess.run(['pdftoppm', '-scale-to', '1200', '-png', str(target), str(RESULTS / 'pdf-page')], check=True)
    checks.append('Dejanski prenos: veljaven PDF z 2 A4 stranema, tudi pri šumnikih in spremenjenem besedilu.')

    from PIL import Image, ImageChops, ImageStat
    page1 = Image.open(RESULTS / 'pdf-page-1.png').convert('RGB')
    page2 = Image.open(RESULTS / 'pdf-page-2.png').convert('RGB')
    w, h = page1.size
    name_box = (round(w*.12), round(h*.57), round(w*.88), round(h*.64))
    assert ImageChops.difference(page1.crop(name_box), page2.crop(name_box)).getbbox()
    stable_box = (0, 0, w, round(h*.54))
    # JPEG encoders may select slightly different global compression tables
    # when only the recipient changes. The common area must remain equivalent.
    common_difference = ImageChops.difference(page1.crop(stable_box), page2.crop(stable_box))
    assert max(ImageStat.Stat(common_difference).mean) < .2
    checks.append('Strani PDF: območji prejemnikov se razlikujeta, zgornja podoba in naslov sta enaka.')

    command('/refresh', {})
    wait('return document.querySelector("#loading-message").hidden')
    assert js('return document.querySelector("#body-text").value') == body
    assert js('return document.querySelector("#footer-text").value') == footer
    assert js('return document.querySelector("#recipient-count").textContent') == '2'
    checks.append('Osnutek: imena, urejeno besedilo in podpis se ohranijo po osvežitvi.')

    fill('#body-text', '\n\n'.join(['Dolgo besedilo, ki se ne more prilegati.']*60))
    wait('return document.querySelector("#download").disabled && document.querySelector("#feedback").classList.contains("error")')
    fill('#body-text', body)
    wait('return !document.querySelector("#download").disabled')
    checks.append('Prelivanje: predolgo besedilo prepreči prenos in pokaže razumljivo napako; popravek znova omogoči prenos.')

    fill('#recipient-rows input', 'Ana Marija Novak in Janez Aleksander Kovač Novak')
    wait('return !document.querySelector("#download").disabled')
    fill('#recipient-rows input', '')
    wait('return document.querySelector("#preview").getAttribute("aria-label").includes("Marija in Jože Kovač")')
    checks.append('Daljše ime se prilagodi; prazne vrstice ne preprečijo prikaza prvega vpisanega prejemnika.')

    js('document.querySelector("#restore-text").click()')
    assert '5. obletnico' in js('return document.querySelector("#body-text").value')
    assert js('return document.querySelector("#recipient-rows tr:nth-child(2) input").value') == 'Marija in Jože Kovač'
    fill('#bulk-names', 'Mojca in Peter Zupan\r\nNina in\tMarko Kos')
    js('document.querySelector("#import-names").click()')
    wait('return document.querySelector("#recipient-count").textContent==="3"')
    assert js('return document.querySelector("#recipient-rows tr:nth-child(3) input").value') == 'Nina in Marko Kos'
    checks.append('Množični vnos: vrstice in stolpci iz preglednice se pravilno pretvorijo; povrnitev besedila ohrani prejemnike.')

    js('document.querySelectorAll("details").forEach(n=>n.open=true)')
    element = command('/element', {'using': 'css selector', 'value': '#script-font'})
    identifier = element['element-6066-11e4-a52e-4f735466cecf']
    command(f'/element/{identifier}/value', {'text': str(ROOT/'dist/assets/calligraphy.ttf')})
    wait('return document.querySelector("#script-font-status").textContent==="calligraphy.ttf"')
    wait('return !document.querySelector("#download").disabled')
    checks.append('Lastna pisava: datoteka TTF se naloži in uporabi v predogledu.')

    assert js('document.querySelector("#download").click();const active=!document.querySelector("#cancel-download").hidden;document.querySelector("#cancel-download").click();return active;')
    wait('return document.querySelector("#feedback").textContent.includes("preklicana")')
    assert not js('return document.querySelector(".editor").inert')
    checks.append('Preklic generiranja: prenos se ustavi in urejanje je spet na voljo.')

    js('document.querySelectorAll("details").forEach(n=>n.open=false)')
    # Firefox desktop imposes a minimum outer-window width. A same-origin
    # iframe provides an actual 390px viewport, including media queries.
    command('/url', {'url': 'about:blank'})
    js('document.body.style.margin="0";const f=document.createElement("iframe");f.src="http://127.0.0.1:8000";f.style="width:390px;height:844px;border:0;display:block";document.body.append(f);')
    iframe = command('/element', {'using': 'css selector', 'value': 'iframe'})
    command('/frame', {'id': iframe})
    wait('return document.querySelector("#loading-message")?.hidden')
    assert js('return innerWidth') == 390
    assert js('return document.documentElement.scrollWidth<=innerWidth'), js('return [document.documentElement.scrollWidth,innerWidth]')
    if js('return document.querySelector("#recipient-count").textContent') == '0':
        fill('#recipient-rows input', 'Ana in Janez Novak')
        wait('return !document.querySelector("#download").disabled')
    command('/frame', {'id': None})
    iframe_id = iframe['element-6066-11e4-a52e-4f735466cecf']
    raw = command(f'/element/{iframe_id}/screenshot', method='GET')
    (RESULTS/'mobile.png').write_bytes(base64.b64decode(raw))
    command('/frame', {'id': iframe})
    checks.append('Mobilni pogled pri širini 390 px: brez vodoravnega prelivanja; obrazec in predogled sta dostopna.')

    print('\n'.join('OK: '+item for item in checks))
    (RESULTS/'preverjanje.txt').write_text('\n'.join('OK: '+item for item in checks)+'\n')
finally:
    if session:
        call('DELETE', f'/session/{session}')
