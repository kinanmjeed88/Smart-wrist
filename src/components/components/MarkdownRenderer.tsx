import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  // A simple renderer that handles paragraphs, bold, italics, links, and lists.
  const lines = text.split('\n');

  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const renderInline = (line: string): (string | React.ReactElement)[] => {
    // This regex will handle multiple formats in one line
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a href={linkMatch[2]} key={i} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const elements: React.ReactElement[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const listItemMatch = line.match(/^\s*[-*]\s+(.*)/);
    if (listItemMatch) {
      listItems.push(listItemMatch[1]);
    } else {
      flushList();
      if (line.trim() !== '') {
        elements.push(<p key={`p-${elements.length}`} className="my-1 whitespace-pre-wrap">{renderInline(line)}</p>);
      }
    }
  });

  flushList();

  return <div className="text-white">{elements}</div>;
};
