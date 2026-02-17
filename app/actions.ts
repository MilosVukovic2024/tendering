 'use server';

import 'server-only';

import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisResult, LegalComplianceResult, ProcurementData } from '../types';

const LEGAL_CONTEXT = `
Kao AI revizor, koristiš Zakon o javnim nabavkama Crne Gore (Službeni list CG br. 74/2019, 3/2023, 11/2023, 84/2024)
I NOVE "SMJERNICE ZA UTVRĐIVANJE PROCIJENJENU VRIJEDNOSTI JAVNE NABAVKE" (Ministarstvo finansija CG, Septembar 2023).

VAŽNA PRAVILA ZA ANALIZU:
1. SIGNALI RIZIKA (redFlags): STROGO JE ZABRANJENO pominjati specifične članove zakona u polju 'redFlags' prvobitne analize. Fokusiraj se na logiku.
2. INDEKS RIZIKA (probability): Mora biti cijeli broj u rasponu od 1 do 100.
`;

function getGeminiApiKey() {
  // Primary: GEMINI_API_KEY (recommended)
  // Fallback: API_KEY (legacy from previous Vite define)
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!key) {
    throw new Error(
      'Missing Gemini API key. Set GEMINI_API_KEY in .env.local (server-side only).',
    );
  }
  return key;
}

export async function analyzeProcurement(data: ProcurementData): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });

  const formattedSpecs = data.specification
    .map(
      (item, index) => `STAVKA #${index + 1}:
     - Opis: ${item.description}
     - Karakteristike: ${item.characteristics}
     - Količina: ${item.quantity}`,
    )
    .join('\n\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
    ${LEGAL_CONTEXT}

    ANALIZIRAJ NABAVKU:
    SPECIFIKACIJA:
    ${formattedSpecs}
    UNESENA CIJENA: ${data.price} EUR

    ZADATAK:
    1. Izračunaj realnu TRŽIŠNU PROCJENU vrijednosti nabavke.
    2. Detaljno obrazloži tržišnu analizu.
    3. Nemoj pominjati članove zakona u polju 'redFlags'.

    ODGOVORI NA CRNOGORSKOM JEZIKU.
    `,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          probability: { type: Type.NUMBER },
          priceAssessment: { type: Type.STRING },
          redFlags: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                severity: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['description', 'severity', 'explanation'],
            },
          },
          redFlagCategories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                score: { type: Type.NUMBER },
              },
              required: ['category', 'score'],
            },
          },
          detailedExplanation: { type: Type.STRING },
          marketValueEstimate: { type: Type.STRING },
          savings: {
            type: Type.OBJECT,
            properties: {
              estimatedMarketPrice: { type: Type.NUMBER },
              differenceAmount: { type: Type.NUMBER },
              differencePercentage: { type: Type.NUMBER },
              socialImpactDescription: { type: Type.STRING },
            },
            required: [
              'estimatedMarketPrice',
              'differenceAmount',
              'differencePercentage',
              'socialImpactDescription',
            ],
          },
          conclusion: { type: Type.STRING },
          tieredRecommendations: {
            type: Type.OBJECT,
            properties: {
              immediateActions: { type: Type.ARRAY, items: { type: Type.STRING } },
              strategicAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
              preventiveMeasures: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['immediateActions', 'strategicAdvice', 'preventiveMeasures'],
          },
        },
        required: [
          'probability',
          'priceAssessment',
          'redFlags',
          'redFlagCategories',
          'detailedExplanation',
          'marketValueEstimate',
          'savings',
          'conclusion',
          'tieredRecommendations',
        ],
      },
    },
  });

  return JSON.parse(response.text || '{}') as AnalysisResult;
}

export async function analyzeLegalCompliance(
  data: ProcurementData,
  initialAnalysis: AnalysisResult,
): Promise<LegalComplianceResult> {
  const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });

  const formattedSpecs = data.specification
    .map((item, index) => `STAVKA #${index + 1}: ${item.description} - ${item.characteristics}`)
    .join('; ');

  const prompt = `
    Kao pravni ekspert za javne nabavke u Crnoj Gori, izvrši detaljnu reviziju usklađenosti na osnovu:
    1. Zakona o javnim nabavkama (ZJN) Crne Gore.
    2. Smjernica Ministarstva finansija za utvrđivanje procijenjene vrijednosti (Septembar 2023).

    PODACI ZA ANALIZU:
    - Specifikacija: ${formattedSpecs}
    - Cijena: ${data.price} EUR
    - Prethodna AI forenzička procjena rizika: ${initialAnalysis.probability}%

    ZADATAK:
    1. Identifikuj specifične članove ZJN koji su potencijalno prekršeni (npr. Član 7 - Načelo ekonomičnosti, Član 82 - Procijenjena vrijednost).
    2. Provjeri usklađenost sa Smjernicama MF (fokus na istraživanje tržišta i dokumentovanje procjene).
    3. BUDI OBRAZRIV U KVALIFIKACIJAMA. Koristi termine kao što su "ukazuje na potencijalno odstupanje", "može doći do povrede načela", "potrebno dodatno provjeriti".
    4. Navedi načela koja su ugrožena.

    ODGOVORI NA CRNOGORSKOM JEZIKU.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          violations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                article: { type: Type.STRING, description: 'Referenca na član zakona' },
                principle: { type: Type.STRING, description: 'Povezano načelo' },
                description: { type: Type.STRING, description: 'Detaljan opis potencijalne povrede' },
                cautionaryNote: { type: Type.STRING, description: 'Obazriva kvalifikacija rizika' },
              },
              required: ['article', 'principle', 'description', 'cautionaryNote'],
            },
          },
          guidelineCompliance: { type: Type.STRING, description: 'Usklađenost sa Smjernicama MF' },
          overallComplianceScore: { type: Type.NUMBER },
        },
        required: ['summary', 'violations', 'guidelineCompliance', 'overallComplianceScore'],
      },
    },
  });

  return JSON.parse(response.text || '{}') as LegalComplianceResult;
}

