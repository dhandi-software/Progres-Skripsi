import React, { useState } from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: string;
    blur?: boolean;
}

export function Image({
    src,
    alt,
    fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3C/svg%3E",
    blur = true,
    className = "",
    ...props
}: ImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const imageSrc = error ? fallback : src;

    return (
        <div
            className={`
                relative
                overflow-hidden
                transition-all duration-300 ease-in-out
                ${!loaded ? "bg-gray-200" : "bg-transparent"}
                ${!loaded && blur ? "animate-pulse" : ""}
                ${className}
            `}
            style={{ paddingTop: '56.25%' }}
        >
            <img
                src={imageSrc}
                alt={alt}
                loading="lazy"
                onLoad={() => {
                    setLoaded(true);
                    setError(false);
                }}
                onError={() => {
                    setLoaded(true);
                    setError(true);
                }}
                className={`
                    absolute top-0 left-0 w-full h-full object-cover
                    transition-all duration-500 ease-in-out
                    ${!loaded ? "scale-105" : "scale-100"}
                    ${blur && !loaded ? "blur-xl" : "blur-0"}
                    ${!loaded ? "opacity-0" : "opacity-100"}
                `}
                {...props}
            />
        </div>
    );
}
