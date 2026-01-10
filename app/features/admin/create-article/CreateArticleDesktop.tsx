import { useCreateArticle } from "./UseCreateArticle";
import { Button } from "~/components/ui/button";
import { Toast } from "~/components/ui/toast";
import { Popover, PopoverTrigger, PopoverContent } from "~/components/ui/popover";
import { Checkbox } from "~/components/ui/checkbox";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import {
  ImageIcon,
  X,
  Eye,
  ChevronDown,
  Undo2,
  Redo2,
  Bold,
  Underline,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
  CalendarIcon
} from "lucide-react";
import { cn } from "~/lib/utils";
import { MediaDesktop } from "~/features/admin/media";
import PopupAdvertisementDesktop from "~/features/admin/popup-advertisement/PopupAdvertisementDesktop";
import PreviewDesktop from "./components/PreviewDesktop";
import DeleteArticlePopup from "~/features/admin/draft/components/DeleteArticlePopup";

const CATEGORY_OPTIONS = [
  { id: 1, label: "Nickel" },
  { id: 2, label: "Mining" },
  { id: 3, label: "Video" },
  { id: 4, label: "Market & Investment" },
  { id: 5, label: "Technology" },
];

interface CreateArticleDesktopProps {
  articleId?: string;
}

export default function CreateArticleDesktop({ articleId }: CreateArticleDesktopProps) {
  const { states, setters, handlers, refs } = useCreateArticle({ articleId });

  const formatText = (command: string) => {
    if (refs.editorRef.current) {
      refs.editorRef.current.focus();
      document.execCommand(command, false);
    }
  };

  const setAlignment = (alignment: string) => {
    if (refs.editorRef.current) {
      refs.editorRef.current.focus();
      switch (alignment) {
        case "left":
          document.execCommand("justifyLeft");
          break;
        case "center":
          document.execCommand("justifyCenter");
          break;
        case "right":
          document.execCommand("justifyRight");
          break;
        case "justify":
          document.execCommand("justifyFull");
          break;
      }
    }
  };

  // Show preview when showPreview is true
  if (states.showPreview) {
    const previewData = handlers.getPreviewData();
    return (
      <PreviewDesktop
        title={previewData.title}
        caption={previewData.caption}
        topics={previewData.topics}
        articleContent={previewData.articleContent}
        image={previewData.image}
        onBack={handlers.handleBackFromPreview}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-white px-[1.5rem] pt-[1.5rem] pb-[3.75rem]">
      {/* Media Popup */}
      {states.showMediaPopup && (
        <div className="fixed inset-0 w-full h-full bg-black/20 z-40 flex items-center justify-center p-8">
          <div className="bg-white rounded-xl shadow-2xl relative w-full max-w-5xl overflow-hidden">
            <MediaDesktop
              standalone={false}
              onClose={() => setters.setShowMediaPopup(false)}
              onImageSelect={handlers.handleImageSelect}
            />
          </div>
        </div>
      )}

      {/* Advertisement Popup */}
      {states.showAdvertisementPopup && (
        <div className="fixed inset-0 w-full h-full bg-black/20 z-40 flex items-center justify-center">
          <PopupAdvertisementDesktop
            onClose={() => setters.setShowAdvertisementPopup(false)}
            onImageSelect={(media) => {
              if (refs.editorRef.current) {
                refs.editorRef.current.focus();
                const img = document.createElement("img");
                img.src = media.url;
                img.style.maxWidth = "100%";
                document.execCommand("insertHTML", false, img.outerHTML);
              }
              setters.setShowAdvertisementPopup(false);
            }}
          />
        </div>
      )}

      {/* Header Section */}
      <div className="w-full flex flex-col gap-[0.75rem] mb-[1.5rem]">
        <h1 className="text-[1.875rem] font-semibold text-[#0D0D12] leading-[2.25rem]">
          Create a News
        </h1>
        <p className="text-[0.875rem] text-[#71717A] leading-[1.25rem]">
          Fill in the details below to create a new news article.
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="flex items-start gap-[1.5rem] mb-[1.5rem]">
        <div className={cn(
          "relative w-[24.875rem] h-[12.5rem] border rounded-[0.5rem] flex flex-col items-center justify-center gap-3 bg-white transition-colors overflow-hidden",
          states.selectedImage ? "border-transparent" : states.errors.image ? "border-[#E11D48] border-dashed" : "border-[#E5E7EB] border-dashed"
        )}>
          {states.selectedImage ? (
            <>
              <img
                src={states.selectedImage.url}
                alt="Header"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-[0.75rem] right-[0.75rem]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlers.handleRemoveImage}
                >
                  Delete Image
                </Button>
              </div>
            </>
          ) : (
            <div className="px-8 text-center flex flex-col items-center">
              <div className="w-[2.5rem] h-[2.5rem] rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-[0.875rem] text-[#71717A] leading-relaxed max-w-[17.5rem] mb-4">
                Make sure to upload images in horizontal (landscape) orientation.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setters.setShowMediaPopup(true)}
              >
                Upload image
              </Button>
            </div>
          )}
        </div>
        {states.errors.image && (
          <p className="text-[0.75rem] text-[#E11D48] mt-1">Please upload an image</p>
        )}

        {/* Preview Button */}
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlers.handlePreview}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-[#D94F24]" />
            <span className="text-[#D94F24] font-medium">Preview</span>
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="w-full flex flex-col gap-[1.5rem]">
        <div className="flex flex-col gap-[0.5rem]">
          <label className="text-[0.875rem] font-medium text-[#0D0D12]">Image Caption</label>
          <input
            type="text"
            placeholder="Insert caption for the image"
            value={states.imageCaption}
            onChange={(e) => {
              setters.setImageCaption(e.target.value);
              handlers.clearFieldError('imageCaption');
            }}
            className={cn(
              "w-full px-[0.75rem] py-[0.625rem] rounded-[0.375rem] border text-[0.875rem] focus:outline-none focus:ring-2 transition-all",
              states.errors.imageCaption
                ? "border-[#E11D48] focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
                : "border-[#E5E7EB] focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
            )}
          />
          {states.errors.imageCaption && (
            <p className="text-[0.75rem] text-[#E11D48]">Please add image caption</p>
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-[0.5rem]">
          <div className="flex items-center justify-between">
            <label className="text-[0.875rem] font-medium text-[#0D0D12]">Title</label>
            <div className="flex items-center gap-[1rem]">
              <span className="text-[0.75rem] text-[#71717A]">{states.title.length}/150</span>
              <label className="flex items-center gap-[0.5rem] cursor-pointer">
                <Checkbox
                  checked={states.isHeadline}
                  onCheckedChange={(checked) => setters.setIsHeadline(checked as boolean)}
                />
                <span className="text-[0.75rem] text-[#0D0D12]">Set as Headline</span>
              </label>
            </div>
          </div>
          <textarea
            placeholder="Insert title"
            value={states.title}
            maxLength={150}
            onChange={(e) => {
              setters.setTitle(e.target.value);
              handlers.clearFieldError('title');
            }}
            className={cn(
              "w-full h-[6.25rem] px-[0.75rem] py-[0.625rem] rounded-[0.375rem] border text-[0.875rem] focus:outline-none focus:ring-2 transition-all resize-none",
              states.errors.title
                ? "border-[#E11D48] focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
                : "border-[#E5E7EB] focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
            )}
          />
          {states.errors.title && (
            <p className="text-[0.75rem] text-[#E11D48]">Please add a title</p>
          )}
        </div>

        {/* Subheading / Summary */}
        <div className="flex flex-col gap-[0.5rem]">
          <label className="text-[0.875rem] font-medium text-[#0D0D12]">Subheading / Summary</label>
          <input
            type="text"
            placeholder="Brief summary of the article"
            value={states.subHeading}
            onChange={(e) => {
              setters.setSubHeading(e.target.value);
              handlers.clearFieldError('subHeading');
            }}
            className={cn(
              "w-full px-[0.75rem] py-[0.625rem] rounded-[0.375rem] border text-[0.875rem] focus:outline-none focus:ring-2 transition-all",
              states.errors.subHeading
                ? "border-[#E11D48] focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
                : "border-[#E5E7EB] focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
            )}
          />
          {states.errors.subHeading && (
            <p className="text-[0.75rem] text-[#E11D48]">Please add a subheading</p>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col gap-[0.5rem]">
          <label className="text-[0.875rem] font-medium text-[#0D0D12]">Category</label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full px-[0.75rem] py-[0.625rem] rounded-[0.375rem] border text-[0.875rem] flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left",
                  states.errors.category ? "border-[#E11D48]" : "border-[#E5E7EB]"
                )}
                onClick={() => handlers.clearFieldError('category')}
              >
                <span className={cn(
                  "truncate",
                  states.selectedCategories.length > 0 ? "text-[#0D0D12]" : "text-[#71717A]"
                )}>
                  {states.selectedCategories.length > 0
                    ? CATEGORY_OPTIONS.filter(opt => states.selectedCategories.includes(opt.id)).map(opt => opt.label).join(", ")
                    : "Select Category"}
                </span>
                <ChevronDown className="w-4 h-4 text-[#71717A]" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 bg-white" align="start">
              <div className="flex flex-col gap-1">
                {CATEGORY_OPTIONS.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                    onClick={() => {
                      const isSelected = states.selectedCategories.includes(category.id);
                      let newSelected;
                      if (isSelected) {
                        newSelected = states.selectedCategories.filter((id: number) => id !== category.id);
                      } else {
                        newSelected = [...states.selectedCategories, category.id];
                      }
                      handlers.handleCategoryChange(
                        CATEGORY_OPTIONS.map(opt => ({
                          id: opt.id.toString(),
                          label: opt.label,
                          checked: newSelected.includes(opt.id)
                        }))
                      );
                    }}
                  >
                    <Checkbox
                      checked={states.selectedCategories.includes(category.id)}
                      onCheckedChange={() => { }}
                    />
                    <span className="text-[0.875rem] text-[#0D0D12]">{category.label}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {states.errors.category && (
            <p className="text-[0.75rem] text-[#E11D48]">Please select a category</p>
          )}
        </div>

        {/* Topics */}
        <div className="flex flex-col gap-[0.5rem]">
          <label className="text-[0.875rem] font-medium text-[#0D0D12]">Topics</label>
          <input
            type="text"
            placeholder="Add a topic and press enter"
            value={states.topicInput}
            onChange={(e) => setters.setTopicInput(e.target.value)}
            onKeyDown={handlers.handleAddTopic}
            className="w-full px-[0.75rem] py-[0.625rem] rounded-[0.375rem] border border-[#E5E7EB] text-[0.875rem] focus:outline-none focus:ring-2 focus:ring-[#D94F24]/20 focus:border-[#D94F24] transition-all"
          />
          {states.topics.length > 0 && (
            <div className="flex flex-wrap gap-[0.5rem] mt-1">
              {states.topics.map((topic) => (
                <div key={topic} className="flex items-center gap-2 px-[0.75rem] py-[0.375rem] bg-white border border-[#E5E7EB] rounded-[0.375rem]">
                  <span className="text-[0.75rem] font-medium text-[#D94F24]">{topic}</span>
                  <button onClick={() => handlers.handleRemoveTopic(topic)}>
                    <X className="w-3 h-3 text-[#71717A]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publish Schedule */}
        <div className="flex flex-col gap-[0.75rem] p-[1rem] border border-[#E5E5E5] rounded-[0.5rem] bg-white">
          <label className="text-[0.875rem] font-medium text-[#0D0D12]">Publish Schedule</label>

          {/* Toggle Buttons */}
          <div className="flex p-[0.25rem] bg-[#F8FAFC] rounded-[0.375rem] border border-[#F1F1F4]">
            <button
              type="button"
              onClick={() => setters.setPublishMethod("now")}
              className={cn(
                "flex-1 py-[0.5rem] px-[0.75rem] rounded-[0.375rem] text-[0.875rem] font-medium transition-all",
                states.publishMethod === "now"
                  ? "bg-white border border-[#D94F24] text-[#D94F24] shadow-sm"
                  : "bg-transparent text-[#71717A] border border-transparent"
              )}
            >
              Publish Now
            </button>
            <button
              type="button"
              onClick={() => setters.setPublishMethod("scheduled")}
              className={cn(
                "flex-1 py-[0.5rem] px-[0.75rem] rounded-[0.375rem] text-[0.875rem] font-medium transition-all",
                states.publishMethod === "scheduled"
                  ? "bg-white border border-[#D94F24] text-[#D94F24] shadow-sm"
                  : "bg-transparent text-[#71717A] border border-transparent"
              )}
            >
              Set Publish Schedule
            </button>
          </div>

          {/* Time & Date Inputs - show when Set Publish Schedule is selected */}
          {states.publishMethod === "scheduled" && (
            <div className="flex flex-col gap-[1rem] mt-[0.5rem]">
              {/* Time Input */}
              <div className="flex flex-col gap-[0.25rem]">
                <label className="text-[0.875rem] font-medium text-[#0D0D12]">Time</label>
                <input
                  type="time"
                  value={states.scheduledTime}
                  onChange={(e) => setters.setScheduledTime(e.target.value)}
                  className="w-fit px-[0.75rem] py-[0.5rem] rounded-[0.375rem] border border-[#E5E5E5] bg-white text-[0.875rem] font-medium text-[#0D0D12] focus:outline-none focus:ring-2 focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
                />
                <p className="text-[0.75rem] font-medium text-[#71717A]">Enter the time in 24-hour format. Example: 13:00.</p>
              </div>

              {/* Date Input */}
              <div className="flex flex-col gap-[0.25rem]">
                <label className="text-[0.875rem] font-medium text-[#0D0D12]">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 w-fit px-[0.75rem] py-[0.5rem] rounded-[0.375rem] border border-[#E5E5E5] bg-white text-[0.875rem] font-medium text-[#0D0D12] hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-[2rem] h-[2rem] flex items-center justify-center rounded-sm border border-[#E5E5E5] bg-white text-[0.875rem]">
                          {states.scheduledDate ? format(new Date(states.scheduledDate), "dd") : "DD"}
                        </div>
                        <div className="w-[5rem] h-[2rem] flex items-center justify-center rounded-sm border border-[#E5E5E5] bg-white text-[0.875rem]">
                          {states.scheduledDate ? format(new Date(states.scheduledDate), "MMMM") : "Month"}
                        </div>
                        <div className="w-[3rem] h-[2rem] flex items-center justify-center rounded-sm border border-[#E5E5E5] bg-white text-[0.875rem]">
                          {states.scheduledDate ? format(new Date(states.scheduledDate), "yyyy") : "YYYY"}
                        </div>
                      </div>
                      <CalendarIcon className="w-4 h-4 text-[#71717A]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={states.scheduledDate ? new Date(states.scheduledDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setters.setScheduledDate(format(date, "yyyy-MM-dd"));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="flex flex-col gap-[0.5rem]">
          <label className="text-[0.875rem] font-medium text-[#0D0D12]">Article Content</label>
          <div className="border border-[#E5E7EB] rounded-[0.375rem] overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-[#E5E7EB] bg-[#F8FAFC]">
              <div className="flex items-center gap-0.5 border-r border-[#E5E7EB] pr-2 mr-1">
                <button onClick={() => formatText("undo")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <Undo2 className="w-4 h-4" />
                </button>
                <button onClick={() => formatText("redo")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-0.5 border-r border-[#E5E7EB] pr-2 mr-1">
                <button onClick={() => formatText("bold")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => formatText("italic")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <Italic className="w-4 h-4" />
                </button>
                <button onClick={() => formatText("underline")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <Underline className="w-4 h-4" />
                </button>
                <button onClick={() => formatText("strikeThrough")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <Strikethrough className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-0.5 border-r border-[#E5E7EB] pr-2 mr-1">
                <button onClick={() => formatText("insertUnorderedList")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => formatText("insertOrderedList")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-0.5 border-r border-[#E5E7EB] pr-2 mr-1">
                <button onClick={() => setAlignment("left")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setAlignment("center")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button onClick={() => setAlignment("right")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <AlignRight className="w-4 h-4" />
                </button>
                <button onClick={() => setAlignment("justify")} className="p-1.5 rounded hover:bg-gray-100 text-[#71717A]">
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 ml-2"
                onClick={() => setters.setShowAdvertisementPopup(true)}
              >
                <Plus className="w-4 h-4" />
                Add Advertisement
              </Button>
            </div>

            {/* Editor */}
            <div
              ref={refs.editorRef}
              contentEditable
              onInput={(e) => setters.setContent(e.currentTarget.innerHTML)}
              className="p-4 min-h-[25rem] outline-none text-[0.875rem] leading-relaxed"
              data-placeholder="Write your article content here..."
            />
          </div>

          {/* Word/Character Count */}
          <div className="flex justify-end gap-4 text-[0.75rem] text-[#71717A]">
            <span>Word: {states.content ? states.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length : 0}</span>
            <span>Character: {states.content ? states.content.replace(/<[^>]*>/g, '').length : 0}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          {states.isEditMode ? (
            <Button
              onClick={() => setters.setShowDeletePopup(true)}
              variant="outline"
              className="min-w-[7.5rem] border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48]/10"
            >
              Delete Article
            </Button>
          ) : (
            <Button
              onClick={handlers.handleCancel}
              variant="outline"
              className="min-w-[7.5rem]"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handlers.handleSaveDraft}
            disabled={states.isLoading}
            className="min-w-[7.5rem] bg-[#A1A1AA] hover:bg-[#71717A] text-white border-none"
          >
            {states.isLoading ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            onClick={handlers.handlePublish}
            disabled={states.isLoading}
            className="min-w-[7.5rem] bg-[#D94F24] hover:bg-[#c0451f]"
          >
            {states.isLoading ? "Publishing..." : "Publish Article"}
          </Button>
        </div>
      </div>

      {/* Delete Article Popup */}
      {states.showDeletePopup && (
        <DeleteArticlePopup
          onClose={() => setters.setShowDeletePopup(false)}
          onDelete={handlers.handleDeleteArticle}
          isLoading={states.isDeleting}
        />
      )}

      {/* Placeholder style */}
      <style dangerouslySetInnerHTML={{
        __html: `
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}} />
    </div>
  );
}
