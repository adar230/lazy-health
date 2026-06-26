const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'cohere/north-mini-code:free'
];

const DEFAULT_TASK = {
  title: 'שתו כוס מים',
  description: 'הישארו מימים לאורך היום',
  category: 'שתייה',
  difficulty: 'קל'
};

const callOpenRouterWithRetry = async (prompt) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is missing');
  }

  let lastError = null;

  for (const model of MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log(`[OpenRouter] Attempting to use model: ${model}`);
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://lazy-health-zizy.vercel.app',
          'X-Title': 'Lazy Health'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const status = response.status;
        console.warn(`[OpenRouter] Model ${model} failed with status ${status}`);
        if (status === 429 || status === 503 || status === 404 || status === 528) {
          lastError = new Error(`API error: ${status}`);
          continue; // Try next model
        }
        // If it's a hard error like 401 (Unauthorized), we might still want to try the fallback task instead of crashing
        lastError = new Error(`OpenRouter API error: ${status}`);
        continue; 
      }

      const data = await response.json();
      const textContent = data.choices?.[0]?.message?.content;

      if (!textContent) {
        console.warn(`[OpenRouter] Model ${model} returned empty response.`);
        lastError = new Error('Invalid response');
        continue;
      }

      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn(`[OpenRouter] Model ${model} failed to return JSON. Raw output:`, textContent);
        lastError = new Error('No JSON object found');
        continue;
      }

      const cleanJson = jsonMatch[0].trim();
      return JSON.parse(cleanJson);
      
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[OpenRouter] Error with model ${model}:`, err.message);
      lastError = err;
      // Continue loop for network errors or timeouts
      continue;
    }
  }
  
  console.error('[OpenRouter] All models failed. Returning default task. Last error:', lastError);
  return DEFAULT_TASK;
};

export const generateDailyTask = async (sleepHours, energyLevel, freeTime) => {
  const prompt = `המשתמש ישן ${sleepHours} שעות, רמת האנרגיה שלו היא ${energyLevel} מתוך 5, ויש לו ${freeTime} זמן פנוי היום. צור משימה בריאותית אחת קצרה ומותאמת אישית בעברית. החזר JSON בלבד עם השדות: title, description, category (שינה/תזונה/שתייה/פעילות/אורח חיים), difficulty (קל/בינוני).`;
  return callOpenRouterWithRetry(prompt);
};

export const generateMinimalTask = async (sleepHours, energyLevel, freeTime) => {
  const prompt = `המשתמש ישן ${sleepHours} שעות, רמת האנרגיה שלו היא ${energyLevel} מתוך 5. צור משימה בריאותית מינימלית אחת קטנה וקלילה בעברית שלוקחת פחות מ-5 דקות. המשימה חייבת להיות קלה מאוד. החזר JSON בלבד עם השדות: title, description, category (שינה/תזונה/שתייה/פעילות/אורח חיים), difficulty (קל).`;
  return callOpenRouterWithRetry(prompt);
};
