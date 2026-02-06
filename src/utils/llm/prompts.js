/**
 * Generates a prompt for a local-expert blog post with strict JSON output.
 * @param {Object} params
 * @param {string} params.location - The target city or region (e.g., "Austin, Texas").
 * @param {string} params.description - The core topic (e.g., "Best coffee shops for remote work").
 * @param {string[]} params.keywords - Array of SEO keywords.
 * @returns {string} The formatted prompt string.
 */
export const getBlogPrompt = ({ location, description, keywords }) => {
  return `
### CONTEXT
You are a Local Expert and SEO Specialist living in ${location}.
Your task is to write a high-quality, authentic blog post about: "${description}".

Target Keywords: ${keywords.join(', ')}.

### EXTERNAL DATA INSTRUCTIONS
1. **Search Validation:** Use your browsing tools to verify the current date and retrieve the latest market data, events, or news specific to ${location} related to this topic.
2. **Fact-Check:** Ensure no permanently closed or obsolete businesses, venues, or locations are mentioned.

### CONTENT & VOICE GUIDELINES (The "Local" Rule)
- **Voice:** Professional but conversational. Use contractions (e.g., "you'll", "can't").
- **The Hook:** Do NOT start with a definition. Start with a local scenario, a specific street, neighborhood, or a relatable struggle residents of ${location} face.
- **Formatting:** 
  - The entire blog body must be written in **valid HTML**.
  - Use semantic tags only: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>.
  - Include a styled TL;DR section at the top using a <div>.
- **Prohibited:** 
  - Do not use clichés like "In conclusion", "Uncover", "Nestled", or "Delve into".
  - Do not lecture the reader.
  - Do not output Markdown.

### OUTPUT FORMAT (CRITICAL)
You must return a **single valid JSON object only**.
Do NOT include explanations, comments, or extra text outside JSON.

The JSON must follow this exact schema:
{
  "title": "A click-worthy, non-clickbait title",
  "seo_keywords": ["keyword1", "keyword2", "keyword3"],
  "main_content": "<div>FULL BLOG POST IN VALID HTML ONLY — including a TL;DR section at the top and a Call to Action at the end.</div>"
}
`;
};
