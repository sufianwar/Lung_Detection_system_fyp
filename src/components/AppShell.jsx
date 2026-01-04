import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({ children }) {
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <div className="shell">
      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} />

      <div className="main">
        <Topbar />

        <div className="mobileBar">
          <button className="btn ghost" type="button" onClick={() => setSideOpen(true)}>
            ☰ Menu
          </button>
        </div>

        <div className="content">{children}</div>
      </div>
    </div>
  );
}
