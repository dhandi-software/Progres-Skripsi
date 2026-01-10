import { useParams, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";

// Re-use admin's create article component which supports edit mode
import CreateArticleMobile from "~/features/admin/create-article/CreateArticleMobile";

export default function EditArticleMobile() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();

  if (!articleId) {
    return (
      <div className="w-full min-h-screen bg-white p-6 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold text-[#0D0D12] mb-2">Article Not Found</h1>
        <p className="text-sm text-[#71717A] mb-6">No article ID provided.</p>
        <Button onClick={() => navigate("/editor")} className="bg-[#D94F24] text-white">
          Back to Pending Reviews
        </Button>
      </div>
    );
  }

  // Use admin's create article component in edit mode
  return <CreateArticleMobile articleId={articleId} />;
}
