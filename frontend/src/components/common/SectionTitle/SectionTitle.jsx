import "./SectionTitle.css";

const SectionTitle = ({ subtitle, title, center = false }) => {
  return (
    <div className={`section-title ${center ? "text-center mx-auto" : ""}`}>
      {subtitle && <span className="section-kicker">{subtitle}</span>}
      <h2>{title}</h2>
    </div>
  );
};

export default SectionTitle;
