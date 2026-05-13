// src/components/ui/SectionHeader.js — Reusable section label + title
// Server Component (no interactivity needed)

export default function SectionHeader({ label, title, titleGray }) {
  return (
    <>
      <div className="section-label reveal">
        <span>{label}</span>
      </div>
      <h2 className="section-title reveal reveal-heading">
        {title}
        <br />
        <span className="gray">{titleGray}</span>
      </h2>
    </>
  );
}
