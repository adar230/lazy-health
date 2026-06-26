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
        model: 'mistralai/mistral-7b-instruct:free',
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
    
    console.log('--- OpenRouter Debug Info ---');
    console.log('Status Code:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Full JSON Response:', JSON.stringify(data, null, 2));
    console.log('---------------------------');

    const textContent = data.choices?.[0]?.message?.content;
    
    if (!textContent) {
      throw new Error('Invalid response from OpenRouter');
    }

    console.log('Raw AI Response:', textContent);

    try {
      // Extract everything between the first '{' and the last '}'
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      
      const cleanJson = jsonMatch[0].trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse OpenRouter JSON:', e);
      throw new Error('Failed to parse OpenRouter JSON response');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('OpenRouter API request timed out after 15 seconds');
    }
    throw err;
  }
};

export const generateMinimalTask = async (sleepHours, energyLevel, freeTime) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is missing');
  }

  const prompt = `המשתמש ישן ${sleepHours} שעות, רמת האנרגיה שלו היא ${energyLevel} מתוך 5. צור משימה בריאותית מינימלית אחת קטנה וקלילה בעברית שלוקחת פחות מ-5 דקות. המשימה חייבת להיות קלה מאוד. החזר JSON בלבד עם השדות: title, description, category (שינה/תזונה/שתייה/פעילות/אורח חיים), difficulty (קל).`;

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
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          { role: 'user', content: prompt }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.choices?.[0]?.message?.content;
    
    if (!textContent) throw new Error('Invalid response from OpenRouter');

    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON object found in response');
      return JSON.parse(jsonMatch[0].trim());
    } catch (e) {
      throw new Error('Failed to parse OpenRouter JSON response');
    }
  } catch (err) {
    throw err;
  }
};
