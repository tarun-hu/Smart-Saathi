import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import PhoneFrame from "../../components/PhoneFrame";
import LoginScreen from "../../components/screens/LoginScreen";
import SignupScreen from "../../components/screens/SignupScreen";
import LogoutScreen from "../../components/screens/LogoutScreen";

const AuthLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(pathname === '/signup' ? 'signup' : 'login');
  const [code, setCode] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div>
      <NavBar />
      <div style={{minHeight:'calc(100vh - 52px)',background:'#f5f5f7',display:'flex',alignItems:'center',justifyContent:'center',padding:48,gap:44,flexWrap:'wrap'}}>

        {/* Web auth card */}
        <div style={{background:'#fff',borderRadius:22,padding:36,width:'100%',maxWidth:440,boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:26}}>
            <div style={{width:32,height:32,borderRadius:8,background:'#1975d2',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg viewBox="0 0 36 36" width="18" height="18" fill="none">
                <circle cx="11" cy="11" r="5.5" fill="white" opacity=".95"/>
                <path d="M2 28c0-5 4-8.5 9-8.5s9 3.5 9 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="26" cy="11" r="4.5" fill="white" opacity=".65"/>
                <path d="M17 28c0-4 3-7 9-7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{fontSize:18,fontWeight:700,color:'#1d1d1f',letterSpacing:'-.02em'}}>Smart<span style={{color:'#1975d2'}}>Saathi</span></span>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',background:'#f5f5f7',borderRadius:12,padding:4,marginBottom:26}}>
            {['login','signup'].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setShowPreview(false);navigate('/'+t);}} style={{flex:1,padding:8,fontSize:14,fontWeight:600,border:'none',borderRadius:9,cursor:'pointer',letterSpacing:'-.01em',transition:'all .18s',background: tab===t?'#fff':'transparent',color: tab===t?'#1975d2':'#aeaeb2',boxShadow: tab===t?'0 2px 8px rgba(0,0,0,.08)':'none'}}>
                {t==='login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {tab==='login' ? (
            <>
              <h2 style={{fontSize:22,fontWeight:800,color:'#1d1d1f',marginBottom:4,letterSpacing:'-.03em'}}>Welcome back</h2>
              <p style={{fontSize:13,color:'#6e6e73',marginBottom:22,lineHeight:1.5}}>Enter your unique caretaker access code to log in and view your dashboard.</p>
              <input className="auth-pill-input" type="text" placeholder="Access code (e.g. CS-4827-X)" value={code} onChange={e=>setCode(e.target.value)} style={{letterSpacing:'.06em',fontWeight:600}}/>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',borderRadius:99}} onClick={()=>{if(!code.trim()){alert('Please enter your access code.');return;}setShowPreview(true);}}>Access Dashboard →</button>
              <p style={{fontSize:11,color:'#aeaeb2',marginTop:8,textAlign:'center',lineHeight:1.5}}>Your access code was sent during onboarding. Contact support if lost.</p>
              {showPreview && (
                <div style={{marginTop:16}}>
                  <div style={{textAlign:'center',fontSize:11,color:'#aeaeb2',margin:'16px 0 10px',borderTop:'.5px solid rgba(0,0,0,.08)',paddingTop:14}}>Showing limited preview</div>
                  <div style={{background:'#f5f5f7',borderRadius:14,padding:16}}>
                    <p style={{fontSize:12,fontWeight:700,color:'#1d1d1f',marginBottom:10}}>📋 Recent activity</p>
                    {[['#ff3b30','🆘 SOS alert from Ramesh — 2 mins ago'],['#ff9f0a','💊 Multivitamin missed — 12:00 PM']].map(([c,t])=>(
                      <div key={t} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'.5px solid rgba(0,0,0,.08)'}}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:c,flexShrink:0}}/><p style={{fontSize:12,color:'#6e6e73',flex:1}}>{t}</p>
                      </div>
                    ))}
                    {['Blood pressure report: 133/86 mm Hg ████████','Mood score: ██/100 — Morning check-in'].map(t=>(
                      <div key={t} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'.5px solid rgba(0,0,0,.08)'}}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:'#aeaeb2',flexShrink:0}}/><p style={{fontSize:12,color:'#6e6e73',flex:1,filter:'blur(3px)',userSelect:'none'}}>{t}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{fontSize:11,color:'#aeaeb2',textAlign:'center',marginTop:8}}>Full details locked — open the app</p>
                  <button style={{width:'100%',padding:11,fontSize:14,fontWeight:700,border:'none',borderRadius:99,background:'linear-gradient(135deg,#16a34a,#15803d)',color:'#fff',cursor:'pointer',boxShadow:'0 3px 12px rgba(22,163,74,.28)',marginTop:14}}>📱 Open in App</button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 style={{fontSize:22,fontWeight:800,color:'#1d1d1f',marginBottom:4,letterSpacing:'-.03em'}}>Create your account</h2>
              <p style={{fontSize:13,color:'#6e6e73',marginBottom:22,lineHeight:1.5}}>Join SmartSaathi as a caregiver. Your details are securely stored in Supabase with AES-256 encryption.</p>
              {['Full name','Email address','Phone number','Create a password'].map((placeholder,i)=>(
                <input key={i} className="auth-pill-input left" type={i===3?'password':i===1?'email':'text'} placeholder={placeholder}/>
              ))}
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',borderRadius:99}}>Create account</button>
              <p style={{fontSize:11,color:'#aeaeb2',marginTop:10,textAlign:'center',lineHeight:1.5}}>By signing up you agree to our <span style={{color:'#1975d2',cursor:'pointer'}}>Terms & Conditions</span>. Data encrypted with AES-256.</p>
            </>
          )}
        </div>

        {/* Phone previews */}
        <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <p style={{fontSize:11,fontWeight:500,color:'#aeaeb2',letterSpacing:'.02em'}}>Login screen</p>
            <PhoneFrame size="sm"><LoginScreen showPreview={tab==='login'&&showPreview}/></PhoneFrame>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <p style={{fontSize:11,fontWeight:500,color:'#aeaeb2',letterSpacing:'.02em'}}>Sign up screen</p>
            <PhoneFrame size="sm"><SignupScreen /></PhoneFrame>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <p style={{fontSize:11,fontWeight:500,color:'#aeaeb2',letterSpacing:'.02em'}}>Profile screen</p>
            <PhoneFrame size="sm"><LogoutScreen /></PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
