import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { projectIdea } = await req.json();

    if (!projectIdea) {
      return NextResponse.json(
        { error: 'Project idea is required' },
        { status: 400 }
      );
    }

    const prompt = `As an expert software architect, analyze the following project idea and suggest 3 different technology stacks that would be most appropriate for implementing it: "${projectIdea}"

Consider the following factors when suggesting stacks:
1. Project requirements and complexity
2. Development efficiency
3. Scalability needs
4. Performance requirements
5. Development team expertise (assume beginner to intermediate level)
6. Industry best practices
7. Community support and resources
8. Cost-effectiveness

For each suggested stack, provide:
1. A descriptive name for the stack combination
2. Main framework/technology
3. Additional necessary technologies/libraries
4. Data storage solution
5. A detailed explanation of why this stack is suitable
6. Whether this is the recommended stack for beginners (only one should be recommended)

Format the response as a JSON object with a "stacks" array containing objects with:
{
  "stacks": [
    {
      "id": number,
      "name": string,
      "framework": string,
      "additionalTech": string,
      "storage": string,
      "description": string,
      "recommended": boolean
    }
  ]
}

Ensure the suggestions are practical and well-suited for the specific project requirements.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-1106-preview",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Error generating stack suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate stack suggestions' },
      { status: 500 }
    );
  }
} 