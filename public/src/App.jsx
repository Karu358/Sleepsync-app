import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const MOON_PHASES = ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 1.8 + 0.4,
  delay: Math.random() * 5, dur: Math.random() * 3 + 2,
}));

const WEEK_DATA = [
  { day:"Mon", sleep:6.5, score:72 },
  { day:"Tue", sleep:7.2, score:81 },
  { day:"Wed", sleep:5.8, score:61 },
  { day:"Thu", sleep:8.0, score:94 },
  { day:"Fri", sleep:6.0, score:67 },
  { day:"Sat", sleep:9.1, score:98 },
  { day:"Sun", sleep:7.5, score:85 },
];

const FRIENDS = [
  { name:"Maya R.",    avatar:"👩‍💻", score:91, sleep:8.2, streak:12, rank:1, badge:"🥇" },
  { name:"You",        avatar:"🧑‍🎓", score:84, sleep:7.4, streak:5,  rank:2, badge:"🥈", isMe:true },
  { name:"Jordan K.",  avatar:"👨‍🔬", score:79, sleep:7.1, streak:8,  rank:3, badge:"🥉" },
  { name:"Sam L.",     avatar:"👩‍🎨", score:73, sleep:6.8, streak:3,  rank:4, badge:"" },
  { name:"Chris W.",   avatar:"👨‍💼", score:68, sleep:6.2, streak:1,  rank:5, badge:"" },
];

const BLOCKED_APPS = [
  { name:"Instagram",  icon:"📸", blocked:true  },
  { name:"TikTok",     icon:"🎵", blocked:true  },
  { name:"YouTube",    icon:"▶️",  blocked:true  },
  { name:"Twitter/X",  icon:"🐦", blocked:true  },
  { name:"Netflix",    icon:"🎬", blocked:false },
  { name:"Discord",    icon:"💬", blocked:false },
];

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const clamp = (v,lo,hi) => Math.min(Math.max(v,lo),hi);
const fmt12 = (h,m) => {
  const ap = h>=12?"PM":"AM"; const hh=h%12||12;
  return `${hh}:${String(m).padStart(2,"0")} ${ap}`;
};

// ─── Shared styles ────────────────────────────────────────────────────────────
const arrowBtn = { background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:14, cursor:"pointer", padding:"4px 10px" };
const bigNum   = { fontSize:58, fontWeight:200, color:"#e0d8ff", lineHeight:1, background:"linear-gradient(135deg,#e0d8ff,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", minWidth:68, textAlign:"center" };
const circBtn  = { width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:"#e0d8ff", fontSize:18, cursor:"pointer", flexShrink:0 };

// ─── UI primitives ────────────────────────────────────────────────────────────
function StarField() {
  return (
    <svg style={{ position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0 }}>
      {STARS.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size} fill="white"
          style={{ animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite alternate`, opacity:.5 }}/>
      ))}
    </svg>
  );
}

function Card({ children, style={}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:"rgba(255,255,255,0.03)", borderRadius:20,
      border:"1px solid rgba(255,255,255,0.07)", padding:"16px 18px",
      transition:"all 0.25s ease", cursor:onClick?"pointer":"default", ...style,
    }}>{children}</div>
  );
}

function Toggle({ on, onChange, accent="#a78bfa" }) {
  return (
    <div onClick={()=>onChange(!on)} style={{
      width:44, height:26, borderRadius:13,
      background:on?`linear-gradient(90deg,#7c3aed,${accent})`:"rgba(255,255,255,0.1)",
      position:"relative", transition:"background 0.3s", cursor:"pointer", flexShrink:0,
    }}>
      <div style={{ position:"absolute", top:3, left:on?21:3, width:20, height:20, borderRadius:"50%", background:"white", transition:"left 0.3s", boxShadow:"0 1px 4px rgba(0,0,0,.35)" }}/>
    </div>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"6px 13px", borderRadius:99, border:"none", cursor:"pointer",
      background:active?"linear-gradient(135deg,#7c3aed,#4f46e5)":"rgba(255,255,255,0.06)",
      color:active?"white":"rgba(255,255,255,0.4)",
      fontSize:12, fontWeight:active?600:400,
      boxShadow:active?"0 4px 14px rgba(124,58,237,0.35)":"none",
      transition:"all 0.25s ease", whiteSpace:"nowrap",
    }}>{children}</button>
  );
}

