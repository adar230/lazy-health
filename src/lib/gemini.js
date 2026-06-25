const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export const generateDailyTask = async (sleepHours, energyLevel, freeTime) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is missing');
  }

  const prompt = `המשתמש ישן ${sleepHours} שעות, רמת האנרגיה שלו היא ${energyLevel} מתוך 5, ויש לו ${freeTime} זמן פנוי היום. צור משימה בריאותית אחת קצרה ומותאמת אישית בעברית. החזר JSON בלבד עם השדות: title, description, category (שינה/תזונה/שתייה/פעילות/אורח חיים), difficulty (קל/בינוני).`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error('Invalid response from Gemini');
    }

    try {
      // Gemini sometimes wraps json in markdown code blocks
      const cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      throw new Error('Failed to parse Gemini JSON response');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Gemini API request timed out after 10 seconds');
    }
    throw err;
  }
};
