export function FeatureDesktop({ title }: { title: string }) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-400 p-8">
            <h2 className="text-2xl font-bold text-gray-300">Halaman {title} (Desktop)</h2>
            <p className="mt-2 text-sm">Fitur ini sedang dalam pengembangan.</p>
        </div>
    );
}