function ScoreRing({ score, size=88, stroke=7 }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
        <defs>
          <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#38bdf8"/></linearGradient>
          <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#fb923c"/></linearGradient>
          <linearGradient id="sg3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ef4444"/><stop offset="100%" stopColor="#f97316"/></linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={score>=80?"url(#sg1)":score>=60?"url(#sg2)":"url(#sg3)"}
          strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ*(1-score/100)} style={{ transition:"stroke-dashoffset 1.2s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:size>80?20:15, fontWeight:700, color:"#e0d8ff" }}>{score}</div>
        <div style={{ fontSize:8, opacity:.45, letterSpacing:".5px" }}>SCORE</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize:11, opacity:.32, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:2 }}>{children}</div>;
}

// ─── Auth screens ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode]     = useState("login"); // login | signup
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [uni, setUni]       = useState("");
  const [err, setErr]       = useState("");
  const [step, setStep]     = useState(0); // onboarding step 0-2

  const ONBOARD = [
    { icon:"🌙", title:"Sleep smarter,\nstudy better.", sub:"SleepSync learns your schedule and builds a sleep routine that maximises memory retention." },
    { icon:"📚", title:"Built for\nstudent life.", sub:"Exams, late-night cramming, early lectures — we sync your rest to your academic calendar." },
    { icon:"🧠", title:"Your brain consolidates\nwhile you sleep.", sub:"Research shows 7-9 hrs improves recall by up to 40%. We help you hit that window every night." },
  ];

  if (step < 3) {
    const s = ONBOARD[step];
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", padding:"40px 28px 32px", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
          {ONBOARD.map((_,i)=>(
            <div key={i} style={{ width:i===step?24:6, height:6, borderRadius:99, background:i===step?"#a78bfa":"rgba(255,255,255,0.15)", transition:"all .35s" }}/>
          ))}
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:62, marginBottom:22, animation:"float 3s ease-in-out infinite" }}>{s.icon}</div>
          <div style={{ fontSize:28, fontWeight:700, lineHeight:1.25, color:"#f0ecff", marginBottom:14, whiteSpace:"pre-line", letterSpacing:"-0.4px" }}>{s.title}</div>
          <div style={{ fontSize:14, opacity:.52, lineHeight:1.7 }}>{s.sub}</div>
        </div>
        <div>
          <button onClick={()=>setStep(p=>p+1)} style={{ width:"100%", padding:17, borderRadius:20, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"white", fontSize:16, fontWeight:700, boxShadow:"0 10px 32px rgba(124,58,237,.45)", cursor:"pointer" }}>
            {step===2?"Create my account →":"Next →"}
          </button>
          {step<2&&<div onClick={()=>setStep(3)} style={{ textAlign:"center", marginTop:14, fontSize:12, opacity:.28, cursor:"pointer" }}>Skip intro</div>}
        </div>
      </div>
    );
  }

  const inputStyle = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"11px 14px", color:"#e0d8ff", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10, fontFamily:"Georgia,serif" };

  return (
    <div style={{ padding:"32px 26px 28px", display:"flex", flexDirection:"column", gap:0 }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ fontSize:24, fontWeight:700, color:"#f0ecff" }}>Sleep<span style={{ color:"#a78bfa" }}>Sync</span></div>
        <div style={{ fontSize:13, opacity:.38, marginTop:4 }}>{mode==="login"?"Welcome back 🌙":"Join thousands of students 🎓"}</div>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {["login","signup"].map(m=><Pill key={m} active={mode===m} onClick={()=>{ setMode(m); setErr(""); }}>{m==="login"?"Log In":"Sign Up"}</Pill>)}
      </div>

      {mode==="signup"&&<input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={inputStyle}/>}
      <input placeholder="University email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle}/>
      {mode==="signup"&&<input placeholder="University (e.g. MIT)" value={uni} onChange={e=>setUni(e.target.value)} style={inputStyle}/>}
      <input placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} style={inputStyle}/>

      {err&&<div style={{ fontSize:12, color:"#f87171", marginBottom:8, textAlign:"center" }}>{err}</div>}

      <button onClick={()=>{
        if(!email||!pass){ setErr("Please fill in all fields."); return; }
        if(mode==="signup"&&!name){ setErr("Please enter your name."); return; }
        onAuth({ name:name||"Alex", email, uni:uni||"State University", mode });
      }} style={{ width:"100%", padding:15, borderRadius:18, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"white", fontSize:15, fontWeight:700, boxShadow:"0 8px 28px rgba(124,58,237,.4)", cursor:"pointer", marginTop:4 }}>
        {mode==="login"?"Log In":"Create Account"}
      </button>

      <div style={{ textAlign:"center", marginTop:14, fontSize:12, opacity:.32 }}>
        {mode==="login"?"No account? ":"Have an account? "}
        <span onClick={()=>{ setMode(mode==="login"?"signup":"login"); setErr(""); }} style={{ color:"#a78bfa", cursor:"pointer" }}>
          {mode==="login"?"Sign up free":"Log in"}
        </span>
      </div>
    </div>
  );
}

