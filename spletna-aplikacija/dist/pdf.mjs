// A4 PDF writer. Images are rendered by the same canvas code as the preview.
// No recipient data leaves the browser and no third-party runtime is needed.
const encoder = new TextEncoder();

export function buildPdf(pages, width = 2480, height = 3508) {
  if (!pages.length) throw new Error('Za PDF je potreben vsaj en prejemnik.');
  const chunks = [];
  const offsets = [0];
  let position = 0;
  const append = value => {
    const bytes = typeof value === 'string' ? encoder.encode(value) : value;
    chunks.push(bytes);
    position += bytes.byteLength;
  };
  const object = (id, content) => {
    offsets[id] = position;
    append(`${id} 0 obj\n${content}\nendobj\n`);
  };
  append('%PDF-1.4\n% Certificate document\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>`);
  pages.forEach((bytes, index) => {
    const pageId = 3 + index * 3;
    object(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.275591 841.889764] /Resources << /XObject << /Image ${pageId + 1} 0 R >> >> /Contents ${pageId + 2} 0 R >>`);
    offsets[pageId + 1] = position;
    append(`${pageId + 1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.byteLength} >>\nstream\n`);
    append(bytes);
    append('\nendstream\nendobj\n');
    const drawing = 'q\n595.275591 0 0 841.889764 0 0 cm\n/Image Do\nQ\n';
    object(pageId + 2, `<< /Length ${encoder.encode(drawing).byteLength} >>\nstream\n${drawing}endstream`);
  });
  const startXref = position;
  const count = 3 + pages.length * 3;
  append(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let i = 1; i < count; i++) append(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  append(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);
  return new Blob(chunks, { type: 'application/pdf' });
}
