import { useRef } from "react";

export default function UploadCard({ file, setFile, onAnalyze, loading, error }) {
  const inputRef = useRef(null);

  return (
    <div className="card">
      <div className="cardTitle">Upload CT Image</div>
      <div className="cardSub">Select an image file to analyze.</div>

      <div className="uploadBox">
        <div className="row">
          <button className="btn" type="button" onClick={() => inputRef.current?.click()}>
            Choose file
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <span className="filePill">{file ? file.name : "No file selected"}</span>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn primary" type="button" disabled={!file || loading} onClick={onAnalyze}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button className="btn ghost" type="button" disabled={!file || loading} onClick={() => setFile(null)}>
            Clear
          </button>
        </div>

        {error ? <div className="error" style={{ marginTop: 10 }}>{error}</div> : null}
      </div>
    </div>
  );
}
