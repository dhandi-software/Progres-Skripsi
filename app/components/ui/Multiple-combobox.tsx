// components/ui/multiple-combobox.tsx
import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { ChevronsUpDown, SearchIcon } from "lucide-react";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "~/components/ui/command";
import { Button } from "./button";
import { cn } from "~/lib/utils";

export interface ComboboxOption {
    id: string;
    label: string;
    checked: boolean;
}

interface MultipleComboboxProps {
    options: ComboboxOption[];
    onOptionsChange: (options: ComboboxOption[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    maxDisplayItems?: number;
}

export function MultipleCombobox({
    options,
    onOptionsChange,
    placeholder = "Select options...",
    searchPlaceholder = "Search...",
    emptyMessage = "No results found.",
    className,
    maxDisplayItems = 2,
}: MultipleComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const handleCheckboxChange = (id: string, checked: boolean) => {
        const updatedOptions = options.map((option) =>
            option.id === id ? { ...option, checked } : option,
        );
        onOptionsChange(updatedOptions);
    };

    const selectedOptions = options.filter((opt) => opt.checked);
    const selectedCount = selectedOptions.length;

    const getDisplayText = () => {
        if (selectedCount === 0) return placeholder;

        const displayedItems = selectedOptions
            .slice(0, maxDisplayItems)
            .map((opt) => opt.label);

        if (selectedCount <= maxDisplayItems) {
            return displayedItems.join(", ");
        } else {
            return `${displayedItems.join(", ")} +${selectedCount - maxDisplayItems} more`;
        }
    };

    return (
        <div
            className={cn(
                "w-fit h-fit gap-2 flex flex-col relative",
                className,
            )}
        >
            {/* Trigger Button */}
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-[17.5rem] h-10 gap-1.5 px-4 py-2 rounded-md bg-background border border-border-subtle shadow-xs flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
                <span className="text-label leading-5 text-foreground truncate text-left flex-1">
                    {getDisplayText()}
                </span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </Button>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute top-12 z-50 w-[18.75rem] h-fit gap-2 px-md py-md rounded-md bg-background border border-border-subtle shadow-md">
                    <Command className="w-full" shouldFilter={false}>
                        {/* Search Bar */}
                        <div className="w-fit gap-1.5 px-md py-sm rounded-md bg-background border border-border-subtle shadow-xs ">
                            <CommandInput
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onValueChange={setSearchValue}
                                className="w-full h-fit text-label leading-5 text-muted-foreground border-none focus:ring-0 focus:outline-none p-0 placeholder:text-muted-foreground"
                            />
                        </div>

                        <CommandList className="w-full h-fit mt-2">
                            <CommandEmpty className="w-full h-8 py-3 text-center text-paragraph-sm text-muted-foreground flex items-center justify-center">
                                {emptyMessage}
                            </CommandEmpty>

                            <CommandGroup className="w-full h-fit p-0 mt-2">
                                {options
                                    .filter((option) =>
                                        option.label
                                            .toLowerCase()
                                            .includes(
                                                searchValue.toLowerCase(),
                                            ),
                                    )
                                    .map((option) => (
                                        <CommandItem
                                            key={option.id}
                                            value={option.label}
                                            onSelect={() => {
                                                handleCheckboxChange(
                                                    option.id,
                                                    !option.checked,
                                                );
                                            }}
                                            className="w-full h-8 py-1.5 px-2 rounded-md flex items-center gap-3 cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={option.checked}
                                                onCheckedChange={(checked) => {
                                                    handleCheckboxChange(
                                                        option.id,
                                                        checked as boolean,
                                                    );
                                                }}
                                            />
                                            <span className="w-full h-fit text-paragraph-sm text-foreground">
                                                {option.label}
                                            </span>
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            )}

            {/* Overlay untuk close dropdown ketika klik outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
