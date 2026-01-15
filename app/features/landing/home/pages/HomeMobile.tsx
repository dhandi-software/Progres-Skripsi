import { NewHeroSection } from "~/features/landing/home/components/Home/HomeMobile/NewHeroSection";
import { AboutSection } from "~/features/landing/home/components/Home/HomeMobile/AboutSection";
import { StepsSection } from "~/features/landing/home/components/Home/HomeMobile/StepsSection";
import { PopularPositionsSection } from "~/features/landing/home/components/Home/HomeMobile/PopularPositionsSection";
import { CtaSection } from "~/features/landing/home/components/Home/HomeMobile/CtaSection";
import { TestimonialsSection } from "~/features/landing/home/components/Home/HomeMobile/TestimonialsSection";
import { InfoSection } from "~/features/landing/home/components/Home/HomeMobile/InfoSection";
import { GamificationSection } from "~/features/landing/home/components/Home/HomeMobile/GamificationSection";

export function HomeMobile() {
    return (
        <main className="w-full bg-white min-h-screen pb-12">
             <div className="flex flex-col w-full">
                <NewHeroSection />
                <AboutSection />
                <InfoSection />
                <PopularPositionsSection />
                <StepsSection />
                <GamificationSection />
                <TestimonialsSection />
                <CtaSection />
             </div>
        </main>
    );
}
