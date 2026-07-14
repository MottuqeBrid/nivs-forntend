import { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

const faqs = [
  {
    q: "What is NIVS?",
    a: "NIVS (Networked Information Vault System) is a media management platform that lets you store images, videos, and files in one secure, organized place.",
  },
  {
    q: "Is NIVS free to use?",
    a: "Yes! NIVS is completely free with unlimited storage for images, videos, and files. There are no hidden fees or premium tiers.",
  },
  {
    q: "What file types are supported?",
    a: "Images: JPEG, PNG, GIF, WebP, SVG. Videos: MP4, WebM, plus YouTube & Vimeo embeds. Files: any type including PDFs, documents, code, archives, and more.",
  },
  {
    q: "Is there a file size limit?",
    a: "No. NIVS uses direct-to-cloud signed URL uploads, which means files go straight from your browser to Supabase storage. There's no backend bottleneck.",
  },
  {
    q: "How are uploads so fast?",
    a: "Files are uploaded directly from your browser to cloud storage using signed URLs. The backend never touches the file, so there's no processing delay or size limit.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. NIVS uses JWT authentication with role-based access control. Your files are stored on Supabase with encrypted connections. Only you can access your uploads.",
  },
  {
    q: "Can I organize my files?",
    a: "Absolutely. You can name files, add tags, and use the search feature to find anything instantly. Tags let you filter and categorize your media.",
  },
  {
    q: "Can I preview files before downloading?",
    a: "Yes. Images show in a lightbox, videos play inline (including YouTube/Vimeo embeds), and PDFs load in an embedded viewer — all without downloading.",
  },
  {
    q: "What roles are available?",
    a: "NIVS has three roles: User (standard access), Moderator (extended permissions), and Admin (full control over users and content).",
  },
  {
    q: "Can I use NIVS on mobile?",
    a: "Yes. NIVS is fully responsive and works on any device — desktop, tablet, or phone. It supports both dark and light themes.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-base-content/60 max-w-xl mx-auto">
          Got questions? We've got answers.
        </p>
      </div>
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {faqs.map(({ q, a }, i) => (
          <div
            key={i}
            className={`card bg-base-200 shadow transition-all ${
              openIndex === i ? "ring-2 ring-primary" : ""
            }`}
          >
            <button
              className="flex items-center justify-between w-full text-left p-5"
              onClick={() => toggle(i)}
            >
              <span className="font-semibold pr-4">{q}</span>
              {openIndex === i ? (
                <HiChevronUp className="text-xl text-primary shrink-0" />
              ) : (
                <HiChevronDown className="text-xl text-base-content/40 shrink-0" />
              )}
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5">
                <p className="text-sm text-base-content/70 leading-relaxed">
                  {a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
