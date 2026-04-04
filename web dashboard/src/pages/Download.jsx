import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import PhoneFrame from "../components/PhoneFrame";
import SeniorHomeScreen from "../components/screens/SeniorHomeScreen";
import LoginScreen from "../components/screens/LoginScreen";
import SignupScreen from "../components/screens/SignupScreen";

const Download = () => {
  const navigate = useNavigate();
  return (
    <div>
      <NavBar />
      <div style={{background:'#fff',padding:'60px 48px 48px',borderBottom:'.5px solid rgba(0,0,0,.08)',textAlign:'center'}}>
        <span style={{display:'inline-block',background:'#e8f1fc',color:'#1975d2',fontSize:11,fontWeight:600,padding:'4px 13px',borderRadius:99,marginBottom:14}}>For elderly users</span>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:'-.04em',color:'#1d1d1f',marginBottom:10,lineHeight:1.06}}>Get the Smart Saathi app</h1>
        <p style={{fontSize:17,color:'#6e6e73',lineHeight:1.47,maxWidth:480,margin:'0 auto'}}>Designed for simplicity. Big buttons, voice commands, no complicated steps — just the care you need, exactly when you need it.</p>
      </div>

      <div style={{padding:'52px 48px',background:'#f5f5f7'}}>
        {/* OS cards */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,maxWidth:500,margin:'0 auto 52px'}}>
          {[['🍎','iPhone (iOS)','iOS 14 or later required'],['🤖','Android','Android 8.0 or later']].map(([icon,name,sub])=>(
            <div key={name} style={{background:'#fff',borderRadius:20,padding:28,textAlign:'center',cursor:'pointer',transition:'all .2s',boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)'}}>
              <span style={{fontSize:36,display:'block',marginBottom:12}}>{icon}</span>
              <p style={{fontSize:16,fontWeight:700,color:'#1d1d1f',marginBottom:4,letterSpacing:'-.01em'}}>{name}</p>
              <p style={{fontSize:12,color:'#aeaeb2',marginBottom:14}}>{sub}</p>
              <button style={{background:'#1975d2',color:'#fff',fontSize:13,fontWeight:600,padding:'8px 20px',borderRadius:99,border:'none',cursor:'pointer',boxShadow:'0 3px 10px rgba(25,117,210,.24)'}}>Download</button>
            </div>
          ))}
        </div>

        {/* GUIDE — 3 visual steps with phones */}
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <h2 style={{fontSize:26,fontWeight:800,color:'#1d1d1f',marginBottom:36,textAlign:'center',letterSpacing:'-.03em'}}>Get started in 3 simple steps</h2>

          {/* Step 1 */}
          <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:40,alignItems:'center',background:'#fff',borderRadius:22,padding:36,marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)'}}>
            <div>
              <div style={{width:44,height:44,borderRadius:'50%',background:'#1975d2',color:'#fff',fontSize:18,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>1</div>
              <h3 style={{fontSize:22,fontWeight:800,color:'#1d1d1f',marginBottom:8,letterSpacing:'-.03em'}}>Log in to the app</h3>
              <p style={{fontSize:15,color:'#6e6e73',lineHeight:1.6,marginBottom:14}}>If a family member has already set up your account, tap "Log In". Enter the access code they provided — you'll be taken directly to your personalised home screen.</p>
              {['A family member generates your access code from their dashboard','Enter the code in the app — it looks like CS-4827-X','You\'ll see your greeting, health stats, and the big TAP TO TALK button'].map(t=>(
                <div key={t} style={{display:'flex',alignItems:'flex-start',gap:9,fontSize:13,color:'#6e6e73',marginBottom:6}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:'#1975d2',flexShrink:0,marginTop:5}}/>
                  {t}
                </div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flexShrink:0}}>
              <p style={{fontSize:10,fontWeight:600,color:'#aeaeb2',letterSpacing:'.04em',textTransform:'uppercase'}}>Step 1 — Login</p>
              <PhoneFrame size="sm"><LoginScreen /></PhoneFrame>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:40,alignItems:'center',background:'#f5f5f7',borderRadius:22,padding:36,marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flexShrink:0}}>
              <p style={{fontSize:10,fontWeight:600,color:'#aeaeb2',letterSpacing:'.04em',textTransform:'uppercase'}}>Step 2 — Sign up</p>
              <PhoneFrame size="sm"><SignupScreen /></PhoneFrame>
            </div>
            <div>
              <div style={{width:44,height:44,borderRadius:'50%',background:'#30d158',color:'#fff',fontSize:18,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>2</div>
              <h3 style={{fontSize:22,fontWeight:800,color:'#1d1d1f',marginBottom:8,letterSpacing:'-.03em'}}>Sign up if you're new</h3>
              <p style={{fontSize:15,color:'#6e6e73',lineHeight:1.6,marginBottom:14}}>First time? Tap "Sign Up", enter your name and phone number, and create a password. A family member receives a pairing request — once they approve, you're connected and ready to go.</p>
              {['Enter your name, phone, and a secure password','A family member receives a pairing request to approve','Once approved, you\'re securely connected — setup complete'].map(t=>(
                <div key={t} style={{display:'flex',alignItems:'flex-start',gap:9,fontSize:13,color:'#6e6e73',marginBottom:6}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:'#30d158',flexShrink:0,marginTop:5}}/>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:40,alignItems:'center',background:'#fff',borderRadius:22,padding:36,marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)'}}>
            <div>
              <div style={{width:44,height:44,borderRadius:'50%',background:'#bf5af2',color:'#fff',fontSize:18,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>3</div>
              <h3 style={{fontSize:22,fontWeight:800,color:'#1d1d1f',marginBottom:8,letterSpacing:'-.03em'}}>Using the app every day</h3>
              <p style={{fontSize:15,color:'#6e6e73',lineHeight:1.6,marginBottom:14}}>You'll see your home screen with a big TAP TO TALK microphone button. Just tap it and speak naturally — Smart Saathi understands and handles the rest.</p>
              {['Tap the big microphone button and speak naturally','Use tiles: My Day, Medicines, Brain Game, Family','Press SOS anytime — your trusted contacts are alerted instantly'].map(t=>(
                <div key={t} style={{display:'flex',alignItems:'flex-start',gap:9,fontSize:13,color:'#6e6e73',marginBottom:6}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:'#bf5af2',flexShrink:0,marginTop:5}}/>
                  {t}
                </div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flexShrink:0}}>
              <p style={{fontSize:10,fontWeight:600,color:'#aeaeb2',letterSpacing:'.04em',textTransform:'uppercase'}}>Step 3 — Daily use</p>
              <PhoneFrame size="sm"><SeniorHomeScreen /></PhoneFrame>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{background:'#1975d2',borderRadius:20,padding:40,marginTop:14,maxWidth:900,margin:'14px auto 0'}}>
          <h3 style={{fontSize:22,fontWeight:800,color:'#fff',textAlign:'center',marginBottom:28,letterSpacing:'-.03em'}}>Trusted by families across India</h3>
          <div className="dl-stats-grid">
            {[['200+','Seniors using app'],['4.9★','Average rating'],['1-tap','SOS access'],['Free','No subscription']].map(([v,l])=>(
              <div key={l} className="dl-stat-item">
                <p style={{fontSize:28,fontWeight:800,color:'#fff',letterSpacing:'-.04em',lineHeight:1,marginBottom:3}}>{v}</p>
                <p style={{fontSize:11,color:'rgba(255,255,255,.6)'}}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{textAlign:'center',padding:'24px 0 6px'}}>
          <p style={{fontSize:13,color:'#aeaeb2'}}>Want to support a family member? <button onClick={()=>navigate('/signup')} style={{background:'none',border:'none',color:'#1975d2',fontSize:13,fontWeight:700,cursor:'pointer'}}>Sign up here →</button></p>
        </div>
      </div>

      <footer style={{background:'#fff',borderTop:'.5px solid rgba(0,0,0,.08)',padding:'20px 48px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:13,fontWeight:700,color:'#1d1d1f'}}>Smart<span style={{color:'#1975d2'}}>Saathi</span></span>
        <span style={{fontSize:11,color:'#aeaeb2'}}>© 2026 Smart Saathi.</span>
        <div style={{display:'flex',gap:16}}>{['Abstract','Features','Contact'].map(l=><span key={l} style={{fontSize:11,color:'#aeaeb2',cursor:'pointer'}} onClick={()=>navigate('/'+l.toLowerCase())}>{l}</span>)}</div>
      </footer>
    </div>
  );
};
export default Download;
