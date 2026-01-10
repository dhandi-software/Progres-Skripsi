import { Menu } from "lucide-react";
import { Toast } from "~/components/ui/toast";
import { useNewsVideo } from "./UseNewsVideo";
import { useSidebar } from "~/components/ui/sidebar";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

const MAX_TITLE_LENGTH = 500;

export default function NewsVideoMobile() {
  const { setOpenMobile } = useSidebar();
  const {
    states: { formData, toastProps, isLoading },
    setters: { setTitle, setYoutubeLink, clearToast },
    handlers: { handlePublish, handleCancel },
  } = useNewsVideo();

  const titleLength = formData.title.length;

  return (
    <div className="w-full min-h-screen pb-[3rem] bg-white flex flex-col gap-[1.5rem]">
      <div className="px-[1.5rem] pt-[1rem] flex flex-col gap-[0.25rem] border-b border-gray-100 pb-[1rem]">
        <div className="flex items-center gap-[0.75rem]">
          <button
            onClick={() => setOpenMobile(true)}
            className="p-[0.25rem] -ml-[0.25rem] rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-[1.5rem] h-[1.5rem] text-[#0D0D12]" />
          </button>
          <h1 className="text-[1.25rem] font-bold text-[#0D0D12]">
            Create a News Video
          </h1>
        </div>
        <p className="text-[0.75rem] text-[#71717A] font-medium pl-[2.25rem] leading-relaxed">
          Create and manage video news content
        </p>
      </div>

      <div className="px-[1.5rem] flex flex-col gap-[1.5rem]">
        <div className="flex flex-col gap-[0.5rem]">
          <p className="text-[1rem] font-medium text-[#0D0D12]">
            Title
          </p>
          <Textarea
            placeholder="Insert title"
            value={formData.title}
            className="w-full"
            onChange={(e) => {
              if (e.target.value.length <= MAX_TITLE_LENGTH) {
                setTitle(e.target.value);
              }
            }}
          />
          <p className="text-right text-[0.875rem] text-[#71717A]">
            {titleLength}/{MAX_TITLE_LENGTH}
          </p>
        </div>

        <div className="flex flex-col gap-[0.5rem]">
          <p className="text-[1rem] font-medium text-[#0D0D12]">
            Link
          </p>
          <Input
            placeholder="insert link"
            value={formData.youtubeLink}
            className="w-full"
            onChange={(e) => setYoutubeLink(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-[0.75rem] pt-[0.5rem]">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isLoading}
            className="flex-1 bg-[#D94F24] text-white hover:bg-[#c0451f]"
          >
            {isLoading ? "Publishing..." : "Publish Video"}
          </Button>
        </div>
      </div>

      {toastProps && (
        <div className="fixed right-[1.5rem] top-[1.5rem] z-50">
          <Toast
            title={toastProps.title}
            variant={toastProps.variant}
            onClose={clearToast}
          />
        </div>
      )}
    </div>
  );
}
