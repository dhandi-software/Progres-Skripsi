import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";

// Type untuk item category
interface CategoryItem {
    id: string;
    label: string;
    checked: boolean;
}

// Props untuk komponen CategoryCheckbox
interface CategoryCheckboxProps {
    title?: string;
    categories?: CategoryItem[];
    onCategoryChange?: (categories: CategoryItem[]) => void;
}

/**
 * Komponen Category Checkbox dengan layout horizontal
 *
 * @example
 * <CategoryCheckbox
 *   title="Kategori"
 *   categories={[
 *     { id: "1", label: "Nickel", checked: false },
 *     { id: "2", label: "Mining", checked: false }
 *   ]}
 *   onCategoryChange={(categories) => console.log(categories)}
 * />
 */
export function CategoryCheckbox({
    title = "Category",
    categories = [
        { id: "1", label: "Nickel", checked: false },
        { id: "2", label: "Mining", checked: false },
        { id: "3", label: "Video", checked: false },
        { id: "4", label: "Market & Investment", checked: false },
        { id: "5", label: "Technology", checked: false },
    ],
    onCategoryChange,
}: CategoryCheckboxProps) {
    const [categoryItems, setCategoryItems] =
        useState<CategoryItem[]>(categories);

    // Handler untuk toggle checkbox
    const handleCheckboxChange = (id: string, checked: boolean) => {
        const updatedCategories = categoryItems.map((item) =>
            item.id === id ? { ...item, checked } : item,
        );

        setCategoryItems(updatedCategories);
        onCategoryChange?.(updatedCategories);
    };

    return (
        <div className="w-full h-fit flex flex-col gap-xs">
            {/* Container text category */}
            <div className="w-full h-fit flex flex-col gap-sm">
                <div className="w-full h-fit text-label-lg text-foreground">
                    {title}
                </div>
            </div>

            {/* Wrap ComboBox */}
            <div className="w-full h-fit rounded-md bg-background">
                {/* Wrap Item - Horizontal Layout */}
                <div className="w-fit h-fit flex flex-row flex-wrap gap-lg py-xs">
                    {categoryItems.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "w-fit h-fit py-1.5  rounded-md bg-background text-foreground gap-sm",
                                "flex items-center cursor-pointer transition-colors",
                            )}
                            onClick={() =>
                                handleCheckboxChange(item.id, !item.checked)
                            }
                        >
                            <Checkbox
                                checked={item.checked}
                                onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                        item.id,
                                        checked as boolean,
                                    )
                                }
                            />
                            <span className="text-sm font-medium whitespace-nowrap">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CategoryCheckbox;
