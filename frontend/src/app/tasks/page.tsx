'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Subtask {
  title: string;
  description: string;
  info: string;
}

interface Feature {
  id: number;
  title: string;
  description: string;
  steps: ImplementationStep[];
  subtasks?: Subtask[];
  category?: string;
}

interface ImplementationStep {
  title: string;
  description: string;
  code_snippet?: string;
  type: 'setup' | 'implementation' | 'testing' | 'optimization';
}

export default function Tasks() {
  const router = useRouter();
  const [projectIdea, setProjectIdea] = useState<string>('');
  const [selectedStack, setSelectedStack] = useState<any>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [generatingSubtasks, setGeneratingSubtasks] = useState<boolean>(false);

  const generateSubtasks = async (params: { 
    id: number;
    title: string;
    description: string;
    steps: ImplementationStep[];
    category?: string;
    projectIdea: string;
    stack: any;
  }) => {
    try {
      // Debug log to check the data being sent
      console.log('Sending data to API:', {
        task: {
          id: params.id,
          title: params.title,
          description: params.description,
          steps: params.steps,
          category: params.category
        },
        projectIdea: params.projectIdea,
        stack: params.stack,
      });

      const response = await fetch('/api/generate-subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: {
            id: params.id,
            title: params.title,
            description: params.description,
            steps: params.steps,
            category: params.category
          },
          projectIdea: params.projectIdea,
          stack: params.stack,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to generate subtasks');
      }
      const data = await response.json();
      return { ...params, subtasks: data.subtasks };
    } catch (error) {
      console.error('Error generating subtasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate subtasks');
      return params;
    }
  };

  useEffect(() => {
    const loadProjectData = () => {
      try {
        const projectDataStr = localStorage.getItem('projectData');
        if (!projectDataStr) {
          router.push('/');
          return;
        }

        const projectData = JSON.parse(projectDataStr);
        if (!projectData.projectIdea || !projectData.stack || !projectData.features) {
          router.push('/');
          return;
        }

        setProjectIdea(projectData.projectIdea);
        setSelectedStack(projectData.stack);
        setFeatures(projectData.features);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading project data:', error);
        router.push('/');
      }
    };

    loadProjectData();
  }, [router]);

  const handleGenerateCode = () => {
    // Save the complete project data before navigating
    try {
      const projectData = {
        projectIdea,
        stack: selectedStack,
        features: features.map(feature => ({
          title: feature.title,
          description: feature.description,
          steps: feature.steps || [],
          subtasks: feature.subtasks || []
        }))
      };
      localStorage.setItem('projectData', JSON.stringify(projectData));
      router.push('/generated-code');
    } catch (error) {
      console.error('Error saving project data:', error);
      setError('Failed to save project data');
    }
  };

  const handleInfoClick = (featureId: number, subtaskIndex: number) => {
    const tooltipId = `${featureId}-${subtaskIndex}`;
    setActiveTooltip(activeTooltip === tooltipId ? null : tooltipId);
  };

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4 text-red-500">Oops! Something went wrong</div>
          <div className="text-gray-400 mb-8">{error}</div>
          <button
            onClick={() => router.push('/features')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
        <div className="text-center animate-pulse">
          <div className="text-2xl font-bold mb-4">Loading your project...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-black text-white">
      <div className="w-full max-w-[1200px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 animate-fade-in">
          <div 
            className="text-2xl font-bold cursor-pointer hover:text-emerald-400 transition-colors duration-300" 
            onClick={() => router.push('/')}
          >
            ProFlow
          </div>
          <button 
            onClick={() => router.push('/features')}
            className="px-4 py-2 text-sm border border-emerald-500/50 rounded-md hover:border-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            ← Back to Features
          </button>
        </div>

        {/* Project Info */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold mb-4">Project Overview</h1>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">{projectIdea}</p>
            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-400 mb-2">Selected Stack:</p>
              <p className="text-emerald-400">{selectedStack?.name}</p>
            </div>
            {generatingSubtasks && (
              <div className="mt-4 text-sm text-emerald-400 animate-pulse">
                Generating subtasks for all features...
              </div>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-16 animate-fade-in">
          {features.map((feature) => (
            <div key={feature.id} className="space-y-6">
              {/* Main Task Box */}
              <div className="bg-gray-900 p-8 rounded-[48px] border-2 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-400 mb-4">{feature.title}</h2>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </div>
              </div>

              {/* Subtasks Container */}
              {feature.subtasks && (
                <div className="ml-8 space-y-3">
                  {feature.subtasks.map((subtask, index) => (
                    <div 
                      key={index}
                      className="relative bg-gray-900/50 p-4 rounded-[24px] border-2 border-emerald-500/40 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-medium">{index + 1}.</span>
                          <h3 className="font-medium">{subtask.title}</h3>
                        </div>
                        <button
                          onClick={() => handleInfoClick(feature.id, index)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900 transition-all duration-300"
                        >
                          ℹ️
                        </button>
                      </div>

                      {/* Info Tooltip */}
                      {activeTooltip === `${feature.id}-${index}` && (
                        <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-emerald-500/30 animate-fade-in">
                          <p className="text-sm text-gray-300 mb-3">{subtask.description}</p>
                          <div className="mt-2 p-3 bg-black/50 rounded border border-emerald-500/10">
                            <div className="text-xs text-emerald-400 mb-1">Additional Information:</div>
                            <p className="text-sm text-gray-400">{subtask.info}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="mt-12 flex justify-end gap-4 animate-fade-in">
          <button
            onClick={handleGenerateCode}
            disabled={features.length === 0}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2"
          >
            <span>Generate Full Code</span>
            <span className="text-xs">✨</span>
          </button>

          <button
            onClick={() => {
              const data = { projectIdea, selectedStack, features };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'project-tasks.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2"
          >
            <span>Export Project</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
} 