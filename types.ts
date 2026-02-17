
export type PriceAssessment = 'fair' | 'overpriced' | 'suspiciously_low' | 'unknown';
export type Severity = 'low' | 'medium' | 'high';

export interface RedFlag {
  description: string;
  severity: Severity;
  explanation: string;
}

export interface RedFlagCategory {
  category: string;
  score: number; // 0-10 skala rizika
}

export interface Source {
  title: string;
  uri: string;
}

export interface TieredRecommendations {
  immediateActions: string[];
  strategicAdvice: string[];
  preventiveMeasures: string[];
}

export interface SpecificationItem {
  description: string;
  characteristics: string;
  quantity: string;
}

export interface SavingsAnalysis {
  estimatedMarketPrice: number;
  differenceAmount: number;
  differencePercentage: number;
  socialImpactDescription: string;
}

export interface LegalViolation {
  article: string;
  principle: string;
  description: string;
  cautionaryNote: string;
}

export interface LegalComplianceResult {
  summary: string;
  violations: LegalViolation[];
  guidelineCompliance: string;
  overallComplianceScore: number; // 0-100
}

export interface AnalysisResult {
  probability: number;
  priceAssessment: PriceAssessment;
  redFlags: RedFlag[];
  redFlagCategories: RedFlagCategory[];
  detailedExplanation: string;
  marketValueEstimate: string;
  savings: SavingsAnalysis;
  conclusion: string;
  tieredRecommendations: TieredRecommendations;
  sources?: Source[];
}

export interface ProcurementData {
  specification: SpecificationItem[];
  price: number;
  currency: 'EUR';
}
