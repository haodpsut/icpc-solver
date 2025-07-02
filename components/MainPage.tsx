import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ApiKeys, AIProvider, OpenRouterModel, ChatMessage } from '../types';
import { OPENROUTER_MODELS } from '../constants';
import { callAI, createAnalysisPrompt, createCodePrompt, createChatPrompt } from '../services/aiService';

interface MainPageProps {
  apiKeys: ApiKeys;
  onReconfigure: () => void;
}

type Step = 'INITIAL' | 'ANALYZING' | 'ANALYZED' | 'CODING' | 'DONE';

const MainPage: React.FC<MainPageProps> = ({ apiKeys, onReconfigure }) => {
  const [provider, setProvider] = useState<AIProvider>(AIProvider.Gemini);
  const [openRouterModel, setOpenRouterModel] = useState<string>(OPENROUTER_MODELS[0].id);
  const [problemText, setProblemText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('INITIAL');
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  
  const isLoading = step === 'ANALYZING' || step === 'CODING';
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isChatting]);

  const handleReset = useCallback(() => {
    setProblemText('');
    setAnalysis('');
    setCode('');
    setError('');
    setStep('INITIAL');
    setChatHistory([]);
    setChatInput('');
  }, []);
  
  const handleSubmit = async () => {
    if (!problemText) {
      setError('Please paste the problem description first.');
      return;
    }
    setError('');
    setChatHistory([]); // Clear previous chat on new analysis/code generation

    const currentStep = step === 'INITIAL' || step === 'DONE' ? 'ANALYZING' : 'CODING';
    setStep(currentStep);
    
    try {
        const model = provider === AIProvider.Gemini ? 'gemini-2.5-flash-preview-04-17' : openRouterModel;
        if (currentStep === 'ANALYZING') {
            const prompt = createAnalysisPrompt(problemText);
            const result = await callAI(prompt, provider, model, apiKeys);
            setAnalysis(result);
            setStep('ANALYZED');
        } else if (currentStep === 'CODING') {
            const prompt = createCodePrompt(problemText, analysis);
            const result = await callAI(prompt, provider, model, apiKeys);
            const cppCodeRegex = /```cpp\s*([\s\S]*?)\s*```/;
            const match = result.match(cppCodeRegex);
            setCode(match ? match[1].trim() : result);
            setStep('DONE');
        }
    } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        setStep(analysis ? 'ANALYZED' : 'INITIAL');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting || isLoading) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: chatInput };
    setChatHistory(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
        const prompt = createChatPrompt(problemText, analysis, code, chatInput);
        const model = provider === AIProvider.Gemini ? 'gemini-2.5-flash-preview-04-17' : openRouterModel;
        const aiResponse = await callAI(prompt, provider, model, apiKeys);

        const newAiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
        setChatHistory(prev => [...prev, newAiMessage]);

    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during chat.';
        const errorAiMessage: ChatMessage = { sender: 'ai', text: `Sorry, I encountered an error: ${errorMessage}` };
        setChatHistory(prev => [...prev, errorAiMessage]);
    } finally {
        setIsChatting(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">AI Code Problem Solver</h1>
        <button onClick={onReconfigure} className="text-sm text-text-secondary hover:text-primary transition-colors">Reconfigure Keys</button>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Controls */}
        <div className="bg-surface rounded-lg p-6 flex flex-col space-y-4">
            <h2 className="text-xl font-semibold">Controls</h2>
            {/* Provider Selection */}
            <div className="flex space-x-4">
                {(Object.values(AIProvider)).map(p => (
                    <button key={p} onClick={() => setProvider(p)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${provider === p ? 'bg-primary text-white' : 'bg-secondary hover:bg-secondary-hover'}`}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>

            {/* OpenRouter Model Selection */}
            {provider === AIProvider.OpenRouter && (
                <Select value={openRouterModel} onChange={e => setOpenRouterModel(e.target.value)} options={OPENROUTER_MODELS} />
            )}

            {/* Problem Input */}
            <div className="flex-grow flex flex-col">
                <label htmlFor="problemText" className="text-sm font-medium text-text-secondary mb-2">Problem Description & Test Cases</label>
                <textarea
                    id="problemText"
                    value={problemText}
                    onChange={e => setProblemText(e.target.value)}
                    placeholder="Paste the full problem description from Codeforces, including examples, here."
                    className="w-full flex-grow bg-background border border-border-color rounded-lg p-3 text-sm text-text-primary focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                    disabled={isLoading}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
                 <button onClick={handleSubmit} disabled={isLoading || !problemText} className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                    {isLoading ? <Spinner/> : (step === 'INITIAL' || step === 'DONE' ? '1. Analyze Problem' : '2. Generate C++ Solution')}
                </button>
                <button onClick={handleReset} disabled={isLoading} className="py-3 px-4 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-secondary-hover disabled:bg-gray-600 transition-colors">
                    Reset
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
        </div>

        {/* Right Panel: Output */}
        <div className="bg-surface rounded-lg p-6 flex flex-col space-y-4 overflow-y-auto">
            {isLoading && step === 'ANALYZING' && <OutputPlaceholder title="Analyzing Problem..." />}
            {isLoading && step === 'CODING' && <OutputPlaceholder title="Generating C++ Solution..." />}
            
            {!isLoading && step === 'INITIAL' && (
                <div className="text-center text-text-secondary flex-grow flex items-center justify-center">
                    <p>The analysis and generated code will appear here.</p>
                </div>
            )}
            
            {analysis && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">Problem Analysis</h3>
                    <pre className="bg-background rounded-md p-4 text-sm text-text-secondary whitespace-pre-wrap font-mono">{analysis}</pre>
                </div>
            )}

            {code && (
                <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-primary">Generated C++ Code</h3>
                    <CodeBlock code={code} />
                </div>
            )}

            {/* Chatbot UI */}
            {analysis && (
                <div className="mt-6 border-t border-border-color pt-4 flex flex-col flex-grow min-h-0">
                    <h3 className="text-lg font-semibold text-primary mb-4 shrink-0">Chat About This Problem</h3>
                    
                    {/* Chat Message History */}
                    <div ref={chatContainerRef} className="space-y-4 flex-grow overflow-y-auto pr-2 mb-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-sm">AI</div>}
                                <div className={`p-3 rounded-lg max-w-xl ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                                    <p className="text-sm whitespace-pre-wrap font-sans">{msg.text}</p>
                                </div>
                                {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center font-bold text-sm">You</div>}
                            </div>
                        ))}
                        {isChatting && (
                            <div className="flex items-start gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-sm">AI</div>
                                <div className="p-3 rounded-lg bg-secondary flex items-center"><Spinner /></div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input Form */}
                    <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask a follow-up question..."
                            className="w-full bg-background border border-border-color rounded-lg p-3 text-sm text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                            disabled={isLoading || isChatting}
                            aria-label="Chat input"
                        />
                        <button type="submit" disabled={isLoading || isChatting || !chatInput.trim()} className="py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};


// UI Helper Components defined outside to prevent re-renders
const Select: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: OpenRouterModel[]}> = ({ value, onChange, options }) => (
    <select value={value} onChange={onChange} className="w-full bg-background border border-border-color rounded-lg p-3 text-sm text-text-primary focus:ring-2 focus:ring-primary focus:outline-none">
        {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
    </select>
);

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
  </div>
);

const OutputPlaceholder: React.FC<{title: string}> = ({title}) => (
    <div className="flex-grow flex flex-col items-center justify-center text-text-secondary">
        <Spinner />
        <p className="mt-4 font-semibold">{title}</p>
    </div>
);

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-background rounded-md relative group">
            <button onClick={handleCopy} className="absolute top-2 right-2 px-2 py-1 bg-secondary text-xs rounded-md text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="p-4 text-sm text-text-primary whitespace-pre-wrap font-mono overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    );
};

export default MainPage;