// ─────────────────────────────────────────────────────────────────────────────
// Генерация документа «Предложение о трудоустройстве» в формате .docx.
//
// Структура и оформление точно воспроизводят эталонный файл
// «Предложение_о_работе_job_offer заполненный.docx»:
//   • весь текст — Times New Roman 11 pt (sz=22), цвет чёрный;
//   • шапка по центру: «ООО «Эко-Меню»» (жирный курсив) + «ПРЕДЛОЖЕНИЕ О
//     ТРУДОУСТРОЙСТВЕ»;
//   • тело письма по ширине (justify), одинарный интервал;
//   • обязанности и условия работы — маркированные списки (тире с втяжкой);
//   • подпись: должность менеджера + ФИО + дата.
//
// Данные подставляются из заполненной формы оффера и контекста системы
// (кандидат, должность, отдел, договор, зарплата, график, дата выхода), а
// контакты и ФИО менеджера — из текущего пользователя.
//
// Пакет .docx собирается минимальным ZIP-райтером (метод STORE, без сжатия) —
// валидный для Word контейнер без внешних зависимостей.
// ─────────────────────────────────────────────────────────────────────────────

export interface OfferDocData {
  candidateName: string;
  position: string;
  department: string;
  contractType: string;
  salary: string; // сырое значение, напр. "120000"
  startDate: string; // дд.мм.гггг
  workSchedule: string;
  responsibilities: string;
  workConditions: string;
  managerRole: string;
  managerName: string; // короткое «Петрова М.И.»
  managerEmail: string;
  managerPhone: string;
  letterDate: string; // дд.мм.гггг
  validUntil: string; // дд.мм.гггг
}

/** Экранирование спецсимволов XML. */
function esc(s: string): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const FONT = '<w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>';
const SZ = '<w:sz w:val="22"/><w:szCs w:val="22"/>';
const COLOR = '<w:color w:val="000000"/>';
const SPACING = '<w:spacing w:line="240" w:lineRule="auto"/>';

interface RunOpts {
  bold?: boolean;
  italic?: boolean;
}

