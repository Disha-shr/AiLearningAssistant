import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/Authcontext.jsx";
import Spinner from "../../components/common/Spinner";
import MarkdownRenderer from "../../components/common/MarkdownRenderer";

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // Scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // Fetch previous chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);

        const response = await aiService.getChatHistory(documentId);

        console.log("Chat history response:", response);

        // Handle different API response formats safely
        let chatHistory = [];

        if (Array.isArray(response)) {
          chatHistory = response;
        } else if (Array.isArray(response?.data)) {
          chatHistory = response.data;
        } else if (Array.isArray(response?.data?.history)) {
          chatHistory = response.data.history;
        } else if (Array.isArray(response?.history)) {
          chatHistory = response.history;
        } else if (Array.isArray(response?.messages)) {
          chatHistory = response.messages;
        }

        setHistory(chatHistory);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setHistory([]);
      } finally {
        setInitialLoading(false);
      }
    };

    if (documentId) {
      fetchChatHistory();
    } else {
      setInitialLoading(false);
      setHistory([]);
    }
  }, [documentId]);

  // Scroll whenever history changes
  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading || !documentId) {
      return;
    }

    const messageContent = message.trim();

    const userMessage = {
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    // Show user's message immediately
    setHistory((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      userMessage,
    ]);

    // Clear input
    setMessage("");

    // Start loading
    setLoading(true);

    try {
      const response = await aiService.chat(
        documentId,
        messageContent
      );

      console.log("Chat response:", response);

      const responseData = response?.data || response || {};

      const answer =
        responseData?.answer ||
        responseData?.message ||
        responseData?.content ||
        "Sorry, I could not generate a response.";

      const assistantMessage = {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks:
          responseData?.relevantChunks || [],
      };

      setHistory((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);

      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };

      setHistory((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Render individual message
  const renderMessage = (msg, index) => {
    const isUser = msg?.role === "user";

    return (
      <div
        key={index}
        className={`flex items-start gap-3 my-4 ${
          isUser ? "justify-end" : ""
        }`}
      >
        {/* AI Avatar */}
        {!isUser && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
            <Sparkles
              className="w-4 h-4 text-white"
              strokeWidth={2}
            />
          </div>
        )}

        {/* Message */}
        <div
          className={`max-w-lg p-4 rounded-2xl shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-md"
              : "bg-white border border-slate-200/60 text-slate-800 rounded-bl-md"
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">
              {msg?.content || ""}
            </p>
          ) : (
            <MarkdownRenderer
              content={msg?.content || ""}
            />
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-slate-700">
              {user?.username?.charAt(0).toUpperCase() ||
                "U"}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Initial loading
  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Spinner />

        <p className="text-sm text-slate-500 mt-3">
          Loading chat history...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center mb-4">
              <MessageSquare
                className="w-7 h-7 text-white"
                strokeWidth={2}
              />
            </div>

            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Start a conversation
            </h3>

            <p className="text-sm text-slate-500">
              Ask me anything about the document!
            </p>
          </div>
        ) : (
          history.map(renderMessage)
        )}

        {/* Scroll reference */}
        <div ref={messagesEndRef} />

        {/* AI Loading */}
        {loading && (
          <div className="flex items-center gap-3 my-4">
            {/* AI Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
              <Sparkles
                className="w-4 h-4 text-white"
                strokeWidth={2}
              />
            </div>

            {/* Typing indicator */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200/60">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />

                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />

                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-slate-200/60 bg-white/80">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3"
        >
          {/* Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={loading}
            className="flex-1 h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10 disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center"
          >
            <Send
              className="w-5 h-5"
              strokeWidth={2}
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;