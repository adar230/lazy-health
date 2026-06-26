const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const generateDailyTask = async (sleepHours, energyLevel, freeTime) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is missing');
  }

  const prompt = `המשתמש ישן ${sleepHours} שעות, רמת האנרגיה שלו היא ${energyLevel} מתוך 5, ויש לו ${freeTime} זמן פנוי היום. צור משימה בריאותית אחת קצרה ומותאמת אישית בעברית. החזר JSON בלבד עם השדות: title, description, category (שינה/תזונה/שתייה/פעילות/אורח חיים), difficulty (קל/בינוני).`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://lazy-health-zizy.vercel.app',
        'X-Title': 'Lazy Health'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          { role: 'user', content: prompt }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const textContent = data.choices?.[0]?.message?.content;
    
    if (!textContent) {
      throw new Error('Invalid response from OpenRouter');
    }

    try {
      // AI sometimes wraps json in markdown code blocks
      const cleanJson = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      throw new Error('Failed to parse OpenRouter JSON response');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('OpenRouter API request timed out after 15 seconds');
    }
    throw err;
  }
};
