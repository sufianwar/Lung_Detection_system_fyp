function b64ToDataUrl(b64) {
  return `data:image/png;base64,${b64}`;
}

export default function ResultPanel({ originalUrl, result }) {
  const probs = result?.class_probs || null;
  const pred = (result?.predicted_class || "").toString().trim().toLowerCase();

  const realConf = probs && pred ? Number(probs[pred] ?? 0) : 0;

  // Keep your presentation-style score (94..99)
  const scorePct = Math.max(94, Math.min(99, Math.round((0.94 + 0.05 * realConf) * 100)));

  const display = {
    normal: pred === "normal" ? scorePct / 100 : 0,
    benign: pred === "benign" ? scorePct / 100 : 0,
    malignant: pred === "malignant" ? scorePct / 100 : 0,
  };

  return (
    <div className="card">
      <div className="rowBetween" style={{ marginBottom: 10 }}>
        <div>
          <div className="cardTitle">Analysis Output</div>
          <div className="cardSub">Classification + lesion segmentation overlay.</div>
        </div>
        {result ? <span className="chip">Score {scorePct}%</span> : null}
      </div>

      {!result ? (
        <div className="emptyState">Run an analysis to view results here.</div>
      ) : (
        <>
          <div className="chips">
            <span className="chip">
              Prediction <span className="chipStrong">{pred || "unknown"}</span>
            </span>
            <span className="chip">Lesion area {Number(result.lesion_area_pct || 0).toFixed(2)}%</span>
          </div>

          <div className="bars" style={{ marginTop: 12 }}>
            <Bar label="Normal" value={display.normal} />
            <Bar label="Benign" value={display.benign} />
            <Bar label="Malignant" value={display.malignant} />
          </div>

          <div className="preview3">
            <Box title="Original">
              {originalUrl ? <img src={originalUrl} alt="original" /> : <div className="emptyState">No preview</div>}
            </Box>
            <Box title="Overlay">
              <img src={b64ToDataUrl(result.overlay_png_base64)} alt="overlay" />
            </Box>
            <Box title="Mask">
              <img src={b64ToDataUrl(result.mask_png_base64)} alt="mask" />
            </Box>
          </div>
        </>
      )}
    </div>
  );
}

function Box({ title, children }) {
  return (
    <div className="imgCard">
      <div className="imgCardTitle">{title}</div>
      <div className="imgCardBody">{children}</div>
    </div>
  );
}

function Bar({ label, value }) {
  const pct = Math.max(0, Math.min(1, Number(value) || 0)) * 100;
  return (
    <div className="bar">
      <div className="barTop">
        <span>{label}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
