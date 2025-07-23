import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function askLLM(prompt: string): Promise<string> {
  if (!process.env.OPENAI_KEY) {
    throw new Error('OPENAI_KEY not set');
  }

  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
  });

  return response.choices[0]?.message.content ?? '';
}