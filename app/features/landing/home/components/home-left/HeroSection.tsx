import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

const slides = [
    {
        id: 1,
        image: "/images/ic_hero_image.jpg",
        title: "New Law Mandates Mining Companies to Allocate Shares for Local Communities",
        time: "3 minutes ago",
    },
    {
        id: 2,
        image: "/images/ic_hero_image.jpg",
        title: "Government Announces Incentives for Green Mining Projects",
        time: "10 minutes ago",
    },
    {
        id: 3,
        image: "/images/ic_hero_image.jpg",
        title: "New Technologies Revolutionize Mineral Exploration",
        time: "1 hour ago",
    },
    {
        id: 4,
        image: "/images/ic_hero_image.jpg",
        title: "Indonesian Mining Firms Commit to Sustainable Practices",
        time: "2 hours ago",
    },
    {
        id: 5,
        image: "/images/ic_hero_image.jpg",
        title: "Local Communities Partner with Mining Giants for Prosperity",
        time: "Yesterday",
    },
];

export function HeroSection() {
    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // auto-slide every 6 second
    useEffect(() => {
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-[21.938rem] max-w-[59rem] overflow-hidden">
            <img
                src={slides[current].image}
                alt={slides[current].title}
                className="w-full h-full object-cover absolute top-0 left-0 z-0 transition-all duration-700 ease-in-out"
                loading="lazy"
            />

            <Button
                variant="outline"
                onClick={prevSlide}
                className="absolute top-1/2 left-4 -translate-y-1/2 z-20 p-2 rounded-md transition-all py-sm px-md border-secondary size-10 bg-white/40 shadow-xs"
            >
                <ArrowLeft className="size-4" />
            </Button>
            <Button
                onClick={nextSlide}
                variant="outline"
                className="absolute top-1/2 right-4 -translate-y-1/2 z-20  rounded-md transition-all py-sm px-md border-secondary size-10 bg-white/40 shadow-xs"
            >
                <ArrowRight className="size-4" />
            </Button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`size-2 rounded-full transition-all duration-300 ${
                            index === current
                                ? "bg-[#D94F24] scale-110"
                                : "bg-brand-secondary-pressed"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
