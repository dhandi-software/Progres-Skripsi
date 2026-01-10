import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { X, ArrowLeft, Clock, ArrowUpRight } from "lucide-react";
import { Input } from "~/components/ui/input";
import { newsApi } from "~/api/news";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";

const RECENT_SEARCHES_KEY = "MNI_RECENT_SEARCHES";
const MAX_RECENT_SEARCHES = 5;

interface SearchMobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchMobileOverlay({ isOpen, onClose }: SearchMobileOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NewsListItem[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Prevent scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Load history
  useEffect(() => {
    const savedHistory = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, [isOpen]);

  // Search logic (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await newsApi.getPublishedNews({
          title: query,
          limit: 10
        });
        if (response.status === "success" || response.code === 200) {
          setResults(response.data);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const addToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const newHistory = [
      searchTerm,
      ...history.filter((item) => item !== searchTerm)
    ].slice(0, MAX_RECENT_SEARCHES);

    setHistory(newHistory);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newHistory));
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const newHistory = history.filter((h) => h !== item);
    setHistory(newHistory);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newHistory));
  };

  const handleSelectResult = (item: NewsListItem) => {
    addToHistory(item.title);
    onClose();
    navigate(`/article/${item.slug}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addToHistory(query);
      // Optionally navigate to a search results page
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header / Search Bar */}
      <div className="flex items-center gap-2 p-4 border-b border-border-subtle">
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search article"
            className="w-full h-11 bg-transparent border-0 focus-visible:ring-0 px-0 text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          )}
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Recent Searches */}
        {!query && (
          <div className="p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">Recent</h3>
            {history.length > 0 ? (
              <div className="flex flex-col">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setQuery(item)}
                    className="flex items-center justify-between py-3 hover:bg-muted/50 cursor-pointer active:bg-muted group"
                  >
                    <div className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground">
                      <Clock size={18} className="shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                    <button
                      onClick={(e) => removeHistoryItem(e, item)}
                      className="text-muted-foreground p-1 hover:text-destructive"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                  <Clock size={40} className="text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">No search history yet</p>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {query && (
          <div className="flex flex-col">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <span className="text-sm text-muted-foreground animate-pulse">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col">
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="flex items-center justify-between px-4 py-4 hover:bg-muted/50 active:bg-muted cursor-pointer border-b border-border-subtle last:border-0"
                  >
                    <div className="flex flex-col gap-1 overflow-hidden pr-4">
                      <span className="text-sm font-medium text-foreground line-clamp-2">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{getRelativeTime(item.created_at)}</span>
                    </div>
                    <ArrowUpRight size={18} className="text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <p className="text-muted-foreground text-sm">
                  No results found for &quot;<span className="font-semibold text-foreground">{query}</span>&quot;
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
