interface TopicsProps {
    title?: string;
    topics: string[];
}

export default function Topics({ title, topics }: TopicsProps) {
    return (
        <div className="w-full flex flex-col gap-2">
            {topics ? (
                <div className="text-[0.875rem] leading-5 font-medium text-foreground">
                    {title}
                </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
                {topics.map((t, idx) => (
                    <button
                        key={`${t}-${idx}`}
                        type="button"
                        className="inline-flex items-center h-8 w-fit gap-2 px-3 py-2 rounded-md bg-brand-primary-foreground border border-subtle"
                    >
                        <span className="text-label-sm text-[#D94F24]">
                            {t}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
