const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel
} = require("docx");

// Helper: border style
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { top: border, bottom: { style: BorderStyle.SINGLE, size: 2, color: "2E7D32" }, left: border, right: border };

// Cell margins
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// Table width: A4 with 1" margins = 9026 DXA
const TABLE_WIDTH = 9026;
const COL_NUM = 600;
const COL_FOLDER = 1200;
const COL_NAME = TABLE_WIDTH - COL_NUM - COL_FOLDER;

function makeHeaderRow() {
  return new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        borders: headerBorder,
        width: { size: COL_NUM, type: WidthType.DXA },
        shading: { fill: "2E7D32", type: ShadingType.CLEAR },
        margins: cellMargins,
        verticalAlign: "center",
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "№", bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })]
      }),
      new TableCell({
        borders: headerBorder,
        width: { size: COL_NAME, type: WidthType.DXA },
        shading: { fill: "2E7D32", type: ShadingType.CLEAR },
        margins: cellMargins,
        verticalAlign: "center",
        children: [new Paragraph({ children: [new TextRun({ text: "Название", bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })]
      }),
      new TableCell({
        borders: headerBorder,
        width: { size: COL_FOLDER, type: WidthType.DXA },
        shading: { fill: "2E7D32", type: ShadingType.CLEAR },
        margins: cellMargins,
        verticalAlign: "center",
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Папка фото", bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })]
      }),
    ]
  });
}

function makeDataRow(num, name, folder, isEven) {
  const bg = isEven ? "F5F5F5" : "FFFFFF";
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: COL_NUM, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: cellMargins,
        verticalAlign: "center",
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(num), font: "Arial", size: 20 })] })]
      }),
      new TableCell({
        borders,
        width: { size: COL_NAME, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: cellMargins,
        verticalAlign: "center",
        children: [new Paragraph({ children: [new TextRun({ text: name, font: "Arial", size: 20 })] })]
      }),
      new TableCell({
        borders,
        width: { size: COL_FOLDER, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: cellMargins,
        verticalAlign: "center",
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: folder, font: "Arial", size: 20 })] })]
      }),
    ]
  });
}

function makeSection(sectionNum, title, count, birds) {
  const countWord = count === 1 ? (title.includes("запись") ? "запись" : "птица") : (count < 5 ? "птицы" : "птиц");
  const label = count === 1 && title.includes("запись") ? `${count} запись` : `${count} ${countWord}`;

  const elements = [];

  // Section heading
  elements.push(new Paragraph({
    spacing: { before: 360, after: 120 },
    children: [
      new TextRun({ text: `${sectionNum}. ${title}`, bold: true, font: "Arial", size: 24, color: "1B5E20" }),
      new TextRun({ text: `  (${label})`, font: "Arial", size: 20, color: "666666" }),
    ]
  }));

  // Table
  const rows = [makeHeaderRow()];
  birds.forEach((bird, i) => {
    rows.push(makeDataRow(i + 1, bird.name, bird.folder, i % 2 === 0));
  });

  elements.push(new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [COL_NUM, COL_NAME, COL_FOLDER],
    rows
  }));

  return elements;
}

