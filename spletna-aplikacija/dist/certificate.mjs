export const DEFAULT_BODY = 'Plaketo podeljuje Župnija Črnomelj\nza 5. obletnico poroke.\n\nHvala za vajino zvestobo, ljubezen in pričevanje.\n\nNaj Gospod še naprej spremlja vajino pot.';
export const DEFAULT_FOOTER = 'Črnomelj, 22. 11. 2026 | Janez Žakelj, župnik';
export const PLACEHOLDER = '[Ime in Priimek jubilantov]';
export const COLORS = { title: '#2D1C03', body: '#2E2D29', name: '#161B1A', footer: '#2E2D29' };
export const DEFAULT_FONTS = { serif: '"Times New Roman", CertificateSerif', script: '"Monotype Corsiva", CertificateScript' };

export function getRecipients(rows) {
  return rows.map(value => value.replace(/[\r\n\t]+/g, ' ').trim()).filter(Boolean);
}

export function parseRecipients(value) {
  return value.split(/\r\n|\n|\r/).map(line => line.split('\t').map(x => x.trim()).filter(Boolean).join(' ')).filter(Boolean);
}

function setFont(context, size, family, bold = false) {
  context.font = `${bold ? '700' : '400'} ${size}px ${family}`;
}

function wrapLine(context, line, maxWidth) {
  const words = line.trim().split(/\s+/u);
  const lines = [];
  let current = '';
  for (const word of words) {
    if (!word) continue;
    const joined = current ? `${current} ${word}` : word;
    if (context.measureText(joined).width <= maxWidth) { current = joined; continue; }
    if (current) { lines.push(current); current = ''; }
    if (context.measureText(word).width <= maxWidth) { current = word; continue; }
    // Even a single long unbroken word must stay inside the decorative border.
    let fragment = '';
    for (const letter of word) {
      if (fragment && context.measureText(fragment + letter).width > maxWidth) { lines.push(fragment); fragment = ''; }
      fragment += letter;
    }
    current = fragment;
  }
  if (current) lines.push(current);
  return lines;
}

function bodyLayout(context, text, size, family) {
  setFont(context, size, family);
  const paragraphs = text.trim().split(/\n\s*\n/u);
  const lineHeight = size * (17 / 14.3);
  const gap = size * (5 / 14.3);
  const lines = [];
  let y = 0;
  for (const paragraph of paragraphs) {
    const explicitLines = paragraph.split('\n');
    for (const explicit of explicitLines) {
      for (const line of wrapLine(context, explicit, 286)) { lines.push({ text: line, y }); y += lineHeight; }
    }
    y += gap;
  }
  return { lines, height: lines.length ? y - gap - lineHeight + size : 0 };
}

export function drawCertificate(canvas, state, recipient, background, fonts = DEFAULT_FONTS) {
  const context = canvas.getContext('2d', { alpha: false });
  context.setTransform(canvas.width / 382, 0, 0, canvas.height / 512, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(background, 0, 0, 382, 512);
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  const title = ['PLAKETA ZA', 'OBLETNICO POROKE'];
  setFont(context, 18.5, fonts.serif, true);
  context.fillStyle = COLORS.title;
  title.forEach((line, i) => context.fillText(line, 191, 255 + i * 26));

  const name = recipient || PLACEHOLDER;
  let nameSize = 28;
  setFont(context, nameSize, fonts.script);
  while (context.measureText(name).width > 282 && nameSize > 12) { nameSize -= .25; setFont(context, nameSize, fonts.script); }
  if (context.measureText(name).width > 282) throw new Error('Ime prejemnika je predolgo. Skrajšaj ga, da bo ostalo berljivo.');
  context.fillStyle = COLORS.name;
  context.fillText(name, 191, 317);

  let bodySize = 14.3;
  let body = bodyLayout(context, state.body, bodySize, fonts.serif);
  while (body.height > 78 && bodySize > 9) { bodySize -= .2; body = bodyLayout(context, state.body, bodySize, fonts.serif); }
  if (body.height > 78) throw new Error('Spodnje besedilo je predolgo za plaketo. Skrajšaj ga ali odstrani nekaj prelomov vrstic.');
  setFont(context, bodySize, fonts.serif);
  context.fillStyle = COLORS.body;
  body.lines.forEach(line => context.fillText(line.text, 191, 345 + line.y));

  const footer = state.footer.replace(/\s+/gu, ' ').trim();
  let footerSize = 12.5;
  setFont(context, footerSize, fonts.serif);
  while (context.measureText(footer).width > 272 && footerSize > 9) { footerSize -= .2; setFont(context, footerSize, fonts.serif); }
  const footerLines = wrapLine(context, footer, 272);
  if (footerLines.length > 2) throw new Error('Kraj, datum in podpis so predolgi. Uporabi največ dve kratki vrstici.');
  context.fillStyle = COLORS.footer;
  footerLines.forEach((line, i) => context.fillText(line, 191, (footerLines.length > 1 ? 462 : 470) + i * 13));
  return { nameSize, bodySize, footerSize, bodyLines: body.lines.length };
}
