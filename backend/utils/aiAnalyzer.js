import Machine from '../models/machine.model.js';
import dotenv from 'dotenv';
import aiAnalysis from '../models/aiAnalysis.model.js';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`;

export async function analyzeMachineById(machineId) {
  const machine = await Machine.findById(machineId)
    .populate({
      path: 'userLogs',
      populate: { path: 'user', select: 'name' }
    });

  if (!machine) {
    throw new Error('Machine not found');
  }

  const prompt = `
You are an AI maintenance assistant.

Here is a machine:
- ID: ${machine._id}
- Name: ${machine.name}
- Type: ${machine.type}

Recent Logs:
${machine.userLogs.map(log => `
- Note: ${log.note}
- Created At: ${new Date(log.createdAt).toLocaleString()}
- Weather: ${log.weather?.main || 'N/A'}, ${log.weather?.description || ''} 
          | Temp Max: ${log.weather?.temp_max || 'N/A'}K 
          | Humidity: ${log.weather?.humidity || 'N/A'}%
          | Pressure: ${log.weather?.pressure || 'N/A'}hPa
          | Cloudiness: ${log.weather?.cloudiness || 'N/A'}%
`).join('\n')}

Please analyze the data and predict:
1. The current risk level (low / medium / high).
2. Any potential issues or dangers (like overheating, component wear, weather-related risks, etc).
3. Suggestions or maintenance tips.

Respond **ONLY** with the JSON object, without any explanation or extra text:
{
  "machine_id": "${machine._id}",
  "level": "low | medium | high",
  "notes": "..."
}
`;

  try {
    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
          role: "user"
        }
      ]
    };

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const geminiJson = await geminiRes.json();
    const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("No response text from Gemini.");
    }

    // Extract only the first valid {...} JSON block using regex
    const match = rawText.match(/\{[\s\S]*?\}/);

    if (!match) {
      throw new Error("No valid JSON object found in Gemini response");
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response:", match[0]);
      return {
        machine_id: machine._id,
        error: "Invalid JSON format from Gemini",
        raw_output: rawText
      };
    }

    return parsed;
  } catch (err) {
    console.error("Gemini processing error:", err);
    return {
      machine_id: machineId,
      error: err.message
    };
  }
}

export async function analyzeAllMachines() {
  const machines = await Machine.find({}, '_id');
  const results = [];

  for (const machine of machines) {
    try {
      const result = await analyzeMachineById(machine._id);
      results.push(result);
    } catch (err) {
      console.error(`Failed to analyze machine ${machine._id}:`, err.message);
      results.push({
        machine_id: machine._id,
        error: err.message
      });
    }
  }

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

await aiAnalysis.findOneAndUpdate(
  { createdAt: { $gte: new Date(`${today}T00:00:00.000Z`), $lt: new Date(`${today}T23:59:59.999Z`) } },
  { aiAnalysis: results },
  { upsert: true, new: true }
);

return results;

}
