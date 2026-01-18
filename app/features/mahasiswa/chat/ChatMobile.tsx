export function ChatMobile({ title }: { title: string }) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-400 p-4">
            <h2 className="text-xl font-bold text-gray-300">Halaman {title} (Mobile)</h2>
            <p className="mt-2 text-xs">Fitur ini sedang dalam pengembangan.</p>
        </div>
    );
}
