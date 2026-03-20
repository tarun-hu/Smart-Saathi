import React from 'react';

const LoginScreen = ({ showPreview = false }) => (
  <div className="auth-phone-screen">
    <div className="auth-screen-header">
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:12}}>
        <div style={{width:34,height:34,borderRadius:9,background:'#1975d2',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg viewBox="0 0 36 36" width="20" height="20" fill="none">
            <circle cx="11" cy="11" r="5.5" fill="white" opacity=".95"/>
            <path d="M2 28c0-5 4-8.5 9-8.5s9 3.5 9 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="26" cy="11" r="4.5" fill="white" opacity=".65"/>
            <path d="M17 28c0-4 3-7 9-7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <p style={{fontSize:14,fontWeight:700,color:'#1d1d1f',letterSpacing:'-.02em',marginBottom:3}}>Welcome back</p>
      <p style={{fontSize:9,color:'#6e6e73',lineHeight:1.5}}>Enter your caretaker access code to log in</p>
    </div>
    <div style={{padding:'12px 14px'}}>
      <p style={{fontSize:9,fontWeight:600,color:'#6e6e73',marginBottom:4}}>Access Code</p>
      <div className="auth-code-input">CS – 4 8 2 7 – X</div>
      <button className="auth-screen-btn">Access Dashboard →</button>
      <p style={{fontSize:8,color:'#aeaeb2',textAlign:'center',marginBottom:10,lineHeight:1.5}}>Code sent during onboarding · Contact support if lost</p>
      {showPreview && (
        <>
          <div style={{textAlign:'center',fontSize:9,color:'#aeaeb2',marginBottom:8,borderBottom:'.5px solid #e8e8ed',paddingBottom:8}}>Showing limited preview</div>
          <div style={{background:'#f5f5f7',borderRadius:9,padding:'9px 10px',marginBottom:10}}>
            <p style={{fontSize:9,fontWeight:700,color:'#1d1d1f',marginBottom:6}}>📋 Recent activity</p>
            {[['#ff3b30','🆘 SOS — 2 mins ago'],['#ff9f0a','💊 Med missed — 12PM']].map(([c,t])=>(
              <div key={t} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 0',borderBottom:'.5px solid #e8e8ed'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:c,flexShrink:0}}/>
                <p style={{fontSize:9,color:'#6e6e73',flex:1}}>{t}</p>
              </div>
            ))}
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 0'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#aeaeb2',flexShrink:0}}/>
              <p style={{fontSize:9,color:'#6e6e73',flex:1,filter:'blur(3px)',userSelect:'none'}}>BP: 133/86 mm Hg ████</p>
            </div>
          </div>
          <button style={{width:'100%',background:'linear-gradient(135deg,#16a34a,#15803d)',color:'#fff',fontSize:10,fontWeight:700,padding:8,borderRadius:9,border:'none',letterSpacing:'-.01em'}}>📱 Open in App</button>
        </>
      )}
    </div>
  </div>
);

export default LoginScreen;
