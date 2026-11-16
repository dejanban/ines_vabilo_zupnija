import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { getRecipients, parseRecipients } from '../dist/certificate.mjs';
import { buildPdf } from '../dist/pdf.mjs';

test('seznam ohrani vrstni red, šumnike in podvojena imena, prazne vrstice izpusti', () => {
  assert.deepEqual(getRecipients([' ', ' Ana in Janez Novak ', '', 'Jože Žagar', 'Jože Žagar']), ['Ana in Janez Novak', 'Jože Žagar', 'Jože Žagar']);
});

test('lepljenje iz preglednice združi stolpce in podpira različne prelome vrstic', () => {
  assert.deepEqual(parseRecipients('Ana\tin Janez Novak\r\n\r\nMarija in\tJože Kovač\rNina in Marko Kos\n'), ['Ana in Janez Novak', 'Marija in Jože Kovač', 'Nina in Marko Kos']);
});

test('PDF brez prejemnikov je zavrnjen', () => {
  assert.throws(() => buildPdf([]), /vsaj en prejemnik/);
});

test('neodvisni PDF razčlenjevalnik prepozna več A4 strani in vse vdelane slike', async () => {
  const jpeg = new Uint8Array(readFileSync(new URL('../dist/assets/izvirna-predloga.jpg', import.meta.url)));
  const pdf = buildPdf([jpeg, jpeg, jpeg], 382, 512);
  const folder = mkdtempSync(path.join(tmpdir(), 'plakete-pdf-'));
  try {
    const filename = path.join(folder, 'preverjanje.pdf');
    writeFileSync(filename, Buffer.from(await pdf.arrayBuffer()));
    const info = execFileSync('pdfinfo', [filename], { encoding: 'utf8' });
    assert.match(info, /Pages:\s+3/);
    assert.match(info, /595\.276 x 841\.89 pts \(A4\)/);
    const images = execFileSync('pdfimages', ['-list', filename], { encoding: 'utf8' });
    assert.equal(images.split('\n').filter(line => /\simage\s+382\s+512\s/.test(line)).length, 3);
    const bytes = new Uint8Array(await pdf.arrayBuffer());
    const text = new TextDecoder('latin1').decode(bytes);
    const xref = Number(text.match(/startxref\n(\d+)/)[1]);
    assert.equal(new TextDecoder().decode(bytes.slice(xref, xref + 4)), 'xref');
  } finally { rmSync(folder, { recursive: true, force: true }); }
});
