import { useState } from "react";

export default function NamePrompt({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial || "");

  function submit(e) {
    e.preventDefault();
    const v = name.trim();
    if (v.length < 2) return;
    onSave(v);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center px-4">
      <form
        onSubmit={submit}
        className="glass rounded-3xl p-8 w-full max-w-md shadow-card"
      >
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Who's voting?
        </h2>
        <p className="text-sm text-wc-muted mb-5">
          Your name is used to make sure each employee votes only once.
        </p>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Linh Nguyen"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-wc-muted focus:outline-none focus:border-wc-gold"
        />
        <div className="mt-5 flex justify-end gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-full text-white/70 hover:text-white"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold rounded-full bg-wc-accent text-white hover:bg-red-600 transition"
          >
            Start voting
          </button>
        </div>
      </form>
    </div>
  );
}
