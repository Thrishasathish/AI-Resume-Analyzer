const roleProfiles = require('../data/roleProfiles.json');
const { extractKeywords, extractExperienceYears, analyzeFormat, analyzeReadability } = require('./nlpService');
const { detectSections } = require('./pdfParser');

/**
 * Main scoring engine — returns atsScore, roleFitScore, and full breakdown
 */
function calculateScores(resumeText, targetRole, jobDescription = '') {
  const roleProfile = roleProfiles[targetRole];
  if (!roleProfile) throw new Error(`Unknown role: ${targetRole}`);

  const resumeKeywords = extractKeywords(resumeText);
  const lowerResume = resumeText.toLowerCase();

  // ── 1. Keyword Match Score (against JD or role profile) ──────────────────
  const jdKeywords = jobDescription ? extractJDKeywords(jobDescription) : [];
  const referenceKeywords = jdKeywords.length > 0
    ? jdKeywords
    : [...roleProfile.criticalKeywords, ...roleProfile.niceToHave];

  const foundFromReference = referenceKeywords.filter(kw =>
    lowerResume.includes(kw.toLowerCase())
  );
  const keywordMatchScore = referenceKeywords.length > 0
    ? Math.round((foundFromReference.length / referenceKeywords.length) * 100)
    : 50;

  // ── 2. Section Completeness Score ────────────────────────────────────────
  const sections = detectSections(resumeText);
  const sectionWeights = {
    hasSummary: 20,
    hasSkills: 25,
    hasExperience: 30,
    hasEducation: 15,
    hasContact: 10,
  };
  let sectionScore = 0;
  Object.entries(sectionWeights).forEach(([key, weight]) => {
    if (sections[key]) sectionScore += weight;
  });

  // Individual section scores
  const sectionScores = {
    summary: sections.hasSummary ? Math.min(60 + Math.floor(Math.random() * 30), 95) : 20,
    skills: calculateSkillsSectionScore(lowerResume, roleProfile),
    experience: sections.hasExperience ? calculateExperienceScore(resumeText) : 10,
    education: sections.hasEducation ? 80 + Math.floor(Math.random() * 15) : 30,
  };

  // ── 3. Format Score ───────────────────────────────────────────────────────
  const { score: formatScore } = analyzeFormat(resumeText);

  // ── 4. Readability Score ──────────────────────────────────────────────────
  const readabilityScore = analyzeReadability(resumeText);

  // ── ATS Score (composite) ─────────────────────────────────────────────────
  const atsScore = Math.round(
    keywordMatchScore * 0.40 +
    sectionScore      * 0.25 +
    formatScore       * 0.20 +
    readabilityScore  * 0.15
  );

  // ── Role Fit Score ────────────────────────────────────────────────────────
  const criticalFound = roleProfile.criticalKeywords.filter(kw =>
    lowerResume.includes(kw.toLowerCase())
  );
  const criticalScore = Math.round((criticalFound.length / roleProfile.criticalKeywords.length) * 100);

  const yearsFound = extractExperienceYears(resumeText);
  const expectedYears = roleProfile.experienceYears.mid;
  const experienceScore = yearsFound >= expectedYears
    ? 100
    : Math.round((yearsFound / Math.max(expectedYears, 1)) * 100);

  const softSkillsFound = roleProfile.softSkills.filter(s => lowerResume.includes(s.toLowerCase()));
  const softScore = Math.round((softSkillsFound.length / roleProfile.softSkills.length) * 100);

  const roleFitScore = Math.round(
    criticalScore   * 0.50 +
    experienceScore * 0.30 +
    softScore       * 0.20
  );

  // ── Keyword Gap Analysis ──────────────────────────────────────────────────
  const allRoleKeywords = [...roleProfile.criticalKeywords, ...roleProfile.niceToHave];
  const foundKeywords = allRoleKeywords.filter(kw => lowerResume.includes(kw.toLowerCase()));
  const missingKeywords = allRoleKeywords.filter(kw => !lowerResume.includes(kw.toLowerCase()));

  return {
    atsScore: Math.min(atsScore, 100),
    roleFitScore: Math.min(roleFitScore, 100),
    breakdown: {
      keywordMatch: keywordMatchScore,
      sectionScore,
      formatScore,
      readability: readabilityScore,
    },
    sectionScores,
    foundKeywords,
    missingKeywords: missingKeywords.slice(0, 15), // top 15 missing
    allRoleKeywords,
  };
}

function extractJDKeywords(jdText) {
  const lower = jdText.toLowerCase();
  const allKeywords = [];
  Object.values(require('../data/roleProfiles.json')).forEach(profile => {
    [...profile.criticalKeywords, ...profile.niceToHave].forEach(kw => {
      if (lower.includes(kw.toLowerCase())) allKeywords.push(kw);
    });
  });
  return [...new Set(allKeywords)];
}

function calculateSkillsSectionScore(lowerText, roleProfile) {
  const critFound = roleProfile.criticalKeywords.filter(kw =>
    lowerText.includes(kw.toLowerCase())
  ).length;
  return Math.round((critFound / roleProfile.criticalKeywords.length) * 100);
}

function calculateExperienceScore(text) {
  let score = 50;
  const hasActionVerbs = /(led|built|developed|managed|created|improved|achieved|designed|implemented|delivered|reduced|increased)/i.test(text);
  const hasNumbers = /\d+%|\d+x|\$\d+/i.test(text);
  const hasDates = /20\d\d/g.test(text);
  if (hasActionVerbs) score += 20;
  if (hasNumbers) score += 20;
  if (hasDates) score += 10;
  return Math.min(score, 100);
}

/**
 * Get list of all supported roles
 */
function getAllRoles() {
  return Object.entries(roleProfiles).map(([key, val]) => ({
    value: key,
    label: val.label,
    category: val.category,
    icon: val.icon,
  }));
}

module.exports = { calculateScores, getAllRoles };
