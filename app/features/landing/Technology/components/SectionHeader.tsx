interface SectionHeaderProps {
  title: string;
}

/**
 * Section Header Component - Orange title with vertical divider for desktop
 */
export function SectionHeaderDesktop({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 pb-4">
      {/* Orange divider line */}
      <div className="w-[0.1875rem] h-7 bg-[#D94F24] rounded-full" />
      <h2 className="text-2xl font-semibold leading-8 text-[#D94F24]">
        {title}
      </h2>
    </div>
  );
}

/**
 * Section Header Component - Orange title with vertical divider for mobile
 */
export function SectionHeaderMobile({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 pb-4">
      {/* Orange divider line */}
      <div className="w-[0.1875rem] h-6 bg-[#D94F24] rounded-full" />
      <h2 className="text-lg font-semibold leading-7 text-[#D94F24]">
        {title}
      </h2>
    </div>
  );
}
