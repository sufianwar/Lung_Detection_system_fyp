import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  const nav = useNavigate();

  function go(to) {
    nav(to);
    onClose?.();
  }

  return (
    <>
      <div className={`sidebarOverlay ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebarHeader">
          {/* <div className="sidebarTitle">Workspace</div> */}
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        </div>

        <nav className="sideNav">
          <NavLink to="/dashboard" className={({ isActive }) => `sideLink ${isActive ? "active" : ""}`} onClick={() => go("/dashboard")}>
            Dashboard
          </NavLink>
          <NavLink to="/results" className={({ isActive }) => `sideLink ${isActive ? "active" : ""}`} onClick={() => go("/results")}>
            Results
          </NavLink>
        </nav>

        <div className="sidebarFooter">
          <div className="smallMuted">Secure Medical AI</div>
        </div>
      </aside>
    </>
  );
}
