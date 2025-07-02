
import React, { useState, useCallback, useRef } from 'react';
import { InputMode } from '../types';
import { UploadIcon } from './icons';

interface ProblemInputProps {
  onProblemTextChange: (text: string) => void;
  isLoading: boolean;
}

const ProblemInput: React.FC<ProblemInputProps> = ({ onProblemTextChange, isLoading }) => {
  const [mode, setMode] = useState<InputMode>(InputMode.TEXT);
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onProblemTextChange(newText);
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    onProblemTextChange('Đang đọc file PDF...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdf = await (window as any).pdfjsLib.getDocument(typedArray).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
        setText(fullText);
        onProblemTextChange(fullText);
      } catch (error) {
        console.error("Lỗi khi đọc file PDF:", error);
        onProblemTextChange('Lỗi: không thể đọc nội dung từ file PDF.');
        setFileName('');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onProblemTextChange]);

  const activeTabClass = 'bg-secondary border-b-2 border-accent text-light';
  const inactiveTabClass = 'text-slate-400 hover:bg-slate-700';

  return (
    <div className="bg-secondary rounded-lg p-6 flex-grow flex flex-col">
      <div className="flex border-b border-slate-600 mb-4">
        <button onClick={() => setMode(InputMode.TEXT)} className={`px-4 py-2 font-semibold transition-colors ${mode === InputMode.TEXT ? activeTabClass : inactiveTabClass}`}>
          Dán Văn bản
        </button>
        <button onClick={() => setMode(InputMode.PDF)} className={`px-4 py-2 font-semibold transition-colors ${mode === InputMode.PDF ? activeTabClass : inactiveTabClass}`}>
          Tải lên PDF
        </button>
      </div>
      <div className="flex-grow">
        {mode === InputMode.TEXT && (
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Dán đề bài của bạn vào đây..."
            className="w-full h-full bg-primary text-dark-text p-4 rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-accent resize-none placeholder-slate-500"
            disabled={isLoading}
          />
        )}
        {mode === InputMode.PDF && (
            <div 
              className="w-full h-full flex flex-col items-center justify-center bg-primary border-2 border-dashed border-slate-600 rounded-md p-4 cursor-pointer hover:border-accent transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isLoading} />
                <UploadIcon className="w-12 h-12 text-slate-500 mb-4"/>
                {fileName ? (
                    <p className="text-light">{fileName}</p>
                ) : (
                    <p className="text-slate-400 text-center">Nhấn để chọn hoặc kéo thả file PDF vào đây</p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ProblemInput;