/** Текстовый run с нужным начертанием. */
function run(text: string, opts: RunOpts = {}): string {
  const rPr =
    FONT +
    (opts.bold ? '<w:b/><w:bCs/>' : '') +
    (opts.italic ? '<w:i/><w:iCs/>' : '') +
    COLOR +
    SZ;
  return `<w:r><w:rPr>${rPr}</w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

/** Обычный абзац тела письма. */
function para(jc: string, runsXml: string): string {
  const jcXml = jc ? `<w:jc w:val="${jc}"/>` : '';
  return `<w:p><w:pPr>${SPACING}${jcXml}<w:rPr>${FONT}${COLOR}${SZ}</w:rPr></w:pPr>${runsXml}</w:p>`;
}

/** Пустой абзац-отступ. */
function spacer(): string {
  return `<w:p><w:pPr>${SPACING}<w:jc w:val="both"/><w:rPr>${FONT}${COLOR}${SZ}</w:rPr></w:pPr></w:p>`;
}

/** Маркированный пункт списка (тире + втяжка). */
function bullet(runsXml: string): string {
  return (
    `<w:p><w:pPr>${SPACING}` +
    `<w:tabs><w:tab w:val="left" w:pos="426"/></w:tabs>` +
    `<w:ind w:left="426" w:hanging="426"/><w:jc w:val="both"/>` +
    `<w:rPr>${FONT}${COLOR}${SZ}</w:rPr></w:pPr>` +
    run('–\t') +
    runsXml +
    `</w:p>`
  );
}

/** Разбить свободный текст поля на пункты списка. */
function splitItems(text: string): string[] {
  const t = (text ?? '').trim();
  if (!t) return [];
  let parts = t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) {
    parts = t.split(/(?<=[.;])\s+/).map((s) => s.trim()).filter(Boolean);
  }
  return parts.map((s) => s.replace(/[.;]+\s*$/, '').trim()).filter(Boolean);
}

/** Группировка разрядов числа неразрывными пробелами: 120000 → 120 000. */
function groupThousands(salary: string): string {
  const digits = (salary ?? '').replace(/\D/g, '');
  if (!digits) return (salary ?? '').trim() || '—';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function buildDocumentXml(d: OfferDocData): string {
  const respItems = splitItems(d.responsibilities);
  const condItems = splitItems(d.workConditions);

  // Обязанности: последний пункт с точкой, остальные с «;».
  const respBullets = respItems
    .map((item, i) => bullet(run(item + (i === respItems.length - 1 ? '.' : ';'))))
    .join('');

  // Условия: первым пунктом — оклад (с жирным курсивом суммы), далее поля формы.
  const salaryBullet = bullet(
    run('оклад в размере ') +
      run(groupThousands(d.salary), { bold: true, italic: true }) +
      run(' рублей до уплаты налогов;'),
  );
  const condBullets =
    salaryBullet +
    condItems
      .map((item, i) => bullet(run(item + (i === condItems.length - 1 ? '.' : ';'))))
      .join('');

  const body =
    para('center', run('ООО «Эко-Меню»', { bold: true, italic: true })) +
    spacer() +
    para('center', run('ПРЕДЛОЖЕНИЕ О ТРУДОУСТРОЙСТВЕ')) +
    spacer() +
    para('both', run('Уважаемый(ая) ') + run(d.candidateName) + run('!')) +
    spacer() +
    para(
      'both',
      run('Компания ') +
        run('ООО «Эко-Меню»', { bold: true, italic: true }) +
        run(' рада сделать вам предложение о трудоустройстве на должности ') +
        run(d.position, { bold: true, italic: true }) +
        run('.'),
    ) +
    spacer() +
    para('both', run('Вы будете работать в отделе ') + run(d.department, { bold: true }) + run('.')) +
    para('both', run('Тип договора: ') + run(d.contractType, { bold: true }) + run('.')) +
    spacer() +
    para('both', run('В круг ваших обязанностей будет входить:')) +
    respBullets +
    spacer() +
    para('both', run('Условия работы включают в себя:')) +
    condBullets +
    spacer() +
    para(
      'both',
      run('График работы для данной позиции: ') +
        run(d.workSchedule, { bold: true, italic: true }) +
        run('.'),
    ) +
    spacer() +
    para('both', run('Дата вашего выхода на работу ') + run(d.startDate + '.', { bold: true })) +
    spacer() +
    para('both', run('Наше предложение актуально до ') + run(d.validUntil, { bold: true }) + run('.')) +
    spacer() +
    para(
      'both',
      run('Если нужно задать уточняющие вопросы — пишите на почту ') +
        run(d.managerEmail) +
        run(' или звоните по телефону ') +
        run(d.managerPhone, { bold: true }) +
        run('.'),
    ) +
    spacer() +
    spacer() +
    para(
      'both',
      run(d.managerRole, { bold: true }) +
        run('\t') +
        run('___________________________', { bold: true }) +
        run(' (', { bold: true }) +
        run(d.managerName, { bold: true }) +
        run(')', { bold: true }) +
        run('\t') +
        run(d.letterDate, { bold: true, italic: true }),
      // ^ дата в подписи: жирный курсив, как в эталоне
    ) +
    `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>` +
    `<w:pgMar w:top="1134" w:right="1314" w:bottom="1134" w:left="1314" w:header="708" w:footer="708" w:gutter="0"/>` +
    `<w:cols w:space="1701"/><w:docGrid w:linePitch="360"/></w:sectPr>`;

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `<w:body>${body}</w:body></w:document>`
  );
}

const CONTENT_TYPES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
  `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
  `<Default Extension="xml" ContentType="application/xml"/>` +
  `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
  `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
  `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
  `</Types>`;

const RELS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
  `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
  `</Relationships>`;

const DOCUMENT_RELS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
  `</Relationships>`;

const STYLES =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
  `<w:docDefaults><w:rPrDefault><w:rPr>` +
  `<w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>` +
  `<w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="ru-RU"/>` +
  `</w:rPr></w:rPrDefault></w:docDefaults>` +
  `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>` +
  `</w:styles>`;

const CORE_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<cp:coreProperties ` +
  `xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ` +
  `xmlns:dc="http://purl.org/dc/elements/1.1/">` +
  `<dc:title>Предложение о трудоустройстве</dc:title>` +
  `<dc:creator>ООО «Эко-Меню»</dc:creator>` +
  `</cp:coreProperties>`;

// ── Минимальный ZIP-райтер (метод STORE, без сжатия) ────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

interface ZipEntry {
  name: string;
  data: Uint8Array;
  crc: number;
  offset: number;
}

function strToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function pushU16(arr: number[], v: number): void {
  arr.push(v & 0xff, (v >>> 8) & 0xff);
}
function pushU32(arr: number[], v: number): void {
  arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
}

function buildZip(files: { name: string; content: string }[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  const entries: ZipEntry[] = [];
  let offset = 0;

  for (const f of files) {
    const data = strToBytes(f.content);
    const nameBytes = strToBytes(f.name);
    const crc = crc32(data);
    const local: number[] = [];
    pushU32(local, 0x04034b50);
    pushU16(local, 20);
    pushU16(local, 0);
    pushU16(local, 0); // STORE
    pushU16(local, 0);
    pushU16(local, 0x21);
    pushU32(local, crc);
    pushU32(local, data.length);
    pushU32(local, data.length);
    pushU16(local, nameBytes.length);
    pushU16(local, 0);
    const header = new Uint8Array(local);
    chunks.push(header, nameBytes, data);
    entries.push({ name: f.name, data, crc, offset });
    offset += header.length + nameBytes.length + data.length;
  }

  const cdStart = offset;
  for (const e of entries) {
    const nameBytes = strToBytes(e.name);
    const cd: number[] = [];
    pushU32(cd, 0x02014b50);
    pushU16(cd, 20);
    pushU16(cd, 20);
    pushU16(cd, 0);
    pushU16(cd, 0); // STORE
    pushU16(cd, 0);
    pushU16(cd, 0x21);
    pushU32(cd, e.crc);
    pushU32(cd, e.data.length);
    pushU32(cd, e.data.length);
    pushU16(cd, nameBytes.length);
    pushU16(cd, 0);
    pushU16(cd, 0);
    pushU16(cd, 0);
    pushU16(cd, 0);
    pushU32(cd, 0);
    pushU32(cd, e.offset);
    const cdHeader = new Uint8Array(cd);
    chunks.push(cdHeader, nameBytes);
    offset += cdHeader.length + nameBytes.length;
  }

  const cdSize = offset - cdStart;
  const end: number[] = [];
  pushU32(end, 0x06054b50);
  pushU16(end, 0);
  pushU16(end, 0);
  pushU16(end, entries.length);
  pushU16(end, entries.length);
  pushU32(end, cdSize);
  pushU32(end, cdStart);
  pushU16(end, 0);
  chunks.push(new Uint8Array(end));

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return out;
}

/** Собрать .docx как Blob. */
export function buildOfferDocx(data: OfferDocData): Blob {
  const zip = buildZip([
    { name: '[Content_Types].xml', content: CONTENT_TYPES },
    { name: '_rels/.rels', content: RELS },
    { name: 'docProps/core.xml', content: CORE_XML },
    { name: 'word/document.xml', content: buildDocumentXml(data) },
    { name: 'word/styles.xml', content: STYLES },
    { name: 'word/_rels/document.xml.rels', content: DOCUMENT_RELS },
  ]);
  const buf = new ArrayBuffer(zip.length);
  new Uint8Array(buf).set(zip);
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

/** Сгенерировать и скачать .docx предложения. */
export function downloadOfferDocx(data: OfferDocData, fileName: string): void {
  const blob = buildOfferDocx(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
