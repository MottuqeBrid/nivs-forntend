const NoteEditor = ({ content, onChange, placeholder }) => {
  return (
    <textarea
      className="textarea textarea-bordered w-full min-h-75 resize-y rounded-xl"
      placeholder={placeholder || "Start writing your note..."}
      value={content || ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
};

export default NoteEditor;
