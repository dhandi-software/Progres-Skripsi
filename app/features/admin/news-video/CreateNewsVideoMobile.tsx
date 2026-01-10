import { Menu } from "lucide-react";
import { Toast } from "~/components/ui/toast";
import UseCreateNews from "./UseCreateNews";
import { useSidebar } from "~/components/ui/sidebar";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

const MAX_TITLE_LENGTH = 500;

export default function CreateNewsVideoMobile() {
  const { setOpenMobile } = useSidebar();
  const {
    formData,
    setTitle,
    setYoutubeLink,
    toastProps,
    clearToast,
    handlePublish,
    handleCancel,
    isLoading,
  } = UseCreateNews();

  const titleLength = formData.title.length;

  return (
    <div className="w-full min-h-screen pb-12 bg-white flex flex-col gap-6">
      {/* Header Section */}
      <div className="px-6 pt-4 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenMobile(true)}
            className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-[#0D0D12]" />
          </button>
          <h1 className="text-[1.5rem] font-bold text-[#0D0D12]">
            Create a News Video
          </h1>
        </div>
        <p className="text-[0.875rem] text-[#71717A] font-medium pl-9 leading-relaxed">
          Create and manage video news content
        </p>
      </div>

      <div className="px-6 flex flex-col gap-6">
        {/* Title Section */}
        <div className="flex flex-col gap-2">
          <p className="text-[1rem] font-medium leading-normal text-foreground">
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
          {/* Character Counter */}
          <p className="text-right text-[1rem] font-normal text-muted-foreground">
            {titleLength}/{MAX_TITLE_LENGTH}
          </p>
        </div>

        {/* Link Section */}
        <div className="flex flex-col gap-2">
          <p className="text-[0.875rem] font-medium leading-normal text-foreground">
            Link
          </p>
          <Input
            placeholder="insert link"
            value={formData.youtubeLink}
            className="w-full"
            onChange={(e) => setYoutubeLink(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {/* Cancel Button */}
          <Button
            onClick={handleCancel}
            variant="outline"
            className="h-10 px-4 py-2 border border-border-subtle rounded-md"
          >
            <span className="text-xs font-medium text-foreground">
              Cancel
            </span>
          </Button>
          {/* Publish Video Button */}
          <Button
            onClick={handlePublish}
            disabled={isLoading}
            className="h-10 px-4 py-2 rounded-md"
          >
            <span className="text-xs font-medium">
              {isLoading ? "Publishing..." : "Publish Video"}
            </span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastProps && (
        <div className="fixed right-6 top-6 z-50">
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
