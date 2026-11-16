import { DEFAULT_BODY, DEFAULT_FOOTER, DEFAULT_FONTS, PLACEHOLDER, getRecipients, parseRecipients, drawCertificate } from './certificate.mjs';
import { buildPdf } from './pdf.mjs';

const $ = selector => document.querySelector(selector);
const STORAGE_KEY = 'crnomelj-plakete-v1';
const defaults = () => ({ recipients: [''], body: DEFAULT_BODY, footer: DEFAULT_FOOTER });
let state = defaults();
let storageAvailable = true;
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (stored && Array.isArray(stored.recipients) && stored.recipients.every(value => typeof value === 'string') && typeof stored.body === 'string' && typeof stored.footer === 'string') {
    state = { recipients: stored.recipients.length ? stored.recipients : [''], body: stored.body, footer: stored.footer };
  }
} catch { storageAvailable = false; }

const fonts = { ...DEFAULT_FONTS };
let background;
let ready = false;
let previewValid = false;
let frame;
let exportController;
let fontLoading = false;

function feedback(message = '', error = false) {
  const node = $('#feedback');
  node.textContent = message;
  node.classList.toggle('error', error);
  node.setAttribute('role', error ? 'alert' : 'status');
}

function persist() {
  if (storageAvailable) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { storageAvailable = false; }
  }
  $('#save-status').textContent = storageAvailable ? 'Shranjeno v tem brskalniku.' : 'Osnutek je na voljo do zaprtja strani.';
}

function updateSummary() {
  const recipients = getRecipients(state.recipients);
  const count = recipients.length;
  $('#recipient-count').textContent = String(count);
  $('#preview-counter').textContent = count ? `1 / ${count} · prvi prejemnik` : 'Prvi prejemnik';
  $('#download-summary').textContent = count === 0 ? 'Dodaj prvega prejemnika' : `${count} ${count === 1 ? 'plaketa' : count === 2 ? 'plaketi' : count === 3 || count === 4 ? 'plakete' : 'plaket'} v enem PDF-ju`;
  $('#download').disabled = !ready || !previewValid || !count || !!exportController || fontLoading;
  $('#preview').setAttribute('aria-label', `Predogled A4 plakete za ${recipients[0] || 'prvega prejemnika'}`);
}

function renderPreview() {
  if (!ready) { updateSummary(); return; }
  try {
    drawCertificate($('#preview'), state, getRecipients(state.recipients)[0] || PLACEHOLDER, background, fonts);
    previewValid = true;
    if ($('#feedback').dataset.layoutError) { feedback(); delete $('#feedback').dataset.layoutError; }
  } catch (error) {
    previewValid = false;
    feedback(error.message, true);
    $('#feedback').dataset.layoutError = 'true';
  }
  updateSummary();
}

function changed() {
  previewValid = false;
  updateSummary();
  persist();
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(renderPreview);
}

function renderRows(focusIndex) {
  const fragment = document.createDocumentFragment();
  state.recipients.forEach((name, index) => {
    const row = document.createElement('tr');
    const number = document.createElement('td'); number.textContent = String(index + 1);
    const field = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text'; input.value = name; input.maxLength = 180;
    input.placeholder = index === 0 ? 'npr. Ana in Janez Novak' : 'Ime in priimek jubilantov';
    input.setAttribute('aria-label', `Prejemnik ${index + 1}`);
    input.autocomplete = 'off';
    input.addEventListener('input', () => { state.recipients[index] = input.value; changed(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); state.recipients.splice(index + 1, 0, ''); renderRows(index + 1); changed(); }
    });
    input.addEventListener('paste', event => {
      const value = event.clipboardData?.getData('text');
      if (!value || !/[\r\n\t]/u.test(value)) return;
      event.preventDefault();
      const names = parseRecipients(value);
      if (!names.length) return;
      state.recipients.splice(index, state.recipients[index].trim() ? 0 : 1, ...names);
      renderRows(index); changed();
    });
    field.append(input);
    const action = document.createElement('td');
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'remove-recipient'; remove.textContent = '×';
    remove.setAttribute('aria-label', `Odstrani prejemnika ${index + 1}`);
    remove.addEventListener('click', () => {
      state.recipients.splice(index, 1);
      if (!state.recipients.length) state.recipients.push('');
      renderRows(Math.min(index, state.recipients.length - 1)); changed();
    });
    action.append(remove); row.append(number, field, action); fragment.append(row);
  });
  $('#recipient-rows').replaceChildren(fragment);
  if (focusIndex !== undefined) $('#recipient-rows').querySelectorAll('input')[focusIndex]?.focus();
}

