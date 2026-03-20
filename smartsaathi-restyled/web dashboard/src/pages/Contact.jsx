import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const faqs = [
  {q:'Is my data being sold?',a:'No. SmartSaathi only collects essential data. Nothing is ever sold, rented, or shared with advertisers or third parties. All data is anonymised and encrypted with AES-256.'},
  {q:'How does the pairing process work?',a:'From the caregiver dashboard, generate a pairing code. Open the SmartSaathi app on the senior\'s phone and enter the code. The connection is encrypted and the code expires after 5 minutes for security.'},
  {q:'Can I manage multiple seniors?',a:'Yes. Use the senior selector at the top of the caregiver dashboard to switch between all paired seniors. There is no limit on the number of seniors per account.'},
  {q:'How does the SOS alert work?',a:'The senior either presses the SOS button or speaks a distress phrase like "Help, I have fallen." SmartSaathi\'s NLP engine classifies this as EMERGENCY_SOS, fetches GPS coordinates, and sends an immediate push notification to all caregivers — all in under 2 seconds.'},
  {q:'What platforms are supported?',a:'The SmartSaathi companion app runs on iOS 14+ and Android 8+, built with Flutter. The caregiver dashboard is a React.js web app accessible on any modern browser.'},
];

const Contact = () => {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div>
      <NavBar />
      <div style={{background:'#fff',padding:'60px 48px 48px',borderBottom:'.5px solid rgba(0,0,0,.08)',textAlign:'center'}}>
        <span style={{display:'inline-block',background:'#e8f1fc',color:'#1975d2',fontSize:11,fontWeight:600,padding:'4px 13px',borderRadius:99,marginBottom:14}}>Get in touch</span>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:'-.04em',color:'#1d1d1f',marginBottom:10}}>Contact & Support</h1>
        <p style={{fontSize:17,color:'#6e6e73',lineHeight:1.47}}>Report a bug, ask a question, or just say hello.</p>
      </div>
      <div style={{background:'#e8f1fc',borderBottom:'.5px solid #bfdbfe',padding:'10px 48px',display:'flex',gap:10,justifyContent:'center'}}>
        <button style={{background:'#1975d2',color:'#fff',fontSize:12,fontWeight:600,padding:'7px 18px',borderRadius:99,border:'none',cursor:'pointer',boxShadow:'0 2px 8px rgba(25,117,210,.24)'}}>💬 Chat on WhatsApp</button>
        <button style={{background:'transparent',border:'1.5px solid #1975d2',color:'#1975d2',fontSize:12,fontWeight:500,padding:'7px 16px',borderRadius:99,cursor:'pointer'}}>📞 +91 86186 76526</button>
      </div>
      <div style={{padding:'40px 48px',background:'#f5f5f7',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{background:'#fff',borderRadius:20,padding:28,width:'100%',maxWidth:620,boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)',marginBottom:28}}>
          <h2 style={{fontSize:20,fontWeight:700,color:'#1d1d1f',marginBottom:4,letterSpacing:'-.02em'}}>Report a bug</h2>
          <p style={{fontSize:13,color:'#6e6e73',marginBottom:20}}>Help us improve SmartSaathi by describing your issue in detail.</p>
          <label style={{fontSize:12,fontWeight:500,color:'#6e6e73',display:'block',marginBottom:5}}>Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com"/>
          <label style={{fontSize:12,fontWeight:500,color:'#6e6e73',display:'block',marginBottom:5}}>Issue type</label>
          <select className="form-select"><option>Select issue type</option><option>iOS App</option><option>Android App</option><option>Web Dashboard</option><option>Other</option></select>
          <label style={{fontSize:12,fontWeight:500,color:'#6e6e73',display:'block',marginBottom:5}}>Issue title</label>
          <input className="form-input" type="text" placeholder="Short description of the issue"/>
          <label style={{fontSize:12,fontWeight:500,color:'#6e6e73',display:'block',marginBottom:5}}>Describe your issue</label>
          <input className="form-input" type="text" placeholder="What happened? What did you expect?"/>
          <div style={{display:'flex',gap:9,marginTop:5}}>
            <button style={{padding:'9px 16px',fontSize:13,fontWeight:500,background:'transparent',border:'.5px solid #d1d1d6',borderRadius:99,color:'#6e6e73',cursor:'pointer'}}>Cancel</button>
            <button style={{flex:1,padding:9,fontSize:13,fontWeight:600,border:'none',borderRadius:99,background:'#1975d2',color:'#fff',cursor:'pointer',boxShadow:'0 3px 10px rgba(25,117,210,.28)'}}>Submit report</button>
          </div>
        </div>

        <div style={{width:'100%',maxWidth:620}}>
          <h3 style={{fontSize:22,fontWeight:700,color:'#1d1d1f',marginBottom:16,letterSpacing:'-.03em'}}>Frequently asked</h3>
          {faqs.map((f,i)=>(
            <div key={i} className={`faq-item${openIdx===i?' open':''}`} onClick={()=>setOpenIdx(openIdx===i?null:i)}>
              <div style={{fontSize:14,fontWeight:600,color:'#1d1d1f',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                {f.q}
                <span style={{fontSize:16,color:'#1975d2',transform: openIdx===i?'rotate(270deg)':'rotate(90deg)',transition:'transform .15s',display:'inline-block'}}>›</span>
              </div>
              {openIdx===i && <p style={{fontSize:13,color:'#6e6e73',marginTop:8,lineHeight:1.6}}>{f.a}</p>}
            </div>
          ))}
          <div style={{background:'#e8f1fc',borderRadius:14,padding:18,marginTop:20,border:'.5px solid #bfdbfe'}}>
            <p style={{fontSize:12,fontWeight:700,color:'#1975d2',marginBottom:12,textTransform:'uppercase',letterSpacing:'.06em'}}>Key features quick reference</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {['🆘 One-tap SOS alert (<2s)','🎙️ AI voice assistant + NLP','📍 Live GPS location tracking','💊 TTS medication reminders','📊 Real-time caregiver dashboard','🧩 Daily cognitive exercises'].map(t=>(
                <p key={t} style={{fontSize:13,color:'#6e6e73',display:'flex',alignItems:'center',gap:6}}>{t}</p>
              ))}
            </div>
            <button onClick={()=>navigate('/features')} style={{marginTop:14,background:'#1975d2',color:'#fff',fontSize:12,fontWeight:600,padding:'8px 18px',borderRadius:99,border:'none',cursor:'pointer',display:'block',marginLeft:'auto',marginRight:'auto'}}>View all features →</button>
          </div>
        </div>
      </div>
      <footer style={{background:'#fff',borderTop:'.5px solid rgba(0,0,0,.08)',padding:'20px 48px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:13,fontWeight:700,color:'#1d1d1f'}}>Smart<span style={{color:'#1975d2'}}>Saathi</span></span>
        <span style={{fontSize:11,color:'#aeaeb2'}}>© 2026 SmartSaathi.</span>
        <div style={{display:'flex',gap:16}}>{['Abstract','Features','Contact'].map(l=><span key={l} style={{fontSize:11,color:'#aeaeb2',cursor:'pointer'}} onClick={()=>navigate('/'+l.toLowerCase())}>{l}</span>)}</div>
      </footer>
    </div>
  );
};
export default Contact;
