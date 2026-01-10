import { useOutletContext } from "react-router";
import NewsVideoDesktop from "~/features/writer/news-video/NewsVideoDesktop";
import NewsVideoMobile from "~/features/writer/news-video/NewsVideoMobile";

export default function VideoRoute() {
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();

  return isMobile ? <NewsVideoMobile /> : <NewsVideoDesktop />;
}
