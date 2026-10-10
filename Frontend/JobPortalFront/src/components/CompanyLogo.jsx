import { useState } from "react";

export default function CompanyLogo({
  src,
  companyName = "Company",
  size = "md",
  className = "",
}) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name) => {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  const sizes = {
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-xl",
    lg: "w-20 h-20 text-2xl",
  };

  const shouldShowImage =
    src &&
    typeof src === "string" &&
    src.trim() !== "" &&
    !imageError;

  return (
    <div
      className={`${sizes[size] || sizes.md} ${className} rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 border border-gray-200 flex-shrink-0`}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={`${companyName} logo`}
          className="w-full h-full object-contain bg-white"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-bold text-indigo-700">
          {getInitials(companyName)}
        </span>
      )}
    </div>
  );
}