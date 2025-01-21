'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [projectIdea, setProjectIdea] = useState('');
  const [projectSuggestions] = useState([
    'A task management app with AI-powered prioritization',
    'A social media platform for book lovers',
    'A fitness tracking app with workout recommendations',
    'An e-commerce site for local artisans',
    'A recipe sharing platform with ingredient substitutions',
    'A personal finance manager with budget insights',
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectIdea.trim()) return;

    // Store the project idea in localStorage
    localStorage.setItem('projectData', JSON.stringify({
      projectIdea: projectIdea.trim(),
      timestamp: new Date().toISOString()
    }));

    // Navigate to stack selection page
    router.push('/stack-selection');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setProjectIdea(suggestion);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold">ProFlow</div>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-sm border border-emerald-500/50 rounded-md hover:border-emerald-400 transition-colors">Sign In</button>
            <button className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors">Get Started</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-32 mb-16 text-center">
          <h1 className="text-6xl font-bold mb-4">What do you want to build?</h1>
          <p className="text-gray-400 mb-8">Prompt, run, edit, and deploy full-stack web apps.</p>
          
          {/* Project Input */}
          <form onSubmit={handleSubmit}>
            <div className="relative w-full max-w-2xl mx-auto">
              <textarea 
                className="w-full p-4 bg-gray-900 rounded-lg border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none resize-none"
                placeholder="How can ProFlow help you today?"
                rows={3}
                required
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button 
                  type="button" 
                  className="p-2 text-gray-400 hover:text-emerald-400"
                  onClick={() => setProjectIdea('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <span className="text-sm text-gray-400">{projectIdea.length}</span>
              </div>
            </div>
            <button 
              type="submit"
              className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
            >
              Generate Stack Suggestions →
            </button>
          </form>
        </div>

        {/* Project Suggestions */}
        <div className="flex flex-wrap gap-2 justify-center mt-8">
          {projectSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 bg-gray-900 border border-emerald-500/20 rounded-full text-sm hover:border-emerald-500/40 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="text-center text-gray-400 mt-8">
          or start a blank app with your favorite stack
        </div>
      </div>
    </main>
  );
}
