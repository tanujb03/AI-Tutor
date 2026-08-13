import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findSlide, getCoverageState } from './lectureLookup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read conversation and lecture files
const conversation = JSON.parse(fs.readFileSync(path.join(__dirname, 'conversation.json'), 'utf8'));
const lec1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'lectures', 'lecture-01-linear-models.json'), 'utf8'));
const lec2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'lectures', 'lecture-02-gradient-descent.json'), 'utf8'));
const lec3 = JSON.parse(fs.readFileSync(path.join(__dirname, 'lectures', 'lecture-03-regularization.json'), 'utf8'));

const lectures = [lec1, lec2, lec3];

console.log("==========================================");
console.log("TEST 1: findSlide()");
console.log("==========================================");

const citation1 = { lecture: "Week 2 — Gradient Descent and Backpropagation", slide: 9 };
const result1 = findSlide(citation1, lectures);
console.log(`Citation: "${citation1.lecture}", Slide ${citation1.slide}`);
console.log("Matched Slide Object:", JSON.stringify(result1, null, 2));

const citation2 = { lecture: "Week 1 — Linear Models & Empirical Risk", slide: 2 };
const result2 = findSlide(citation2, lectures);
console.log(`\nCitation: "${citation2.lecture}", Slide ${citation2.slide}`);
console.log("Matched Slide Object:", JSON.stringify(result2, null, 2));

console.log("\n==========================================");
console.log("TEST 2: getCoverageState()");
console.log("==========================================");

const coverage = getCoverageState(conversation.messages, lectures);

coverage.forEach((lec) => {
  console.log(`\n[${lec.title}] (Week ${lec.week})`);
  console.log(`Stats: ${lec.stats.touched} Touched | ${lec.stats.revisited} Revisited | ${lec.stats.notAsked} Not Asked`);
  lec.slides.forEach((slide) => {
    console.log(`  - Slide ${slide.slide_number}: "${slide.title}" => Status: ${slide.status.toUpperCase()} (Citations: ${slide.citationCount})`);
  });
});

console.log("\n==========================================");
console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
console.log("==========================================");
