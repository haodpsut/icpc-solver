import React, { useState, useEffect, useCallback } from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import ProblemInput from './components/ProblemInput';
import AnalysisDisplay from './components/AnalysisDisplay';
import * as geminiService from './services/geminiService';
import * as openrouterService from './services/openrouterService';
import Spinner from './components/Spinner';
import { BrainIcon, CodeIcon } from './components/icons';
import { AiProvider } from './types';

const App: React.FC = () => {
  const [provider, setProvider] = useState<AiProvider>(AiProvider.GEMINI);
  const [apiKeys, setApiKeys] = useState<Record<AiProvider, string | null>>({
    [AiProvider.GEMINI]: null,
    [AiProvider.OPENROUTER]: null,
  });
  const [keysVerified, setKeysVerified] = useState<Record<AiProvider, boolean>>({
    [AiProvider.GEMINI]: false,
    [AiProvider.OPENROUTER]: false,
  });

  const [problemText, setProblemText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [solution, setSolution] = useState('');

  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerStorageKeys: Record<AiProvider, string> = {
    [AiProvider.GEMINI]: 'google_api_key',
    [AiProvider.OPENROUTER]: 'openrouter_api_key',
  };

  useEffect(() => {
    const verifyStoredKeys = async () => {
        const geminiKey = localStorage.getItem(providerStorageKeys[AiProvider.GEMINI]);
        const openrouterKey = localStorage.getItem(providerStorageKeys[AiProvider.OPENROUTER]);
        
        const updates: any = {};
        if (geminiKey) {
            const isValid = await geminiService.verifyApiKey(geminiKey);
            updates[AiProvider.GEMINI] = { key: geminiKey, verified: isValid };
        }
        if (openrouterKey) {
            const isValid = await openrouterService.verifyApiKey(openrouterKey);
            updates[AiProvider.OPENROUTER] = { key: openrouterKey, verified: isValid };
        }

        setApiKeys(prev => ({ ...prev, ...Object.keys(updates).reduce((acc, k) => ({...acc, [k]: updates[k].key}), {}) }));
        setKeysVerified(prev => ({ ...prev, ...Object.keys(updates).reduce((acc, k) => ({...acc, [k]: updates[k].verified}), {}) }));
    };
    verifyStoredKeys();
  }, []);

  const handleKeyVerified = (verifiedKey: string, verifiedProvider: AiProvider) => {
    localStorage.setItem(providerStorageKeys[verifiedProvider], verifiedKey);
    setApiKeys(prev => ({ ...prev, [verifiedProvider]: verifiedKey }));
    setKeysVerified(prev => ({ ...prev, [verifiedProvider]: true }));
  };
  
  const currentApiKey = apiKeys[provider];
  const isCurrentKeyVerified = keysVerified[provider];
  
  const handleCallApi = async (
    apiFn: (apiKey: string, ...args: any[]) => Promise<string>,
    setLoading: (loading: boolean) => void,
    setData: (data: string) => void,
    ...args: any[]
  ) => {
    if (!problemText || !currentApiKey) {
      setError('Vui lòng nhập đề bài và đảm bảo API key hợp lệ.');
      return;
    }
    setError(null);
    setLoading(true);
    setData('');

    try {
      const result = await apiFn(currentApiKey, ...args);
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định khi gọi API.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (provider === AiProvider.GEMINI) {
        handleCallApi(geminiService.generateAnalysis, setIsLoadingAnalysis, setAnalysis, problemText);
    } else {
        handleCallApi(openrouterService.generateAnalysis, setIsLoadingAnalysis, setAnalysis, problemText);
    }
    setSolution('');
  }, [provider, currentApiKey, problemText]);

  const handleSolve = useCallback(async () => {
    if (!analysis) {
        setError('Vui lòng chạy phân tích trước khi tạo giải pháp.');
        return;
    }
    if (provider === AiProvider.GEMINI) {
        handleCallApi(geminiService.generateSolution, setIsLoadingSolution, setSolution, problemText, analysis);
    } else {
        handleCallApi(openrouterService.generateSolution, setIsLoadingSolution, setSolution, problemText, analysis);
    }
  }, [provider, currentApiKey, problemText, analysis]);

  if (!isCurrentKeyVerified) {
    return <ApiKeyModal provider={provider} onKeyVerified={handleKeyVerified} />;
  }

  const isLoading = isLoadingAnalysis || isLoadingSolution;

  return (
    <div className="min-h-screen bg-primary flex flex-col p-4">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-light">ICPC AI Solver</h1>
        <div className="flex justify-center items-center gap-4 mt-4">
          <p className="text-slate-400">Model đang dùng:</p>
          <select 
            value={provider} 
            onChange={(e) => setProvider(e.target.value as AiProvider)}
            className="bg-secondary text-light border border-slate-600 rounded-md px-3 py-1 focus:ring-2 focus:ring-accent focus:outline-none"
          >
            <option value={AiProvider.GEMINI}>Google Gemini</option>
            <option value={AiProvider.OPENROUTER}>OlympicCoder (OpenRouter)</option>
          </select>
        </div>
      </header>
      
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
        <div className="flex flex-col gap-4 h-full">
          <ProblemInput onProblemTextChange={setProblemText} isLoading={isLoading} />
          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !problemText}
              className="w-full flex justify-center items-center bg-accent text-primary font-bold py-3 px-4 rounded-md hover:bg-sky-400 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              {isLoadingAnalysis ? <Spinner /> : <BrainIcon className="w-5 h-5 mr-2" />}
              Phân tích
            </button>
            <button
              onClick={handleSolve}
              disabled={isLoading || !analysis}
              className="w-full flex justify-center items-center bg-emerald-500 text-primary font-bold py-3 px-4 rounded-md hover:bg-emerald-400 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              {isLoadingSolution ? <Spinner /> : <CodeIcon className="w-5 h-5 mr-2" />}
              Tạo Giải pháp
            </button>
          </div>
        </div>
        <div className="h-full overflow-hidden">
            <AnalysisDisplay
                analysis={analysis}
                solution={solution}
                isLoadingAnalysis={isLoadingAnalysis}
                isLoadingSolution={isLoadingSolution}
                error={error}
            />
        </div>
      </main>
    </div>
  );
};

export default App;
