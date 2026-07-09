/**
 * @module renderEngine
 * @description Type-agnostic PDF render engine for the Document Engine.
 * Generates PDF documents by compositing a background image with dynamically
 * positioned text fields defined by a layout JSON schema and populated from
 * merge field data. Built on `pdf-lib` with support for standard PDF fonts,
 * hex colors, text alignment, and automatic coordinate conversion.
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * Converts a hex color string to a pdf-lib RGB color object.
 *
 * @param {string} hex - Hex color string (e.g., `"#1a1a1a"`).
 * @returns {import('pdf-lib').Color} A pdf-lib RGB color.
 *
 * @example
 * hexToRgb("#ff0000") // → rgb(1, 0, 0)
 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

/**
 * Maps user-friendly font names to pdf-lib StandardFonts constants.
 * @type {Object<string, string>}
 */
const FONT_MAP = {
  Helvetica: StandardFonts.Helvetica,
  'Helvetica-Bold': StandardFonts.HelveticaBold,
  'Helvetica-Italic': StandardFonts.HelveticaOblique,
  'Times-Roman': StandardFonts.TimesRoman,
  'Times-Bold': StandardFonts.TimesRomanBold,
  'Times-Italic': StandardFonts.TimesRomanItalic,
  Courier: StandardFonts.Courier,
  'Courier-Bold': StandardFonts.CourierBold,
};

/**
 * Renders a PDF document by compositing a background image with text fields.
 *
 * The layout JSON defines where each merge field should be drawn on the page,
 * including position, font, size, color, and alignment. The coordinate system
 * uses top-left origin (like CSS), which is automatically converted to PDF's
 * bottom-left origin internally.
 *
 * @param {Buffer|null} backgroundImageBuffer - Buffer of the background image (PNG or JPG), or null for a blank page.
 * @param {Array<Object>} layoutJson - Array of field layout definitions.
 * @param {string} layoutJson[].key - The merge field key (must match a key in `mergeFields`).
 * @param {number} layoutJson[].x - X-coordinate for text placement (top-left origin).
 * @param {number} layoutJson[].y - Y-coordinate for text placement (top-left origin).
 * @param {number} [layoutJson[].fontSize=24] - Font size in points.
 * @param {string} [layoutJson[].fontFamily='Helvetica'] - Font name (see {@link FONT_MAP} for options).
 * @param {string} [layoutJson[].color='#000000'] - Hex color string for the text.
 * @param {string} [layoutJson[].alignment='left'] - Text alignment: `"left"`, `"center"`, or `"right"`.
 * @param {number} [layoutJson[].maxWidth] - Maximum width for text wrapping (defaults to page width).
 * @param {Object} mergeFields - Key-value pairs of field data to render (e.g., `{ name: "Rahul Sharma" }`).
 * @param {Object} [options={}] - Rendering options.
 * @param {number} [options.width=842] - Page width in points (default: A4 landscape).
 * @param {number} [options.height=595] - Page height in points (default: A4 landscape).
 * @returns {Promise<Buffer>} The generated PDF as a Node.js Buffer.
 *
 * @throws {Error} If the background image cannot be embedded.
 * @throws {Error} If an unsupported font is requested and the fallback fails.
 *
 * @example
 * const fs = require('fs');
 * const { renderDocument } = require('./renderEngine');
 *
 * const bgImage = fs.readFileSync('template-bg.png');
 * const layout = [
 *   { key: 'name', x: 400, y: 300, fontSize: 36, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', alignment: 'center' },
 *   { key: 'event', x: 400, y: 370, fontSize: 20, fontFamily: 'Helvetica', color: '#333333', alignment: 'center' },
 * ];
 * const data = { name: 'Rahul Sharma', event: 'Hackathon 2026' };
 *
 * const pdfBuffer = await renderDocument(bgImage, layout, data);
 * fs.writeFileSync('certificate.pdf', pdfBuffer);
 */
async function renderDocument(backgroundImageBuffer, layoutJson, mergeFields, options = {}) {
  const width = options.width || 842; // A4 landscape width in points
  const height = options.height || 595; // A4 landscape height in points

  // Validate inputs
  if (!mergeFields || typeof mergeFields !== 'object') {
    throw new Error('mergeFields must be a non-null object.');
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([width, height]);

  // Embed background image (if provided)
  if (backgroundImageBuffer) {
    let image;

    try {
      // Detect image type from magic bytes
      const isPng = backgroundImageBuffer[0] === 0x89 && backgroundImageBuffer[1] === 0x50;

      if (isPng) {
        image = await pdfDoc.embedPng(backgroundImageBuffer);
      } else {
        image = await pdfDoc.embedJpg(backgroundImageBuffer);
      }
    } catch (err) {
      throw new Error(`Failed to embed background image: ${err.message}`);
    }

    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  // Font cache — avoids re-embedding the same font multiple times per document
  const fontCache = {};

  /**
   * Retrieves (and caches) an embedded PDF font by its user-friendly name.
   *
   * @param {string} fontName - Font name matching a key in {@link FONT_MAP}.
   * @returns {Promise<import('pdf-lib').PDFFont>} The embedded font.
   */
  async function getFont(fontName) {
    if (!fontCache[fontName]) {
      const stdFont = FONT_MAP[fontName] || StandardFonts.Helvetica;
      fontCache[fontName] = await pdfDoc.embedFont(stdFont);
    }
    return fontCache[fontName];
  }

  // Render each field from the layout
  const fields = Array.isArray(layoutJson) ? layoutJson : [];

  for (const field of fields) {
    const value = mergeFields[field.key] || '';
    if (!value) continue; // Skip empty values

    const font = await getFont(field.fontFamily || 'Helvetica');
    const fontSize = field.fontSize || 24;
    const color = field.color ? hexToRgb(field.color) : rgb(0, 0, 0);
    const maxWidth = field.maxWidth || width;

    // Calculate x position based on text alignment
    let x = field.x || 0;
    const textWidth = font.widthOfTextAtSize(value, fontSize);

    if (field.alignment === 'center') {
      x = x - textWidth / 2;
    } else if (field.alignment === 'right') {
      x = x - textWidth;
    }

    // Convert from top-left origin (CSS-like) to bottom-left origin (PDF)
    // Both canvas fillText and pdf-lib drawText use baseline rendering,
    // so we only need to subtract field.y from page height.
    const y = height - (field.y || 0);

    page.drawText(value, {
      x: Math.max(0, x),
      y: Math.max(0, y),
      size: fontSize,
      font,
      color,
      maxWidth,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { renderDocument };
