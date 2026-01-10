import { NewHeroSection } from "../components/internship/NewHeroSection";
import { AboutSection } from "../components/internship/AboutSection";
import { StepsSection } from "../components/internship/StepsSection";
import { PopularPositionsSection } from "../components/internship/PopularPositionsSection";
import { CtaSection } from "../components/internship/CtaSection";
import { TestimonialsSection } from "../components/internship/TestimonialsSection";
import { InfoSection } from "../components/internship/InfoSection";
import { GamificationSection } from "../components/internship/GamificationSection";

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
