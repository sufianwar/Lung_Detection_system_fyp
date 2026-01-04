import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ResultPanel from "../components/ResultPanel.jsx";

export default function Results() {
  const nav = useNavigate();
  const loc = useLocation();
  const state = loc.state || null;

  const [originalUrl, setOriginalUrl] = useState(state?.originalUrl || "");
  const result = state?.result || null;

  // If user navigates here directly, show safe empty view
  useEffect(() => {
    if (originalUrl) return;
    const f = state?.file;
    if (!f) return;
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <div className="pageHeader rowBetween">
        <div>
          <div className="pageH1">Results</div>
          <div className="pageP">Prediction and segmentation overlay.</div>
        </div>

        <div className="row">
          <button className="btn ghost" type="button" onClick={() => nav("/dashboard")}>
            ← New analysis
          </button>
        </div>
      </div>

      <ResultPanel originalUrl={originalUrl} result={result} />

      {!result ? (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="emptyState">
            No results available. Go to Dashboard and run Analyze.
          </div>
          <button className="btn primary" type="button" onClick={() => nav("/dashboard")}>
            Go to Dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
}
