import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

interface Subtask {
  title?: string;
  description?: string;
  info?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const { task, projectIdea, stack } = await req.json();

    // Detailed validation logging
    console.log('Received request data:', { task, projectIdea, stack });

    if (!task?.title || !task?.description) {
      return NextResponse.json(
        { error: 'Missing required fields in task: title and description are required' },
        { status: 400 }
      );
    }

    if (!projectIdea) {
      return NextResponse.json(
        { error: 'Missing required field: projectIdea' },
        { status: 400 }
      );
    }

    if (!stack?.name) {
      return NextResponse.json(
        { error: 'Missing required field: stack.name' },
        { status: 400 }
      );
    }

    const prompt = `As an expert software developer, break down this task into detailed subtasks for implementation:

Project Context:
- Project Idea: "${projectIdea}"
- Tech Stack: ${stack.name} (${stack.framework || 'No framework specified'})
- Task: "${task.title}"
- Task Description: "${task.description}"

Create a list of 3-5 specific subtasks that:
1. Break down the implementation into manageable pieces
2. Follow a logical sequence
3. Include any setup or prerequisite steps
4. Consider testing and validation
5. Account for edge cases and error handling

Format the response as a JSON array of subtasks with exactly this structure:
{
  "subtasks": [
    {
      "title": "Clear, actionable subtask title",
      "description": "Detailed explanation of what needs to be done",
      "info": "Additional technical details, considerations, or best practices"
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

    const parsedResponse = JSON.parse(response);
    
    // Validate response structure
    if (!parsedResponse.subtasks || !Array.isArray(parsedResponse.subtasks)) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Ensure each subtask has the required fields
    parsedResponse.subtasks = parsedResponse.subtasks.map((subtask: Subtask) => ({
      title: subtask.title || 'Untitled Subtask',
      description: subtask.description || 'No description provided',
      info: subtask.info || 'No additional information available'
    }));

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error generating subtasks:', error);
    return NextResponse.json(
      { error: 'Failed to generate subtasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 