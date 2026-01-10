// features/Navbar/Breadcrumb/LeftPreview.tsx

import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export default function LeftPreview() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        navigate(-1);
    };

    const getBreadcrumbLabel = () => {
        if (location.pathname.includes("/preview")) {
            return "Preview Article";
        }
        return "Articles";
    };

    return (
        <div className="w-full h-fit">
            {/* Breadcrumb Container */}
            <div className="w-full h-fit flex items-center ">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="w-fit h-fit pr-[0.75rem] flex items-center hover:opacity-70 transition-opacity cursor-pointer"
                >
                    <ArrowLeft className="w-[1.5rem] h-[1.5rem] text-foreground " />
                </button>

                {/* Label Container */}
                <div className="w-fit h-fit gap-[0.5rem]">
                    <span className="w-fit h-fit text-label-lg text-foreground">
                        {getBreadcrumbLabel()}
                    </span>
                </div>
            </div>
        </div>
    );
}
