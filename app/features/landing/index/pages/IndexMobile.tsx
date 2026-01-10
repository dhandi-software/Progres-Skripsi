import { FilteringSectionMobile } from "~/features/landing/index/components/mobile/FilteringSectionMobile";
import CardNews from "~/components/ui/Cardnews";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import { useNewsIndex } from "./useNewsIndex";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";

export function IndexMobile() {
    const { news, loading, error, pagination, setPage, setFilters } = useNewsIndex(10);

    const handleSearch = (filters: { category?: number; date?: number }) => {
        setFilters({
            category: filters.category,
            date: filters.date,
        });
        setPage(1);
    };

    if (loading && news.length === 0) {
        return (
            <div className="flex flex-col gap-6 pb-8 px-4 pt-4">
                <FilteringSectionMobile onSearch={handleSearch} />
                <div className="text-muted-foreground body-paragraph-sm">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col gap-4 pb-8 px-4 pt-4">
                {/* Filtering Section */}
                <FilteringSectionMobile onSearch={handleSearch} />

                {error && <div className="text-destructive body-paragraph-sm">{error}</div>}

                {/* News List */}
                <div className="flex flex-col gap-4">
                    {news.map((article) => (
                        <CardNews
                            key={article.id}
                            slug={article.slug}
                            title={article.title}
                            imageSrc={
                                article.media?.path
                                    ? mediaApi.getFileUrl(article.media.path)
                                    : "/images/ic_hero_image.jpg"
                            }
                            timeText={getRelativeTime(article.created_at)}
                            flow="horizontal"
                            lineClamp={2}
                            imageSize={{ width: "8.125rem", height: "7.5rem" }}
                            tagLabel={article.categories.map((cat) => cat.name)}
                        />
                    ))}
                </div>

                {/* Pagination */}
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
            </div>
        </div>
    );
}
