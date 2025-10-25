import ReactMarkdown from 'react-markdown';

import rehypeHighlight from 'rehype-highlight';

export function RawView({ data }) {
  if (!data) {
    return null;
  }

  return (
    <div className="text-sm [&_pre]:!m-0 [&_pre]:!rounded-lg [&_pre]:!p-4 [&_code]:!rounded-lg pb-8">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
        {`\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``}
      </ReactMarkdown>
    </div>
  );
}
