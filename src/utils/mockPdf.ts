// ─────────────────────────────────────────────────────────────────────────────
// Генерация простого .pdf для демонстрации скачивания (заключения проверок).
// Содержимое не важно — нужен валидный PDF-файл, открывающийся в просмотрщике.
// Текст — ASCII/латиница (стандартный шрифт Helvetica не покрывает кириллицу).
// Без внешних зависимостей: PDF собирается вручную.
// ─────────────────────────────────────────────────────────────────────────────

function escapePdfText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/** Собрать минимальный одностраничный PDF из строк текста. */
function buildPdf(lines: string[]): Blob {
  const content = lines
    .map((l, i) => `BT /F1 ${i === 0 ? 16 : 11} Tf 72 ${780 - i * 24} Td (${escapePdfText(l)}) Tj ET`)
    .join('\n');

  const objs = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>',
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
    `<</Length ${content.length}>>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

/** Сгенерировать и скачать простой PDF. */
export function downloadMockPdf(fileName: string, lines: string[]): void {
  const blob = buildPdf(lines);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
