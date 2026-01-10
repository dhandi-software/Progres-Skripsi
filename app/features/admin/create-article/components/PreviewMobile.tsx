// Preview Mobile component for inline display
import { ArrowLeft, Share2 } from "lucide-react";

interface PreviewMobileProps {
  title: string;
  caption: string;
  topics: string[];
  articleContent: string;
  image: string | null;
  subHeading?: string;
  onBack: () => void;
}

export function PreviewMobile({
  title,
  caption,
  topics,
  articleContent,
  image,
  onBack,
}: PreviewMobileProps) {
  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
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
    <div className="w-full min-h-screen bg-white px-[1rem] pt-[1rem] pb-[2rem]">
      {/* Breadcrumb / Back Button */}
      <div className="w-full h-fit flex items-center mb-[1.5rem]">
        <button
          onClick={onBack}
          className="flex items-center gap-[0.5rem] hover:opacity-70 transition-opacity cursor-pointer"
        >
          <ArrowLeft className="w-[1.25rem] h-[1.25rem] text-[#0D0D12]" />
          <span className="text-[0.875rem] font-medium text-[#0D0D12] leading-[1.25rem]">
            Preview Article
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col gap-[1rem]">
        {/* Title & Meta */}
        <div className="w-full flex flex-col gap-[0.5rem]">
          <div className="flex items-start justify-between gap-[0.5rem]">
            <h1 className="flex-1 text-[1rem] font-semibold text-[#0D0D12] leading-[1.5rem]">
              {title || "Untitled Article"}
            </h1>
            <button className="p-[0.25rem] hover:bg-gray-50 rounded-md transition-colors shrink-0">
              <Share2 className="w-[1.25rem] h-[1.25rem] text-[#0D0D12]" />
            </button>
          </div>

          {/* Date & Time */}
          <div className="flex flex-wrap items-center gap-x-[0.5rem] gap-y-[0.25rem]">
            <span className="text-[0.75rem] text-[#71717A] leading-[1rem]">
              Created by MNI
            </span>
            <span className="inline-block w-[0.125rem] h-[0.125rem] rounded-full bg-[#71717A]" />
            <time className="text-[0.75rem] text-[#71717A] leading-[1rem]">
              {getCurrentDate()}
            </time>
            <span className="inline-block w-[0.125rem] h-[0.125rem] rounded-full bg-[#71717A]" />
            <span className="text-[0.75rem] text-[#71717A] leading-[1rem]">
              {getCurrentTime()} WIB
            </span>
          </div>
        </div>

        {/* Hero Picture */}
        {image && (
          <div className="w-full flex flex-col gap-[0.5rem]">
            <img
              src={image}
              alt={caption || title}
              className="w-full h-[12.5rem] rounded-[0.5rem] object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/Picture.svg";
              }}
            />
            {caption && (
              <p className="w-full text-[0.75rem] text-[#0D0D12] leading-[1rem]">
                {caption}
              </p>
            )}
          </div>
        )}

        {/* Article Body */}
        <article
          className="w-full text-[0.875rem] text-[#0D0D12] leading-[1.5rem] space-y-3 prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: articleContent,
          }}
        />

        {/* Topics Section */}
        {topics && topics.length > 0 && (
          <div className="w-full flex flex-col gap-[0.5rem]">
            <div className="text-[0.875rem] font-medium text-[#0D0D12] leading-[1.25rem]">
              Topics
            </div>
            <div className="flex flex-wrap gap-[0.5rem]">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className="inline-flex items-center h-[1.75rem] w-fit gap-[0.5rem] px-[0.625rem] py-[0.375rem] rounded-[0.375rem] bg-white border border-[#DFE1E7]"
                >
                  <span className="text-[0.625rem] font-medium text-[#D94F24]">
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

export default PreviewMobile;
