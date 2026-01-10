/**
 * @example
 * <OverlayImageWrapper className="h-400">
 *   <img src="https://picsum.photos/1080/1080" className="w-full h-full" />
 * </OverlayImageWrapper>
 *
 */
import { cn } from "~/lib/utils";
interface OverlayImageProps {
    children?: React.ReactNode;
    className?: string
}

/**
 * OverlayImageWrapper
 *
 * A component that overlays an image with a black background with 60% opacity
 * to provide contrast for the image.
 *
 * @param {OverlayImageProps} props
 * @returns {React.ReactElement}
 */
const OverlayImageWrapper: React.FC<OverlayImageProps> = ({ children, className }) => {
    return (
        <div className={cn("relative w-full", className)}>
            <div className='absolute w-full h-full'>
                {children}
            </div>
            <div className="absolute bg-black/60 w-full z-[50] h-full" />
        </div >
    );
};

export default OverlayImageWrapper;