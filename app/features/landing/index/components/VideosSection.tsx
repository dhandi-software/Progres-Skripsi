"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import CardNews from "~/components/ui/Cardnews";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useNewsIndex } from "../pages/useNewsIndex";
import { getRelativeTime } from "~/lib/timeUtils";
import { categoryApi } from "~/api/categoryApi";
import { mediaApi } from "~/api/mediaApi";
import type { NewsCategoriesResponse } from "~/api/types";

export function NewsSection() {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState<string>("Category");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
    const [categories, setCategories] = useState<NewsCategoriesResponse[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const { news, loading, error, pagination, setPage, setFilters } = useNewsIndex(10);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryApi.getCategories();
                if (response.data && response.data.length > 0) {
                    setCategories(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const day = date ? format(date, "dd") : "DD";
    const month = date ? format(date, "MMMM") : "Month";
    const year = date ? format(date, "yyyy") : "YYYY";

    const handleSearch = () => {
        const timestamp = date ? Math.floor(date.getTime() / 1000) : undefined;
        setFilters({
            date: timestamp,
            category: selectedCategoryId,
        });
        setPage(1); // Reset to first page on new search
    };

    const handleCategorySelect = (cat: NewsCategoriesResponse) => {
        setSelectedCategory(cat.name);
        setSelectedCategoryId(cat.id);
    };

    const handleClearFilters = () => {
        setDate(undefined);
        setSelectedCategory("Category");
        setSelectedCategoryId(undefined);
        setFilters({});
        setPage(1);
    };

    if (loading && news.length === 0) {
        return (
            <div className="max-w-[60rem] mx-auto">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-[60rem] mx-auto flex flex-col gap-[2rem]">
            <div className="flex gap-[2rem] items-end">
                <div className="flex flex-col gap-[0.25rem]">
                    <h2 className="text-paragraph-sm">Filter by Date</h2>
                    <Popover>
                        <PopoverTrigger
                            asChild
                            variant="ghost"
                            className="!p-0"
                        >
                            <div className="flex items-center gap-2 justify-between">
                                <div className="w-[2.06rem] h-[2.25rem] flex items-center justify-center rounded-sm border border-border-subtle bg-background px-[0.25rem] text-sm">
                                    {day}
                                </div>
                                <div className="w-[7.81rem] h-[2.25rem] flex items-center justify-center rounded-sm border border-border-subtle bg-background px-[0.25rem] text-label">
                                    {month}
                                </div>
                                <div className="w-[2.75rem] h-[2.25rem] flex items-center justify-center rounded-sm border border-border-subtle bg-background px-[0.25rem] text-sm ring-offset-background">
                                    {year}
                                </div>
                                <CalendarIcon />
                            </div>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex flex-col gap-[0.25rem]">
                    <h2 className="text-paragraph-sm">Filter by Category</h2>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    "flex items-center justify-between w-[13.5rem] h-[2.25rem] border border-border-subtle rounded-md bg-background text-muted-foreground text-sm px-[0.75rem] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                                )}
                            >
                                <span>{selectedCategory}</span>
                                <ChevronsUpDown className="w-[1rem] h-[1rem] opacity-70" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="start"
                            className="w-[13.5rem]"
                        >
                            {categoriesLoading ? (
                                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                            ) : categories.length === 0 ? (
                                <DropdownMenuItem disabled>No categories</DropdownMenuItem>
                            ) : (
                                categories.map((cat) => (
                                    <DropdownMenuItem
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat)}
                                        className={cn(
                                            "text-sm cursor-pointer",
                                            selectedCategory === cat.name
                                                ? "bg-accent text-accent-foreground"
                                                : "",
                                        )}
                                    >
                                        {cat.name}
                                    </DropdownMenuItem>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Button
                    size="md"
                    onClick={handleSearch}
                    className="bg-[#D94F24] text-white h-[2.25rem] px-[1rem]"
                >
                    <span className="text-label-sm">Search</span>
                </Button>
            </div>

            {error && <div className="text-destructive">{error}</div>}

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
    );
}
