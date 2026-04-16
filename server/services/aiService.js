const OpenAI = require('openai');

let openaiClient = null;

function getClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/**
 * Generate role-aware AI suggestions
 */
async function generateSuggestions(resumeText, targetRole, missingKeywords, sectionScores, jobDescription = '') {
  try {
    const client = getClient();

    const prompt = `You are an expert resume coach and ATS specialist.

The candidate is applying for a **${targetRole}** position.
${jobDescription ? `\nJob Description:\n${jobDescription}\n` : ''}
Resume Text:
${resumeText.substring(0, 3000)}

Missing keywords for this role: ${missingKeywords.slice(0, 8).join(', ')}

Section scores: Summary ${sectionScores.summary}%, Skills ${sectionScores.skills}%, Experience ${sectionScores.experience}%, Education ${sectionScores.education}%

Provide exactly 6 specific, actionable suggestions to improve this resume for the ${targetRole} role.
For each suggestion, specify: type (critical/warning/good), section (summary/skills/experience/education/general), and a clear message.

Respond in this exact JSON format:
{
  "suggestions": [
    { "type": "critical", "section": "skills", "message": "..." },
    { "type": "warning", "section": "experience", "message": "..." },
    { "type": "good", "section": "education", "message": "..." }
  ]
}

Be specific to the ${targetRole} role, not generic. Reference actual missing skills.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions || [];
  } catch (err) {
    console.error('AI suggestions error:', err.message);
    // Return fallback suggestions if AI fails
    return generateFallbackSuggestions(missingKeywords, targetRole, sectionScores);
  }
}

/**
 * AI rewrite a specific section
 */
async function rewriteSection(sectionText, sectionName, targetRole) {
  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Rewrite the following resume ${sectionName} section for a ${targetRole} position.
Make it ATS-friendly, add relevant keywords for the role, use strong action verbs, and include quantified achievements where possible.
Keep it concise and professional.

Original text:
${sectionText}

Return only the rewritten section text, no explanations.`,
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (err) {
    throw new Error('AI rewrite failed: ' + err.message);
  }
}

/**
 * Fallback suggestions when AI is unavailable
 */
function generateFallbackSuggestions(missingKeywords, targetRole, sectionScores) {
  const suggestions = [];

  if (missingKeywords.length > 0) {
    suggestions.push({
      type: 'critical',
      section: 'skills',
      message: `Add these missing keywords for ${targetRole}: ${missingKeywords.slice(0, 4).join(', ')}`,
    });
  }

  if (sectionScores.experience < 70) {
    suggestions.push({
      type: 'critical',
      section: 'experience',
      message: 'Add quantified achievements to your experience — e.g., "Increased performance by 40%" instead of "Improved performance"',
    });
  }

  if (sectionScores.summary < 60) {
    suggestions.push({
      type: 'warning',
      section: 'summary',
      message: `Tailor your summary to mention "${targetRole}" and your key skills for this role`,
    });
  }

  suggestions.push({
    type: 'warning',
    section: 'general',
    message: 'Use strong action verbs: Led, Built, Designed, Implemented, Delivered, Achieved',
  });

  suggestions.push({
    type: 'warning',
    section: 'skills',
    message: `For ${targetRole} positions, include tools and technologies you have experience with, even from personal projects`,
  });

  if (sectionScores.education >= 70) {
    suggestions.push({
      type: 'good',
      section: 'education',
      message: 'Education section is well-formatted ✓',
    });
  }

  return suggestions;
}

module.exports = { generateSuggestions, rewriteSection };
