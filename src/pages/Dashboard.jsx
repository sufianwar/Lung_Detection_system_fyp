import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadCard from "../components/UploadCard.jsx";
import { analyzeImage } from "../api.js";

// ✅ Add your hero image
import lungHero from "../assets/lung-bg.png";

export default function Dashboard() {
  const nav = useNavigate();

  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setOriginalUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function onAnalyze() {
    setError("");
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    try {
      const json = await analyzeImage(file, { threshold: null });
      nav("/results", { state: { file, originalUrl, result: json } });
    } catch (e) {
      setError(e?.message || "Analyze failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      {/* ✅ Professional hero section */}
      <div className="heroCard">
        <div className="heroText">
          <div className="heroTag">Clinical AI </div>
          <div className="heroTitle">Lung CT Screening & Segmentation</div>
          <div className="heroDesc">
            Upload a scan and generate a clean clinical report with overlay mask output.
          </div>

          <div className="heroBadges">
            <span className="heroBadge">Fast Analysis</span>
            <span className="heroBadge">Overlay + Mask</span>
          </div>
        </div>

        <div className="heroArt">
          <img src={lungHero} alt="Lung hero" />
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <UploadCard
          file={file}
          setFile={setFile}
          onAnalyze={onAnalyze}
          loading={loading}
          error={error}
        />

        <div className="card">
          <div className="cardTitle">Preview</div>
          {!originalUrl ? (
            <div className="emptyState">No image selected.</div>
          ) : (
            <div className="imgbox">
              <img src={originalUrl} alt="preview" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
