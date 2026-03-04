
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import type { AnalysisResult, CholaResult, MalandraResult, FresaResult, EvolutionLevel, GroundingChunk } from '../types';
import { PERSONA_PROMPTS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_REALITY = 'gemini-3-flash-preview';            
const MODEL_CRITIC = 'gemini-3-flash-preview';             
const MODEL_SPEED = 'gemini-2.5-flash-lite-preview-02-05'; 
const MODEL_BALANCE = 'gemini-3-flash-preview';            
const MODEL_QUANTUM = 'gemini-3-pro-preview';              
const MODEL_VOICE = 'gemini-2.5-flash-preview-tts';        

/**
 * SCHEMAS
 */
const cholaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    coreInsight: { type: Type.STRING },
    strategicView: { type: Type.STRING },
    costOfInaction: { type: Type.STRING },
  },
  required: ["coreInsight", "strategicView", "costOfInaction"],
};

const malandraSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fatalFlaw: { type: Type.STRING },
    deconstruction: { type: Type.STRING },
    overlookedRisk: { type: Type.STRING },
    hardQuestion: { type: Type.STRING },
  },
  required: ["fatalFlaw", "deconstruction", "overlookedRisk", "hardQuestion"],
};

const fresaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    details: { type: Type.ARRAY, items: { type: Type.STRING } },
    justification: { type: Type.STRING },
  },
  required: ["title", "details"],
};

/**
 * CORE AGENTS
 */

export const generateCholaResponse = async (problem: string): Promise<CholaResult> => {
  const response = await ai.models.generateContent({
    model: MODEL_REALITY,
    contents: [{ role: 'user', parts: [{ text: `${PERSONA_PROMPTS.CHOLA}\n\nPROBLEM: ${problem}` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: cholaSchema,
      tools: [{ googleSearch: {} }],
    },
  });
  const result = JSON.parse(response.text) as CholaResult;
  result.groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  return result;
};

export const generateMalandraResponse = async (thesis: CholaResult, problem: string): Promise<MalandraResult> => {
  const context = `PROBLEM: ${problem}\nTHESIS: ${JSON.stringify(thesis)}`;
  const response = await ai.models.generateContent({
    model: MODEL_CRITIC,
    contents: [{ role: 'user', parts: [{ text: `${PERSONA_PROMPTS.MALANDRA}\n\nCONTEXT:\n${context}` }] }],
    config: { responseMimeType: "application/json", responseSchema: malandraSchema },
  });
  return JSON.parse(response.text) as MalandraResult;
};

export const generateFresaResponse = async (
  thesis: CholaResult, 
  antithesis: MalandraResult, 
  level: EvolutionLevel, 
  problem: string,
  userFeedback?: string
): Promise<FresaResult> => {
  let selectedModel = MODEL_BALANCE;
  let config: any = { responseMimeType: "application/json", responseSchema: fresaSchema };

  if (level === '3') selectedModel = MODEL_SPEED;
  if (level === '9') {
    selectedModel = MODEL_QUANTUM;
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  const feedbackContext = userFeedback ? `\nUSER FEEDBACK ON PREVIOUS SYNTHESIS: ${userFeedback}\nADJUST ACCORDINGLY.` : "";
  const prompt = `${PERSONA_PROMPTS.FRESA}\nLEVEL: ${level}\nCONTEXT: ${JSON.stringify({problem, thesis, antithesis})}${feedbackContext}`;

  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: config,
  });

  return {
    level,
    content: JSON.parse(response.text),
    feedbackHistory: userFeedback ? [userFeedback] : []
  };
};

export const generateSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_VOICE,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const getFullAnalysis = async (problem: string, level: EvolutionLevel): Promise<AnalysisResult> => {
  const thesis = await generateCholaResponse(problem);
  const antithesis = await generateMalandraResponse(thesis, problem);
  const synthesis = await generateFresaResponse(thesis, antithesis, level, problem);
  return { thesis, antithesis, synthesis };
};
