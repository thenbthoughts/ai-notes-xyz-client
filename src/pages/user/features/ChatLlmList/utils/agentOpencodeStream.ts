import { useEffect, useRef, useState } from 'react';

export type OpencodeStreamState = {
    content: string;
    status: string;
    pipelineStep: string;
    isStreaming: boolean;
    error: string;
};

// Keep simple language: this hook streams ANSWER.md live while opencode is pending.
// It uses fetch + ReadableStream to parse Server-Sent Events (SSE).
export const useAgentOpencodeStream = (
    threadId: string,
    enabled: boolean
): OpencodeStreamState => {
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('');
    const [pipelineStep, setPipelineStep] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState('');
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!threadId || !enabled) {
            setIsStreaming(false);
            return;
        }

        let cancelled = false;
        const controller = new AbortController();
        abortRef.current = controller;
        setIsStreaming(true);
        setError('');

        const run = async (): Promise<void> => {
            try {
                const url = `/api/chat-llm/agent-opencode/stream?threadId=${encodeURIComponent(threadId)}`;
                const res = await fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        Accept: 'text/event-stream',
                    },
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`Stream HTTP ${res.status}`);
                }
                if (!res.body) {
                    throw new Error('No stream body');
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';
                let sseEvent = '';
                let sseData = '';

                const flushEvent = (): void => {
                    if (!sseEvent && !sseData) return;
                    const event = sseEvent.trim() || 'message';
                    const raw = sseData.trim();
                    sseEvent = '';
                    sseData = '';
                    if (!raw) return;
                    try {
                        const data = JSON.parse(raw) as Record<string, unknown>;
                        if (event === 'chunk' || event === 'done') {
                            const c = typeof data.content === 'string' ? data.content : '';
                            const st = typeof data.status === 'string' ? data.status : '';
                            const step = typeof data.pipelineStep === 'string' ? data.pipelineStep : '';
                            if (!cancelled) {
                                setContent(c);
                                if (st) setStatus(st);
                                if (step) setPipelineStep(step);
                            }
                            if (event === 'done' && !cancelled) {
                                setIsStreaming(false);
                            }
                        } else if (event === 'heartbeat') {
                            const st = typeof data.status === 'string' ? data.status : '';
                            const step = typeof data.pipelineStep === 'string' ? data.pipelineStep : '';
                            if (!cancelled) {
                                if (st) setStatus(st);
                                if (step) setPipelineStep(step);
                            }
                        } else if (event === 'error') {
                            const msg = typeof data.message === 'string' ? data.message : 'stream error';
                            if (!cancelled) setError(msg);
                        } else if (event === 'end') {
                            if (!cancelled) setIsStreaming(false);
                        }
                    } catch {
                        // ignore json parse error
                    }
                };

                while (!cancelled) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    // SSE lines are separated by \n\n
                    let idx: number;
                    while ((idx = buffer.indexOf('\n\n')) !== -1) {
                        const chunk = buffer.slice(0, idx);
                        buffer = buffer.slice(idx + 2);
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('event:')) {
                                sseEvent = line.slice(6).trim();
                            } else if (line.startsWith('data:')) {
                                sseData += line.slice(5).trim() + '\n';
                            } else if (line.startsWith(':')) {
                                // comment, ignore
                            }
                        }
                        flushEvent();
                    }
                }
                if (!cancelled) setIsStreaming(false);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                // AbortError is expected when disabled
                if (msg.includes('abort') || msg.includes('Abort')) {
                    if (!cancelled) setIsStreaming(false);
                    return;
                }
                if (!cancelled) {
                    setError(msg.slice(0, 300));
                    setIsStreaming(false);
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
            controller.abort();
            setIsStreaming(false);
        };
    }, [threadId, enabled]);

    // When disabled, clear content after a short delay is handled by caller
    useEffect(() => {
        if (!enabled) {
            // keep last content for a moment, caller decides when to clear
        }
    }, [enabled]);

    return { content, status, pipelineStep, isStreaming, error };
};
