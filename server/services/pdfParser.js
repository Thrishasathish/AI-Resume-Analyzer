const fs = require('fs');
const path = require('path');

/**
 * Extract raw text from PDF or DOCX file
 */
async function parseFile(filePath, fileType) {
  try {
    if (fileType === 'pdf') {
      return await parsePDF(filePath);
    } else if (fileType === 'docx') {
      return await parseDOCX(filePath);
    }
    throw new Error('Unsupported file type');
  } catch (err) {
    throw new Error(`File parsing failed: ${err.message}`);
  }
}

async function parsePDF(filePath) {
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function parseDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * Detect sections in resume text
 */
function detectSections(text) {
  const lower = text.toLowerCase();
  const sections = {
    hasSummary: /summary|objective|profile|about/i.test(lower),
    hasSkills: /skills|technologies|tools|expertise|competencies/i.test(lower),
    hasExperience: /experience|work history|employment|positions/i.test(lower),
    hasEducation: /education|degree|university|college|school/i.test(lower),
    hasProjects: /projects|portfolio|work samples/i.test(lower),
    hasCertifications: /certifications|certificates|awards/i.test(lower),
    hasContact: /email|phone|linkedin|github/i.test(lower),
  };
  return sections;
}

module.exports = { parseFile, detectSections };
