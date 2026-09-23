/** Card cover photo. If the image fails to load, a neutral block is shown instead of a broken-image icon. */
const CoverImage = ({ src, className = "h-40" }) => (
  <div className={`w-full bg-slate-100 ${className}`}>
    {src && (
      <img
        src={src}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />
    )}
  </div>
);

export default CoverImage;
