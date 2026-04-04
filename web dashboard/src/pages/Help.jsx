import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import PhoneFrame from "../components/PhoneFrame";
import SeniorHomeScreen from "../components/screens/SeniorHomeScreen";
import FamilyDashboardScreen from "../components/screens/FamilyDashboardScreen";

const Features = () => {
  const navigate = useNavigate();
  const seniorFeats = [
    {n:1,title:'🆘 One-tap SOS',desc:'A single button press triggers an alert to selected family members with location and status details, so help can be summoned without delay.',tag:'Real-time · <2s delivery'},
    {n:2,title:'🎙️ AI Voice Assistant',desc:'Powered by Google Speech-to-Text and NLP intent classification. Seniors speak naturally — "Call my daughter", "When\'s my next medicine?" — and the AI processes the intent with no typing required. Supports EMERGENCY_SOS, LOG_MEDICATION, and GENERAL_QUERY intents.',tag:'Voice-first · AI-powered'},
    {n:3,title:'💊 Medication Reminders',desc:'TTS-powered voice reminders notify users at the exact scheduled time without requiring menu navigation. Missed doses are logged and family members are notified so support can arrive as needed.',tag:'Missed dose alerts'},
    {n:4,title:'🧩 Cognitive Exercises',desc:'Daily brain exercises — memory recall, pattern recognition, verbal fluency — with scoring and trend tracking. Scores are saved in the family dashboard as helpful insights over time.',tag:'Brain health · Daily'},
  ];
  const careFeats = [
    {n:5,title:'📊 Real-time Dashboard',desc:'A React.js dashboard providing real-time insights: medication adherence, GPS location, vitals, mood trends, hydration, and brain exercise scores. Built with Supabase real-time subscriptions — no page refresh needed.',tag:'Supabase Realtime'},
    {n:6,title:'📍 Live Location Tracking',desc:'Family members can view the senior\'s location on a live map. Geofence alerts trigger notifications when the senior leaves a familiar area, and location is shared automatically during SOS events.',tag:'GPS · Geofencing'},
    {n:7,title:'🔗 Secure Pairing',desc:'An encrypted 8-character pairing code generated from the dashboard. Expires after 5 minutes for security. The senior enters the code in the app to establish an encrypted, verified connection.',tag:'Encrypted · Expiring'},
    {n:8,title:'⚠️ Anomaly Detection',desc:'AI flags deviations from the senior\'s established routine — unusually sedentary periods, missed check-ins, irregular vitals — as anomalies surfaced prominently in the dashboard for family review.',tag:'AI-powered · Routine-based'},
  ];
  const NumBox = ({n,bg='#e8f1fc',c='#1975d2'}) => (
    <div style={{width:36,height:36,borderRadius:'50%',background:bg,color:c,fontSize:13,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{n}</div>
  );
  return (
    <div>
      <NavBar />
      <div style={{background:'#fff',padding:'60px 48px 48px',borderBottom:'.5px solid rgba(0,0,0,.08)',textAlign:'center'}}>
        <span style={{display:'inline-block',background:'#e8f1fc',color:'#1975d2',fontSize:11,fontWeight:600,padding:'4px 13px',borderRadius:99,marginBottom:14}}>Features</span>
        <h1 style={{fontSize:40,fontWeight:800,letterSpacing:'-.04em',color:'#1d1d1f',marginBottom:10,lineHeight:1.06}}>Everything Smart Saathi can do</h1>
        <p style={{fontSize:17,color:'#6e6e73',maxWidth:580,margin:'0 auto',lineHeight:1.47,fontWeight:400}}>Eight core capabilities designed around the real needs of elderly users and their families, distilled from research and the Smart Saathi project objectives.</p>
      </div>

      {/* Senior features + phone */}
      <section style={{padding:'72px 48px',background:'#fff'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:48,alignItems:'center',maxWidth:1100,margin:'0 auto'}}>
          <div>
            <p style={{fontSize:12,fontWeight:600,color:'#1975d2',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:20}}>Senior-facing features</p>
            <div style={{display:'flex',flexDirection:'column',gap:22}}>
              {seniorFeats.map(f=>(
                <div key={f.n} style={{display:'flex',gap:14}}>
                  <NumBox n={f.n}/>
                  <div>
                    <p style={{fontSize:16,fontWeight:700,color:'#1d1d1f',marginBottom:4,letterSpacing:'-.01em'}}>{f.title}</p>
                    <p style={{fontSize:13,color:'#6e6e73',lineHeight:1.6,marginBottom:6}}>{f.desc}</p>
                    <span style={{display:'inline-block',background:'#e8f1fc',color:'#1975d2',fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:99,border:'.5px solid rgba(25,117,210,.2)'}}>{f.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,animation:'float 5.5s ease-in-out infinite'}}>
            <p style={{fontSize:11,fontWeight:600,color:'#aeaeb2',letterSpacing:'.04em',textTransform:'uppercase'}}>Senior App</p>
            <PhoneFrame size="lg"><SeniorHomeScreen /></PhoneFrame>
          </div>
        </div>
      </section>

      {/* Family features + phone */}
      <section style={{padding:'72px 48px',background:'#f5f5f7'}}>
        <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:48,alignItems:'center',maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,animation:'float 6s ease-in-out infinite'}}>
            <p style={{fontSize:11,fontWeight:600,color:'#aeaeb2',letterSpacing:'.04em',textTransform:'uppercase'}}>Family Dashboard</p>
            <PhoneFrame size="lg"><FamilyDashboardScreen /></PhoneFrame>
          </div>
          <div>
            <p style={{fontSize:12,fontWeight:600,color:'#1975d2',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:20}}>Family features</p>
            <div style={{display:'flex',flexDirection:'column',gap:22}}>
              {careFeats.map(f=>(
                <div key={f.n} style={{display:'flex',gap:14}}>
                  <NumBox n={f.n}/>
                  <div>
                    <p style={{fontSize:16,fontWeight:700,color:'#1d1d1f',marginBottom:4,letterSpacing:'-.01em'}}>{f.title}</p>
                    <p style={{fontSize:13,color:'#6e6e73',lineHeight:1.6,marginBottom:6}}>{f.desc}</p>
                    <span style={{display:'inline-block',background:'#e8f1fc',color:'#1975d2',fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:99,border:'.5px solid rgba(25,117,210,.2)'}}>{f.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer style={{background:'#fff',borderTop:'.5px solid rgba(0,0,0,.08)',padding:'20px 48px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:13,fontWeight:700,color:'#1d1d1f'}}>Smart<span style={{color:'#1975d2'}}>Saathi</span></span>
        <span style={{fontSize:11,color:'#aeaeb2'}}>© 2026 Smart Saathi.</span>
        <div style={{display:'flex',gap:16}}>{['Abstract','Features','Contact'].map(l=><span key={l} style={{fontSize:11,color:'#aeaeb2',cursor:'pointer'}} onClick={()=>navigate('/'+l.toLowerCase())}>{l}</span>)}</div>
      </footer>
    </div>
  );
};
export default Features;
