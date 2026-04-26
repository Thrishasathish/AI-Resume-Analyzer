const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

async function generateSuggestions(resumeText, targetRole, missingKeywords, sectionScores, jobDescription = '') {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = 'Provide 6 resume suggestions for ' + targetRole + ' role in JSON format: {"suggestions":[{"type":"critical","section":"skills","message":"..."}]}';
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return parsed.suggestions || [];
  } catch (err) {
    console.error('AI suggestions error:', err.message);
    return generateFallbackSuggestions(missingKeywords, targetRole, sectionScores);
  }
}

async function rewriteSection(text, sectionName, targetRole) {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Rewrite this ' + sectionName + ' for ' + targetRole + ' role: ' + text);
    return result.response.text();
  } catch (err) {
    return text + '\n\n(AI rewrite temporarily unavailable)';
  }
}

function generateFallbackSuggestions(missingKeywords, targetRole, sectionScores) {
  const suggestions = [];
  if (missingKeywords.length > 0) suggestions.push({ type: 'critical', section: 'skills', message: 'Add missing keywords for ' + targetRole + ': ' + missingKeywords.slice(0, 4).join(', ') });
  if (sectionScores.experience < 70) suggestions.push({ type: 'critical', section: 'experience', message: 'Add quantified achievements e.g. Increased performance by 40%' });
  if (sectionScores.summary < 60) suggestions.push({ type: 'warning', section: 'summary', message: 'Tailor your summary to mention ' + targetRole });
  suggestions.push({ type: 'warning', section: 'general', message: 'Use strong action verbs: Led, Built, Designed, Implemented' });
  suggestions.push({ type: 'warning', section: 'skills', message: 'Include tools and technologies from personal projects' });
  if (sectionScores.education >= 70) suggestions.push({ type: 'good', section: 'education', message: 'Education section is well-formatted' });
  return suggestions;
}

module.exports = { generateSuggestions, rewriteSection };