// --- DATA ---
const sections = [
  { num: 1, title: "Большой авиарий", birds: [
    { name: "Кеклик", folder: "01" },
    { name: "Серая куропатка", folder: "02" },
    { name: "Китайский перепел", folder: "03" },
    { name: "Павлин", folder: "04" },
    { name: "Австралийская ястребиная горлица", folder: "05" },
    { name: "Вяхирь", folder: "06" },
    { name: "Капская горлица", folder: "07" },
    { name: "Зелёный голубь", folder: "08" },
    { name: "Александрийский попугай", folder: "09" },
    { name: "Волнистый попугай", folder: "10" },
    { name: "Корелла", folder: "11" },
    { name: "Рисовая амадина", folder: "12" },
  ]},
  { num: 2, title: "Фазанариум", birds: [
    { name: "Синий ушастый фазан", folder: "13" },
    { name: "Румынский фазан", folder: "14" },
    { name: "Серебряный фазан", folder: "15" },
    { name: "Королевский фазан", folder: "16" },
    { name: "Золотой фазан", folder: "17" },
  ]},
  { num: 3, title: "Водоплавающие", birds: [
    { name: "Фламинго розовый", folder: "24" },
    { name: "Индийский бегунок", folder: "25" },
    { name: "Каролинская утка", folder: "26" },
    { name: "Мандаринка", folder: "27" },
    { name: "Мандаринка белая", folder: "28" },
    { name: "Каюга", folder: "29" },
    { name: "Чирок-свистунок (миникряква)", folder: "30" },
  ]},
  { num: 4, title: "Декоративные голуби", birds: [
    { name: "Турман", folder: "19" },
    { name: "Дутыш", folder: "20" },
    { name: "Кинг", folder: "21" },
    { name: "Голубь павлин", folder: "22" },
    { name: "Голубь дракон", folder: "23" },
  ]},
  { num: 5, title: "Дрофятник", birds: [
    { name: "Дрофа", folder: "31" },
  ]},
  { num: 6, title: "Певчие птицы Тайги", birds: [
    { name: "Щур", folder: "32" },
    { name: "Рябчик", folder: "33" },
    { name: "Клёст", folder: "34" },
    { name: "Снегирь", folder: "35" },
    { name: "Свиристель", folder: "36" },
  ]},
  { num: 7, title: "Малый авиарий", birds: [
    { name: "Амадины (различные виды)", folder: "39" },
  ]},
  { num: 8, title: "Неясыти", birds: [
    { name: "Неясыть длиннохвостая (уральская)", folder: "37" },
    { name: "Неясыть бородатая", folder: "38" },
  ]},
  { num: 9, title: "Попугаи Юго-Восточной Азии", birds: [
    { name: "Благородный попугай", folder: "43" },
  ]},
  { num: 10, title: "Попугаи Центральной Америки", birds: [
    { name: "Ара сине-жёлтый", folder: "41" },
    { name: "Ара макао (красный ара)", folder: "42" },
  ]},
  { num: 11, title: "Попугаи Центральной Африки", birds: [
    { name: "Жако бурохвостый", folder: "44" },
    { name: "Жако краснохвостный", folder: "45" },
  ]},
  { num: 12, title: "Журавли", birds: [
    { name: "Грифовая цесарка", folder: "46" },
    { name: "Красавка", folder: "47" },
    { name: "Султанка", folder: "48" },
  ]},
  { num: 13, title: "Сова ушастая", birds: [
    { name: "Сова ушастая", folder: "50" },
  ]},
  { num: 14, title: "Сова сипуха", birds: [
    { name: "Сова сипуха", folder: "49" },
  ]},
  { num: 15, title: "Декоративные курочки", birds: [
    { name: "Малайская серама", folder: "51" },
    { name: "Китайская хохлатая (шёлковая курица)", folder: "52" },
    { name: "Айям цемани", folder: "53" },
    { name: "Бойцовская курица", folder: "54" },
    { name: "Га Донг Тао", folder: "55" },
  ]},
  { num: 16, title: "Домик Сыча", birds: [
    { name: "Сыч", folder: "18" },
  ]},
];

// Build all children
const children = [];

// Title
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: "Авиариум Парк Сказка", bold: true, font: "Arial", size: 36, color: "1B5E20" })]
}));

// Subtitle
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 40 },
  children: [new TextRun({ text: "Список разделов и животных для согласования", font: "Arial", size: 24, color: "444444" })]
}));

// Date
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: "18 марта 2026 г.", font: "Arial", size: 20, color: "999999" })]
}));

// Divider line
children.push(new Paragraph({
  spacing: { after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: "43A047", space: 8 } },
  children: []
}));

// Sections
sections.forEach(s => {
  const els = makeSection(s.num, s.title, s.birds.length, s.birds);
  children.push(...els);
});

// Warning section
children.push(new Paragraph({
  spacing: { before: 480, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "E53935", space: 6 } },
  children: [new TextRun({ text: "\u26A0\uFE0F  Требует уточнения", bold: true, font: "Arial", size: 26, color: "E53935" })]
}));

children.push(new Paragraph({
  spacing: { after: 120 },
  children: [
    new TextRun({ text: "Нильский крылан", bold: true, font: "Arial", size: 20 }),
    new TextRun({ text: " (папка 40)", font: "Arial", size: 20, color: "666666" }),
  ]
}));

children.push(new Paragraph({
  spacing: { after: 200 },
  children: [
    new TextRun({ text: "В документе \u00ABПтицы Авиариума\u00BB относится к разделу \u00ABРукокрылые\u00BB, но этот раздел отсутствует в утверждённом списке из 16 разделов. Просьба уточнить: добавить 17-й раздел \u00ABРукокрылые\u00BB или исключить из экспозиции?", font: "Arial", size: 20 }),
  ]
}));

// Divider
children.push(new Paragraph({
  spacing: { before: 200, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: "43A047", space: 8 } },
  children: []
}));

// Total
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 120 },
  children: [new TextRun({ text: "Итого: 55 существ \u00B7 16 разделов", bold: true, font: "Arial", size: 24, color: "1B5E20" })]
}));

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 20 }
      }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } // ~2cm margins
      }
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = "/Users/dima/Desktop/Авиариум_разделы_согласование.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Document saved to:", outPath);
  console.log("Size:", (buffer.length / 1024).toFixed(1), "KB");
});
