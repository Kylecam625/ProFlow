import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question, codeContext } = await request.json();

    if (!question || !codeContext) {
      return new Response(
        JSON.stringify({ error: 'Missing question or code context' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert software developer helping explain code.
Your responses should use proper markdown formatting:

## Code Examples
- Use single backticks for inline code: \`variableName\`, \`functionName()\`, \`path/to/file.ext\`
- Use triple backticks with language specifiers for code blocks:

\`\`\`typescript
// Import statement
import { useState } from 'react';

// Component definition
export function ExampleComponent() {
  // State declaration
  const [value, setValue] = useState('example');
  
  // JSX return
  return (
    <div className="container">
      {value}
    </div>
  );
}
\`\`\`

## Text Structure
- Use **bold** for important concepts
- Use *italics* for emphasis
- Use > for important notes
- Use >>> for critical warnings
- Use --- for section breaks

## Headers
- Use # for main titles
- Use ## for major sections
- Use ### for subsections
- Always include blank lines between sections

## Lists and Tables
- Use - for unordered lists
- Use 1. for ordered lists
- Use properly aligned tables:
  | Feature | Description |
  |:--------|:------------|
  | Item 1  | Details 1   |

## Code References
- Reference files as: \`src/components/Example.tsx\`
- Reference functions as: \`handleSubmit()\`
- Reference variables as: \`isLoading\`
- Reference types as: \`interface Props\`

Structure each response with:
1. A clear title describing the topic
2. A brief overview of the concept
3. Relevant code examples with proper syntax highlighting
4. Best practices in a highlighted note block
5. Links to documentation if relevant`
        },
        {
          role: 'user',
          content: `Project Context:
${JSON.stringify(codeContext, null, 2)}

Question: ${question}

Provide a detailed answer with:
1. Clear section headers
2. Syntax-highlighted code examples
3. Important notes in blockquotes
4. Best practices and recommendations`
        }
      ],
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content?.trim() || 'No answer generated';

    return new Response(
      JSON.stringify({ answer }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error answering question:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to answer question',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 