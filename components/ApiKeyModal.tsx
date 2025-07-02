import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import * as openrouterService from '../services/openrouterService';
import Spinner from './Spinner';
import { KeyIcon } from './icons';
import { AiProvider } from '../types';

interface ApiKeyModalProps {
  provider: AiProvider;
  onKeyVerified: (key: string, provider: AiProvider) => void;
}

const providerConfig = {
    [AiProvider.GEMINI]: {
        name: 'Google Gemini',
        url: 'https://ai.google.dev/',
        verificationFn: geminiService.verifyApiKey,
        errorHint: 'Vui lòng kiểm tra lại key từ Google AI Studio.',
    },
    [AiProvider.OPENROUTER]: {
        name: 'OpenRouter',
        url: 'https://openrouter.ai/keys',
        verificationFn: openrouterService.verifyApiKey,
        errorHint: 'Vui lòng kiểm tra lại key từ cài đặt OpenRouter.',
    }
};

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ provider, onKeyVerified }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const config = providerConfig[provider];

  const handleVerify = async () => {
    if (!apiKey) {
      setError('Vui lòng nhập API key.');
      return;
    }
    setIsLoading(true);
    setError('');
    const isValid = await config.verificationFn(apiKey);
    setIsLoading(false);
    if (isValid) {
      onKeyVerified(apiKey, provider);
    } else {
      setError(`API key không hợp lệ hoặc đã xảy ra lỗi. ${config.errorHint}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-secondary rounded-lg shadow-2xl p-8 w-full max-w-md border border-slate-600">
        <div className="flex flex-col items-center text-center">
            <KeyIcon className="h-12 w-12 text-accent mb-4"/>
            <h2 className="text-2xl font-bold text-light mb-2">Yêu Cầu API Key của {config.name}</h2>
            <p className="text-slate-400 mb-6">
                Vui lòng nhập API key từ <a href={config.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">trang {config.name}</a> để sử dụng model này. Key của bạn sẽ được lưu trữ an toàn trong trình duyệt.
            </p>
        </div>
        <div className="space-y-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`dán API key ${config.name} của bạn vào đây`}
            className="w-full px-4 py-2 bg-primary border border-slate-600 rounded-md focus:ring-2 focus:ring-accent focus:outline-none text-light placeholder-slate-500"
            disabled={isLoading}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleVerify}
            disabled={isLoading || !apiKey}
            className="w-full flex justify-center items-center bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-sky-400 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : 'Xác thực và Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
