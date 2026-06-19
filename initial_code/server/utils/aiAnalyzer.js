const buildPrompt = (resumeText, jobDescription) => `
You are an expert ATS Resume Analyzer and Resume Writer.

Return STRICT JSON only.
Do not wrap the response in markdown.
Do not use backticks.
Do not provide explanations.
Return valid JSON only.

Use this exact schema:

{
  "ats_score": 0,
  "strengths": [],
  "missing_skills": [],
  "improvements": [],

  "section_rewrites": [
    {
      "section_type": "",
      "title": "",
      "rewritten_description": ""
    }
  ],

  "certifications_to_add": [],

  "overall_assessment": "",

  "estimated_score_after_changes": 0
}

Rules:

1. Calculate an ATS score out of 100 based on the resume and job description.
2. Return only the top 5 strengths.
3. Return only the top 5 missing skills.
4. Return only the top 5 improvement suggestions.
5. Identify ALL sections containing descriptions, including:
   - Projects
   - Work Experience
   - Internships
   - Freelance Work
   - Research Work
   - Achievements
   - Awards
6. For every section found, create one object inside section_rewrites.
7. Set section_type appropriately, such as:
   - Project
   - Experience
   - Internship
   - Freelance
   - Research
   - Achievement
   - Award
8. Rewrite descriptions using strong action verbs and ATS-friendly language.
9. Naturally incorporate important keywords from the job description into rewritten descriptions whenever relevant.
10. Quantify achievements whenever possible.
11. Keep rewritten descriptions concise, professional, and resume-ready.
12. Recommend useful certifications only if they fill important skill gaps.
13. Keep overall assessment under 100 words.
14. Estimate the ATS score after implementing all suggestions.
15. Do NOT return:
    - tech_stack
    - original_description
    - additional_keywords_to_add
16. Return valid JSON only.

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

import dotenv from "dotenv";
dotenv.config();

export const analyzeWithGemini = async (resumeText, jobDescription) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is undefined");
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildPrompt(resumeText, jobDescription)
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      throw new Error(JSON.stringify(data));
    }

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
      throw new Error("Empty Gemini response");
    }

    // Try parsing
    try {
  const cleanedText = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleanedText);

  console.log(
    "Parsed Gemini Response:\n",
    JSON.stringify(parsed, null, 2)
  );

  return parsed;

} catch (parseError) {
  console.error("JSON Parsing Error:", parseError);

  return {
    success: false,
    error: "Failed to parse Gemini response",
    raw_model_output: rawText
  };
}

  } catch (err) {
    console.error("Gemini Fatal Error:", err.message);
    return {
      success: false,
      error: err.message
    };
  }
};