import { readFileSync } from 'fs';
import * as XLSX from 'xlsx';

export function convert(path) {
    const xlsx = readFileSync(path);
    const workbook = XLSX.read(xlsx, { type: 'buffer' });
    const vocabSheet = workbook.Sheets['Vocab'];

    const rows = XLSX.utils.sheet_to_json(vocabSheet, {
        header: 1,
        blankrows: false,
        defval: null,
    }).filter(row => row[0]);
    const headers = rows.shift();
    if (rows.length === 0) return {};

    const vocab = {};

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        if (!row || row.length === 0) continue;

        const objectKey = row[0];
        if (!objectKey) continue;

        const entry = {};
        for (let colIndex = 1; colIndex < headers.length; colIndex++) {
            const propertyName = headers[colIndex];
            if (!propertyName) continue;

            const cellValue = row[colIndex];
            if (cellValue == null) continue;

            const value = String(cellValue).trim();
            if (value === '') continue;

            entry[propertyName] = processValue(value);
        }

        if (Object.keys(entry).length > 0) {
            vocab[objectKey] = entry;
        }
    }

    return vocab;
}

function processValue(val) {
    if (!val.includes("||")) {
        return numberize(val);
    }
    return val.split("||").map(item => item.trim()).map(numberize);
}

function numberize(potentialNum) {
    if (!potentialNum) return potentialNum;
    return isNaN(Number(potentialNum)) ? potentialNum : Number(potentialNum);
}