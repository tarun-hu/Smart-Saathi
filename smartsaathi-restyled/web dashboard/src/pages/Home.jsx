import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import PhoneFrame from "../components/PhoneFrame";
import SeniorHomeScreen from "../components/screens/SeniorHomeScreen";
import dashboardSvg from "../assets/illustrations/undraw_dashboard_p93p.svg";

const AppLogoSVG = () => (
  <svg viewBox="0 0 36 36" width="42" height="42" fill="none">
    <circle cx="11" cy="11" r="5.5" fill="white" opacity=".95"/>
    <path d="M2 28c0-5 4-8.5 9-8.5s9 3.5 9 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="26" cy="11" r="4.5" fill="white" opacity=".65"/>
    <path d="M17 28c0-4 3-7 9-7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2.5 2.5L8 3" stroke="#1975d2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <NavBar />

      {/* ── HERO ── */}
      <section style={{background:'#fff',padding:'72px 48px 60px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-120,right:-120,width:560,height:560,background:'radial-gradient(circle,rgba(25,117,210,.05) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:56,alignItems:'center',position:'relative',zIndex:2,maxWidth:1100,margin:'0 auto'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'#e8f1fc',color:'#0c447c',fontSize:11,fontWeight:600,padding:'5px 13px',borderRadius:99,marginBottom:22,letterSpacing:'.02em'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#1975d2',animation:'bdgpulse 2s ease infinite'}}/>
              Elderly care, reimagined
            </div>
            <h1 style={{fontSize:52,fontWeight:800,lineHeight:1.04,letterSpacing:'-.04em',color:'#1d1d1f',marginBottom:16}}>
              Let's provide the<br/>
              <span style={{color:'#1975d2'}}>care they deserve.</span>
            </h1>
            <p style={{fontSize:17,color:'#6e6e73',lineHeight:1.47,maxWidth:440,marginBottom:32,fontWeight:400}}>
              The all-in-one companion platform for caregivers — real-time monitoring, voice AI, and instant alerts, beautifully designed.
            </p>
            <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
              <button className="btn-primary" onClick={() => navigate('/signup')}>
                Get started as a caregiver
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </button>
              <button className="btn-outline-green" onClick={() => navigate('/download')}>Are you an elder person?</button>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:24}}>
              <div style={{display:'flex'}}>
                {['RG','SM','AP','+'].map((a,i)=>(
                  <div key={a} style={{width:24,height:24,borderRadius:'50%',border:'2px solid #fff',background:'#e8f1fc',color:'#1975d2',fontSize:8,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',marginLeft: i===0?0:-6}}>{a}</div>
                ))}
              </div>
              <span style={{fontSize:12,color:'#6e6e73'}}><strong style={{color:'#1d1d1f',fontWeight:600}}>200+ caregivers</strong> across India trust SmartSaathi</span>
            </div>
          </div>

          {/* App logo + Samsung S-series phone */}
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:7,animation:'float 5s ease-in-out infinite'}}>
              <div style={{width:68,height:68,borderRadius:17,background:'#1975d2',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 10px 30px rgba(25,117,210,.28)'}}>
                <AppLogoSVG />
              </div>
              <span style={{fontSize:18,fontWeight:800,color:'#1d1d1f',letterSpacing:'-.03em'}}>Smart<span style={{color:'#1975d2'}}>Saathi</span></span>
              <span style={{fontSize:10,color:'#aeaeb2',fontWeight:400}}>The elderly care companion</span>
            </div>
            <div style={{animation:'float 5s ease-in-out infinite'}}>
              <PhoneFrame size="lg">
                <SeniorHomeScreen />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE PRINCIPLES ── */}
      <section style={{padding:'72px 48px',background:'#f5f5f7'}}>
        <p style={{fontSize:11,fontWeight:600,color:'#1975d2',textTransform:'uppercase',letterSpacing:'.1em',textAlign:'center',marginBottom:8}}>Why SmartSaathi</p>
        <h2 style={{fontSize:34,fontWeight:800,letterSpacing:'-.04em',textAlign:'center',marginBottom:10,color:'#1d1d1f',lineHeight:1.06}}>Designed around three principles</h2>
        <p style={{fontSize:17,color:'#6e6e73',textAlign:'center',marginBottom:52,lineHeight:1.47,maxWidth:520,margin:'0 auto 52px',fontWeight:400}}>Every decision starts with one question — does this make elderly care more accessible, safe, and transparent?</p>
        <div className="ap-feature-grid" style={{maxWidth:1000,margin:'0 auto'}}>
          {[
            {bg:'#e8f1fc',fill:'#1975d2',icon:<path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm3.5 5.5l-4 4-2-2L6 11l3.5 3.5 5.5-5.5-1.5-1.5z" fill="#1975d2"/>,name:'Simplicity',desc:'A dashboard that makes sense the first time. Health data, SOS alerts, medication logs — all in one clean view.',tag:'Zero learning curve',tagBg:'#e8f1fc',tagColor:'#1975d2'},
            {bg:'#f5f3ff',icon:<path d="M10 2a6 6 0 00-6 6v2H3a1 1 0 00-1 1v5a1 1 0 001 1h14a1 1 0 001-1v-5a1 1 0 00-1-1h-1V8a6 6 0 00-6-6z" fill="#7c3aed"/>,name:'Privacy',desc:'Only essential data. No advertising. No data selling. Anonymised, encrypted, and always under your control.',tag:'No ads ever',tagBg:'#f5f3ff',tagColor:'#6d28d9'},
            {bg:'#f0fdf4',icon:<path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 5v4l3 1.5-.75 1.5L10 12.5V7h1z" fill="#16a34a"/>,name:'Control',desc:'Customise every notification, threshold, and access level. SmartSaathi adapts to you — not the other way around.',tag:'Your rules',tagBg:'#f0fdf4',tagColor:'#15803d'},
          ].map(f=>(
            <div className="ap-feature-card" key={f.name}>
              <div style={{width:44,height:44,borderRadius:11,background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg viewBox="0 0 20 20" width="22" height="22" fill="none">{f.icon}</svg>
              </div>
              <p style={{fontSize:16,fontWeight:700,color:'#1d1d1f',letterSpacing:'-.02em'}}>{f.name}</p>
              <p style={{fontSize:13,color:'#6e6e73',lineHeight:1.5,fontWeight:400}}>{f.desc}</p>
              <span style={{display:'inline-block',background:f.tagBg,color:f.tagColor,fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:99,border:'.5px solid rgba(0,0,0,.06)'}}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPANION APP CTA ── */}
      <section style={{padding:'72px 48px',background:'#fff'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:52,alignItems:'center',maxWidth:1000,margin:'0 auto'}}>
          <div>
            <p style={{fontSize:11,fontWeight:600,color:'#1975d2',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Companion app</p>
            <h2 style={{fontSize:36,fontWeight:800,letterSpacing:'-.04em',color:'#1d1d1f',marginBottom:14,lineHeight:1.06}}>Get the app for<br/>your loved one</h2>
            <p style={{fontSize:16,color:'#6e6e73',lineHeight:1.55,marginBottom:26,maxWidth:400}}>The SmartSaathi companion app puts independence and safety in the palm of every senior's hand — voice-first, clutter-free, and always accessible.</p>
            <button className="btn-outline-green" style={{marginBottom:10}} onClick={() => navigate('/download')}>Are you an elder person? →</button>
            <p style={{fontSize:12,color:'#aeaeb2',marginBottom:20}}>Redirects to the download page and setup guide</p>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {['AI voice assistant — speak naturally to get help','One-tap SOS with automatic live location sharing','100% ad-free, zero data selling, AES-256 encryption'].map(t=>(
                <div key={t} style={{display:'flex',alignItems:'center',gap:9,fontSize:14,color:'#6e6e73'}}>
                  <div style={{width:20,height:20,borderRadius:'50%',background:'#e8f1fc',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><CheckIcon /></div>{t}
                </div>
              ))}
            </div>
          </div>
          <div style={{animation:'float-slow 6s ease-in-out infinite'}}>
            <PhoneFrame size="lg">
              <SeniorHomeScreen alt />
            </PhoneFrame>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{padding:'72px 48px',background:'#fff'}}>
        <p style={{fontSize:11,fontWeight:600,color:'#1975d2',textTransform:'uppercase',letterSpacing:'.1em',textAlign:'center',marginBottom:8}}>Platform at a glance</p>
        <h2 style={{fontSize:34,fontWeight:800,letterSpacing:'-.04em',textAlign:'center',marginBottom:10,color:'#1d1d1f'}}>Numbers that matter</h2>
        <p style={{fontSize:17,color:'#6e6e73',textAlign:'center',marginBottom:40,lineHeight:1.47,fontWeight:400}}>Real outcomes for real families</p>
        <div className="ap-stats-row" style={{maxWidth:900,margin:'0 auto'}}>
          {[['🆘','2','s','SOS Response','Average alert delivery time'],['👥','200','+','Caregivers','Actively using SmartSaathi'],['📊','98','%','Accuracy','Verified SOS detection rate'],['🌙','24','/7','Monitoring','Always-on coverage']].map(([icon,val,sfx,lbl,desc])=>(
            <div className="ap-stat-item" key={lbl}>
              <div style={{fontSize:32,marginBottom:10}}>{icon}</div>
              <div className="ap-stat-val" style={{fontSize:40,fontWeight:800,color:'#1975d2',letterSpacing:'-.05em',lineHeight:1,marginBottom:4}}>{val}<span style={{fontSize:22,fontWeight:700,color:'#aeaeb2'}}>{sfx}</span></div>
              <p style={{fontSize:14,fontWeight:600,color:'#1d1d1f',marginBottom:3}}>{lbl}</p>
              <p style={{fontSize:12,color:'#aeaeb2',lineHeight:1.4}}>{desc}</p>
            </div>
          ))}
        </div>
        <div className="ap-pill-stats" style={{maxWidth:900,margin:'14px auto 0'}}>
          {[['🚫','0 Ads','Forever ad-free platform'],['🔒','AES-256','Bank-level encryption'],['🎙️','AI Voice','Natural language commands'],['📍','Live GPS','Real-time location sync']].map(([icon,val,lbl])=>(
            <div className="ap-pill-stat" key={lbl}>
              <div className="ap-pill-stat-icon">{icon}</div>
              <div><p style={{fontSize:16,fontWeight:800,color:'#1d1d1f',lineHeight:1,letterSpacing:'-.02em'}}>{val}</p><p style={{fontSize:11,color:'#6e6e73',marginTop:2}}>{lbl}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRIVACY ── */}
      <section style={{padding:'72px 48px',background:'#f5f5f7'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center',maxWidth:1000,margin:'0 auto'}}>
          <div>
            <p style={{fontSize:11,fontWeight:600,color:'#1975d2',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:14}}>Privacy first</p>
            <h2 style={{fontSize:34,fontWeight:800,color:'#1d1d1f',marginBottom:24,letterSpacing:'-.04em',lineHeight:1.06}}>Your family's data,<br/>always yours.</h2>
            {[
              {bg:'#e8f1fc',stroke:'#1975d2',title:'No data selling',desc:'We never sell, rent, or share your data with advertisers or third parties — ever.'},
              {bg:'#f0fdf4',stroke:'#16a34a',title:'Essential data only',desc:'Minimal collection — only what\'s strictly necessary to operate SmartSaathi.'},
              {bg:'#fef2f2',stroke:'#dc2626',title:'Zero advertising',desc:'No ads in SmartSaathi products. Your attention is not for sale.'},
            ].map(p=>(
              <div key={p.title} style={{display:'flex',gap:14,padding:'18px 0',borderBottom:'.5px solid rgba(0,0,0,.08)'}}>
                <div style={{width:40,height:40,borderRadius:10,background:p.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke={p.stroke} strokeWidth="1.6" strokeLinecap="round"><path d="M10 2a6 6 0 00-6 6v2H3a1 1 0 00-1 1v5a1 1 0 001 1h14a1 1 0 001-1v-5a1 1 0 00-1-1h-1V8a6 6 0 00-6-6z"/></svg>
                </div>
                <div>
                  <p style={{fontSize:15,fontWeight:700,color:'#1d1d1f',marginBottom:3,letterSpacing:'-.01em'}}>{p.title}</p>
                  <p style={{fontSize:13,color:'#6e6e73',lineHeight:1.5}}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>
            <img src={dashboardSvg} alt="Dashboard" style={{width:240,height:'auto',objectFit:'contain',animation:'float 7s ease-in-out 1s infinite'}} />
            <div style={{position:'absolute',bottom:20,right:0,background:'#fff',borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:8,boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)'}}>
              <span style={{fontSize:20}}>🔒</span>
              <div><p style={{fontSize:12,fontWeight:700,color:'#1d1d1f'}}>Bank-level security</p><p style={{fontSize:10,color:'#aeaeb2'}}>AES-256 encrypted</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-blue-section">
        <h2 style={{fontSize:36,fontWeight:800,color:'#fff',letterSpacing:'-.04em',marginBottom:12,position:'relative'}}>Start caring smarter today.</h2>
        <p style={{fontSize:17,color:'rgba(255,255,255,.75)',marginBottom:32,lineHeight:1.47,position:'relative'}}>Join 200+ caregivers across India who trust SmartSaathi.</p>
        <button className="btn-white-pill" onClick={() => navigate('/signup')}>
          Get started free
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#1975d2" strokeWidth="2.2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{background:'#fff',borderTop:'.5px solid rgba(0,0,0,.08)',padding:'20px 48px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:24,height:24,borderRadius:6,background:'#1975d2',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg viewBox="0 0 36 36" width="14" height="14" fill="none"><circle cx="11" cy="11" r="5.5" fill="white" opacity=".95"/></svg>
          </div>
          <span style={{fontSize:13,fontWeight:700,color:'#1d1d1f',letterSpacing:'-.02em'}}>Smart<span style={{color:'#1975d2'}}>Saathi</span></span>
        </div>
        <span style={{fontSize:11,color:'#aeaeb2'}}>© 2026 SmartSaathi. Built for elderly care.</span>
        <div style={{display:'flex',gap:16}}>
          {['Abstract','Features','Contact'].map(l=>(
            <span key={l} style={{fontSize:11,color:'#aeaeb2',cursor:'pointer'}} onClick={() => navigate('/'+l.toLowerCase())}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Home;
