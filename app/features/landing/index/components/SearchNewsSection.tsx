"use client";

import { useEffect } from "react";
import CardNews from "~/components/ui/Cardnews";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { useNewsIndex } from "../pages/useNewsIndex";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";
import { useSearchParams } from "react-router";

export function SearchNewsSection() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { news, loading, error, pagination, setPage, setFilters } = useNewsIndex(10);

  // Initial fetch with query
  useEffect(() => {
    setFilters({
      title: query,
    });
    setPage(1);
  }, [query]);

  if (loading && news.length === 0) {
    return (
      <div className="max-w-[60rem] w-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-[1.5rem]">
      <div className="flex flex-col gap-4">
        <div className="border-[0px_0px_1px] border-[var(--border\/subtle,#e5e5e5)] border-solid content-stretch flex items-center pb-[var(--lg,16px)] pt-0 px-0 relative shrink-0 w-full">
          <p className="basis-0 font-['Geist:SemiBold',sans-serif] font-semibold grow leading-[var(--normal\/lg,28px)] min-h-px min-w-px relative shrink-0 text-[#d94f24] text-[length:var(--lg,18px)]">
            Results
          </p>
        </div>
        <p className="font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-w-full relative shrink-0 text-[#525252] text-[14px]">
          Showing results for &quot;<span className="font-bold text-foreground">{query}</span>&quot;
        </p>
      </div>

      {error && <div className="text-destructive">{error}</div>}

      {news.length === 0 && !loading && (
        <div className="bg-background flex flex-col gap-[10px] items-center justify-center px-0 py-[24px] relative rounded-xl size-full min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-[84px] h-[54px] flex items-center justify-center">
              <img
                src="/images/empty-state.svg"
                alt="Empty State"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if image not found, or use a placeholder based on the SVG content from Figma if needed
                  // ideally we should save the SVG from Figma to a file, but for now assuming we might need to use what's available or inline it.
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm text-muted-foreground text-center">
              Article not found
            </p>
          </div>
        </div>
      )}

      {news.map((article) => (
        <CardNews
          key={article.id}
          slug={article.slug}
          title={article.title}
          boldTitle
          imageSrc={
            article.media?.path
              ? mediaApi.getFileUrl(article.media.path)
              : "/images/ic_hero_image.jpg"
          }
          timeText={getRelativeTime(article.created_at)}
          flow="horizontal"
          tagLabel={article.categories.map((cat) => cat.name)}
        />
      ))}

      {/* === PAGINATION === */}
      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent className="justify-center">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(pagination.currentPage - 1)}
                className={`cursor-pointer ${pagination.currentPage === 1
                  ? "opacity-50 pointer-events-none"
                  : ""
                  }`}
              />
            </PaginationItem>

            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const active = pagination.currentPage === pageNum;
              // Basic pagination logic to avoid rendering too many buttons
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
              ) {
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={active}
                      onClick={() => setPage(pageNum)}
                      className={`cursor-pointer w-[2.56rem] h-[2.25rem] flex items-center justify-center !text-white bg-brand-primary-muted-foreground`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (
                pageNum === pagination.currentPage - 2 ||
                pageNum === pagination.currentPage + 2
              ) {
                return <PaginationItem key={i}>...</PaginationItem>;
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(pagination.currentPage + 1)}
                className={`cursor-pointer ${pagination.currentPage === pagination.totalPages
                  ? "opacity-50 pointer-events-none"
                  : ""
                  }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
