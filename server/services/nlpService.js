const nlp = require('compromise');

// Common tech keywords to extract
const TECH_KEYWORDS = [
  'JavaScript','TypeScript','Python','Java','C++','C#','Go','Rust','PHP','Ruby','Swift','Kotlin',
  'React','Vue','Angular','Next.js','Node.js','Express','Django','Flask','Spring','FastAPI',
  'HTML','CSS','Tailwind','Bootstrap','Sass','SCSS',
  'SQL','MySQL','PostgreSQL','MongoDB','Redis','Firebase','DynamoDB','Cassandra',
  'AWS','Azure','GCP','Docker','Kubernetes','Terraform','CI/CD','Jenkins','GitHub Actions',
  'Git','GitHub','GitLab','Bitbucket',
  'REST API','GraphQL','gRPC','WebSocket','Microservices',
  'Machine Learning','Deep Learning','NLP','TensorFlow','PyTorch','scikit-learn','pandas','NumPy',
  'Power BI','Tableau','Figma','Adobe XD','Sketch',
  'Agile','Scrum','Kanban','JIRA','Confluence',
  'Linux','Unix','Bash','Shell scripting',
  'Selenium','Jest','Cypress','Postman','JUnit',
  'React Native','Flutter','iOS','Android',
  'Spark','Hadoop','Airflow','Kafka','ETL',
  'Nginx','Apache','Linux','DevOps','MLOps',
  'TypeScript','Redux','Webpack','Vite',
];

/**
 * Extract keywords found in resume text
 */
function extractKeywords(text) {
  const foundKeywords = [];
  const lowerText = text.toLowerCase();

  TECH_KEYWORDS.forEach((kw) => {
    if (lowerText.includes(kw.toLowerCase())) {
      foundKeywords.push(kw);
    }
  });

  // Also extract via NLP
  const doc = nlp(text);
  const nouns = doc.nouns().out('array');
  const unique = [...new Set([...foundKeywords, ...nouns.filter(n => n.length > 2)])];

  return unique;
}

/**
 * Extract years of experience mentioned in resume
 */
function extractExperienceYears(text) {
  const patterns = [
    /(\d+)\+?\s*years?\s+of\s+experience/gi,
    /(\d+)\+?\s*years?\s+experience/gi,
    /experience\s+of\s+(\d+)\+?\s*years?/gi,
  ];

  let maxYears = 0;
  patterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const years = parseInt(match[1]);
      if (years > maxYears && years < 40) maxYears = years;
    }
  });

  // Estimate from date ranges
  if (maxYears === 0) {
    const dateRanges = text.match(/20\d\d\s*[-–]\s*(20\d\d|present|current)/gi) || [];
    if (dateRanges.length > 0) maxYears = Math.min(dateRanges.length * 1.5, 15);
  }

  return maxYears;
}

/**
 * Check format quality (no tables detected etc)
 */
function analyzeFormat(text) {
  const issues = [];
  let score = 100;

  // Check for contact info
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(text);
  const hasPhone = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/i.test(text);
  if (!hasEmail) { issues.push('No email address found'); score -= 15; }
  if (!hasPhone) { issues.push('No phone number found'); score -= 10; }

  // Check length
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 100) { issues.push('Resume seems too short'); score -= 20; }
  if (wordCount > 1200) { issues.push('Resume may be too long (aim for 1 page)'); score -= 10; }

  // Check for action verbs
  const actionVerbs = ['led', 'built', 'developed', 'managed', 'created', 'improved', 'achieved', 'designed', 'implemented', 'delivered'];
  const hasActionVerbs = actionVerbs.some(v => text.toLowerCase().includes(v));
  if (!hasActionVerbs) { issues.push('Add action verbs to experience bullets'); score -= 15; }

  // Check for quantified achievements
  const hasNumbers = /\d+%|\d+x|\$\d+|\d+ (people|users|teams|engineers)/i.test(text);
  if (!hasNumbers) { issues.push('Add quantified achievements (e.g. "increased by 30%")'); score -= 15; }

  return { score: Math.max(score, 0), issues };
}

/**
 * Readability score based on sentence structure
 */
function analyzeReadability(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length === 0) return 50;

  const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  
  // Ideal avg sentence length for resumes: 8-15 words
  let score = 100;
  if (avgLength > 25) score -= 30;
  else if (avgLength > 20) score -= 15;
  else if (avgLength < 4) score -= 20;

  return Math.max(score, 0);
}

module.exports = { extractKeywords, extractExperienceYears, analyzeFormat, analyzeReadability };
