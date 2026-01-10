import { HeroSection } from "../components/internship/HeroSection";
import { InfoSection } from "../components/internship/InfoSection";
import { ActorsSection } from "../components/internship/ActorsSection";
import { GamificationSection } from "../components/internship/GamificationSection";

export function HomeMobile() {
    return (
        <main className="w-full bg-background min-h-screen pb-12">
             <div className="flex flex-col gap-8 px-4 py-6">
                <HeroSection />
                <ActorsSection />
                <InfoSection />
                <GamificationSection />
             </div>
        </main>
    );
}
