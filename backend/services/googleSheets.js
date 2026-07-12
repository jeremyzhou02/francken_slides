const { google } = require("googleapis");

const sheets = google.sheets({
  version: "v4",
  auth: process.env.GOOGLE_API_KEY,
});

const parseCsvRows = (csvText) => {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
};

const parseQuoteRows = (rows = []) =>
  rows
    .map(([quote, name]) => ({
      quote: String(quote || "").trim(),
      name: String(name || "").trim(),
    }))
    .filter((item) => item.quote && item.name);

const fetchPublicSheetRows = async (spreadsheetId) => {
  const response = await fetch(
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
      spreadsheetId,
    )}/gviz/tq?tqx=out:csv&range=A:B`,
  );

  if (!response.ok) {
    throw new Error(`Public sheet request failed with ${response.status}`);
  }

  return parseCsvRows(await response.text());
};

const fetchQuoteItems = async (spreadsheetId) => {
  if (!spreadsheetId) return [];

  try {
    const rows = await fetchPublicSheetRows(spreadsheetId);
    return parseQuoteRows(rows);
  } catch (publicSheetError) {
    console.error("Public Google Sheet Quote Sync Error:", publicSheetError.message);
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A:B",
  });

  return parseQuoteRows(response.data.values);
};

const addQuoteItems = async (slide) => {
  const slideObject = slide.toObject ? slide.toObject() : slide;
  if (slideObject.type !== "quote") return slideObject;

  try {
    const settings = slideObject.settings || {};
    const spreadsheetId = settings.spreadsheetId;

    if (!spreadsheetId) {
      slideObject.settings.items = [];
      return slideObject;
    }

    slideObject.settings.items = await fetchQuoteItems(spreadsheetId);
    return slideObject;
  } catch (sheetError) {
    console.error("Google Sheets Quote Sync Error:", sheetError.message);
    slideObject.settings.items = [];
    return slideObject;
  }
};

const addQuoteItemsToSlides = (slides) => Promise.all(slides.map(addQuoteItems));

module.exports = {
  addQuoteItems,
  addQuoteItemsToSlides,
  fetchQuoteItems,
  parseCsvRows,
  parseQuoteRows,
};
