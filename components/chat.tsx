"use client";

import type { EveMessage, EveMessagePart } from "eve/react";
import { useEveAgent } from "eve/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { ThemeToggle } from "@/components/theme-toggle";

function ChatMessagePart({
  part,
  showCaret,
}: {
  part: EveMessagePart;
  showCaret: boolean;
}) {
  switch (part.type) {
    case "step-start":
      return null;
    case "text":
      return (
        <MessageResponse caret="block" isAnimating={showCaret}>
          {part.text}
        </MessageResponse>
      );
    case "reasoning":
      return (
        <Reasoning defaultOpen isStreaming={part.state === "streaming"}>
          <ReasoningTrigger />
          <ReasoningContent>{part.text}</ReasoningContent>
        </Reasoning>
      );
    case "dynamic-tool":
      return (
        <Tool
          defaultOpen={
            part.state === "approval-requested" ||
            part.state === "approval-responded"
          }
        >
          <ToolHeader
            state={part.state}
            title={part.toolName}
            toolName={part.toolName}
            type="dynamic-tool"
          />
          <ToolContent>
            <ToolInput input={part.input} />
            <ToolOutput errorText={part.errorText} output={part.output} />
          </ToolContent>
        </Tool>
      );
    case "authorization":
      return null;
  }
}

function ChatMessage({
  isStreaming,
  message,
}: {
  isStreaming: boolean;
  message: EveMessage;
}) {
  const lastTextIndex = message.parts.reduce(
    (last, part, index) => (part.type === "text" ? index : last),
    -1,
  );

  return (
    <Message from={message.role}>
      <MessageContent>
        {message.parts.map((part, index) => (
          <ChatMessagePart
            key={`${message.id}-${index}`}
            part={part}
            showCaret={
              isStreaming &&
              message.role === "assistant" &&
              index === lastTextIndex
            }
          />
        ))}
      </MessageContent>
    </Message>
  );
}

export function Chat() {
  const { data, status, send, stop, error } = useEveAgent();
  const busy = status === "submitted" || status === "streaming";
  const lastMessage = data.messages.at(-1);
  const showThinking =
    status === "submitted" &&
    (lastMessage?.role !== "assistant" || lastMessage.parts.length === 0);

  const handleSubmit = async (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text || busy) return;
    await send({ message: text });
  };

  return (
    <div className="relative flex h-dvh flex-col bg-background text-foreground">
      <div className="pointer-events-none absolute top-3 right-3 z-10 sm:top-4 sm:right-4">
        <ThemeToggle className="pointer-events-auto" />
      </div>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-6 sm:px-6">
          {data.messages.length === 0 ? (
            <ConversationEmptyState
              description="Задайте вопрос агенту"
              title="Начните диалог"
            />
          ) : (
            data.messages.map((message, index) => (
              <ChatMessage
                isStreaming={
                  status === "streaming" && index === data.messages.length - 1
                }
                key={message.id}
                message={message}
              />
            ))
          )}

          {showThinking ? (
            <Message from="assistant">
              <MessageContent>
                <p className="text-muted-foreground text-sm">Думаю...</p>
              </MessageContent>
            </Message>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-6 sm:px-6">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea placeholder="Напишите сообщение..." />
          <PromptInputSubmit onStop={stop} status={status} />
        </PromptInput>
      </div>

      {error ? (
        <p className="px-4 pb-4 text-center text-sm text-destructive">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
