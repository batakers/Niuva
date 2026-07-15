const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const roots = [
  path.join(__dirname, "../src/pages/marketing"),
  path.join(__dirname, "../src/components/brand"),
  path.join(__dirname, "../src/components/layout"),
];
const ignoredAttributes = new Set(["className", "to", "href", "id", "src", "key"]);
const files = roots.flatMap((root) => fs.readdirSync(root).filter((name) => /\.[jt]sx?$/.test(name)).map((name) => path.join(root, name)));
const indonesianPattern = /\b(agar|anda|atau|belum|berbasis|dalam|dengan|dari|dan|hasil|hubungi|kami|kapabilitas|kebutuhan|kirim|kolaborasi|lebih|lihat|menjadi|menggunakan|oleh|pada|pengembangan|perusahaan|produk|proyek|riset|sebagai|setiap|solusi|tim|untuk|yang)\b/i;
const conditionalCopy = new Set(["Tanpa perusahaan", "Pesan berhasil dikirim. Tim Niuva akan menghubungi Anda.", "nama@perusahaan.com", "untuk", "Lihat detail"]);
const copySource = fs.readFileSync(path.join(__dirname, "../src/i18n/publicCopy.js"), "utf8");
const translatedValues = new Set();
const copyAst = parser.parse(copySource, { sourceType: "module", plugins: ["jsx"] });
traverse(copyAst, {
  ObjectProperty(nodePath) {
    const key = nodePath.node.key;
    if (key.type === "StringLiteral") translatedValues.add(key.value);
  },
});

const missing = [];

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const values = new Set();
  const ast = parser.parse(source, { sourceType: "module", plugins: ["jsx"] });
  traverse(ast, {
    JSXText(nodePath) {
      const value = nodePath.node.value.replace(/\s+/g, " ").trim();
      if (value) values.add(value);
    },
    JSXAttribute(nodePath) {
      const name = nodePath.node.name?.name;
      const value = nodePath.node.value?.value;
      if (!ignoredAttributes.has(name) && typeof value === "string" && /[A-Za-zÀ-ÿ]/.test(value)) values.add(value);
    },
    StringLiteral(nodePath) {
      const value = nodePath.node.value.trim();
      if (value.length > 2 && indonesianPattern.test(value) && !translatedValues.has(value)) values.add(value);
    },
  });
  if (values.size) {
    const isAuditedUi = file.includes(`${path.sep}pages${path.sep}marketing${path.sep}`) || file.endsWith(`${path.sep}BrandSystem.jsx`);
    if (isAuditedUi) {
      [...values].filter((value) => indonesianPattern.test(value) && !translatedValues.has(value) && !conditionalCopy.has(value)).forEach((value) => missing.push({ file, value }));
    }
  }
}

console.log(`Missing Indonesian copy candidates: ${missing.length}`);
missing.forEach(({ file, value }) => console.log(`${path.relative(path.join(__dirname, "../src"), file)} :: ${value}`));
process.exitCode = missing.length ? 1 : 0;
