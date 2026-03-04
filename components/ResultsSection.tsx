
import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { PersonaCard } from './PersonaCard';
import { Spinner } from './Spinner';
import { CholaIcon } from './icons/CholaIcon';
import { MalandraIcon } from './icons/MalandraIcon';
import { FresaIcon } from './icons/FresaIcon';
import { generateSpeech } from '../services/geminiService';

interface ResultsSectionProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  isSynthesizing: boolean;
  onRefine: (feedback: string) => void;
}

class AudioEngine {
  private static instance: AudioEngine;
  private context: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private constructor() {}
  public static getInstance() {
    if (!AudioEngine.instance) AudioEngine.instance = new AudioEngine();
    return AudioEngine.instance;
  }
  private getContext() {
    if (!this.context) this.context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    if (this.context.state === 'suspended') this.context.resume();
    return this.context;
  }
  public stop() {
    if (this.currentSource) { try { this.currentSource.stop(); } catch(e){} this.currentSource = null; }
  }
  public async play(base64: string, onEnded: () => void) {
    this.stop();
    const ctx = this.getContext();
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const buffer = await ctx.decodeAudioData(bytes.buffer);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = onEnded;
    this.currentSource = source;
    source.start(0);
  }
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result, isLoading, isSynthesizing, onRefine }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cachedAudio, setCachedAudio] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    setCachedAudio(null);
    setIsPlaying(false);
    AudioEngine.getInstance().stop();
    setShowFeedbackForm(false);
  }, [result?.thesis]);

  const handleSpeak = async () => {
    if (!result?.synthesis) return;
    if (isPlaying) { AudioEngine.getInstance().stop(); setIsPlaying(false); return; }
    if (cachedAudio) { setIsPlaying(true); AudioEngine.getInstance().play(cachedAudio, () => setIsPlaying(false)); return; }
    setIsGeneratingAudio(true);
    try {
      const text = `${result.synthesis.content.title}. ${result.synthesis.content.details.join('. ')}`;
      const base64 = await generateSpeech(text);
      setCachedAudio(base64);
      setIsPlaying(true);
      AudioEngine.getInstance().play(base64, () => setIsPlaying(false));
    } catch (e) { console.error(e); setIsPlaying(false); } finally { setIsGeneratingAudio(false); }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center py-20 space-y-6">
      <div className="relative">
        <Spinner />
        <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20"></div>
      </div>
      <p className="text-purple-400 font-mono text-xs tracking-widest uppercase">Deconstructing Reality...</p>
    </div>
  );

  if (!result) return <div className="text-center py-20 text-gray-600 font-mono text-sm tracking-widest">AWAITING INPUT...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* THESIS: CHOLA */}
      <PersonaCard icon={<CholaIcon />} title="THESIS" subtitle="CHOLA" color="teal" isLoading={false}>
        <div className="space-y-6">
          <div className="p-3 bg-teal-950/20 border-l-2 border-teal-500">
            <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-tighter mb-1">Core Insight</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{result.thesis.coreInsight}</p>
          </div>
          <p className="text-gray-400 text-sm italic">"{result.thesis.strategicView}"</p>
          {result.thesis.groundingChunks && result.thesis.groundingChunks.length > 0 && (
            <div className="pt-4 border-t border-teal-900/30">
              <h4 className="text-[10px] font-bold text-teal-600 uppercase mb-2">Verified Realities</h4>
              <div className="flex flex-wrap gap-2">
                {result.thesis.groundingChunks.map((c, i) => c.web && (
                  <a key={i} href={c.web.uri} target="_blank" className="text-[10px] bg-teal-900/40 text-teal-200 px-2 py-1 rounded hover:bg-teal-800 transition-colors truncate max-w-[150px]">
                    {c.web.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </PersonaCard>

      {/* ANTITHESIS: MALANDRA */}
      <PersonaCard icon={<MalandraIcon />} title="ANTITHESIS" subtitle="MALANDRA" color="red" isLoading={false}>
        <div className="space-y-6">
          <div className="p-3 bg-red-950/20 border-l-2 border-red-500">
            <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-tighter mb-1">Fatal Flaw</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{result.antithesis.fatalFlaw}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400 text-xs">Risk: {result.antithesis.overlookedRisk}</p>
            <p className="text-red-300 text-sm font-bold italic">"{result.antithesis.hardQuestion}"</p>
          </div>
        </div>
      </PersonaCard>

      {/* SYNTHESIS: FRESA (SALAMANDRA LOOP) */}
      <PersonaCard 
        icon={<FresaIcon />} title="SYNTHESIS" subtitle="FRESA" color="pink" isLoading={isSynthesizing}
        onAction={handleSpeak} 
        actionIcon={isGeneratingAudio ? <Spinner size="small" /> : (isPlaying ? "⏹" : "▶")}
        actionLabel={isPlaying ? "Stop" : "Listen"}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-pink-300 text-lg leading-tight">{result.synthesis.content.title}</h4>
            {result.synthesis.level === '9' && (
              <span className="text-[9px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 animate-pulse">Quantum Pensante</span>
            )}
          </div>
          
          <ul className="space-y-3">
            {result.synthesis.content.details.map((d, i) => (
              <li key={i} className="flex items-start text-sm text-gray-300">
                <span className="text-pink-500 mr-2 mt-1">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>

          {/* SALAMANDRA FEEDBACK LOOP */}
          <div className="pt-6 border-t border-pink-900/30">
            {!showFeedbackForm ? (
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-500 uppercase font-mono">Feedback Loop:</p>
                <div className="flex space-x-2">
                  <button onClick={() => setShowFeedbackForm(true)} className="p-2 hover:bg-pink-500/10 rounded-full transition-colors">👎</button>
                  <button className="p-2 hover:bg-teal-500/10 rounded-full transition-colors">👍</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <textarea 
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Tell Fresa what's missing..."
                  className="w-full bg-black/50 border border-pink-500/30 rounded p-2 text-xs focus:ring-1 focus:ring-pink-500 outline-none"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowFeedbackForm(false)} className="text-[10px] text-gray-500 hover:text-white">Cancel</button>
                  <button 
                    onClick={() => { onRefine(feedbackInput); setFeedbackInput(""); setShowFeedbackForm(false); }}
                    className="text-[10px] bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded"
                  >Refine Synthesis</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PersonaCard>
    </div>
  );
};
