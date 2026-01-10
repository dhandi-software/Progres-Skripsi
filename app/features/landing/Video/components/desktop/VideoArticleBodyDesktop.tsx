import Topics from "~/components/ui/Topics";

interface VideoArticleBodyDesktopProps {
  imageSrc?: string;
  imageCaption?: string;
  articleContent?: React.ReactNode;
  topics?: string[];
}

export function VideoArticleBodyDesktop({
  imageSrc = "/images/Picture.svg",
  imageCaption = "Picture: Nickel mining area in Halmahera, North Maluku. (Dok: MNI)",
  articleContent,
  topics = ["Nickel Mining", "PT_SDM", "Halmahera Mining", "Mine Waste Management"]
}: VideoArticleBodyDesktopProps) {
  return (
    <>
      {/* Hero Picture */}
      <div className="w-full flex flex-col gap-2">
        <img
          src={imageSrc}
          alt="Mining area"
          className="w-[59rem] h-[25rem] rounded-md object-cover"
        />
        <p className="w-[59rem] text-paragraph-sm text-foreground">
          {imageCaption}
        </p>
      </div>

      {/* Article Body */}
      {articleContent ? (
        <article className="w-full text-paragraph-sm text-foreground space-y-4">
          {articleContent}
        </article>
      ) : (
        <article className="w-full text-paragraph-sm text-foreground space-y-4">
          <p>
            HALMAHERA, TAMBANGKU — PT Sumber Daya Mineral's (SDM)
            massive expansion plans in the Halmahera nickel mining
            block in North Maluku are facing serious obstacles. The
            Rp 5 trillion project, touted as a foreign exchange
            booster and creator of 2,000 jobs, is now facing fierce
            protests from indigenous peoples and environmental NGOs.
          </p>
          <p>
            The trigger is the ecological impact caused and the
            implementation of compensation that is considered
            non-transparent. An environmental audit report leaked to
            the editorial office of Tambangku revealed violations of
            the Environmental Impact Assessment (EIA) approved in
            2021. The audit noted that rock waste (overburden) was
            flowing into rivers and threatening the local marine
            ecosystem—the main source of livelihood for local
            fishermen.
          </p>
          <p>
            "We can no longer catch fish like we used to. The river
            water is murky and the sea near the coast is becoming
            polluted. We demand that the company and the government
            take action," said Ahmad Yusuf (48), head of the Teluk
            Jaya Village Fishermen's Group, one of six villages
            affected.
          </p>
          <p>
            PT SDM President Director Budi Santoso denied any EIA
            violations in a written statement. "We have carried out
            all procedures in accordance with applicable
            regulations. Our waste management system meets national
            standards. We are open to dialogue and further
            investigation regarding the issues that have arisen," he
            wrote. Tensions have also escalated due to disparities
            in land compensation payments. A number of residents
            claim to have received only Rp 5,000 per meter, far
            below the market price of up to Rp 50,000 per meter.
          </p>
          <p>
            Darwin Silaban, a policy analyst from ICW (Indonesia
            Corruption Watch), urged a comprehensive audit by the
            KPK (Corruption Eradication Commission). "There are
            strong indications of irregularities in the land
            acquisition and compensation processes. This must be
            thoroughly investigated to protect the rights of
            residents and prevent state losses," he said. PT SDM's
            expansion is part of the government's strategy to
            accelerate nickel downstreaming, particularly to supply
            raw materials for electric vehicle (EV) batteries.
            However, this case once again highlights the classic
            dilemma between pursuing economic growth and maintaining
            environmental sustainability and social justice.
          </p>
        </article>
      )}

      {/* Topics */}
      <Topics title="Topics" topics={topics} />
    </>
  );
}
