'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface StackSuggestion {
  id: number;
  name: string;
  framework: string;
  additionalTech: string;
  storage: string;
  description: string;
  recommended: boolean;
}

export default function StackSelection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedStacks, setSuggestedStacks] = useState<StackSuggestion[]>([]);
  const [projectIdea, setProjectIdea] = useState<string>('');
  
  useEffect(() => {
    const fetchStackSuggestions = async () => {
      try {
        const projectDataStr = localStorage.getItem('projectData');
        if (!projectDataStr) {
          router.push('/');
          return;
        }

        const projectData = JSON.parse(projectDataStr);
        setProjectIdea(projectData.projectIdea);

        const response = await fetch('/api/generate-stack', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectIdea: projectData.projectIdea }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate stack suggestions');
        }

        const data = await response.json();
        setSuggestedStacks(data.stacks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStackSuggestions();
  }, [router]);

  const handleStackSelect = (stackId: number) => {
    const selectedStack = suggestedStacks.find(stack => stack.id === stackId);
    if (selectedStack) {
      // Update the project data with the selected stack
      const projectData = JSON.parse(localStorage.getItem('projectData') || '{}');
      projectData.stack = selectedStack;
      localStorage.setItem('projectData', JSON.stringify(projectData));
      
      router.push('/features');
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
        <div className="text-center animate-pulse">
          <div className="text-2xl font-bold mb-4">🤔 Thinking...</div>
          <div className="text-gray-400">Finding the perfect tools for your project</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
        <div className="text-center animate-bounce">
          <div className="text-2xl font-bold mb-4 text-red-500">Oops! Something went wrong</div>
          <div className="text-gray-400 mb-8">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-black text-white">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 animate-fade-in">
          <div 
            className="text-2xl font-bold cursor-pointer hover:text-emerald-400 transition-colors duration-300" 
            onClick={() => router.push('/')}
          >
            ProFlow
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm border border-emerald-500/50 rounded-md hover:border-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            ← Back
          </button>
        </div>

        {/* Main Content */}
        <div className="mt-16 mb-12 text-center animate-fade-in">
          <h1 className="text-3xl font-bold mb-4 animate-glow">Here's what we recommend</h1>
          <p className="text-lg text-emerald-400 mb-2">For your project:</p>
          <p className="text-xl text-gray-300 italic animate-slide-up">{projectIdea}</p>
        </div>

        {/* Stack Options */}
        <div className="space-y-6">
          {suggestedStacks.map((stack, index) => (
            <div
              key={stack.id}
              style={{ animationDelay: `${index * 150}ms` }}
              className={`p-6 rounded-lg animate-fade-slide-up ${
                stack.recommended
                  ? 'bg-emerald-950/20 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-gray-900 border border-emerald-500/20'
              } hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 hover:scale-[1.02]`}
            >
              {stack.recommended && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-emerald-400 animate-pulse">★</span>
                  <span className="text-sm text-emerald-400">Recommended for beginners</span>
                </div>
              )}
              
              <h2 className="text-xl font-semibold mb-3">{stack.name}</h2>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">{stack.description}</p>

              <div className="space-y-3">
                <div className="transform transition-all duration-300 hover:translate-x-2">
                  <div className="text-sm text-emerald-400 mb-1">Main Tool</div>
                  <div className="text-white">{stack.framework}</div>
                </div>
                <div className="transform transition-all duration-300 hover:translate-x-2">
                  <div className="text-sm text-emerald-400 mb-1">Helper Tools</div>
                  <div className="text-white">{stack.additionalTech}</div>
                </div>
                {stack.storage && (
                  <div className="transform transition-all duration-300 hover:translate-x-2">
                    <div className="text-sm text-emerald-400 mb-1">Storage</div>
                    <div className="text-white">{stack.storage}</div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => handleStackSelect(stack.id)}
                  className={`w-full py-3 rounded-md transition-all duration-300 text-center transform hover:scale-[1.02] ${
                    stack.recommended 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'border border-emerald-500/50 hover:border-emerald-400 text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  Use this stack
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Stack Option */}
        <div className="mt-8 text-center animate-fade-in">
          <button 
            className="text-emerald-400 hover:text-emerald-300 transition-all duration-300 text-sm hover:scale-105 transform"
          >
            Want to use different tools? Create your own combination →
          </button>
        </div>
      </div>
    </main>
  );
} 