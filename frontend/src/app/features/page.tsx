'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from '@hello-pangea/dnd';

interface Feature {
  id: number;
  title: string;
  description: string;
  steps: ImplementationStep[];
  isExpanded: boolean;
  category?: string;
}

interface ImplementationStep {
  title: string;
  description: string;
  code_snippet?: string;
  type: 'setup' | 'implementation' | 'testing' | 'optimization';
}

interface SuggestedFeature {
  title: string;
  description: string;
  category: 'core' | 'ux' | 'technical' | 'security';
}

export default function Features() {
  const router = useRouter();
  const [projectIdea, setProjectIdea] = useState<string>('');
  const [selectedStack, setSelectedStack] = useState<any>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [suggestedFeatures, setSuggestedFeatures] = useState<SuggestedFeature[]>([]);
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(true);

  useEffect(() => {
    const loadProjectData = () => {
      try {
        const projectDataStr = localStorage.getItem('projectData');
        if (!projectDataStr) {
          router.push('/');
          return;
        }

        const projectData = JSON.parse(projectDataStr);
        if (!projectData.projectIdea || !projectData.stack) {
          router.push('/');
          return;
        }

        setProjectIdea(projectData.projectIdea);
        setSelectedStack(projectData.stack);

        // Load existing features if they exist
        if (projectData.features) {
          setFeatures(projectData.features);
        }

        // Fetch suggested features if we don't have any yet
        if (!projectData.features || projectData.features.length === 0) {
          fetchSuggestedFeatures(projectData.projectIdea, projectData.stack);
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        router.push('/');
      }
    };

    loadProjectData();
  }, [router]);

  // Update localStorage whenever features change
  useEffect(() => {
    const updateProjectData = () => {
      try {
        const projectDataStr = localStorage.getItem('projectData');
        if (projectDataStr) {
          const projectData = JSON.parse(projectDataStr);
          projectData.features = features;
          localStorage.setItem('projectData', JSON.stringify(projectData));
        }
      } catch (error) {
        console.error('Error updating project data:', error);
      }
    };

    updateProjectData();
  }, [features]);

  const fetchSuggestedFeatures = async (idea: string, stack: any) => {
    setIsSuggestionsLoading(true);
    try {
      const response = await fetch('/api/generate-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIdea: idea, stack }),
      });

      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestedFeatures(data.features || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  const generateSteps = async (feature: Feature) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          stack: selectedStack,
          projectIdea,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate steps');
      const data = await response.json();
      
      setFeatures(features.map(f => 
        f.id === feature.id 
          ? { ...f, steps: data.steps }
          : f
      ));
    } catch (error) {
      console.error('Error generating steps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([
        ...features,
        {
          id: Date.now(),
          title: newFeature,
          description: '',
          steps: [],
          isExpanded: false
        }
      ]);
      setNewFeature('');
      setIsAddingFeature(false);
    }
  };

  const handleFeatureClick = (id: number) => {
    setFeatures(features.map(feature => ({
      ...feature,
      isExpanded: feature.id === id ? !feature.isExpanded : feature.isExpanded
    })));
  };

  const handleDeleteFeature = (id: number) => {
    setFeatures(features.filter(feature => feature.id !== id));
  };

  const handleDescriptionChange = (id: number, description: string) => {
    setFeatures(features.map(feature =>
      feature.id === id ? { ...feature, description } : feature
    ));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(features);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFeatures(items);
  };

  const handleGenerateSteps = async (feature: Feature) => {
    if (feature.steps.length === 0) {
      await generateSteps(feature);
    }
  };

  const handleSuggestionClick = (suggestion: SuggestedFeature) => {
    setFeatures([
      ...features,
      {
        id: Date.now(),
        title: suggestion.title,
        description: suggestion.description,
        steps: [],
        isExpanded: false,
        category: suggestion.category
      }
    ]);

    setSuggestedFeatures(suggestedFeatures.filter(s => s.title !== suggestion.title));
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-black text-white">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 animate-fade-in">
          <div 
            className="text-2xl font-bold cursor-pointer hover:text-emerald-400 transition-colors duration-300" 
            onClick={() => router.push('/')}
          >
            ProFlow
          </div>
          <button 
            onClick={() => router.push('/stack-selection')}
            className="px-4 py-2 text-sm border border-emerald-500/50 rounded-md hover:border-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            ← Back to Stack Selection
          </button>
        </div>

        {/* Project Info */}
        <div className="mt-8 mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold mb-4 animate-glow">Let's plan your features</h1>
          <div className="bg-gray-900 p-6 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
            <p className="text-gray-400">Project:</p>
            <p className="text-lg text-white mb-4">{projectIdea}</p>
            <p className="text-gray-400">Selected Stack:</p>
            <p className="text-emerald-400">{selectedStack?.name}</p>
          </div>
        </div>

        {/* Feature List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="features">
            {(provided: DroppableProvided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {features.map((feature, index) => (
                  <Draggable 
                    key={feature.id} 
                    draggableId={feature.id.toString()} 
                    index={index}
                  >
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{ animationDelay: `${index * 150}ms`, ...provided.draggableProps.style }}
                        className="animate-fade-slide-up"
                      >
                        <div 
                          className={`p-6 rounded-lg bg-gray-900 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] ${feature.isExpanded ? 'shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div {...provided.dragHandleProps} className="cursor-move text-gray-500 hover:text-emerald-400">
                                ⋮⋮
                              </div>
                              <h3 
                                className="text-lg font-semibold cursor-pointer"
                                onClick={() => handleFeatureClick(feature.id)}
                              >
                                {feature.title}
                              </h3>
                            </div>
                            <button
                              onClick={() => handleDeleteFeature(feature.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors duration-300"
                            >
                              ×
                            </button>
                          </div>
                          
                          {feature.isExpanded && (
                            <div className="mt-4 space-y-4 animate-slide-up">
                              <div>
                                <label className="text-sm text-emerald-400 mb-2 block">Description</label>
                                <textarea
                                  className="w-full p-3 bg-black rounded border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none resize-none text-sm"
                                  placeholder="Describe this feature..."
                                  rows={3}
                                  value={feature.description}
                                  onChange={(e) => handleDescriptionChange(feature.id, e.target.value)}
                                />
                              </div>
                              <div>
                                <div className="flex justify-between items-center">
                                  <label className="text-sm text-emerald-400 mb-2">Implementation Steps</label>
                                  {feature.steps.length === 0 && (
                                    <button
                                      onClick={() => handleGenerateSteps(feature)}
                                      className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-300 flex items-center gap-2"
                                      disabled={isLoading}
                                    >
                                      {isLoading ? (
                                        <span className="animate-pulse">Generating steps...</span>
                                      ) : (
                                        <>
                                          <span>Generate Steps</span>
                                          <span className="text-xs">✨</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {feature.steps.map((step, i) => (
                                    <div key={i} className="p-3 bg-black rounded border border-emerald-500/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-emerald-400">{i + 1}.</span>
                                        <span className="font-medium">{step.title}</span>
                                        <span className="text-xs px-2 py-1 bg-emerald-900/30 rounded-full text-emerald-400 ml-auto">
                                          {step.type}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-400 ml-6">{step.description}</p>
                                      {step.code_snippet && (
                                        <pre className="mt-2 p-2 bg-black/50 rounded border border-emerald-500/10 text-xs overflow-x-auto">
                                          <code>{step.code_snippet}</code>
                                        </pre>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Feature Button */}
        {!isAddingFeature ? (
          <button
            onClick={() => setIsAddingFeature(true)}
            className="mt-6 w-full py-4 rounded-lg border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          >
            + Add Feature
          </button>
        ) : (
          <div className="mt-6 animate-fade-slide-up">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Enter feature name..."
                className="flex-1 p-4 bg-gray-900 rounded-lg border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                autoFocus
              />
              <button
                onClick={handleAddFeature}
                className="px-6 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingFeature(false)}
                className="px-6 border border-emerald-500/50 hover:border-emerald-400 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        <div className="mt-12 p-6 rounded-lg bg-emerald-950/20 border border-emerald-500/30 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4">Suggested Features</h2>
          {isSuggestionsLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="text-emerald-400 animate-pulse text-lg">Generating suggestions...</div>
              <div className="text-gray-400 text-sm animate-pulse">Analyzing your project requirements</div>
            </div>
          ) : suggestedFeatures.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {suggestedFeatures.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-4 text-left bg-black/50 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium group-hover:text-emerald-400 transition-colors duration-300">
                      {suggestion.title}
                    </span>
                    <span className="text-xs px-2 py-1 bg-emerald-900/30 rounded-full text-emerald-400">
                      {suggestion.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{suggestion.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-4">
              All suggestions have been added! You can still add custom features above.
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-end animate-fade-in">
          <button 
            onClick={() => router.push('/tasks')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            disabled={features.length === 0}
          >
            View Tasks →
          </button>
        </div>
      </div>
    </main>
  );
} 