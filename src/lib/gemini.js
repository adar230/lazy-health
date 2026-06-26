const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
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

export const generateDailyTask = async (type, data) => {
  let prompt = '';
  if (type === 'morning') {
    prompt = `המשתמש ישן ${data.sleepHours || 7} שעות, רמת האנרגיה שלו היא ${data.energyLevel || 3} מתוך 5. צור משימה בריאותית אחת קצרה ומותאמת אישית בעברית לבוקר. vary the task type, do not always suggest walking or breathing exercises. Include variety like: nutrition tasks (prepare a healthy meal, eat vegetables, cook something), hydration, sleep hygiene, mental wellness (breathing, meditation, journaling), social wellness, screen time reduction, stretching, cooking. החזר JSON בלבד עם השדות: title, description, category (שינה/תזונה/שתייה/פעילות/אורח חיים), difficulty (קל/בינוני).`;
  } else {
    prompt = `המשתמש שתה ${data.waterGlasses || 5} כוסות מים, אכל בריא: ${data.ateHealthy ? 'כן' : 'לא'}, והיה פעיל היום: ${data.wasActive ? 'כן' : 'לא'}, ויש לו ${data.freeTime || 15} דקות פנויות. צור משימה בריאותית אחת קצרה ומותאמת אישית בעברית לערב. vary the task type, do not always suggest walking or breathing exercises. Include variety like: nutrition tasks (prepare a healthy meal, eat vegetables, cook something), hydration, sleep hygiene, mental wellness (breathing, meditation, journaling), social wellness, screen time reduction, stretching, cooking. החזר JSON בלבד עם השדות: title, description, category (שינה/תזונה/שתייה/פעילות/אורח חיים), difficulty (קל/בינוני).`;
  }
  return callOpenRouterWithRetry(prompt);
};

export const generateMinimalTask = async (type, data, mainTaskTitle = '') => {
  let prompt = '';
  const avoidMain = mainTaskTitle ? `The user's main task is '${mainTaskTitle}'. Do NOT suggest this. Generate a COMPLETELY DIFFERENT task that is much easier and shorter (under 3 minutes). For example, if the main task is walking, suggest drinking a glass of water or doing a quick stretch.` : '';

  if (type === 'morning') {
    prompt = `המשתמש ישן ${data.sleepHours || 7} שעות, רמת האנרגיה שלו היא ${data.energyLevel || 3} מתוך 5. ${avoidMain} צור משימה בריאותית מינימלית אחת קטנה וקלילה בעברית לבוקר שלוקחת פחות מ-3 דקות. המשימה חייבת להיות קלה מאוד. vary the task type, do not always suggest walking or breathing exercises. Include variety like: nutrition tasks, hydration, sleep hygiene, mental wellness, stretching. החזר JSON בלבד עם השדות: title, description, category (שינה/תזונה/שתייה/פעילות/אורח חיים), difficulty (קל).`;
  } else {
    prompt = `המשתמש שתה ${data.waterGlasses || 5} כוסות מים, אכל בריא: ${data.ateHealthy ? 'כן' : 'לא'}, והיה פעיל היום: ${data.wasActive ? 'כן' : 'לא'}, ויש לו ${data.freeTime || 15} דקות פנויות. ${avoidMain} צור משימה בריאותית מינימלית אחת קטנה וקלילה בעברית לערב שלוקחת פחות מ-3 דקות. המשימה חייבת להיות קלה מאוד. vary the task type, do not always suggest walking or breathing exercises. Include variety like: nutrition tasks, hydration, sleep hygiene, mental wellness, stretching. החזר JSON בלבד עם השדות: title, description, category (שינה/תזונה/שתייה/פעילות/אורח חיים), difficulty (קל).`;
  }
  return callOpenRouterWithRetry(prompt);
};

export const generateDashboardInsights = async (statsText) => {
  const prompt = `You are an expert health analyst. Here is the user's actual checkin data for the last 7 days:\n${statsText}\nAnalyze the EXACT numbers provided. Do not give generic tips. Give 3 personalized insights based on real patterns in the data (e.g., 'בשבוע האחרון ישנת ממוצע 6.9 שעות - זה טוב! אבל ביומיים האחרונים האנרגיה ירדה ל-2, כדאי לבדוק אם יש קשר לשינה'). Return a JSON array of strings in Hebrew: ["insight 1", "insight 2", "insight 3"]. Return ONLY the JSON array.`;
  return callOpenRouterWithRetry(prompt);
};
