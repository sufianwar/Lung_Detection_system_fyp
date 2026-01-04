import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";
import { getUserEmail, logout } from "../auth.js";
import { health } from "../api.js";

function titleFromPath(pathname) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/results") return "Results";
  return "PulmoVision";
}

export default function Topbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const [apiOk, setApiOk] = useState(null);

  useEffect(() => {
    let mounted = true;
    health()
      .then((r) => mounted && setApiOk(Boolean(r?.ok)))
      .catch(() => mounted && setApiOk(false));
    return () => (mounted = false);
  }, []);

  const email = getUserEmail();

  return (
    <header className="topbar">
      <div className="topbarLeft">
        <BrandMark />
        <div className="topbarTitles">
          <div className="brandName">PulmoVision</div>
          <div className="pageTitle">{titleFromPath(loc.pathname)}</div>
        </div>
      </div>

      <div className="topbarRight">
        <div className="status">
          <span className={`statusDot ${apiOk === null ? "" : apiOk ? "ok" : "bad"}`} />
          <span className="statusText">System</span>
        </div>

        {/* <div className="userChip" title={email}>
          {email ? email.split("@")[0] : "User"}
        </div> */}

        <button
          className="btn ghost"
          type="button"
          onClick={() => {
            logout();
            nav("/login", { replace: true });
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
