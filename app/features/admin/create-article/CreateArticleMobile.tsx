import { useCreateArticle } from "./UseCreateArticle";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/TextField";
import { Toast } from "~/components/ui/toast";
import { Popover, PopoverTrigger, PopoverContent } from "~/components/ui/popover";
import { Checkbox } from "~/components/ui/checkbox";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import {
  ImageIcon,
  X,
  Menu,
  Eye,
  ChevronDown,
  Send,
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
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import { MediaMobile } from "~/features/admin/media";
import PreviewMobile from "./components/PreviewMobile";
import DeleteArticlePopup from "~/features/admin/draft/components/DeleteArticlePopup";

const CATEGORY_OPTIONS = [
  { id: 1, label: "Nickel" },
  { id: 2, label: "Mining" },
  { id: 3, label: "Video" },
  { id: 4, label: "Market & Investment" },
  { id: 5, label: "Technology" },
];

interface CreateArticleMobileProps {
  articleId?: string;
}

export default function CreateArticleMobile({ articleId }: CreateArticleMobileProps) {
  const { states, setters, handlers, refs } = useCreateArticle({ articleId });
  const { setOpenMobile } = useSidebar();

  // Show preview when showPreview is true
  if (states.showPreview) {
    const previewData = handlers.getPreviewData();
    return (
      <PreviewMobile
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
    <div className="w-full min-h-screen bg-white flex flex-col pb-32">
      {states.showMediaPopup && (
        <div className="fixed inset-0 w-full h-full bg-black/20 z-50 flex items-center justify-center p-4">
          <MediaMobile
            standalone={false}
            onClose={() => setters.setShowMediaPopup(false)}
            onImageSelect={(image) => handlers.handleImageSelect(image as any)}
          />
        </div>
      )}

      {/* Header Section */}
      <div className="px-6 py-4 flex flex-col gap-1 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenMobile(true)}
            className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-[#0D0D12]" />
          </button>
          <h1 className="text-[1.25rem] font-bold text-[#0D0D12]">
            Create New Article
          </h1>
        </div>
        <p className="text-[0.75rem] text-[#71717A] pl-9 font-medium">
          Articles that are incomplete or have not been published.
        </p>
      </div>

      <div className="px-6 py-6 flex flex-col gap-8">
        {/* Header Image Section */}
        <div className="flex flex-col gap-4">
          <div className={cn(
            "relative w-full h-[17rem] aspect-[380/238] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 bg-white transition-colors overflow-hidden",
            states.selectedImage ? "border-transparent" : states.errors.image ? "border-[#E11D48]" : "border-[#E5E7EB]"
          )}>
            {states.selectedImage ? (
              <>
                <img
                  src={states.selectedImage.url}
                  alt="Header"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={handlers.handlePreview}
                    className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-1.5 text-[0.75rem] font-semibold text-[#D94F24]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <button
                    onClick={handlers.handleRemoveImage}
                    className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-gray-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="px-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
                <button
                  onClick={handlers.handlePreview}
                  className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-xs border border-gray-100 flex items-center gap-1.5 text-[0.75rem] font-semibold text-[#D94F24]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <div className="flex flex-col gap-2 mb-6">
                  <p className="text-[0.875rem] text-gray-500 leading-relaxed max-w-[17.5rem]">
                    Make sure to upload image in horizontal (landscape) orientation. Supported formats: JPG, JPEG, PNG.
                  </p>
                  <p className="text-[0.75rem] text-gray-400">
                    Recommended image ratio: 23.75rem (width) × 14.875rem (height).
                  </p>
                </div>
                <button
                  onClick={() => setters.setShowMediaPopup(true)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-50 shadow-sm"
                >
                  Upload Image
                </button>
              </div>
            )}
          </div>
          {states.errors.image && (
            <p className="text-[0.75rem] text-[#E11D48] mt-1">Please upload an image</p>
          )}
        </div>

        {/* Caption Thumbnail */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">Caption Thumbnail</label>
          <input
            type="text"
            placeholder="Insert caption"
            value={states.imageCaption}
            onChange={(e) => {
              setters.setImageCaption(e.target.value);
              handlers.clearFieldError('imageCaption');
            }}
            className={cn(
              "w-full px-4 py-3 rounded-sm border text-sm focus:outline-none focus:ring-2 transition-all",
              states.errors.imageCaption
                ? "border-[#E11D48] focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
                : "border-[#E5E7EB] focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
            )}
          />
          {states.errors.imageCaption && (
            <p className="text-[0.75rem] text-[#E11D48]">Please add image caption</p>
          )}
        </div>

        {/* Title Section */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Title</label>
            <textarea
              placeholder="Insert title"
              value={states.title}
              onChange={(e) => {
                setters.setTitle(e.target.value);
                handlers.clearFieldError('title');
              }}
              className={cn(
                "w-full px-4 py-3 rounded-sm border text-sm min-h-[7.5rem] focus:outline-none focus:ring-2 transition-all resize-none",
                states.errors.title
                  ? "border-[#E11D48] focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
                  : "border-[#E5E7EB] focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
              )}
            />
            {states.errors.title && (
              <p className="text-[0.75rem] text-[#E11D48]">Please add a title</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={states.isHeadline}
                onChange={(e) => setters.setIsHeadline(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#D94F24] focus:ring-[#D94F24]"
              />
              <span className="text-xs font-medium text-gray-600">Set the article as a Headline</span>
            </label>
            <span className="text-xs text-gray-400">{states.title.length}/500</span>
          </div>
        </div>

        {/* Subheading */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">Subheading</label>
          <input
            type="text"
            placeholder="Insert subheading"
            value={states.subHeading}
            onChange={(e) => {
              setters.setSubHeading(e.target.value);
              handlers.clearFieldError('subHeading');
            }}
            className={cn(
              "w-full px-4 py-3 rounded-sm border text-sm focus:outline-none focus:ring-2 transition-all",
              states.errors.subHeading
                ? "border-[#E11D48] focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
                : "border-[#E5E7EB] focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
            )}
          />
          {states.errors.subHeading && (
            <p className="text-[0.75rem] text-[#E11D48]">Please add a subheading</p>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">Category</label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full px-4 py-3 rounded-sm border text-sm flex items-center justify-between bg-white hover:bg-gray-50 transition-colors",
                  states.errors.category ? "border-[#E11D48]" : "border-[#E5E7EB]"
                )}
                onClick={() => handlers.clearFieldError('category')}
              >
                <span className={cn(
                  "truncate",
                  states.selectedCategories.length > 0 ? "text-gray-900 font-medium" : "text-gray-400"
                )}>
                  {states.selectedCategories.length > 0
                    ? CATEGORY_OPTIONS.filter(opt => states.selectedCategories.includes(opt.id)).map(opt => opt.label).join(", ")
                    : "Select Category"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
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
                    <span className="text-sm text-gray-700">{category.label}</span>
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
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">Topics</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Add a topic and press enter"
              value={states.topicInput}
              onChange={(e) => setters.setTopicInput(e.target.value)}
              onKeyDown={handlers.handleAddTopic}
              className="w-full px-4 py-3 pr-12 rounded-sm border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#D94F24]/20 focus:border-[#D94F24] transition-all"
            />
            <button
              onClick={() => handlers.handleAddTopic()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D94F24]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {states.topics.map((topic) => (
              <div key={topic} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                <span className="text-xs font-semibold text-[#D25026]">{topic}</span>
                <button onClick={() => handlers.handleRemoveTopic(topic)}>
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Publish Schedule */}
        <div className="flex flex-col gap-3 p-4 border border-[#E5E5E5] rounded-lg">
          <label className="text-sm font-medium text-gray-900">Publish Schedule</label>

          {/* Toggle Buttons */}
          <div className="flex p-1 bg-gray-50 rounded-sm border border-gray-100">
            <button
              onClick={() => setters.setPublishMethod("now")}
              className={cn(
                "flex-1 py-2 px-2 rounded-sm text-sm font-medium transition-all",
                states.publishMethod === "now"
                  ? "bg-white border border-[#D94F24] text-[#D94F24] shadow-xs"
                  : "bg-transparent text-gray-500"
              )}
            >
              Publish Now
            </button>
            <button
              onClick={() => setters.setPublishMethod("scheduled")}
              className={cn(
                "flex-1 py-2 px-2 rounded-sm text-sm font-medium transition-all",
                states.publishMethod === "scheduled"
                  ? "bg-white border border-[#D94F24] text-[#D94F24] shadow-xs"
                  : "bg-transparent text-gray-500"
              )}
            >
              Set Publish Schedule
            </button>
          </div>

          {/* Time & Date Inputs - show when Set Publish Schedule is selected */}
          {states.publishMethod === "scheduled" && (
            <div className="flex flex-col gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Time Input */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-900">Time</label>
                <input
                  type="time"
                  value={states.scheduledTime}
                  onChange={(e) => setters.setScheduledTime(e.target.value)}
                  className="w-fit px-3 py-2 border border-[#E5E5E5] rounded-sm text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
                />
                <p className="text-xs font-medium text-gray-500">Enter the time in 24-hour format. Example: 13:00.</p>
              </div>

              {/* Date Input */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-900">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 w-fit px-3 py-2 rounded-sm border border-[#E5E5E5] bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-1">
                        <div className="w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-sm border border-[#E5E5E5] bg-white text-xs">
                          {states.scheduledDate ? format(new Date(states.scheduledDate), "dd") : "DD"}
                        </div>
                        <div className="w-[4rem] h-[1.75rem] flex items-center justify-center rounded-sm border border-[#E5E5E5] bg-white text-xs">
                          {states.scheduledDate ? format(new Date(states.scheduledDate), "MMMM") : "Month"}
                        </div>
                        <div className="w-[2.5rem] h-[1.75rem] flex items-center justify-center rounded-sm border border-[#E5E5E5] bg-white text-xs">
                          {states.scheduledDate ? format(new Date(states.scheduledDate), "yyyy") : "YYYY"}
                        </div>
                      </div>
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
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

        {/* Article Body */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-900">Article</label>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1">
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Undo2 className="w-4 h-4" /></button>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Redo2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1">
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Bold className="w-4 h-4" /></button>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Underline className="w-4 h-4" /></button>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Italic className="w-4 h-4" /></button>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Strikethrough className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1">
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><List className="w-4 h-4" /></button>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><ListOrdered className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-0.5">
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><AlignLeft className="w-4 h-4" /></button>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><AlignCenter className="w-4 h-4" /></button>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><AlignRight className="w-4 h-4" /></button>
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><AlignJustify className="w-4 h-4" /></button>
            </div>
          </div>

          <button className="w-fit flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            Add Advertisement
          </button>

          <div
            ref={refs.editorRef}
            contentEditable
            onInput={(e) => setters.setContent(e.currentTarget.innerHTML)}
            className="w-full min-h-[25rem] p-4 bg-white border border-[#E5E7EB] rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D94F24]/20 focus:border-[#D94F24] transition-all prose prose-sm max-w-none"
            data-placeholder="Write an article here..."
          >
          </div>

          <div className="flex justify-end gap-3 text-[0.625rem] text-gray-400 font-medium">
            <span>Word: {states.content ? states.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length : 0}</span>
            <span>Character: {states.content ? states.content.replace(/<[^>]*>/g, '').length : 0}</span>
          </div>
        </div>
      </div>

      {/* Fixed Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-100 flex items-center gap-3 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        {states.isEditMode ? (
          <Button
            onClick={() => setters.setShowDeletePopup(true)}
            variant="outline"
            className="border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48]/10"
          >
            Delete Article
          </Button>
        ) : (
          <Button
            onClick={handlers.handleCancel}
            variant="outline"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handlers.handleSaveDraft}
          disabled={states.isLoading}
          variant="ghost"
          className="flex-1 bg-gray-400 !text-white hover:bg-gray-500"
        >
          {states.isLoading ? "Saving..." : "Save to draft"}
        </Button>
        <Button
          onClick={handlers.handlePublish}
          disabled={states.isLoading}
          variant="default"
          className="flex-1"
        >
          {states.isLoading ? "Publishing..." : "Publish Article"}
        </Button>
      </div>

      {/* Delete Article Popup */}
      {states.showDeletePopup && (
        <DeleteArticlePopup
          onClose={() => setters.setShowDeletePopup(false)}
          onDelete={handlers.handleDeleteArticle}
          isLoading={states.isDeleting}
        />
      )}

      {states.toastProps && (
        <Toast
          title={states.toastProps.title}
          variant={states.toastProps.variant}
          onClose={() => { }}
        />
      )}

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
