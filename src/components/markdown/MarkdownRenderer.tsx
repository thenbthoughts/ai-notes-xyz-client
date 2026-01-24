import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { LucideClipboard, LucideCheck } from "lucide-react";
import { useState, type ReactNode, type CSSProperties } from "react";
import toast from "react-hot-toast";

// Type for syntax highlighter style - cast to expected type
const syntaxStyle: { [key: string]: CSSProperties } = oneDark as unknown as { [key: string]: CSSProperties };

// Code block component with copy functionality
const CodeBlock = ({
  inline,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  node?: unknown;
}) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (!inline && (match || codeString.includes("\n"))) {
    return (
      <div className="relative group my-3 w-full overflow-hidden">
        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? (
              <LucideCheck className="w-4 h-4" />
            ) : (
              <LucideClipboard className="w-4 h-4" />
            )}
          </button>
        </div>
        {language && (
          <div className="absolute left-3 top-0 px-2 py-0.5 text-xs text-gray-400 bg-gray-800 rounded-b font-mono">
            {language}
          </div>
        )}
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            style={syntaxStyle}
            language={language || "text"}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              padding: "1.25rem 1rem",
              paddingTop: language ? "2rem" : "1rem",
              fontSize: "0.8125rem",
              minWidth: "100%",
              width: "max-content",
            }}
            codeTagProps={{
              style: {
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                whiteSpace: "pre",
              },
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  // Inline code
  return (
    <code className="px-1.5 py-0.5 mx-0.5 rounded bg-gray-100 text-rose-600 font-mono text-[0.8125em] break-all">
      {children}
    </code>
  );
};

// Table wrapper with horizontal scroll
const TableWrapper = ({ children }: { children?: ReactNode }) => (
  <div className="my-4 w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-gray-200 text-sm">
        {children}
      </table>
    </div>
  </div>
);

const TableHead = ({ children }: { children?: ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
);

const TableBody = ({ children }: { children?: ReactNode }) => (
  <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
);

const TableRow = ({ children }: { children?: ReactNode }) => (
  <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
);

const TableHeader = ({ children }: { children?: ReactNode }) => (
  <th className="px-3 py-2 md:px-4 md:py-3 text-left font-semibold text-gray-700 text-xs md:text-sm whitespace-nowrap">
    {children}
  </th>
);

const TableCell = ({ children }: { children?: ReactNode }) => (
  <td className="px-3 py-2 md:px-4 md:py-3 text-gray-600 text-xs md:text-sm whitespace-nowrap">
    {children}
  </td>
);

// Blockquote component
const Blockquote = ({ children }: { children?: ReactNode }) => (
  <blockquote className="my-4 pl-4 border-l-4 border-emerald-500 bg-emerald-50 py-3 pr-4 rounded-r-lg text-gray-700 italic">
    {children}
  </blockquote>
);

// Heading components
const H1 = ({ children }: { children?: ReactNode }) => (
  <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200">
    {children}
  </h1>
);

const H2 = ({ children }: { children?: ReactNode }) => (
  <h2 className="text-xl font-bold text-gray-800 mt-5 mb-3 pb-1 border-b border-gray-100">
    {children}
  </h2>
);

const H3 = ({ children }: { children?: ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">{children}</h3>
);

const H4 = ({ children }: { children?: ReactNode }) => (
  <h4 className="text-base font-semibold text-gray-700 mt-3 mb-2">
    {children}
  </h4>
);

// Paragraph component
const Paragraph = ({ children }: { children?: ReactNode }) => (
  <p className="my-2 leading-relaxed text-gray-700">{children}</p>
);

// List components
const UnorderedList = ({ children }: { children?: ReactNode }) => (
  <ul className="my-3 ml-4 space-y-1 list-disc list-outside text-gray-700">
    {children}
  </ul>
);

const OrderedList = ({ children }: { children?: ReactNode }) => (
  <ol className="my-3 ml-4 space-y-1 list-decimal list-outside text-gray-700">
    {children}
  </ol>
);

const ListItem = ({ children }: { children?: ReactNode }) => (
  <li className="pl-1 leading-relaxed">{children}</li>
);

// Link component
const LinkComponent = ({
  href,
  children,
}: {
  href?: string;
  children?: ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-emerald-600 hover:text-emerald-700 underline decoration-emerald-300 hover:decoration-emerald-500 underline-offset-2 transition-colors"
  >
    {children}
  </a>
);

// Horizontal rule
const HorizontalRule = () => (
  <hr className="my-6 border-t-2 border-gray-200" />
);

// Image component
const ImageComponent = ({ src, alt }: { src?: string; alt?: string }) => (
  <img
    src={src}
    alt={alt || ""}
    className="my-4 max-w-full h-auto rounded-lg shadow-md"
    loading="lazy"
  />
);

// Pre component (wrapper for code blocks)
const PreComponent = ({ children }: { children?: ReactNode }) => (
  <div className="w-full">{children}</div>
);

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({
  content,
  className = "",
}: MarkdownRendererProps) => {
  return (
    <div
      className={`markdown-content w-full min-w-0 ${className}`}
      style={{ maxWidth: "100%", overflowWrap: "break-word" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: CodeBlock,
          pre: PreComponent,
          table: TableWrapper,
          thead: TableHead,
          tbody: TableBody,
          tr: TableRow,
          th: TableHeader,
          td: TableCell,
          blockquote: Blockquote,
          h1: H1,
          h2: H2,
          h3: H3,
          h4: H4,
          p: Paragraph,
          ul: UnorderedList,
          ol: OrderedList,
          li: ListItem,
          a: LinkComponent,
          hr: HorizontalRule,
          img: ImageComponent,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
