import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateProjectStructure(projectIdea: string, stack: any) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a software architect. Generate a clear and organized project structure following best practices for the given tech stack.
Your response should be a clean directory tree structure without any explanations or markdown formatting.
Use proper indentation with spaces or │ ├ └ characters.
Do not include any other text besides the directory tree.`
      },
      {
        role: 'user',
        content: `Create a detailed directory structure for this project:
Project: ${projectIdea}
Tech Stack: ${stack.name}
${stack.framework ? `Framework: ${stack.framework}` : ''}`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content?.trim() || '// No project structure generated';
}

async function generateDependencies(projectIdea: string, stack: any) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o', 
    messages: [
      {
        role: 'system',
        content: `You are a dependency manager expert. Generate a comprehensive list of dependencies with specific versions.
Your response should be a valid package.json or requirements.txt file without any explanations or markdown.
Include both production and development dependencies.
Do not include any other text besides the dependency file contents.`
      },
      {
        role: 'user',
        content: `Create a dependencies file for this project:
Project: ${projectIdea}
Tech Stack: ${stack.name}
${stack.framework ? `Framework: ${stack.framework}` : ''}`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content?.trim() || '// No dependencies generated';
}

async function generateSetupInstructions(projectIdea: string, stack: any) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a DevOps expert. Provide clear, step-by-step setup instructions.
Your response should be a numbered list of setup steps.
Each step should be clear and concise.
Do not include any explanations or markdown formatting.
Just return the numbered steps, one per line.`
      },
      {
        role: 'user',
        content: `Create setup instructions for this project:
Project: ${projectIdea}
Tech Stack: ${stack.name}
${stack.framework ? `Framework: ${stack.framework}` : ''}`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content?.trim().split('\n').filter(line => line.trim());
}

async function generateImplementationSteps(projectIdea: string, stack: any, features: any[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a technical project manager. Create a detailed implementation plan.'
      },
      {
        role: 'user',
        content: `Create implementation steps for this project:
Project: ${projectIdea}
Tech Stack: ${stack.name}
${stack.framework ? `Framework: ${stack.framework}` : ''}

Features:
${features.map(f => `- ${f.title}: ${f.description}`).join('\n')}

Provide a detailed step-by-step guide covering:
1. Initial setup phase
2. Core implementation phase
3. Feature implementation phase
4. Final phase (optimization & deployment)`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content?.trim().split('\n').filter(line => line.trim());
}

async function generateProjectFiles(projectIdea: string, stack: any, features: any[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert software developer. Generate production-ready code files.
Your response should be a collection of code files separated by ---FILENAME--- markers.
Each file should start with ---FILENAME--- followed by the file path on a new line.
The actual code should follow on subsequent lines until the next file marker.
Include proper error handling, logging, and documentation.
Do not wrap code in quotes, backticks, or markdown code blocks.
Do not include any explanations or markdown formatting.

Example format:

---FILENAME---
src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));

---FILENAME---
src/App.js
import React from 'react';

function App() {
  return <div>Hello World</div>;
}

export default App;`
      },
      {
        role: 'user',
        content: `Generate the core project files for:
Project: ${projectIdea}
Tech Stack: ${stack.name}
${stack.framework ? `Framework: ${stack.framework}` : ''}

Features:
${features.map(f => `- ${f.title}: ${f.description}`).join('\n')}`
      }
    ],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content?.trim() || '';
  const files: Record<string, string> = {};

  // Split content by file markers and process each file
  const fileSegments = content.split('---FILENAME---').filter(Boolean);
  
  for (const segment of fileSegments) {
    const lines = segment.trim().split('\n');
    const filePath = lines[0].trim();
    const code = lines.slice(1).join('\n').trim();
    if (filePath && code) {
      // Remove any remaining triple quotes or markdown code block markers
      const cleanedCode = code
        .replace(/^```[\w-]*\n?/gm, '')  // Remove opening code block markers
        .replace(/```$/gm, '')           // Remove closing code block markers
        .replace(/^"""\n?/gm, '')        // Remove opening triple quotes
        .replace(/"""\n?$/gm, '')        // Remove closing triple quotes
        .replace(/^'''[\w-]*\n?/gm, '')  // Remove opening single quotes
        .replace(/'''\n?$/gm, '')        // Remove closing single quotes
        .trim();
      files[filePath] = cleanedCode;
    }
  }

  return files;
}

async function generateFeatures(projectIdea: string, stack: any, features: any[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a software architect. Document implemented features and best practices.
Your response should be a bullet-pointed list of features and practices.
Each point should be clear and concise.
Do not include any explanations or markdown formatting.
Just return the bullet points, one per line.`
      },
      {
        role: 'user',
        content: `Document the features and best practices for this project:
Project: ${projectIdea}
Tech Stack: ${stack.name}
${stack.framework ? `Framework: ${stack.framework}` : ''}

Features:
${features.map(f => `- ${f.title}: ${f.description}`).join('\n')}`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content?.trim().split('\n').filter(line => line.trim());
}

async function generateReadme(projectIdea: string, stack: any, features: any[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a technical writer. Create a comprehensive README.md file.
Your response must be in valid markdown format with proper syntax for:
- Headers using # symbols (# for h1, ## for h2, etc.)
- Code blocks using triple backticks with language specifiers (\`\`\`javascript)
- Inline code using single backticks
- Lists using - or * with proper indentation
- Links using [text](url) format
- Bold text using **double asterisks**
- Italic text using *single asterisks*
- Tables using | and - for structure
- Blockquotes using >

Include these sections in order:
1. Project Title (h1)
2. Project Description
3. Features List
4. Prerequisites
5. Installation Steps
6. Usage Instructions
7. API Documentation (if applicable)
8. Development Setup
9. Testing Instructions
10. Deployment Guide
11. Contributing Guidelines
12. License Information

Use proper markdown spacing (blank lines between sections).
Do not include any explanations outside the README content.`
      },
      {
        role: 'user',
        content: `Create a README.md for this project:
Project: ${projectIdea}
Tech Stack: ${stack.name}
${stack.framework ? `Framework: ${stack.framework}` : ''}

Features:
${features.map(f => `- ${f.title}: ${f.description}`).join('\n')}`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content?.trim();
}

export async function POST(request: Request) {
  try {
    const { projectIdea, stack, features } = await request.json();

    if (!projectIdea || !stack || !features) {
      return new Response(
        JSON.stringify({ error: 'Missing required project data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate all sections in parallel
    const [
      projectStructure,
      dependencies,
      setupInstructions,
      implementationSteps,
      projectFiles,
      featuresList,
      readme
    ] = await Promise.all([
      generateProjectStructure(projectIdea, stack),
      generateDependencies(projectIdea, stack),
      generateSetupInstructions(projectIdea, stack),
      generateImplementationSteps(projectIdea, stack, features),
      generateProjectFiles(projectIdea, stack, features),
      generateFeatures(projectIdea, stack, features),
      generateReadme(projectIdea, stack, features)
    ]);

    const response = {
      project_structure: {
        directory: projectStructure
      },
      dependencies_configuration: {
        requirements_file: dependencies
      },
      setup_instructions: {
        instructions: setupInstructions
      },
      implementation_steps: {
        steps: implementationSteps
      },
      main_project_files: projectFiles,
      additional_features_best_practices: {
        features: featuresList
      },
      readme_content: readme
    };

    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating code:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate code',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 