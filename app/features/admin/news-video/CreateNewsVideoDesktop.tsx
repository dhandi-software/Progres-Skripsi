import { Toast } from "~/components/ui/toast";
import UseCreateNews from "./UseCreateNews";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const MAX_TITLE_LENGTH = 500;

export function CreateNewsVideoDesktop() {
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
    <div className="relative flex size-full flex-col items-start gap-2xl px-xl pb-4xl pt-xl">
      {/* Header Section */}
      <div className="relative flex w-full shrink-0 flex-col items-start gap-sm">
        <h1 className="relative w-full shrink-0 text-3xl font-semibold leading-normal-3xl text-foreground">
          Create a News Video
        </h1>
        <p className="relative w-full shrink-0 text-sm font-medium leading-normal-sm text-black-60">
          Publish a new news video on the Media Nikel Indonesia platform.
        </p>
      </div>

      {/* Title Section */}
      <div className="relative flex w-full shrink-0 flex-col items-end gap-sm">
        <div className="relative flex w-full shrink-0 flex-col items-start gap-sm">
          <p className="relative w-full shrink-0 text-base font-medium leading-normal-sm text-foreground">
            Title
          </p>
          <div className="relative flex w-full shrink-0 items-start">
            <Textarea
              placeholder="Insert title"
              value={formData.title}
              onChange={(e) => {
                if (e.target.value.length <= MAX_TITLE_LENGTH) {
                  setTitle(e.target.value);
                }
              }}
            />
          </div>
        </div>
        {/* Character Counter */}
        <p className="relative w-full shrink-0 text-right text-base font-normal leading-normal-base text-muted-foreground">
          {titleLength}/{MAX_TITLE_LENGTH}
        </p>
      </div>

      {/* Link Section */}
      <div className="relative flex w-full shrink-0 flex-col items-start gap-sm">
        <p className="relative w-full shrink-0 text-sm font-medium leading-normal-sm text-foreground">
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

      {/* Action Buttons */}
      <div className="relative flex w-full shrink-0 items-center justify-end gap-md">
        {/* Cancel Button */}
        <Button
          onClick={handleCancel}
          variant="outline"
          className="flex items-center justify-center gap-sm overflow-clip rounded-base border border-border-subtle px-md py-sm shadow-xs"
        >
          <span className="text-xs font-medium leading-normal-xs text-foreground">
            Cancel
          </span>
        </Button>
        {/* Publish Video Button */}
        <Button
          onClick={handlePublish}
          disabled={isLoading}
          className="flex items-center justify-center gap-sm overflow-clip rounded-base px-md py-sm shadow-xs"
        >
          <span className="text-xs font-medium leading-normal-xs">
            {isLoading ? "Publishing..." : "Publish Video"}
          </span>
        </Button>
      </div>

      {/* Toast Notification */}
      {toastProps && (
        <div className="fixed right-xl top-xl z-50">
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
