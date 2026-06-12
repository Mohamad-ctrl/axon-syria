/**
 * Generates fixture PDFs for the sign-pdf spike into scripts/fixtures/.
 * Run: node scripts/make-test-pdfs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "fixtures");
fs.mkdirSync(outDir, { recursive: true });

/* A 240x70 transparent PNG with a blue squiggle, as a stand-in signature. */
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])) >>> 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function makeSignaturePng(w = 240, h = 70) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(1 + w * 4);
    for (let x = 0; x < w; x++) {
      const cy = h / 2 + Math.sin(x / 9) * (h / 4) + Math.sin(x / 31) * 6;
      const on = Math.abs(y - cy) < 2.2;
      row[1 + x * 4 + 0] = 25;
      row[1 + x * 4 + 1] = 35;
      row[1 + x * 4 + 2] = 130;
      row[1 + x * 4 + 3] = on ? 255 : 0;
    }
    rows.push(row);
  }
  const idat = zlib.deflateSync(Buffer.concat(rows));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

async function contractEn() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const p1 = doc.addPage([595, 842]);
  p1.drawText("SERVICE AGREEMENT", { x: 72, y: 770, size: 18, font });
  p1.drawText("1. The parties agree to the scope of work described herein.", {
    x: 72,
    y: 720,
    size: 11,
    font,
  });
  const p2 = doc.addPage([595, 842]);
  p2.drawText("2. This agreement is governed by the laws of the UAE.", {
    x: 72,
    y: 770,
    size: 11,
    font,
  });
  p2.drawText("For and on behalf of Axon Group:", { x: 72, y: 240, size: 11, font });
  p2.drawText("________________________________", { x: 72, y: 200, size: 11, font });
  p2.drawText("Authorized Signatory", { x: 72, y: 182, size: 10, font });
  return doc.save();
}

async function headerTrap() {
  // "Signature" appears in a page-1 header; the real block is on page 2.
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const p1 = doc.addPage([595, 842]);
  p1.drawText("Digital Signature Policy - Overview", { x: 72, y: 800, size: 14, font });
  p1.drawText("This document describes when documents require signing.", {
    x: 72,
    y: 740,
    size: 11,
    font,
  });
  const p2 = doc.addPage([595, 842]);
  p2.drawText("Agreed and accepted.", { x: 72, y: 700, size: 11, font });
  p2.drawText("Signature: ______________________", { x: 72, y: 150, size: 11, font });
  return doc.save();
}

async function scanLike() {
  // No text layer at all - simulates a scanned document.
  const doc = await PDFDocument.create();
  const p = doc.addPage([595, 842]);
  p.drawRectangle({ x: 60, y: 700, width: 475, height: 80, color: rgb(0.85, 0.85, 0.9) });
  for (let i = 0; i < 18; i++) {
    p.drawRectangle({
      x: 72,
      y: 640 - i * 26,
      width: 380 + (i % 5) * 20,
      height: 8,
      color: rgb(0.75, 0.75, 0.78),
    });
  }
  return doc.save();
}

fs.writeFileSync(path.join(outDir, "signature.png"), makeSignaturePng());
fs.writeFileSync(path.join(outDir, "contract-en.pdf"), await contractEn());
fs.writeFileSync(path.join(outDir, "header-trap.pdf"), await headerTrap());
fs.writeFileSync(path.join(outDir, "scan-like.pdf"), await scanLike());
console.log("fixtures written to", outDir);
