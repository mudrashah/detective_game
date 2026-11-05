import * as fs from 'node:fs';
import * as path from 'node:path';
import { generateCase } from '../generator/caseGenerator.js';

function exportCase() {
  const seed = 1984;
  const caseData = generateCase({ seed });
  const casesDir = path.resolve(process.cwd(), 'cases');
  if (!fs.existsSync(casesDir)) {
    fs.mkdirSync(casesDir, { recursive: true });
  }

  const outPath = path.join(casesDir, 'case_01_echo_park.json');
  fs.writeFileSync(outPath, JSON.stringify(caseData, null, 2), 'utf-8');
  console.log(`Successfully generated and exported seeded case to:\n  ${outPath}`);
}

exportCase();

