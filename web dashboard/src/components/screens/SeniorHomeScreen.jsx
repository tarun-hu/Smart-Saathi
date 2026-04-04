import React from 'react';

const SeniorHomeScreen = ({ alt = false }) => (
  <div className="ss-screen">
    <div className="ss-header">
      <p style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:1,letterSpacing:'-.01em'}}>
        Hello, Ramesh 👋
      </p>
      <p style={{fontSize:9,color:'rgba(255,255,255,.55)'}}>Wednesday, 18 March 2026</p>
      <div className="ss-stat-strip">
        {[['💊', alt ? '3/4' : '2/4','Meds'],['💧', alt ? '5/8' : '3/8','Water'],['🧠', alt ? '82' : '76','Brain'],['❤️', alt ? '72' : '76','BPM']].map(([icon,val,lbl])=>(
          <div className="ss-stat" key={lbl}>
            <div style={{fontSize:11,fontWeight:700,color:'#fff',lineHeight:1}}>{icon}</div>
            <div style={{fontSize:9,fontWeight:700,color:'#fff',lineHeight:1.2}}>{val}</div>
            <div style={{fontSize:7,color:'rgba(255,255,255,.55)',marginTop:1}}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="ss-body">
      {/* Mic */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 0'}}>
        <div className="ss-mic-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm-7 10a7 7 0 0014 0h-2a5 5 0 01-10 0H5zm7 9v3m-4 0h8"/>
          </svg>
        </div>
        <p style={{fontSize:8,fontWeight:700,color:'#1975d2',letterSpacing:'.06em',marginTop:5}}>TAP TO TALK</p>
      </div>
      {/* Tiles */}
      <div className="ss-tiles">
        {[
          ['📅','My Day','1 appt today','linear-gradient(135deg,#1975d2,#1e40af)'],
          ['💊','Medicines', alt ? '3 taken · 1 left' : '2 taken · 1 missed','linear-gradient(135deg,#16a34a,#15803d)'],
          ['🧠','Brain Game','3 exercises','linear-gradient(135deg,#7c3aed,#6d28d9)'],
          ['👥','Family','Tap to call','linear-gradient(135deg,#db2777,#be185d)'],
        ].map(([icon,name,sub,bg])=>(
          <div className="ss-tile" key={name} style={{background:bg}}>
            <div style={{fontSize:17,lineHeight:1}}>{icon}</div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'#fff',lineHeight:1.2}}>{name}</div>
              <div style={{fontSize:7,color:'rgba(255,255,255,.65)'}}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Water tracker */}
      <div style={{background:'#fff',borderRadius:9,padding:'7px 9px',border:'.5px solid #dbeafe'}}>
        <p style={{fontSize:8,fontWeight:700,color:'#1e40af',marginBottom:5}}>💧 Water today — {alt ? '5' : '3'} of 8 glasses</p>
        <div style={{display:'flex',gap:3,marginBottom:4}}>
          {Array.from({length:8},(_,i)=>(
            <div key={i} style={{
              width:15,height:18,borderRadius:3,border:'1.5px solid',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,
              background: i < (alt ? 5 : 3) ? '#dbeafe' : '#f8fafc',
              borderColor: i < (alt ? 5 : 3) ? '#3b82f6' : '#e2e8f0',
              opacity: i < (alt ? 5 : 3) ? 1 : .35
            }}>💧</div>
          ))}
        </div>
        <div className="ss-water-bar">
          <div className="ss-water-fill" style={{width: alt ? '62%' : '37%'}} />
        </div>
      </div>
    </div>
  </div>
);

export default SeniorHomeScreen;
