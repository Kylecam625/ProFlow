'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown, { Components } from 'react-markdown';

interface GeneratedCode {
  project_structure: {
    directory: string;
  };
  dependencies_configuration: {
    requirements_file: string;
  };
  setup_instructions: {
    instructions: string[];
  };
  main_project_files: Record<string, string>;
  additional_features_best_practices: {
    features: string[];
  };
  readme_content: string;
}

interface Feature {
  title: string;
  description: string;
  steps?: {
    title: string;
    description: string;
    code_snippet?: string;
    type: 'setup' | 'implementation' | 'testing' | 'optimization';
  }[];
  category?: string;
}

const TreeStructure = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  return (
    <div className="font-mono text-sm">
      {lines.map((line, index) => {
        const indent = line.search(/\S/);
        const isFile = !line.includes('/') || line.endsWith('.py') || line.endsWith('.txt') || line.endsWith('.json') || line.endsWith('.md');
        return (
          <div
            key={index}
            className={`flex items-center ${isFile ? 'text-emerald-300' : 'text-gray-300'}`}
            style={{ paddingLeft: `${indent * 0.5}rem` }}
          >
            {isFile ? '📄' : '📁'} <span className="ml-2">{line.trim()}</span>
          </div>
        );
      })}
    </div>
  );
};

const CopyableCodeBlock = ({ content, language }: { content: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Calculate button width based on content
  const buttonWidth = copied ? "120px" : "100px"; // Increased button widths

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center gap-2"
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </>
        )}
      </button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '2rem 1.5rem 1.5rem',
          paddingRight: buttonWidth, // Add padding based on button width
          background: 'transparent',
          fontSize: '0.875rem',
        }}
        showLineNumbers={true}
        wrapLines={true}
        wrapLongLines={true}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
};

const InstructionList = ({ instructions }: { instructions: string[] }) => (
  <div className="space-y-4">
    {instructions.map((instruction, index) => (
      <div key={index} className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm mt-1">
          {index + 1}
        </span>
        <div className="flex-1">
          <ReactMarkdown
            components={{
              p: (props) => <p className="text-gray-300 leading-relaxed" {...props} />,
              code: (props) => {
                const { className, children } = props;
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                
                return isInline ? (
                  <code className="px-1.5 py-0.5 rounded bg-gray-700 text-emerald-300 font-mono text-sm">
                    {children}
                  </code>
                ) : (
                  <div className="rounded-lg overflow-hidden bg-[#1a1f2e] border border-gray-700">
                    <CopyableCodeBlock
                      content={String(children).replace(/\n$/, '')}
                      language={match[1]}
                    />
                  </div>
                );
              },
              pre: ({ children }) => <>{children}</>,
              a: (props) => (
                <a className="text-emerald-400 hover:text-emerald-300 underline" {...props} />
              ),
            }}
          >
            {instruction}
          </ReactMarkdown>
        </div>
      </div>
    ))}
  </div>
);

const FeatureList = ({ features }: { features: string[] }) => (
  <div className="space-y-4">
    {features.map((feature, index) => (
      <div key={index} className="flex items-start gap-3">
        <span className="text-emerald-400 flex-shrink-0 mt-1.5">•</span>
        <div className="flex-1">
          <ReactMarkdown
            components={{
              p: (props) => <p className="text-gray-300 leading-relaxed" {...props} />,
              code: (props) => {
                const { className, children } = props;
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                
                return isInline ? (
                  <code className="px-1.5 py-0.5 rounded bg-gray-700 text-emerald-300 font-mono text-sm">
                    {children}
                  </code>
                ) : (
                  <div className="rounded-lg overflow-hidden bg-[#1a1f2e] border border-gray-700">
                    <CopyableCodeBlock
                      content={String(children).replace(/\n$/, '')}
                      language={match[1]}
                    />
                  </div>
                );
              },
              pre: ({ children }) => <>{children}</>,
              a: (props) => (
                <a className="text-emerald-400 hover:text-emerald-300 underline" {...props} />
              ),
            }}
          >
            {feature}
          </ReactMarkdown>
        </div>
      </div>
    ))}
  </div>
);

