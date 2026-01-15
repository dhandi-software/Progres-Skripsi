import { NewHeroSection } from "~/features/landing/home/components/Home/HomeDesktop/NewHeroSection";
import { AboutSection } from "~/features/landing/home/components/Home/HomeDesktop/AboutSection";
import { StepsSection } from "~/features/landing/home/components/Home/HomeDesktop/StepsSection";
import { PopularPositionsSection } from "~/features/landing/home/components/Home/HomeDesktop/PopularPositionsSection";
import { CtaSection } from "~/features/landing/home/components/Home/HomeDesktop/CtaSection";
import { TestimonialsSection } from "~/features/landing/home/components/Home/HomeDesktop/TestimonialsSection";
import { InfoSection } from "~/features/landing/home/components/Home/HomeDesktop/InfoSection";
import { GamificationSection } from "~/features/landing/home/components/Home/HomeDesktop/GamificationSection";

export function HomeDesktop() {
    return (
        <main className="w-full bg-white flex flex-col items-center">
            <NewHeroSection />
            <AboutSection />
            <InfoSection />
            <PopularPositionsSection />
            <StepsSection />
            <GamificationSection />
            <TestimonialsSection />
            <CtaSection />
        </main>
    );
}
