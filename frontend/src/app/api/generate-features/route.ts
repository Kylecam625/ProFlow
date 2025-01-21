import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { projectIdea, stack } = await req.json();

    const prompt = `As an expert software architect, suggest features for the following project:

Project Idea: "${projectIdea}"
Tech Stack: ${stack.name} (${stack.framework})

Provide a list of recommended features that would be appropriate for this type of application.
Consider:
1. Core functionality
2. User experience features
3. Technical requirements
4. Common industry standards
5. Security features
6. Performance optimizations

Format the response as a JSON object with an array of feature suggestions:
{
  "features": [
    {
      "title": string,
      "description": string,
      "category": "core" | "ux" | "technical" | "security"
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
    console.error('Error generating feature suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate feature suggestions' },
      { status: 500 }
    );
  }
} 