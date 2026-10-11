import { useEffect, useState } from "react";
import { DEFAULT_MODELS, listModels } from "../lib/ollama";

export default function Settings({ settings, onSave, onClose, onReset }) {
  const [draft, setDraft] = useState(settings);
  const [models, setModels] = useState(DEFAULT_MODELS);
  const [status, setStatus] = useState(null); // {type, text}
  const [testing, setTesting] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function test() {
    setTesting(true);
    setStatus(null);
    try {
      const found = await listModels(draft);
      if (found.length) setModels(found);
      setStatus({ type: "success", text: `Connected. ${found.length} models available to your key.` });
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <h2 id="settings-title">AI settings</h2>
        <p className="hint">
          Create a key at ollama.com/settings/keys. It is stored only in this browser and sent only to Ollama.
        </p>

        <label>Ollama API key
          <div className="key-row">
            <input
              className="field"
              type={showKey ? "text" : "password"}
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="Paste your key"
              autoComplete="off"
              spellCheck="false"
            />
            <button type="button" className="btn small" onClick={() => setShowKey((v) => !v)}>{showKey ? "Hide" : "Show"}</button>
          </div>
        </label>

        <label>Model
          <input className="field" list="models" value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} />
          <datalist id="models">{models.map((m) => <option key={m} value={m} />)}</datalist>
        </label>

        <fieldset>
          <legend>Connection</legend>
          <label className="radio">
            <input type="radio" name="mode" checked={draft.mode === "proxy"} onChange={() => setDraft({ ...draft, mode: "proxy" })} />
            <span>Via this site (recommended). Avoids CORS errors in dev and on Netlify.</span>
          </label>
          <label className="radio">
            <input type="radio" name="mode" checked={draft.mode === "direct"} onChange={() => setDraft({ ...draft, mode: "direct" })} />
            <span>Direct from the browser to ollama.com. Works only if Ollama allows your origin.</span>
          </label>
        </fieldset>

        {status && <p className={`inline-${status.type === "error" ? "error" : "ok"}`} role="status">{status.text}</p>}

        <div className="modal-actions">
          <button className="btn outline dark" onClick={test} disabled={testing}>{testing ? "Testing…" : "Test connection"}</button>
          <button className="btn primary" onClick={() => onSave(draft)}>Save</button>
        </div>

        <hr />
        <button className="link danger" onClick={() => window.confirm("Replace all books and loans with the sample data?") && onReset()}>
          Reset library to sample data
        </button>
      </div>
    </div>
  );
}