const StyledReadme = ({ content }: { content: string }) => (
  <div className="prose prose-invert max-w-none">
    <ReactMarkdown
      components={{
        h1: (props) => (
          <h1 className="text-3xl font-bold text-emerald-400 mb-6 pb-2 border-b border-gray-700" {...props} />
        ),
        h2: (props) => (
          <h2 className="text-2xl font-bold text-emerald-300 mt-8 mb-4" {...props} />
        ),
        h3: (props) => (
          <h3 className="text-xl font-semibold text-emerald-200 mt-6 mb-3" {...props} />
        ),
        p: (props) => (
          <p className="text-gray-300 leading-relaxed mb-4" {...props} />
        ),
        ul: (props) => (
          <ul className="space-y-2 my-4 ml-4" {...props} />
        ),
        li: (props) => (
          <li className="flex items-start gap-2 text-gray-300">
            <span className="text-emerald-400 mt-1">•</span>
            <span {...props} />
          </li>
        ),
        pre: (props) => (
          <pre className="bg-gray-700 p-4 rounded-lg font-mono text-sm text-emerald-300 overflow-x-auto" {...props} />
        ),
        code: (props) => {
          const { className, children } = props;
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          
          return isInline ? (
            <code className="px-1.5 py-0.5 rounded bg-gray-700 text-emerald-300 font-mono text-sm">
              {children}
            </code>
          ) : (
            <div className="rounded-lg overflow-hidden bg-[#1a1f2e] border border-gray-700">
              <CopyableCodeBlock
                content={String(children).replace(/\n$/, '')}
                language={match[1]}
              />
            </div>
          );
        },
        blockquote: (props) => (
          <blockquote className="border-l-4 border-emerald-500 pl-4 my-4 text-gray-400 italic" {...props} />
        ),
        table: (props) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full divide-y divide-gray-700" {...props} />
          </div>
        ),
        th: (props) => (
          <th className="px-4 py-2 bg-gray-700 text-emerald-300 font-semibold text-left" {...props} />
        ),
        td: (props) => (
          <td className="px-4 py-2 border-t border-gray-700 text-gray-300" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const fileName = filePath.toLowerCase();
  
  // Special cases for specific filenames
  if (fileName.includes('package.json')) return 'json';
  if (fileName.includes('tsconfig.json')) return 'json';
  if (fileName.endsWith('dockerfile') || fileName.endsWith('containerfile')) return 'dockerfile';
  if (fileName.endsWith('makefile')) return 'makefile';
  if (fileName.includes('.env')) return 'shell';
  if (fileName.endsWith('requirements.txt')) return 'pip-requirements';
  if (fileName.endsWith('gemfile')) return 'ruby';
  if (fileName.endsWith('cmakelists.txt')) return 'cmake';
  if (fileName.endsWith('.gitignore')) return 'gitignore';
  if (fileName.endsWith('compose.yaml') || fileName.endsWith('compose.yml')) return 'yaml';

  // Map file extensions to languages
  const languageMap: Record<string, string> = {
    // Web
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    html: 'markup',
    htm: 'markup',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    vue: 'vue',
    svelte: 'svelte',
    astro: 'astro',

    // Backend
    py: 'python',
    java: 'java',
    rb: 'ruby',
    php: 'php',
    go: 'go',
    rs: 'rust',
    cs: 'csharp',
    fs: 'fsharp',
    kt: 'kotlin',
    scala: 'scala',
    swift: 'swift',
    dart: 'dart',
    r: 'r',
    pl: 'perl',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    fish: 'shell',

    // Data/Config
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'markup',
    toml: 'toml',
    ini: 'ini',
    env: 'shell',
    conf: 'nginx',
    properties: 'properties',

    // Database
    sql: 'sql',
    psql: 'pgsql',
    mysql: 'mysql',
    mongo: 'mongodb',
    prisma: 'prisma',

    // Documentation
    md: 'markdown',
    mdx: 'mdx',
    tex: 'latex',
    rst: 'restructuredtext',
    adoc: 'asciidoc',

    // Build/Deploy
    gradle: 'gradle',
    groovy: 'groovy',
    dockerfile: 'dockerfile',
    containerfile: 'dockerfile',
    vagrantfile: 'ruby',
    jenkinsfile: 'groovy',

    // Other
    graphql: 'graphql',
    gql: 'graphql',
    proto: 'protobuf',
    sol: 'solidity',
    cmake: 'cmake',
    make: 'makefile',
    nim: 'nim',
    zig: 'zig',
    tf: 'hcl',
    tfvars: 'hcl',
    hcl: 'hcl',
  };

  return languageMap[ext] || 'plaintext';
}

export default function GeneratedCodePage() {
  const [code, setCode] = useState<GeneratedCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const totalSteps = 7; // Total number of API calls we make
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const generateCode = async () => {
      try {
        setLoading(true);
        setProgress(0);
        const projectDataStr = localStorage.getItem('projectData');
        if (!projectDataStr) {
          throw new Error('No project data found');
        }

        const projectData = JSON.parse(projectDataStr);
        if (!projectData.projectIdea || !projectData.stack || !projectData.features) {
          throw new Error('Missing required project data');
        }

        // Clean up the features data to only include necessary fields
        const cleanedFeatures = projectData.features.map((feature: Feature) => ({
          title: feature.title,
          description: feature.description,
          steps: feature.steps || [],
          category: feature.category
        }));

        const requestData = {
          projectIdea: projectData.projectIdea,
          stack: projectData.stack,
          features: cleanedFeatures
        };

        // Start progress animation
        let animationFrame: number | undefined;
        const startTime = Date.now();
        const expectedDuration = 20000; // Expect response in 20 seconds
        const maxProgress = 92; // Max progress before completion
        
        const animateProgress = () => {
          const elapsed = Date.now() - startTime;
          // Use a logarithmic curve for more realistic progress simulation
          const rawProgress = Math.log10((elapsed / expectedDuration) * 9 + 1) * 45;
          const newProgress = Math.min(rawProgress, maxProgress);
          setProgress(Math.round(newProgress));
          if (newProgress < maxProgress) {
            animationFrame = requestAnimationFrame(animateProgress);
          }
        };
        animationFrame = requestAnimationFrame(animateProgress);

        console.log('Sending project data:', JSON.stringify(requestData, null, 2));
        const response = await fetch('/api/generate-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        // Cancel animation
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.details || 'Failed to generate code');
        }

        const data = await response.json();
        console.log('Received code data:', data);
        
        // Smoothly complete the progress
        setProgress(95);
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress(98);
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update code and finish loading
        setCode(data);
        setLoading(false);
      } catch (err) {
        console.error('Error in generateCode:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    generateCode();
  }, []);

  const askQuestion = async () => {
    if (!question.trim() || !code) return;

    try {
      setAskingQuestion(true);
      setAnswer(null);

      const response = await fetch('/api/ask-code-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          codeContext: code
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      setAnswer('Sorry, I had trouble answering that question. Please try again.');
    } finally {
      setAskingQuestion(false);
    }
  };

  const CodeBlock = ({ title, content, language = 'python' }: { title: string; content: string; language?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-emerald-400">{title}</h3>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <div className="rounded-lg overflow-hidden bg-[#1a1f2e] border border-gray-700">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '0.875rem',
            }}
            showLineNumbers={true}
            wrapLines={true}
            wrapLongLines={true}
          >
            {content || '// No code generated yet'}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[80vh] space-y-8">
          <div className="w-full max-w-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-emerald-400">{Math.round(progress)}%</span>
              <span className="text-sm font-medium text-emerald-400">Step {Math.min(Math.ceil(progress / (100 / totalSteps)), totalSteps)} of {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.round(progress)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-emerald-400">Generating Your Code</h2>
            <p className="text-gray-300 max-w-md">
              Please wait while we generate your complete project code. This might take a minute as we're creating multiple files with proper implementation details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => router.push('/tasks')}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!code) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400">Generated Code</h1>
          <button
            onClick={() => router.push('/tasks')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            ← Back to Tasks
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Project Structure</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              {code && <TreeStructure content={code.project_structure.directory} />}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Dependencies</h2>
            <CodeBlock
              title="requirements.txt"
              content={code.dependencies_configuration.requirements_file}
              language="text"
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Setup Instructions</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <InstructionList instructions={code.setup_instructions.instructions} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Project Files</h2>
            {Object.entries(code.main_project_files).map(([filePath, content]) => {
              // Extract file name from path for display
              const fileName = filePath.split('/').pop() || filePath;
              const fileType = fileName.split('.').pop() || '';
              
              return (
                <div key={filePath} className="mb-8">
                  <div className="mb-2">
                    <h3 className="text-xl font-semibold text-emerald-400">{filePath}</h3>
                    <p className="text-sm text-gray-400">{fileType.toUpperCase()} file</p>
                  </div>
                  <div className="rounded-lg overflow-hidden bg-[#1a1f2e] border border-gray-700">
                    <CopyableCodeBlock
                      content={content || '// No code generated yet'}
                      language={getLanguageFromPath(filePath)}
                    />
                  </div>
                </div>
              );
            })}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Additional Features & Best Practices</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <FeatureList features={code.additional_features_best_practices.features} />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">README.md</h2>
            <div className="bg-gray-800 rounded-lg p-8">
              <StyledReadme content={code.readme_content} />
            </div>
          </section>

          <section className="mt-16 border-t border-gray-700 pt-8">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Ask Questions About Your Code</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about your generated code..."
                  className="flex-1 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none text-white"
                  onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                />
                <button
                  onClick={askQuestion}
                  disabled={askingQuestion || !question.trim()}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  {askingQuestion ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Thinking...
                    </>
                  ) : (
                    'Ask'
                  )}
                </button>
              </div>
              
              {answer && (
                <div className="bg-gray-800 rounded-lg p-6 mt-4">
                  <ReactMarkdown
                    components={{
                      h1: (props) => (
                        <h1 className="text-2xl font-bold text-emerald-400 mb-4" {...props} />
                      ),
                      h2: (props) => (
                        <h2 className="text-xl font-bold text-emerald-300 mt-6 mb-3" {...props} />
                      ),
                      h3: (props) => (
                        <h3 className="text-lg font-semibold text-emerald-200 mt-4 mb-2" {...props} />
                      ),
                      p: (props) => (
                        <p className="text-gray-300 leading-relaxed mb-4" {...props} />
                      ),
                      ul: (props) => (
                        <ul className="list-disc list-inside space-y-2 mb-4 marker:text-emerald-400" {...props} />
                      ),
                      ol: (props) => (
                        <ol className="list-decimal list-inside space-y-2 mb-4 marker:text-emerald-400" {...props} />
                      ),
                      li: (props) => (
                        <li className="text-gray-300" {...props} />
                      ),
                      code: (props) => {
                        const { className, children } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        
                        return isInline ? (
                          <code className="px-1.5 py-0.5 rounded bg-gray-700 text-emerald-300 font-mono text-sm">
                            {children}
                          </code>
                        ) : (
                          <div className="rounded-lg overflow-hidden bg-[#1a1f2e] border border-gray-700">
                            <CopyableCodeBlock
                              content={String(children).replace(/\n$/, '')}
                              language={match[1]}
                            />
                          </div>
                        );
                      },
                      blockquote: (props) => (
                        <blockquote className="border-l-4 border-emerald-500 pl-4 my-4 bg-emerald-500/10 p-3 rounded-r-lg text-gray-300" {...props} />
                      ),
                      a: (props) => (
                        <a className="text-emerald-400 hover:text-emerald-300 underline" {...props} />
                      ),
                      strong: (props) => (
                        <strong className="text-emerald-400 font-semibold" {...props} />
                      ),
                      em: (props) => (
                        <em className="text-emerald-300 italic" {...props} />
                      ),
                      table: (props) => (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full divide-y divide-gray-700" {...props} />
                        </div>
                      ),
                      th: (props) => (
                        <th className="px-4 py-2 bg-gray-700 text-emerald-300 font-semibold text-left" {...props} />
                      ),
                      td: (props) => (
                        <td className="px-4 py-2 border-t border-gray-700 text-gray-300" {...props} />
                      ),
                      hr: (props) => (
                        <hr className="my-6 border-gray-700" {...props} />
                      ),
                    }}
                  >
                    {answer}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 