import React from 'react';

const FamilyDashboardScreen = () => (
  <div className="ct-screen">
    <div className="ct-nav-bar">
      <div style={{display:'flex',alignItems:'center',gap:4}}>
        <div style={{width:16,height:16,borderRadius:4,background:'#1975d2',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg viewBox="0 0 36 36" width="10" height="10" fill="none">
            <circle cx="11" cy="11" r="5.5" fill="white" opacity=".95"/>
            <path d="M2 28c0-5 4-8.5 9-8.5s9 3.5 9 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p style={{fontSize:9,fontWeight:700,color:'#1975d2',lineHeight:1}}>Smart Saathi</p>
          <p style={{fontSize:6,color:'#6e6e73'}}>Dr. Priya Dashboard</p>
        </div>
      </div>
      <div className="ct-bell">🔔</div>
    </div>
    <div style={{flex:1,padding:'8px 10px',display:'flex',flexDirection:'column',gap:7}}>
      {/* Senior card */}
      <div style={{background:'#fff',borderRadius:10,padding:'8px 10px',border:'.5px solid #e8edf5'}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
          <div style={{width:24,height:24,borderRadius:'50%',background:'linear-gradient(135deg,#1975d2,#60a5fa)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>R</div>
          <div>
            <p style={{fontSize:10,fontWeight:700,color:'#1d1d1f'}}>Ramesh Gupta</p>
            <p style={{fontSize:7,color:'#30d158',fontWeight:600}}>● Online · Home</p>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
          {[['76','BPM'],['98%','SpO2'],['3/4','Meds']].map(([v,l])=>(
            <div key={l} style={{background:'#f0f6ff',borderRadius:6,padding:'5px 4px',textAlign:'center'}}>
              <p style={{fontSize:11,fontWeight:800,color:'#1975d2',lineHeight:1}}>{v}</p>
              <p style={{fontSize:6,color:'#6e6e73'}}>{l}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Alert */}
      <div style={{background:'#fff1f0',border:'.5px solid #fecaca',borderRadius:8,padding:'6px 9px',display:'flex',gap:6,alignItems:'flex-start'}}>
        <span style={{fontSize:13,flexShrink:0,marginTop:1}}>⚠️</span>
        <div>
          <p style={{fontSize:9,fontWeight:700,color:'#dc2626',lineHeight:1,marginBottom:2}}>Medication missed</p>
          <p style={{fontSize:7,color:'#991b1b',lineHeight:1.3}}>Metformin 500mg not taken — 12:00 PM. Last seen 45 min ago.</p>
        </div>
      </div>
      {/* Quick actions */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
        {[['📍','Location'],['📊','Reports'],['💬','Message'],['🆘','SOS Log']].map(([icon,lbl])=>(
          <div key={lbl} style={{background:'#fff',border:'.5px solid #e8edf5',borderRadius:8,padding:7,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
            <span style={{fontSize:16}}>{icon}</span>
            <p style={{fontSize:7,fontWeight:600,color:'#6e6e73',textAlign:'center'}}>{lbl}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FamilyDashboardScreen;
