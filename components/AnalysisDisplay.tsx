
import React, { useMemo } from 'react';
import Spinner from './Spinner';
import { BrainIcon, CodeIcon } from './icons';

interface AnalysisDisplayProps {
  analysis: string;
  solution: string;
  isLoadingAnalysis: boolean;
  isLoadingSolution: boolean;
  error: string | null;
}

const DisplaySection: React.FC<{ title: string; content: string; isLoading: boolean; icon: React.ReactNode; defaultText: string }> = ({ title, content, isLoading, icon, defaultText }) => {
  const renderedContent = useMemo(() => {
    if (isLoading) return null;
    if (!content) return <p className="text-slate-400">{defaultText}</p>;
    
    // Use marked to convert markdown to HTML
    const rawMarkup = (window as any).marked.parse(content, { gfm: true, breaks: true });
    
    return <div className="prose prose-invert max-w-none prose-pre:bg-primary prose-pre:text-light" dangerouslySetInnerHTML={{ __html: rawMarkup }} />;
  }, [content, isLoading, defaultText]);

  return (
    <div className="bg-secondary p-6 rounded-lg">
      <h3 className="text-xl font-bold text-light mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      {isLoading ? (
        <div className="flex items-center text-accent">
          <Spinner />
          <span>Đang tạo...</span>
        </div>
      ) : (
        renderedContent
      )}
    </div>
  );
};


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, solution, isLoadingAnalysis, isLoadingSolution, error }) => {
  return (
    <div className="bg-primary rounded-lg p-6 space-y-6 overflow-y-auto h-full">
      {error && (
        <div className="bg-red-900 border border-red-500 text-red-300 p-4 rounded-lg">
            <h3 className="font-bold">Đã xảy ra lỗi</h3>
            <p>{error}</p>
        </div>
      )}
      <DisplaySection
        title="Phân tích bài toán"
        content={analysis}
        isLoading={isLoadingAnalysis}
        icon={<BrainIcon className="w-6 h-6 text-accent" />}
        defaultText="Phân tích chi tiết của AI sẽ xuất hiện ở đây."
      />
      <DisplaySection
        title="Giải pháp đề xuất"
        content={solution}
        isLoading={isLoadingSolution}
        icon={<CodeIcon className="w-6 h-6 text-accent" />}
        defaultText="Giải pháp bằng code C++ của AI sẽ xuất hiện ở đây."
      />
    </div>
  );
};

export default AnalysisDisplay;
