// components/ui/Category-Combobox.tsx
import {
    MultipleCombobox,
    type ComboboxOption,
} from "~/components/ui/Multiple-combobox";

interface CategoryComboboxProps {
    categories: ComboboxOption[];
    onCategoriesChange: (categories: ComboboxOption[]) => void;
}

export default function CategoryCombobox({
    categories,
    onCategoriesChange,
}: CategoryComboboxProps) {
    return (
        <div className="gap-xs">
            <h3 className="text-lg font-medium">Select Categories</h3>
            <MultipleCombobox
                options={categories}
                onOptionsChange={onCategoriesChange}
                placeholder="Select categories..."
                searchPlaceholder="Search categories..."
                emptyMessage="No categories found."
                maxDisplayItems={3}
            />
        </div>
    );
}
