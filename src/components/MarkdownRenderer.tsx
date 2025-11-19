
import React from 'react';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  text: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  return (
    <div className="markdown-content text-gray-100 text-[10px] sm:text-xs">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all font-medium" />
          ),
          strong: ({ node, ...props }) => <strong {...props} className="text-white font-bold" />,
          em: ({ node, ...props }) => <em {...props} className="text-gray-300 italic" />,
          ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside my-2 space-y-1 marker:text-cyan-500" />,
          ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside my-2 space-y-1 marker:text-cyan-500" />,
          p: ({ node, ...props }) => <p {...props} className="my-1.5 leading-relaxed whitespace-pre-wrap" />,
          // Table styles
          table: ({ node, ...props }) => <div className="overflow-x-auto my-3 rounded-lg border border-gray-700"><table {...props} className="min-w-full divide-y divide-gray-700" /></div>,
          thead: ({ node, ...props }) => <thead {...props} className="bg-gray-800" />,
          tbody: ({ node, ...props }) => <tbody {...props} className="divide-y divide-gray-700 bg-gray-900/50" />,
          tr: ({ node, ...props }) => <tr {...props} />,
          th: ({ node, ...props }) => <th {...props} className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-300 uppercase tracking-wider border-l border-gray-700 last:border-0" />,
          td: ({ node, ...props }) => <td {...props} className="px-2 py-1.5 whitespace-normal text-[10px] text-gray-200 border-l border-gray-700 last:border-0" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};