$('#body-text').value = state.body;
$('#footer-text').value = state.footer;
$('#body-text').addEventListener('input', event => { state.body = event.target.value; changed(); });
$('#footer-text').addEventListener('input', event => { state.footer = event.target.value; changed(); });
$('#add-recipient').addEventListener('click', () => { state.recipients.push(''); renderRows(state.recipients.length - 1); changed(); });
$('#import-names').addEventListener('click', () => {
  const names = parseRecipients($('#bulk-names').value);
  if (!names.length) { feedback('Najprej vpiši ali prilepi vsaj enega prejemnika.', true); $('#bulk-names').focus(); return; }
  state.recipients = [...getRecipients(state.recipients), ...names];
  $('#bulk-names').value = ''; renderRows(); changed(); feedback('Prejemniki so dodani na seznam.');
});
$('#restore-text').addEventListener('click', () => {
  state.body = DEFAULT_BODY; state.footer = DEFAULT_FOOTER;
  $('#body-text').value = state.body; $('#footer-text').value = state.footer;
  changed(); feedback('Povrnjena sta izvirno besedilo in podpis. Prejemniki so ohranjeni.');
});

async function uploadFont(event, kind) {
  const file = event.target.files?.[0];
  if (!file) return;
  const previousFont = fonts[kind];
  fontLoading = true; updateSummary();
  try {
    if (file.size > 8 * 1024 * 1024) throw new Error('Izberi datoteko pisave, manjšo od 8 MB.');
    const family = `Uploaded${kind}${Date.now()}`;
    const face = await new FontFace(family, await file.arrayBuffer()).load();
    document.fonts.add(face);
    fonts[kind] = `"${family}"`;
    $(`#${kind}-font-status`).textContent = file.name;
    feedback('Pisava je naložena. Predogled in PDF uporabljata isto pisavo.');
  } catch {
    fonts[kind] = previousFont;
    feedback('Pisave ni bilo mogoče naložiti. Izberi veljavno datoteko TTF, OTF, WOFF ali WOFF2, manjšo od 8 MB.', true);
    event.target.value = '';
  } finally { fontLoading = false; renderPreview(); }
}
$('#serif-font').addEventListener('change', event => uploadFont(event, 'serif'));
$('#script-font').addEventListener('change', event => uploadFont(event, 'script'));

const nextPaint = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
function jpegBytes(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob(async blob => {
    try {
      if (!blob) throw new Error('Slikovne strani ni bilo mogoče pripraviti.');
      resolve(new Uint8Array(await blob.arrayBuffer()));
    } catch (error) { reject(error); }
  }, 'image/jpeg', .97));
}

$('#cancel-download').addEventListener('click', () => exportController?.abort());
$('#download').addEventListener('click', async () => {
  if (!ready || exportController || !previewValid || fontLoading) return;
  const recipients = getRecipients(state.recipients);
  if (!recipients.length) { feedback('Dodaj vsaj enega prejemnika.', true); return; }
  const snapshot = { body: state.body, footer: state.footer };
  const exportFonts = { ...fonts };
  exportController = new AbortController();
  const signal = exportController.signal;
  $('#cancel-download').hidden = false;
  $('.editor').inert = true;
  $('#download').setAttribute('aria-busy', 'true');
  updateSummary();
  const canvas = document.createElement('canvas'); canvas.width = 2480; canvas.height = 3508;
  const pages = [];
  let currentPage = 0;
  try {
    await document.fonts.ready;
    for (const recipient of recipients) {
      signal.throwIfAborted();
      currentPage++;
      feedback(`Pripravljam PDF: ${currentPage} / ${recipients.length} …`);
      await nextPaint();
      drawCertificate(canvas, snapshot, recipient, background, exportFonts);
      pages.push(await jpegBytes(canvas));
    }
    signal.throwIfAborted();
    const pdf = buildPdf(pages);
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = url; link.download = `plakete-crnomelj-${recipients.length}.pdf`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    feedback(`PDF je pripravljen: ${recipients.length} ${recipients.length === 1 ? 'stran' : 'strani'}.`);
  } catch (error) {
    if (signal.aborted) feedback('Priprava PDF-ja je preklicana. Seznam prejemnikov je ohranjen.');
    else feedback(`PDF ni bil prenesen${currentPage ? ` (stran ${currentPage})` : ''}. ${error.message || 'Poskusi znova.'}`, true);
  } finally {
    exportController = undefined;
    $('.editor').inert = false;
    $('#cancel-download').hidden = true;
    $('#download').removeAttribute('aria-busy');
    canvas.width = 1; canvas.height = 1;
    updateSummary();
  }
});

async function initialize() {
  renderRows(); updateSummary(); persist();
  try {
    background = new Image();
    background.src = new URL('./assets/ozadje.svg', import.meta.url).href;
    await Promise.all([
      background.decode(),
      document.fonts.load('400 14px CertificateSerif'),
      document.fonts.load('700 19px CertificateSerif'),
      document.fonts.load('400 28px CertificateScript'),
    ]);
    await document.fonts.ready;
    ready = true;
    $('#loading-message').hidden = true;
    renderPreview();
  } catch {
    $('#loading-message').textContent = 'Predloge ni bilo mogoče naložiti.';
    feedback('Predloge ali pisav ni bilo mogoče naložiti. Osveži stran. Če aplikacijo uporabljaš lokalno, jo odpri prek priloženega strežnika.', true);
  }
}

initialize();
