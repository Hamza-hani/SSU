"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Lesson } from "../types";

export default function LessonRenderer({ lesson }: { lesson: Lesson }) {
  if (!lesson) return null;

  // VIDEO
  if (lesson.type === "video") {
    const url = (lesson as any).url;
    return (
      <div className="w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          {lesson.title}
        </h1>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-black shadow-sm">
          <video className="w-full h-full" controls src={url} />
        </div>
      </div>
    );
  }

  // TEXT (Markdown)
  if (lesson.type === "text") {
    const content = ((lesson as any).content || "").trim();

    return (
      <div className="w-full">
        {/* Coursera-like reading width */}
        <div className="mx-auto w-full max-w-3xl">
          {/* Top title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
            {lesson.title}
          </h1>

          {/* Reading body (tight + aesthetic) */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mt-0 mb-3">
                      {children}
                    </h2>
                  ),
                  h2: ({ children }) => (
                    <h3 className="text-xl font-bold tracking-tight text-gray-900 mt-8 mb-2">
                      {children}
                    </h3>
                  ),
                  h3: ({ children }) => (
                    <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-[15px] leading-7 text-gray-700 my-2">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2 list-disc pl-6 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2 list-decimal pl-6 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-[15px] leading-7 text-gray-700">{children}</li>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 font-medium hover:underline"
                    >
                      {children}
                    </a>
                  ),

                  // Tables: scrollable + clean (Coursera-style)
                  table: ({ children }) => (
                    <div className="my-4 w-full overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full border-collapse text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-50">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-900">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-gray-100 px-3 py-2 align-top text-gray-700">
                      {children}
                    </td>
                  ),

                  // Blockquote as “callout”
                  blockquote: ({ children }) => (
                    <div className="my-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <div className="text-gray-700 text-[15px] leading-7">
                        {children}
                      </div>
                    </div>
                  ),
                  hr: () => <hr className="my-8 border-gray-200" />,
                  code: ({ children }) => (
                    <code className="rounded bg-gray-100 px-1 py-0.5 text-[13px] text-gray-900">
                      {children}
                    </code>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>

          {/* bottom spacing */}
          <div className="h-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-600">
      Unsupported lesson type: {(lesson as any)?.type}
    </div>
  );
}
