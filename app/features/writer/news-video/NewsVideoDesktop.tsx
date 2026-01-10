import { Toast } from "~/components/ui/toast";
import { useNewsVideo } from "./UseNewsVideo";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const MAX_TITLE_LENGTH = 500;

export default function NewsVideoDesktop() {
  const {
    states: { formData, toastProps, isLoading },
    setters: { setTitle, setYoutubeLink, clearToast },
    handlers: { handlePublish, handleCancel },
  } = useNewsVideo();

  const titleLength = formData.title.length;

  return (
    <div className="relative flex size-full flex-col items-start gap-[1.5rem] px-[1.5rem] pb-[3.75rem] pt-[1.5rem] bg-white">
      <div className="relative flex w-full shrink-0 flex-col items-start gap-[0.5rem]">
        <h1 className="text-[1.875rem] font-semibold text-[#0D0D12]">
          Create a News Video
        </h1>
        <p className="text-[0.875rem] text-[#71717A]">
          Publish a new news video on the Media Nikel Indonesia platform.
        </p>
      </div>

      <div className="relative flex w-full shrink-0 flex-col items-end gap-[0.5rem]">
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[0.5rem]">
          <p className="text-[1rem] font-medium text-[#0D0D12]">
            Title
          </p>
          <div className="relative flex w-full shrink-0 items-start">
            <Textarea
              placeholder="Insert title"
              value={formData.title}
              className="resize-none h-[6.25rem]"
              onChange={(e) => {
                if (e.target.value.length <= MAX_TITLE_LENGTH) {
                  setTitle(e.target.value);
                }
              }}
            />
          </div>
        </div>
        <p className="text-[0.875rem] text-[#71717A]">
          {titleLength}/{MAX_TITLE_LENGTH}
        </p>
      </div>

      <div className="relative flex w-full shrink-0 flex-col items-start gap-[0.5rem]">
        <p className="text-[1rem] font-medium text-[#0D0D12]">
          Link
        </p>
        <div className="relative flex w-full shrink-0 items-start">
          <Input
            placeholder="insert link"
            value={formData.youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
          />
        </div>
      </div>

      <div className="relative flex w-full shrink-0 items-center justify-end gap-[1rem] mt-[1rem]">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="min-w-[7.5rem]"
        >
          Cancel
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isLoading}
          className="min-w-[7.5rem] bg-[#D94F24] hover:bg-[#c0451f]"
        >
          {isLoading ? "Publishing..." : "Publish Video"}
        </Button>
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
