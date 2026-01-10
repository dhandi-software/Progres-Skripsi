import CardNews from "~/components/ui/Cardnews";

interface NewsItem {
  title: string;
  imageSrc?: string;
  timeText?: string;
}

interface TextNewsItem {
  title: string;
  timeText?: string;
}

interface VideoRelatedNewsDesktopProps {
  newsCards?: NewsItem[];
  textNews?: TextNewsItem[];
}

const defaultNewsCards: NewsItem[] = [
  {
    title: "Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine.",
    imageSrc: "/images/Picture2.svg",
    timeText: "15 minutes ago"
  },
  {
    title: "National Safety Agency Launches a Full-Scale Investigation into the Fatal Blast at the Rocky Point Coal Mine, Which Claimed the Lives of 5 Workers.",
    imageSrc: "/images/Picture2.svg",
    timeText: "15 minutes ago"
  },
  {
    title: "National Safety Agency Launches a Full-Scale Investigation into the Fatal Blast at the Rocky Point Coal Mine, Which Claimed the Lives of 5 Workers.",
    imageSrc: "/images/Picture2.svg",
    timeText: "15 minutes ago"
  }
];

const defaultTextNews: TextNewsItem[] = Array(6).fill({
  title: "Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine.",
  timeText: "2 hours ago"
});

export function VideoRelatedNewsDesktop({
  newsCards = defaultNewsCards,
  textNews = defaultTextNews
}: VideoRelatedNewsDesktopProps) {
  return (
    <>
      <div className="text-subheading-h5 text-[#D94F24]">
        Related News
      </div>

      {/* News Cards Grid - First Row */}
      <div className="w-full h-fit flex justify-between gap-6">
        {newsCards.slice(0, 3).map((news, index) => (
          <CardNews
            key={index}
            title={news.title}
            imageSrc={news.imageSrc}
            timeText={news.timeText}
            trending={false}
            description=""
            flow="vertical"
            boldTitle={true}
            imageSize={index === 0 ? { width: "full", height: "10rem" } : undefined}
          />
        ))}
      </div>

      {/* News Cards Grid - Second Row */}
      <div className="w-full h-fit flex justify-between gap-6">
        {newsCards.slice(3, 6).map((news, index) => (
          <CardNews
            key={index + 3}
            title={news.title}
            imageSrc={news.imageSrc}
            timeText={news.timeText}
            trending={false}
            description=""
            flow="vertical"
            boldTitle={true}
          />
        ))}
      </div>

      {/* Text News Items */}
      {[0, 2, 4].map((rowStart) => (
        <div key={rowStart} className="w-full h-fit gap-6 flex justify-between items-start">
          {textNews.slice(rowStart, rowStart + 2).map((news, index) => (
            <div key={rowStart + index} className="w-full flex flex-col gap-3 border-b">
              <div>
                <h4 className="w-full text-foreground text-paragraph-sm font-bold leading-5 h-fit">
                  {news.title}
                </h4>
              </div>
              <time className="text-paragraph-sm text-muted-foreground mb-lg">
                {news.timeText}
              </time>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
