import { useState } from "react";

export interface Article {
  id: number;
  title: string;
  image: string;
  status: "Published" | "Scheduled" | "Draft";
  uploadDate?: string;
  views: number;
  type: "Article" | "Video";
}

export function useArticles() {
  const [activeTab, setActiveTab] = useState("All Articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data based on Figma
  const allArticles: Article[] = [
    {
      id: 1,
      title: "Environmental Advocacy Group Releases a Damning Report on the Widespread Deforestation and Mercury P...",
      image: "http://localhost:3845/assets/832275b6b0fffda9fbe9fa28383a3fd74920e637.png",
      status: "Scheduled",
      uploadDate: "11 November 2025 at 12:00 PM",
      views: 0,
      type: "Article",
    },
    {
      id: 2,
      title: "Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine.",
      image: "http://localhost:3845/assets/5390cf8d3c4ddfd89e289c2d5457ba2286b7bcc9.png",
      status: "Scheduled",
      uploadDate: "11 November 2025 at 12:00 PM",
      views: 0,
      type: "Article",
    },
    {
      id: 3,
      title: "National Safety Agency Launches a Full-Scale Investigation into the Fatal Blast at the Rocky Point Coal Mine, Which Claimed the Liv...",
      image: "http://localhost:3845/assets/9c6e903adb501bcc6a24ca2d9161f9e791246ecc.png",
      status: "Published",
      views: 10000,
      type: "Article",
    },
    {
      id: 4,
      title: "Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine.",
      image: "http://localhost:3845/assets/9cb1f5c13f337dd0813289da088aeb3624aba853.png",
      status: "Scheduled",
      uploadDate: "11 November 2025 at 12:00 PM",
      views: 0,
      type: "Article",
    },
    // Add more mock items as needed
  ];

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    articles: allArticles,
  };
}
