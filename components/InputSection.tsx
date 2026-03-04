
import React from 'react';
import type { EvolutionLevel } from '../types';
import { EVOLUTION_LEVELS } from '../constants';

interface InputSectionProps {
  problem: string;
  setProblem: (problem: string) => void;
  evolutionLevel: EvolutionLevel;
  onLevelChange: (level: EvolutionLevel) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  problem,
  setProblem,
  evolutionLevel,
  onLevelChange,
  onAnalyze,
  isLoading,
}) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 mb-8 shadow-lg">
      <textarea
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        placeholder="Describe your problem or challenge here..."
        className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none transition-colors"
        disabled={isLoading}
      />
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="evolutionLevel" className="block text-sm font-medium text-gray-400 mb-1">
            Evolution Level
          </label>
          <select
            id="evolutionLevel"
            value={evolutionLevel}
            onChange={(e) => onLevelChange(e.target.value as EvolutionLevel)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
            disabled={isLoading}
          >
            {EVOLUTION_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}: {level.description}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isLoading || !problem.trim()}
          className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? 'ANALIZANDO...' : 'SINTETIZAR'}
        </button>
      </div>
    </div>
  );
};
