
import React, { useState, useEffect } from 'react';
import { ApiKeys } from '../types';

interface ConfigPageProps {
  onConfigSaved: (keys: ApiKeys) => void;
}

const ConfigPage: React.FC<ConfigPageProps> = ({ onConfigSaved }) => {
  const [keys, setKeys] = useState<ApiKeys>({ gemini: '', openrouter: '', drive: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    try {
        const savedKeysRaw = localStorage.getItem('api_keys');
        if (savedKeysRaw) {
            setKeys(JSON.parse(savedKeysRaw));
        }
    } catch (e) {
        console.error("Could not load keys from localStorage", e);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeys({ ...keys, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keys.gemini || !keys.openrouter) {
      setError('Gemini and OpenRouter API keys are required.');
      return;
    }
    setError('');
    localStorage.setItem('api_keys', JSON.stringify(keys));
    onConfigSaved(keys);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg p-8 space-y-8 bg-surface rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary">Configure API Keys</h1>
          <p className="mt-2 text-text-secondary">Your keys are stored locally in your browser.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField name="gemini" label="Gemini API Key" value={keys.gemini} onChange={handleChange} isRequired={true} />
          <InputField name="openrouter" label="OpenRouter API Key" value={keys.openrouter} onChange={handleChange} isRequired={true} />
          <InputField name="drive" label="Google Drive Token (Optional)" value={keys.drive} onChange={handleChange} />
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors duration-200"
            >
              Save & Validate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface InputFieldProps {
    name: keyof ApiKeys;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isRequired?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, value, onChange, isRequired = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-2">
            {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <input
            type="password"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 bg-background border border-border-color rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder={`Enter your ${label}`}
            required={isRequired}
        />
    </div>
);


export default ConfigPage;
