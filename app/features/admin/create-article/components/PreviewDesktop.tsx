// Preview Desktop component for inline display
import { ArrowLeft, Share2 } from "lucide-react";

interface PreviewDesktopProps {
  title: string;
  caption: string;
  topics: string[];
  articleContent: string;
  image: string | null;
  subHeading?: string;
  onBack: () => void;
}

export function PreviewDesktop({
  title,
  caption,
  topics,
  articleContent,
  image,
  onBack,
}: PreviewDesktopProps) {
  // Format date for display
  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return now.toLocaleDateString("en-US", options);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="w-full min-h-screen bg-white px-[1.5rem] pt-[1.5rem] pb-[3.75rem]">
      {/* Breadcrumb / Back Button */}
      <div className="w-full h-fit flex items-center mb-[2rem]">
        <button
          onClick={onBack}
          className="flex items-center gap-[0.75rem] hover:opacity-70 transition-opacity cursor-pointer"
        >
          <ArrowLeft className="w-[1.5rem] h-[1.5rem] text-[#0D0D12]" />
          <span className="text-[1rem] font-medium text-[#0D0D12] leading-[1.5rem]">
            Preview Article
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col gap-[1.5rem]">
        {/* Title & Meta */}
        <div className="w-full flex flex-col gap-[0.75rem]">
          <h1 className="text-[1.25rem] font-semibold text-[#0D0D12] leading-[1.75rem]">
            {title || "Untitled Article"}
          </h1>

          <div className="w-full flex items-center justify-between">
            {/* Date & Time */}
            <div className="flex items-center h-[1.5rem] gap-[0.75rem]">
              <span className="text-[0.875rem] text-[#71717A] leading-[1.25rem]">
                Created by MNI
              </span>
              <span className="inline-block w-[0.125rem] h-[0.125rem] rounded-full bg-[#71717A]" />
              <time className="text-[0.875rem] text-[#71717A] leading-[1.25rem]">
                {getCurrentDate()}
              </time>
              <span className="inline-block w-[0.125rem] h-[0.125rem] rounded-full bg-[#71717A]" />
              <span className="text-[0.875rem] text-[#71717A] leading-[1.25rem]">
                {getCurrentTime()} WIB
              </span>
            </div>

            {/* Share Button */}
            <button className="p-[0.5rem] hover:bg-gray-50 rounded-md transition-colors">
              <Share2 className="w-[1.5rem] h-[1.5rem] text-[#0D0D12]" />
            </button>
          </div>
        </div>

        {/* Hero Picture */}
        {image && (
          <div className="w-full flex flex-col gap-[0.5rem]">
            <img
              src={image}
              alt={caption || title}
              className="w-full h-[25rem] rounded-[0.5rem] object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/Picture.svg";
              }}
            />
            {caption && (
              <p className="w-full text-[0.875rem] text-[#0D0D12] leading-[1.25rem]">
                {caption}
              </p>
            )}
          </div>
        )}

        {/* Article Body */}
        <article
          className="w-full text-[0.875rem] text-[#0D0D12] leading-[1.5rem] space-y-4 prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{
            __html: articleContent,
          }}
        />

        {/* Topics Section */}
        {topics && topics.length > 0 && (
          <div className="w-full flex flex-col gap-[0.5rem]">
            {/* Title */}
            <div className="text-[0.875rem] font-medium text-[#0D0D12] leading-[1.25rem]">
              Topics
            </div>

            {/* Topic Chips */}
            <div className="flex flex-wrap gap-[0.5rem]">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className="inline-flex items-center h-[2rem] w-fit gap-[0.5rem] px-[0.75rem] py-[0.5rem] rounded-[0.5rem] bg-white border border-[#DFE1E7]"
                >
                  <span className="text-[0.75rem] font-medium text-[#D94F24]">
                    {topic}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewDesktop;
