import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DEMO_EMAIL, DEMO_PASS, login } from "../auth.js";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASS);
  const [error, setError] = useState("");

  const from = useMemo(() => loc.state?.from || "/dashboard", [loc.state]);

  function onSubmit(e) {
    e.preventDefault();
    setError("");

    const ok = login(email, password);
    if (!ok) return setError("Invalid email or password.");

    nav(from, { replace: true });
  }

  return (
    <div className="loginWrap">
      {/* Animated background layers */}
      <div className="loginBg" aria-hidden="true">
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />  
        <div className="scanLine" />
        <div className="gridLines" />        
      </div>

      {/* Simple login card */}
      <div className="loginCard">
        <div className="loginBrand">
          <div className="brandChip">
            <span className="dot" />
            <span>PulmoVision</span>
          </div>
          <div className="loginTitle">Sign in</div>
          <div className="loginSub">Medical imaging </div>
        </div>

        <form onSubmit={onSubmit} className="loginForm">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abc@pulmovision.ai"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error ? <div className="error">{error}</div> : null}

          <button className="btn primary full" type="submit">
            Sign in
          </button>

          {/* <div className="hint">
            Demo: <code>{DEMO_EMAIL}</code> / <code>{DEMO_PASS}</code>
          </div> */}
        </form>
      </div>
    </div>
  );
}
