import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { feature, stack, projectIdea } = await req.json();

    const prompt = `As an expert software developer, provide detailed implementation steps for the following feature:

Project: "${projectIdea}"
Tech Stack: ${stack.name} (${stack.framework})
Feature: "${feature.title}"
Feature Description: "${feature.description}"

Provide a detailed, step-by-step implementation guide that:
1. Follows best practices for the chosen tech stack
2. Includes necessary setup steps
3. Considers error handling and edge cases
4. Follows security best practices
5. Considers performance implications

Format the response as a JSON object with an array of implementation steps:
{
  "steps": [
    {
      "title": string,
      "description": string,
      "code_snippet": string (optional),
      "type": "setup" | "implementation" | "testing" | "optimization"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Error generating implementation steps:', error);
    return NextResponse.json(
      { error: 'Failed to generate implementation steps' },
      { status: 500 }
    );
  }
} 