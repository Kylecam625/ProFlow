import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { projectIdea, stack, features } = await request.json();

    // Enhanced validation with specific error messages
    if (!projectIdea) {
      return NextResponse.json(
        { error: 'Project idea is required' },
        { status: 400 }
      );
    }

    if (!stack || !stack.name) {
      return NextResponse.json(
        { error: 'Tech stack with name is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(features) || features.length === 0) {
      return NextResponse.json(
        { error: 'At least one feature is required' },
        { status: 400 }
      );
    }

    // Validate each feature has required properties
    const invalidFeatures = features.filter(
      (f: any) => !f.title || !f.description || !Array.isArray(f.steps)
    );

    if (invalidFeatures.length > 0) {
      return NextResponse.json(
        { error: 'All features must have title, description, and steps array' },
        { status: 400 }
      );
    }

    const prompt = `Generate complete code for the following project:

Project Description:
${projectIdea}

Tech Stack:
${stack.name}

Features:
${features.map((f: any) => `
- ${f.title}
  Description: ${f.description}
  Category: ${f.category}
  Implementation Steps:
  ${f.steps.map((s: any) => `  * ${s.title}: ${s.description}`).join('\n')}
`).join('\n')}

Please provide a complete implementation including:
1. Project structure
2. All necessary files
3. Dependencies and configuration
4. Implementation of all features
5. Clear comments and documentation
6. Setup instructions

Use best practices and modern coding standards.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert software developer who writes clean, efficient, and well-documented code. You should provide complete, working implementations that follow best practices."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_completion_tokens: 16384,
      stream: true
    });

    // Set up streaming response headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            controller.enqueue(encoder.encode(content));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
} 