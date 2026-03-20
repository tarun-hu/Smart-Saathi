import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import PhoneFrame from "../components/PhoneFrame";
import CaretakerScreen from "../components/screens/CaretakerScreen";

const Abstract = () => {
  const navigate = useNavigate();
  return (
    <div>
      <NavBar />
      <div style={{background:'#fff',padding:'60px 48px 48px',borderBottom:'.5px solid rgba(0,0,0,.08)',textAlign:'center'}}>
        <span style={{display:'inline-block',background:'#e8f1fc',color:'#1975d2',fontSize:11,fontWeight:600,padding:'4px 13px',borderRadius:99,marginBottom:14}}>Academic Synopsis</span>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:'-.04em',color:'#1d1d1f',marginBottom:10,lineHeight:1.06}}>Abstract</h1>
        <p style={{fontSize:17,color:'#6e6e73',maxWidth:540,margin:'0 auto',lineHeight:1.47,fontWeight:400}}>A concise overview of SmartSaathi — the problem it addresses, the solution it delivers, and the technology that powers it.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:52,padding:'60px 48px',background:'#f5f5f7',alignItems:'flex-start',maxWidth:1200,margin:'0 auto'}}>
        <div>
          {/* Abstract */}
          <div style={{background:'#fff',borderRadius:18,padding:24,marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)'}}>
            <p style={{fontSize:10,fontWeight:600,color:'#1975d2',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6}}>Abstract</p>
            <p style={{fontSize:17,fontWeight:700,color:'#1d1d1f',marginBottom:10,letterSpacing:'-.02em'}}>SmartSaathi — An AI-powered elderly care companion</p>
            <p style={{fontSize:13,color:'#6e6e73',lineHeight:1.6,marginBottom:10}}>The elderly population worldwide faces increasing challenges as life expectancy rises and more seniors live independently. Age-related issues such as memory decline, physical frailty, chronic illnesses, and isolation heighten the risk of health incidents. SmartSaathi was developed to address these concerns by combining artificial intelligence, speech recognition, and healthcare IoT into a user-friendly platform.</p>
            <p style={{fontSize:13,color:'#6e6e73',lineHeight:1.6,marginBottom:12}}>Unlike conventional health applications that rely on complex touch interfaces and small text — often inaccessible to seniors — SmartSaathi emphasises simplicity through natural voice interaction. By capturing voice commands and health data, the system generates a real-time picture of an individual's well-being, enabling caregivers to monitor medication adherence, respond to SOS alerts, and plan medical appointments.</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {['Elderly Care','Voice Assistant','Artificial Intelligence','Emergency Response','Healthcare IoT'].map(k=>(
                <span key={k} style={{display:'inline-block',background:'#e8f1fc',color:'#1975d2',fontSize:11,fontWeight:600,padding:'4px 11px',borderRadius:99,border:'.5px solid #bfdbfe'}}>{k}</span>
              ))}
            </div>
          </div>

          {/* Problem / Solution */}
          <div style={{background:'#fff',borderRadius:18,padding:24,marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)'}}>
            <p style={{fontSize:10,fontWeight:600,color:'#1975d2',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6}}>Problem Statement</p>
            <p style={{fontSize:17,fontWeight:700,color:'#1d1d1f',marginBottom:10,letterSpacing:'-.02em'}}>Why existing solutions fall short</p>
            <p style={{fontSize:13,color:'#6e6e73',lineHeight:1.6,marginBottom:14}}>Elderly individuals who live independently encounter missed medications, inadequate hydration, lack of routine health monitoring, and delayed access to help during emergencies. Most digital health solutions are not designed with seniors in mind — relying on complex interfaces, small text, and manual navigation that are unsuitable for users with limited digital literacy or physical constraints.</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {c:'#ff3b30',l:'❌ Generic voice assistants',d:'No healthcare-specific features, no caregiver dashboards, no emergency SOS'},
                {c:'#ff3b30',l:'❌ Medical alert necklaces',d:'Hardware-dependent, stigmatising, often resisted by seniors'},
                {c:'#1975d2',l:'✓ SmartSaathi',d:'Voice-first, no proprietary hardware, seamless caregiver dashboard integration'},
                {c:'#1975d2',l:'✓ Holistic ecosystem',d:'Medication, SOS, location, and caregiver connectivity in one unified platform'},
              ].map(({c,l,d})=>(
                <div key={l} style={{background: c==='#ff3b30'?'#f5f5f7':'#e8f1fc',borderRadius:10,padding:12,border: c==='#1975d2'?'.5px solid #bfdbfe':'none'}}>
                  <p style={{fontSize:11,fontWeight:700,color:c,marginBottom:4}}>{l}</p>
                  <p style={{fontSize:11,color:'#6e6e73'}}>{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div style={{background:'#fff',borderRadius:18,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,.04),0 12px 28px rgba(0,0,0,.06)'}}>
            <p style={{fontSize:10,fontWeight:600,color:'#1975d2',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6}}>Technology Stack</p>
            <p style={{fontSize:17,fontWeight:700,color:'#1d1d1f',marginBottom:14,letterSpacing:'-.02em'}}>Built with modern, proven tools</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
              {[['📱','Flutter','Cross-platform mobile (Android/iOS)'],['⚛️','React.js','Real-time caregiver dashboard'],['🟢','Node.js','Event-driven backend & APIs'],['🍃','Supabase','Database, auth & realtime'],['🎙️','Google STT/TTS','Voice AI — Speech & synthesis'],['🧠','NLP Intent','Command recognition & classification']].map(([icon,name,desc])=>(
                <div key={name} style={{textAlign:'center',background:'#f5f5f7',borderRadius:12,padding:14}}>
                  <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
                  <p style={{fontSize:12,fontWeight:700,color:'#1d1d1f'}}>{name}</p>
                  <p style={{fontSize:11,color:'#6e6e73',marginTop:2}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky caretaker phone */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,position:'sticky',top:20,animation:'float-slow 6s ease-in-out infinite'}}>
          <p style={{fontSize:11,fontWeight:600,color:'#aeaeb2',letterSpacing:'.04em',textTransform:'uppercase'}}>Caretaker Dashboard</p>
          <PhoneFrame size="lg"><CaretakerScreen /></PhoneFrame>
        </div>
      </div>

      <footer style={{background:'#fff',borderTop:'.5px solid rgba(0,0,0,.08)',padding:'20px 48px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:13,fontWeight:700,color:'#1d1d1f',letterSpacing:'-.02em'}}>Smart<span style={{color:'#1975d2'}}>Saathi</span></span>
        <span style={{fontSize:11,color:'#aeaeb2'}}>K.R Mangalam University · Projexa Team 26E2011-VST · January 2026</span>
        <div style={{display:'flex',gap:16}}>{['Abstract','Features','Contact'].map(l=><span key={l} style={{fontSize:11,color:'#aeaeb2',cursor:'pointer'}} onClick={()=>navigate('/'+l.toLowerCase())}>{l}</span>)}</div>
      </footer>
    </div>
  );
};
export default Abstract;
