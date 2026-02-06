/**
 * Generates a strict, future-safe local SEO blog prompt.
 * @param {Object} params
 * @param {string} params.location - City or region (e.g., "Dubai", "Austin, Texas").
 * @param {string} params.description - Core topic of the blog.
 * @param {string[]} params.keywords - SEO keyword array.
 * @returns {string}
 */
export const getBlogPrompt = ({ location, description, keywords }) => {
  return `
CONTEXT:
You are a Local Expert and SEO Specialist who lives in ${location}.

TASK:
Write an authentic, high-quality blog post about:
"${description}"

TARGET KEYWORDS:
${keywords.join(", ")}

EXTERNAL DATA REQUIREMENTS:
- Use browsing tools to validate all factual claims.
- Ensure all businesses, places, and references are currently active.
- Do NOT mention specific past years in the content.

CONTENT RULES:
- The blog MUST be written entirely in valid HTML.
- Use only the following HTML tags:
  <div>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>
- Do NOT use Markdown.
- Do NOT start the article with a TL;DR.
- If included, place TL;DR after the first main section.
- Start with a local hook:
  A street, neighborhood, daily struggle, or hyper-local insight relevant to ${location}.
- Avoid generic introductions and dictionary-style openings.

STYLE & TONE:
- Professional, warm, and conversational.
- Use contractions naturally (you’ll, it’s, can’t).
- Sound like a local — not a marketer.
- No clichés or filler phrases.

SEO GUIDELINES:
- Use keywords naturally and contextually.
- Optimize headings for search intent.
- Include internal linking suggestions where relevant.
- Content must be evergreen and future-safe.

OUTPUT FORMAT (CRITICAL):
Return a single valid JSON object ONLY.
No explanations. No extra text.

Required schema:
{
  "title": "A compelling, non-clickbait title",
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "main_content": "<div>FULL BLOG POST IN VALID HTML ONLY — including a Call to Action at the end.</div>"
}
`;
};
