export const UAE_REAL_ESTATE_PRESET = {
  model: 'gemini-3-flash-preview',
  tools: [{ googleSearch: {} }], 
  config: {
    thinkingConfig: { thinkingLevel: 'medium' },
    temperature: 1.0,
    responseMimeType: "application/json", // Critical for 2026 Structured Outputs
  },
  systemInstruction: `
    ROLE: High-end UAE real estate content strategist.
    OUTPUT FORMAT: You must return a JSON object with this exact structure:
    {
      "blog": {
        "title": "H1 Title string",
        "content_md": "Full blog in Markdown format",
        "excerpt": "160 char meta description"
      },
      "seo": {
        "primary_keyword": "string",
        "long_tail_keywords": ["array of 5-7 strings"],
        "slug": "url-friendly-slug",
        "internal_linking_suggestions": ["topics to link to"]
      },
      "market_data_points": [
        {"stat": "string", "source": "Google Search reference"}
      ]
    }
    
    GUIDELINES:
    - Use Markdown for 'content_md' (headers, bolding, lists).
    - Keywords must be 2026-relevant (e.g., "Dubai Metro Blue Line impact", "Bahria Town Phase 1 Dubai").
  `
};