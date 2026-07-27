/* Reusable Card component */
const Card = ({ children, className = "", hover = false }) => {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100
        ${hover ? "hover:shadow-xl hover:-translate-y-1 transition-all duration-300" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