// ─── Home screen ──────────────────────────────────────────────────────────────
function HomeScreen({ user, examMode, setExamMode, blockStart }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <div style={{ fontSize:11, opacity:.32, letterSpacing:"1.5px", textTransform:"uppercase" }}>Good evening</div>
        <div style={{ fontSize:21, fontWeight:700, color:"#f0ecff", letterSpacing:"-0.3px" }}>{user.name} 👋</div>
      </div>

      {/* Score card */}
      <Card style={{ background:"linear-gradient(135deg,rgba(88,28,180,.32),rgba(30,10,80,.45))", border:"1px solid rgba(167,139,250,.22)", display:"flex", alignItems:"center", gap:18 }}>
        <ScoreRing score={84}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, opacity:.38, letterSpacing:"1px", textTransform:"uppercase", marginBottom:4 }}>Retention Score</div>
          <div style={{ fontSize:28, fontWeight:300, color:"#c4b5fd", marginBottom:3 }}>7.4<span style={{ fontSize:13, opacity:.5 }}> hrs</span></div>
          <div style={{ fontSize:11, opacity:.38, marginBottom:7 }}>11:18 PM — 6:38 AM</div>
          <span style={{ padding:"3px 10px", borderRadius:99, background:"rgba(167,139,250,.15)", border:"1px solid rgba(167,139,250,.28)", fontSize:11, color:"#a78bfa" }}>✦ Good sleep quality</span>
        </div>
      </Card>

      {/* Tonight */}
      <Card>
        <SectionLabel>Tonight's Plan</SectionLabel>
        <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          {[{l:"Wind Down",t:"10:30 PM",i:"🫧"},{l:"Sleep By",t:"11:30 PM",i:"🌙"},{l:"Wake Up",t:"7:00 AM",i:"☀️"}].map((it,i)=>(
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontSize:20, marginBottom:5 }}>{it.i}</div>
              <div style={{ fontSize:13, fontWeight:600, color:"#e0d8ff" }}>{it.t}</div>
              <div style={{ fontSize:10, opacity:.36, marginTop:2 }}>{it.l}</div>
            </div>
          ))}
        </div>
        <div style={{ height:4, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
          <div style={{ height:"100%", width:"68%", borderRadius:99, background:"linear-gradient(90deg,#7c3aed,#38bdf8)" }}/>
        </div>
        <div style={{ fontSize:10, opacity:.28, marginTop:5, textAlign:"right" }}>68% to optimal window</div>
      </Card>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[{i:"💧",l:"Hydration",v:"On track"},{i:"📱",l:"Screen time",v:"2h 14m"},{i:"☕",l:"Last caffeine",v:"3:00 PM"},{i:"🏃",l:"Activity",v:"6,200 steps"}].map((it,j)=>(
          <Card key={j} style={{ padding:"12px 14px" }}>
            <div style={{ fontSize:18, marginBottom:5 }}>{it.i}</div>
            <div style={{ fontSize:11, opacity:.36 }}>{it.l}</div>
            <div style={{ fontSize:13, fontWeight:600, color:"#e0d8ff", marginTop:2 }}>{it.v}</div>
          </Card>
        ))}
      </div>

      {/* Exam mode */}
      <Card onClick={()=>setExamMode(e=>!e)} style={{
        background:examMode?"linear-gradient(135deg,rgba(251,146,60,.2),rgba(239,68,68,.13))":undefined,
        border:examMode?"1px solid rgba(251,146,60,.35)":undefined,
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:examMode?"#fed7aa":"#e0d8ff" }}>📚 Exam Prep Mode</div>
          <div style={{ fontSize:11, opacity:.42, marginTop:3 }}>
            {examMode?`Screen blocker active · Starts at ${fmt12(blockStart,0)}`:"Blocks late-night apps before exams"}
          </div>
        </div>
        <Toggle on={examMode} onChange={setExamMode} accent="#f97316"/>
      </Card>

      {examMode && (
        <Card style={{ background:"linear-gradient(135deg,rgba(239,68,68,.12),rgba(251,146,60,.1))", border:"1px solid rgba(239,68,68,.22)" }}>
          <div style={{ fontSize:12, opacity:.65, lineHeight:1.65 }}>
            🚫 <span style={{ color:"#fca5a5" }}>Screen blocker</span> will activate at {fmt12(blockStart,0)} tonight — Instagram, TikTok, YouTube & Twitter will be restricted until 7:00 AM.
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Social / Leaderboard ─────────────────────────────────────────────────────
function SocialScreen() {
  const [tab, setTab] = useState("leaderboard");
  const [inviteCode] = useState("SLEEP-4829");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <SectionLabel>Social</SectionLabel>
      <div style={{ display:"flex", gap:6 }}>
        {["leaderboard","friends","invite"].map(t=><Pill key={t} active={tab===t} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</Pill>)}
      </div>

      {tab==="leaderboard" && (
        <>
          {/* Top 3 podium */}
          <Card style={{ background:"linear-gradient(135deg,rgba(88,28,180,.25),rgba(30,10,80,.35))", border:"1px solid rgba(167,139,250,.18)" }}>
            <div style={{ fontSize:11, opacity:.35, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:14 }}>This Week's Top Sleepers</div>
            <div style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", gap:12, marginBottom:8 }}>
              {/* 2nd */}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>👩‍🔬</div>
                <div style={{ fontSize:11, opacity:.6, marginBottom:4 }}>Jordan</div>
                <div style={{ height:50, width:44, borderRadius:"8px 8px 0 0", background:"linear-gradient(to top,#6d28d9,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:16 }}>🥈</span>
                </div>
                <div style={{ fontSize:12, color:"#c4b5fd", marginTop:4, fontWeight:600 }}>79</div>
              </div>
              {/* 1st */}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:24, marginBottom:4 }}>👩‍💻</div>
                <div style={{ fontSize:11, opacity:.6, marginBottom:4 }}>Maya</div>
                <div style={{ height:70, width:44, borderRadius:"8px 8px 0 0", background:"linear-gradient(to top,#a78bfa,#c4b5fd)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:18 }}>🥇</span>
                </div>
                <div style={{ fontSize:13, color:"#e0d8ff", marginTop:4, fontWeight:700 }}>91</div>
              </div>
              {/* you */}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>🧑‍🎓</div>
                <div style={{ fontSize:11, opacity:.6, marginBottom:4, color:"#a78bfa" }}>You</div>
                <div style={{ height:60, width:44, borderRadius:"8px 8px 0 0", background:"linear-gradient(to top,#4f46e5,#6d28d9)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:17 }}>🥈</span>
                </div>
                <div style={{ fontSize:12, color:"#a78bfa", marginTop:4, fontWeight:600 }}>84</div>
              </div>
            </div>
          </Card>

          {/* Full list */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {FRIENDS.map((f,i)=>(
              <Card key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                background:f.isMe?"linear-gradient(135deg,rgba(124,58,237,.18),rgba(79,70,229,.12))":undefined,
                border:f.isMe?"1px solid rgba(167,139,250,.3)":undefined,
              }}>
                <div style={{ fontSize:13, fontWeight:700, opacity:.4, width:16, textAlign:"center" }}>#{f.rank}</div>
                <div style={{ fontSize:24 }}>{f.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:f.isMe?"#c4b5fd":"#e0d8ff" }}>{f.name}{f.badge&&` ${f.badge}`}</div>
                  <div style={{ fontSize:11, opacity:.4, marginTop:2 }}>{f.sleep}h avg · {f.streak}-day streak</div>
                </div>
                <ScoreRing score={f.score} size={44} stroke={5}/>
              </Card>
            ))}
          </div>

          <Card style={{ background:"linear-gradient(135deg,rgba(56,189,248,.1),rgba(124,58,237,.1))", border:"1px solid rgba(56,189,248,.18)" }}>
            <div style={{ fontSize:12, opacity:.65, lineHeight:1.65 }}>
              ✦ You're <span style={{ color:"#c4b5fd" }}>7 points</span> behind Maya. Sleep 30 min earlier for 3 nights to close the gap!
            </div>
          </Card>
        </>
      )}

      {tab==="friends" && (
        <div style={{ display:"flex", flexDirection:"column", ga
