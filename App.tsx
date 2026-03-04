
import React, { useState, useCallback } from 'react';
import { InputSection } from './components/InputSection';
import { ResultsSection } from './components/ResultsSection';
import { getFullAnalysis, generateFresaResponse } from './services/geminiService';
import type { AnalysisResult, EvolutionLevel } from './types';

const App: React.FC = () => {
  const [problem, setProblem] = useState<string>("Our startup is struggling with product-market fit. Pivot or double down?");
  const [evolutionLevel, setEvolutionLevel] = useState<EvolutionLevel>('6');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  const handleAnalyze = useCallback(async () => {
    if (!problem.trim()) return;
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await getFullAnalysis(problem, evolutionLevel);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [problem, evolutionLevel]);

  const handleRefine = useCallback(async (feedback: string) => {
    if (!analysisResult) return;
    setIsSynthesizing(true);
    try {
      const newSynthesis = await generateFresaResponse(
        analysisResult.thesis,
        analysisResult.antithesis,
        evolutionLevel,
        problem,
        feedback
      );
      setAnalysisResult(prev => prev ? { ...prev, synthesis: newSynthesis } : null);
    } catch (error) {
      console.error("Refinement Error:", error);
    } finally {
      setIsSynthesizing(false);
    }
  }, [analysisResult, evolutionLevel, problem]);

  const handleLevelChange = useCallback((newLevel: EvolutionLevel) => {
    setEvolutionLevel(newLevel);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col items-center mb-12">
          <div className="relative">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              CHALAMANDRA
            </h1>
            <div className="absolute -top-4 -right-8 px-2 py-0.5 bg-pink-600 text-[10px] font-bold rounded-full rotate-12 shadow-lg shadow-pink-900/50">
              QUANTUM MIND
            </div>
          </div>
          <p className="text-gray-500 mt-4 font-mono text-sm tracking-widest uppercase">Dialectical Intelligence Framework</p>
        </header>

        <main className="space-y-10">
          <InputSection
            problem={problem}
            setProblem={setProblem}
            evolutionLevel={evolutionLevel}
            onLevelChange={handleLevelChange}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          <ResultsSection
            result={analysisResult}
            isLoading={isLoading}
            isSynthesizing={isSynthesizing}
            onRefine={handleRefine}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
