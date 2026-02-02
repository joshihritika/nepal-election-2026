"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr + "Z").getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "अहिले भर्खरै";
  if (diff < 3600) return `${Math.floor(diff / 60)} मिनेट अगाडि`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} घण्टा अगाडि`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} दिन अगाडि`;
  return new Date(dateStr + "Z").toLocaleDateString("ne-NP");
}

export default function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const LIMIT = 10;

  const fetchComments = useCallback(async (off: number, append: boolean) => {
    try {
      const res = await fetch(`/api/comments?limit=${LIMIT}&offset=${off}`);
      const data = await res.json();
      const fetched: Comment[] = data.comments || [];
      setComments(prev => append ? [...prev, ...fetched] : fetched);
      setHasMore(fetched.length === LIMIT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments(0, false);
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments(prev => [data.comment, ...prev]);
        setMessage("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchComments(newOffset, true);
  };

  return (
    <section className="mt-10">
      <h3 className="text-xl font-bold text-gray-900 mb-4">आफ्नो भनाइ राख्नुहोस्</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 mb-4">
        <div className="space-y-3">
          <div>
            <label htmlFor="comment-name" className="block text-xs font-medium text-gray-500 mb-1">नाम</label>
            <input
              id="comment-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              placeholder="तपाईंको नाम"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="comment-message" className="block text-xs font-medium text-gray-500 mb-1">सन्देश</label>
            <textarea
              id="comment-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="आफ्नो विचार लेख्नुहोस्..."
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="text-right text-xs text-gray-400 mt-0.5">{message.length}/500</div>
          </div>
          <button
            type="submit"
            disabled={submitting || !name.trim() || !message.trim()}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "पठाउँदै..." : "पठाउनुहोस्"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center text-sm text-gray-500 py-8">लोड हुँदैछ...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-8">अहिलेसम्म कुनै टिप्पणी छैन। पहिलो हुनुहोस्!</div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{c.message}</p>
            </div>
          ))}
          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full min-h-[44px] py-2.5 text-sm font-medium text-blue-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              थप लोड गर्नुहोस्
            </button>
          )}
        </div>
      )}
    </section>
  );
}
