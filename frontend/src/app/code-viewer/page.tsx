'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeViewer() {
  const [code, setCode] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadData = () => {
      try {
        const projectData = localStorage.getItem('projectData');
        if (!projectData) {
          console.error('No project data found in localStorage');
          router.push('/');
          return;
        }

        const parsedData = JSON.parse(projectData);
        const { projectIdea, stack, features } = parsedData;

        // Validate required data
        if (!projectIdea) {
          throw new Error('Project idea is missing');
        }
        if (!stack || !stack.name) {
          throw new Error('Tech stack is missing or invalid');
        }
        if (!Array.isArray(features) || features.length === 0) {
          throw new Error('Features are missing or invalid');
        }

        // If all data is valid, generate code
        generateCode(projectIdea, stack, features);
      } catch (error) {
        console.error('Error loading project data:', error);
        setCode('Error: Failed to load project data. Please go back and ensure all information is provided.');
      }
    };

    loadData();
  }, []);

  async function generateCode(projectIdea: string, stack: { name: string }, features: any[]) {
    try {
      // Debug log to check the data being sent
      console.log('Sending data to API:', {
        projectIdea,
        stack,
        features
      });

      const response = await fetch('/api/generate-full-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIdea, stack, features }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedCode = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        accumulatedCode += chunk;
        setCode(accumulatedCode);
      }
    } catch (error) {
      console.error('Error:', error);
      setCode('Error generating code. Please try again.');
    }
  }

  async function handleEditRequest() {
    if (!editPrompt.trim()) return;
    setEditPrompt('');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Generated Code</h1>
          <p className="text-blue-400">Watch as the AI generates your code in real-time...</p>
        </div>

        <div className="bg-[#1E1E1E] rounded-lg overflow-hidden mb-8 relative">
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{
              margin: 0,
              padding: '2rem',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              minHeight: '300px',
            }}
          >
            {code || ''}
          </SyntaxHighlighter>
          {!code && (
            <div 
              className="absolute bottom-8 left-[4rem] w-3 h-5 bg-blue-400 animate-pulse"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Request Changes</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Describe the changes you want to make..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleEditRequest}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={!code}
          >
            Copy Code
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
} 