import { VideoListSection } from "~/features/landing/video-index/components/VideoListSection";
import { SidebarAdsSection } from "~/features/landing/index/components/SidebarAdsSection";

export function VideoIndexDesktop() {
  return (
    <main className="flex justify-baseline px-[3.75rem] pt-[1.5rem] gap-[1.5rem]">
      <div className="flex flex-col gap-[1.5rem] w-[59rem]">
        <div className="flex flex-col gap-4">
          <h1 className="text-subheading-h5 text-[#D94F24] leading-normal">
            Video News Index
          </h1>
          <div className="border"></div>
        </div>
        <VideoListSection />
      </div>

      <div className="flex flex-col w-[22rem] gap-[2rem]">
        <SidebarAdsSection />
      </div>
    </main>
  );
}
