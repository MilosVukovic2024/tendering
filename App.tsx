'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw,
  PlusCircle,
  Trash2,
  TrendingUp,
  Download,
  Mail,
  Target,
  Gavel,
  Zap,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Fingerprint,
  Baby,
  Wine,
  Sparkles,
  Lightbulb,
  UserRoundSearch,
  Rocket,
  Ghost,
  Navigation,
  CloudRain,
  Scale,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { AnalysisResult, ProcurementData, Severity, SpecificationItem, LegalComplianceResult } from './types';
import { analyzeProcurementWithLegal as apiAnalyze } from './app/actions';

const FidelityLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#B51D4E" />
    <path 
      d="M50 20V80M50 35C42.5 35 36 41.7157 36 50C36 58.2843 42.5 65 50 65C57.5 65 64 58.2843 64 50C64 41.7157 57.5 35 50 35Z" 
      stroke="white" 
      strokeWidth="6" 
      strokeLinecap="round"
    />
  </svg>
);

const LOADING_SLIDES = [
  {
    title: "Bilansi Vaše kompanije su jedinstveni baš kao i Vaš otisak prsta.",
    subtitle: "Za Vas, pravimo odgovarajuća unikatna rješenja.",
    service: "Finansije za sve. Dvodnevni in-house trening.",
    price: "1.399 eura.",
    icon: <Fingerprint size={64} strokeWidth={1} className="text-slate-400" />
  },
  {
    title: "Zapravo, mi ne pišemo biznis plan za kompaniju.",
    subtitle: "Mi pripremamo kompaniju za nasljednika.",
    service: "Biznis plan.",
    price: "Već od 299 eura.",
    icon: <Baby size={64} strokeWidth={1} className="text-slate-400" />
  },
  {
    title: "Zapravo, biznis je kao vino; što je zreliji, to je bolji.",
    subtitle: "Mi smo Vaša podrška u stvaranju tradicije.",
    service: "Biznis plan.",
    price: "Već od 299 eura.",
    icon: <Wine size={64} strokeWidth={1} className="text-slate-400" />
  },
  {
    title: "Zapravo, mi ne predviđamo budućnost.",
    subtitle: "Mi je stvaramo.",
    service: "Biznis plan.",
    price: "Već od 299 eura.",
    icon: <Sparkles size={64} strokeWidth={1} className="text-slate-400" />
  },
  {
    title: "Vi treba da mislite, razvijate ideje i stvarate magiju.",
    subtitle: "Ostalo prepustite nama.",
    service: "Biznis plan.",
    price: "Već od 299 eura.",
    icon: <Lightbulb size={64} strokeWidth={1} className="text-[#B71C4A]" />
  },
  {
    title: "Ako Vam kažu da ste ludi jer se bavite privatnim biznisom, razumijemo Vas.",
    subtitle: "Ni mi nismo sasvim normalni.",
    service: "Poslovno savjetovanje.",
    price: "Već od 699 eura.",
    icon: <UserRoundSearch size={64} strokeWidth={1} className="text-slate-400" />
  },
  {
    title: "Definitivno, bavljenje privatnim biznimom u Crnoj Gori je ekstreman sport.",
    subtitle: "Zajedno sa Vama, skačemo sa ivice Svemira.",
    service: "Poslovno savjetovanje.",
    price: "Već od 699 eura.",
    icon: <Rocket size={64} strokeWidth={1} className="text-slate-400" />
  },
  {
    title: "Mi smo vjerovatno jedini konsultanti koji ne klimaju po vertikali.",
    subtitle: "I niko ne voli papagaje.",
    service: "Poslovno savjetovanje.",
    price: "Već od 699 eura.",
    icon: <Ghost size={64} strokeWidth={1} className="text-slate-400" />
  },
  {
    title: "Ako vam dobro ide, onda trebate lajfkouča koji fenomenalno priča neispričane priče.",
    subtitle: "Tu smo za one koji ipak traže veći izazov.",
    service: "Poslovno savjetovanje.",
    price: "Već od 699 eura.",
    icon: <Navigation size={64} strokeWidth={1} className="text-slate-400" />
  },
  {
    title: "Pingvini ne lete jer znaju da im krila služe za ronjenje.",
    subtitle: "Pametno koristite svoje resurse.",
    service: "Poslovno savjetovanje.",
    price: "Već od 699 eura.",
    icon: <CloudRain size={64} strokeWidth={1} className="text-slate-400" />
  }
];

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [legalResult, setLegalResult] = useState<LegalComplianceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [openRedFlags, setOpenRedFlags] = useState<number[]>([]);
  const [isForensicOpen, setIsForensicOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const BASE_URL = 'https://www.tendering.me';
  const MF_EMAIL = 'javne.nabavke@mif.gov.me';

  const [formData, setFormData] = useState<ProcurementData>({
    specification: [{ description: '', characteristics: '', quantity: '' }],
    price: 0,
    currency: 'EUR'
  });

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % LOADING_SLIDES.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleReset = () => {
    setResult(null);
    setLegalResult(null);
    setError(null);
    setFormData({
      specification: [{ description: '', characteristics: '', quantity: '' }],
      price: 0,
      currency: 'EUR'
    });
    setShowLanding(false);
    setOpenRedFlags([]);
    setIsForensicOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addSpecItem = () => {
    setFormData({
      ...formData,
      specification: [...formData.specification, { description: '', characteristics: '', quantity: '' }]
    });
  };

  const removeSpecItem = (index: number) => {
    if (formData.specification.length === 1) return;
    const newSpecs = [...formData.specification];
    newSpecs.splice(index, 1);
    setFormData({ ...formData, specification: newSpecs });
  };

  const updateSpecItem = (index: number, field: keyof SpecificationItem, value: string) => {
    const newSpecs = [...formData.specification];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setFormData({ ...formData, specification: newSpecs });
  };

  const toggleRedFlag = (index: number) => {
    if (openRedFlags.includes(index)) {
      setOpenRedFlags(openRedFlags.filter(i => i !== index));
    } else {
      setOpenRedFlags([...openRedFlags, index]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSpecValid = formData.specification.every(item => item.description.trim() !== '');
    if (!isSpecValid || formData.price <= 0) {
      setError("Molimo unesite opis za sve stavke i procijenjenu vrijednost.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const unified = await apiAnalyze(formData);
      setResult(unified.analysis);
      setLegalResult(unified.legal);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "Došlo je do greške prilikom revizije.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    setError(null);

    try {
      const generatedAtISO = new Date().toISOString();
      const filename = `tendering_izvjestaj_${new Date().getTime()}.pdf`;
      const res = await fetch('/api/report-pdf', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          generatedAtISO,
          formData,
          result,
          legalResult,
        }),
      });

      if (!res.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError("Neuspješno generisanje PDF-a. Pokušajte ponovo.");
    }
  };

  const handleSendEmail = () => {
    if (!result) return;
    const subject = encodeURIComponent(`PRIJAVA NEPRAVILNOSTI: Forenzička analiza nabavke - Indeks rizika ${result.probability}%`);
    const body = encodeURIComponent(`
Poštovani,

Šaljem Vam nalaz forenzičke analize javne nabavke generisan putem Tendering platforme.

KLJUČNI PODACI:
Zaključak: ${result.conclusion}
Indeks rizika: ${result.probability}%
Potencijalna ušteda: ${result.savings.differenceAmount.toLocaleString()} EUR (${result.savings.differencePercentage}%)

${legalResult ? `PRAVNA USKLAĐENOST:\n${legalResult.summary}` : ''}

Analiza generisana na: ${BASE_URL}
    `.trim());
    window.location.href = `mailto:${MF_EMAIL}?subject=${subject}&body=${body}`;
  };

  const getSeverityStyles = (severity: Severity) => {
    switch (severity) {
      case 'high': return { 
        border: 'border-l-4 border-l-[#DC2626]', 
        bg: 'bg-white', 
        tag: 'bg-[#DC2626]/10 text-[#DC2626]',
        icon: <AlertCircle className="text-[#DC2626]" size={20} /> 
      };
      case 'medium': return { 
        border: 'border-l-4 border-l-[#F59E0B]', 
        bg: 'bg-white', 
        tag: 'bg-[#F59E0B]/10 text-[#F59E0B]',
        icon: <AlertTriangle className="text-[#F59E0B]" size={20} /> 
      };
      default: return { 
        border: 'border-l-4 border-l-[#10B981]', 
        bg: 'bg-white', 
        tag: 'bg-[#10B981]/10 text-[#10B981]',
        icon: <Info className="text-[#10B981]" size={20} /> 
      };
    }
  };

  const ProbabilityGauge = ({ probability, size = "large" }: { probability: number, size?: "small" | "large" }) => {
    const radius = size === "large" ? 60 : 24;
    const stroke = size === "large" ? 10 : 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, probability)) / 100) * circumference;
    
    return (
      <div className={`flex flex-col items-center justify-center relative ${size === "large" ? "py-2" : ""}`}>
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle stroke="#e2e8f0" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle
            stroke="#B71C4A"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
           <span className={`${size === "large" ? "text-3xl" : "text-[10px]"} font-black text-slate-900 leading-none`}>{probability}%</span>
        </div>
      </div>
    );
  };

  if (showLanding) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#B71C4A]"></div>
        
        <div className="max-w-4xl mx-auto w-full space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10 px-2">
          {/* Logo Section */}
          <div className="space-y-4 md:space-y-6 flex flex-col items-center">
            <FidelityLogo className="w-16 h-16 md:w-24 md:h-24 drop-shadow-xl mb-2" />
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-base md:text-lg">❤️</span>
              <p className="text-[10px] md:text-[14px] font-bold text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">OD FIDELITY CONSULTING</p>
            </div>
          </div>

          {/* Headline Section */}
          <div className="space-y-6 md:space-y-10">
            <h1 className="hero-title font-black tracking-tighter leading-none uppercase select-none overflow-hidden">
              <span className="text-[#1B2A4A]">TENDER</span><span className="text-[#B51D4E]">ING</span>
            </h1>
            <div className="space-y-4 md:space-y-6">
              <p className="hero-subtitle text-[#1B2A4A] font-extrabold tracking-tight max-w-3xl mx-auto leading-tight uppercase px-4">
                Digitalna forenzička analiza javnih nabavki uz pomoć AI.
              </p>
              <p className="text-base md:text-xl text-slate-500 font-medium max-w-xl mx-auto px-4">
                Za manje od 60 sekundi, besplatno dobijate analizu javne nabavke.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-4 items-center w-full px-4">
            <button 
              onClick={() => setShowLanding(false)}
              className="w-full max-w-sm px-8 py-4 md:px-12 md:py-6 bg-[#B51D4E] text-white rounded-2xl font-black text-lg md:text-xl shadow-2xl hover:bg-[#1B2A4A] transition-all flex items-center justify-center gap-4 group"
            >
              Započni analizu <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700 w-full overflow-x-hidden">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowLanding(true)}>
              <FidelityLogo className="w-8 h-8" />
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black tracking-tighter text-[#1B2A4A] uppercase">
                  TENDER<span className="text-[#B51D4E]">ING</span>
                </span>
                <span className="hidden sm:inline text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                  ❤️ od Fidelity consulting
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleReset} className="p-2 text-slate-400 hover:text-[#B71C4A] transition-colors rounded-full hover:bg-slate-50">
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
             <div className="h-full bg-[#B71C4A] animate-[progress_5s_linear_infinite]"></div>
          </div>
          <div className="max-w-2xl w-full space-y-8 md:space-y-12 text-center animate-in fade-in duration-1000">
            <div className="space-y-4">
              <p className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-4 md:mb-8 px-2">
                AI FORENZIČKA + PRAVNA ANALIZA U TOKU...
              </p>
              
              <div key={currentSlideIndex} className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center px-4">
                 <div className="mb-6 md:mb-10 p-6 md:p-8 bg-slate-50 rounded-full">
                   {LOADING_SLIDES[currentSlideIndex].icon}
                 </div>
                 <h2 className="text-xl md:text-3xl font-light text-slate-400 leading-tight mb-4">
                   {LOADING_SLIDES[currentSlideIndex].title}
                 </h2>
                 <p className="text-base md:text-xl font-medium text-slate-600 mb-8 md:mb-12">
                   {LOADING_SLIDES[currentSlideIndex].subtitle}
                 </p>
                 <div className="space-y-1">
                    <p className="text-[12px] md:text-sm font-light text-slate-400">
                      {LOADING_SLIDES[currentSlideIndex].service}
                    </p>
                    <p className="text-[12px] md:text-sm font-light text-slate-400">
                      {LOADING_SLIDES[currentSlideIndex].price}
                    </p>
                 </div>
              </div>
            </div>
            <div className="pt-8 md:pt-12 border-t border-slate-50 flex flex-col items-center gap-4">
               <FidelityLogo className="w-8 h-8 md:w-10 md:h-10 opacity-50" />
               <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">❤️ od Fidelity consulting</p>
            </div>
          </div>
          <style>{`@keyframes progress { from { width: 0%; } to { width: 100%; } }`}</style>
        </div>
      )}

      {result ? (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Mobile Summary */}
          <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
             <div className="flex items-center gap-3">
                <ProbabilityGauge probability={result.probability} size="small" />
                <div className="h-8 w-px bg-slate-100"></div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Procjena</span>
                   <span className={`text-xs font-black uppercase ${result.priceAssessment === 'overpriced' ? 'text-[#DC2626]' : 'text-[#10B981]'}`}>
                     {result.priceAssessment}
                   </span>
                </div>
             </div>
             <button onClick={handleDownloadReport} className="p-2 bg-slate-100 text-slate-900 rounded-lg">
                <Download size={18} />
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              {/* Main Conclusion */}
              <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-widest">Nalaz analize</span>
                </div>
                <p className="text-lg md:text-xl lg:text-2xl font-medium text-slate-800 leading-snug">
                  {result.conclusion}. <span className="font-bold">Indeks rizika je procijenjen na {result.probability}%.</span>
                </p>
                {/* Pravna analiza se sada radi automatski u prvom run-u */}
              </section>

              {/* Legal Analysis Section (if present) */}
              {legalResult && (
                <section id="legal-analysis-section" className="bg-[#fefce8] p-6 md:p-8 rounded-2xl border border-yellow-200 shadow-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                       <Scale className="text-yellow-600 shrink-0" size={24} /> Pravna analiza
                    </h3>
                    <div className="px-3 py-2 bg-white rounded-full border border-yellow-200 flex items-center gap-2 shrink-0">
                       <span className="hidden sm:inline text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                       <span className="text-base md:text-lg font-black text-slate-900">{legalResult.overallComplianceScore}/100</span>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 bg-white/50 rounded-xl border border-yellow-100">
                    <p className="text-slate-800 font-bold leading-relaxed text-sm md:text-base">{legalResult.summary}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Potencijalne povrede zakona i načela</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {legalResult.violations.map((v, i) => (
                        <div key={i} className="bg-white p-4 md:p-5 rounded-xl border border-yellow-200 shadow-sm space-y-3">
                           <div className="flex flex-wrap items-center gap-2">
                             <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-[9px] font-black uppercase tracking-widest">{v.article}</span>
                             <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-widest">{v.principle}</span>
                           </div>
                           <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">{v.description}</p>
                           <div className="pt-2 flex items-start gap-2 text-[10px] md:text-xs text-slate-400 italic">
                             <Fingerprint size={12} className="mt-0.5 shrink-0" />
                             <span>{v.cautionaryNote}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 md:p-6 rounded-xl border border-yellow-200 space-y-3">
                     <h4 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <FileText size={14} className="text-yellow-600" /> Smjernice MF (2023)
                     </h4>
                     <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                       {legalResult.guidelineCompliance}
                     </p>
                  </div>

                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-yellow-700 uppercase tracking-widest justify-center pt-4 opacity-60">
                    <CheckCircle2 size={12} /> ZJN & Smjernice MF referenca
                  </div>
                </section>
              )}

              {/* Market Analysis */}
              <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3">
                   <Target className="text-[#B71C4A] shrink-0" size={24} /> Tržišna analiza
                </h3>
                <div className="text-slate-600 font-medium leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                  {result.marketValueEstimate}
                </div>
              </section>

              {/* Savings Analysis */}
              <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3">
                   <TrendingUp className="text-[#B71C4A] shrink-0" size={24} /> Analiza ušteda
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 md:p-6 bg-[#FDE8EF] rounded-xl border border-[#FDE8EF] flex flex-col justify-center">
                    <p className="text-[9px] md:text-[10px] font-black text-[#B71C4A] uppercase tracking-widest mb-1">Preplaćeno</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900">{result.savings.differenceAmount.toLocaleString()} EUR</p>
                    <p className="text-[10px] md:text-xs font-bold text-[#DC2626] mt-2">+{result.savings.differencePercentage}% iznad tržišta</p>
                  </div>
                  <div className="p-5 md:p-6 bg-[#ECFDF5] rounded-xl border border-[#D1FAE5] flex flex-col justify-center">
                    <p className="text-[9px] md:text-[10px] font-black text-[#10B981] uppercase tracking-widest mb-1">Tržišna cijena</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900">{result.savings.estimatedMarketPrice.toLocaleString()} EUR</p>
                    <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-2">AI procjena (MF)</p>
                  </div>
                </div>

                <div className="p-5 md:p-6 bg-slate-50 rounded-xl border border-slate-200">
                   <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Info size={14} /> Društveni uticaj
                   </h4>
                   <p className="text-sm md:text-base text-slate-700 font-medium italic">
                     "Mogli smo obezbijediti: {result.savings.socialImpactDescription}"
                   </p>
                </div>
              </section>

              {/* Red Flags */}
              <section className="space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <ShieldAlert className="text-[#B71C4A] shrink-0" size={24} /> Signali rizika
                </h3>
                <div className="space-y-3">
                  {result.redFlags.map((flag, idx) => {
                    const styles = getSeverityStyles(flag.severity as Severity);
                    const isOpen = openRedFlags.includes(idx);
                    return (
                      <div key={idx} className={`${styles.border} ${styles.bg} rounded-lg border border-slate-200 shadow-sm overflow-hidden`}>
                        <button 
                          onClick={() => toggleRedFlag(idx)}
                          className="w-full text-left p-4 md:p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="shrink-0">{styles.icon}</div>
                            <div>
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${styles.tag} mb-1 inline-block`}>
                                 {flag.severity === 'high' ? 'Kritično' : flag.severity === 'medium' ? 'Umjereno' : 'Nisko'}
                               </span>
                               <p className="font-bold text-slate-900 text-xs md:text-sm leading-tight">{flag.description}</p>
                            </div>
                          </div>
                          {isOpen ? <ChevronUp size={18} className="shrink-0" /> : <ChevronDown size={18} className="shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-4 md:px-5 pb-4 md:pb-5">
                            <div className="md:ml-9 p-3 md:p-4 bg-slate-50 rounded-lg text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                              {flag.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Sidebar Sticky */}
            <div className="lg:col-span-4 space-y-6 w-full">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 lg:sticky lg:top-24">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Analiza rizika</h3>
                    <ProbabilityGauge probability={result.probability} />
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <button 
                      onClick={handleSendEmail}
                      className="w-full p-4 bg-[#B71C4A] text-white rounded-xl font-bold text-sm uppercase flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-md"
                    >
                      <Mail size={18} /> Prijavi nepravilnosti
                    </button>
                    <button 
                      onClick={handleDownloadReport}
                      className="w-full p-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-sm uppercase flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                    >
                      <Download size={18} /> Preuzmi PDF
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 w-full">
          <div className="space-y-10 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-[#1B2A4A] tracking-tight flex items-center gap-3 uppercase">
                <Search className="text-[#B51D4E] shrink-0" /> Unos podataka
              </h2>
              <p className="text-sm md:text-base text-slate-500 font-medium">Unesite zvaničnu specifikaciju i vrijednost za AI forenziku.</p>
            </div>

            {error && (
              <div className="bg-[#FDE8EF] border border-[#FDE8EF] text-[#DC2626] p-4 rounded-xl flex items-center gap-3 font-bold text-sm animate-in shake duration-500">
                <AlertCircle size={20} className="shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 w-full">
              <div className="space-y-4 w-full">
                {formData.specification.map((item, index) => (
                  <div key={index} className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 relative w-full">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-[#B51D4E] text-white rounded-md text-[9px] font-black uppercase tracking-widest">Stavka #{index + 1}</span>
                      {formData.specification.length > 1 && (
                        <button type="button" onClick={() => removeSpecItem(index)} className="p-2 text-slate-400 hover:text-[#DC2626] transition-colors">
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Opis predmeta</label>
                        <input 
                          required
                          value={item.description} 
                          onChange={(e) => updateSpecItem(index, 'description', e.target.value)} 
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-[#B51D4E] transition-all text-sm md:text-base" 
                          placeholder="Npr. Nabavka vozila" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tehnički uslovi</label>
                        <textarea 
                          value={item.characteristics} 
                          onChange={(e) => updateSpecItem(index, 'characteristics', e.target.value)} 
                          rows={3}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:ring-2 focus:ring-[#B51D4E] transition-all text-sm md:text-base" 
                          placeholder="Specifikacije iz tendera..." 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Količina</label>
                        <input 
                          value={item.quantity} 
                          onChange={(e) => updateSpecItem(index, 'quantity', e.target.value)} 
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-[#B51D4E] transition-all text-sm md:text-base" 
                          placeholder="Npr. 1 kom" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={addSpecItem}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-[#B51D4E] hover:border-[#B51D4E]/20 transition-all flex items-center justify-center gap-2 font-bold text-[10px] md:text-xs uppercase"
                >
                  <PlusCircle size={18} /> Dodaj novu stavku
                </button>
              </div>

              <div className="bg-[#1B2A4A] p-6 md:p-10 rounded-2xl shadow-xl space-y-6 w-full">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vrijednost (bez PDV-a)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      value={formData.price || ''} 
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full p-4 md:p-6 bg-white/10 border border-white/10 rounded-2xl text-white font-black text-2xl md:text-3xl outline-none focus:ring-2 focus:ring-[#B51D4E] transition-all pr-16" 
                      placeholder="0.00" 
                    />
                    <span className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-white/40 font-black text-base md:text-lg">EUR</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <button 
                    type="submit"
                    className="w-full py-4 md:py-5 bg-[#B51D4E] text-white rounded-2xl font-black text-base md:text-lg uppercase shadow-lg hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 group"
                  >
                    Kreni! <Zap size={20} className="group-hover:fill-current" />
                  </button>
                  <p className="text-center text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    AI analiza je gotova za manje od 60 sekundi
                  </p>
                </div>
              </div>
            </form>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;