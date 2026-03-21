import React from 'react';

const SignupScreen = () => (
  <div className="auth-phone-screen">
    <div style={{background:'#fff',padding:'36px 14px 12px',textAlign:'center',borderBottom:'.5px solid #e8e8ed'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:10}}>
        <div style={{width:34,height:34,borderRadius:9,background:'#1975d2',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg viewBox="0 0 36 36" width="20" height="20" fill="none">
            <circle cx="11" cy="11" r="5.5" fill="white" opacity=".95"/>
            <path d="M2 28c0-5 4-8.5 9-8.5s9 3.5 9 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="26" cy="11" r="4.5" fill="white" opacity=".65"/>
            <path d="M17 28c0-4 3-7 9-7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <p style={{fontSize:14,fontWeight:700,color:'#1d1d1f',letterSpacing:'-.02em',marginBottom:2}}>Create account</p>
      <p style={{fontSize:9,color:'#6e6e73'}}>Join SmartSaathi as a caregiver</p>
    </div>
    <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:7}}>
      {[['Full name','Dr. Priya Sharma'],['Email','priya@example.com'],['Phone','+91 98765 43210'],['Password','••••••••••']].map(([lbl,val])=>(
        <div key={lbl} className="auth-field">
          <p style={{fontSize:8,color:'#aeaeb2',marginBottom:1}}>{lbl}</p>
          <p style={{fontSize:11,color:'#1d1d1f'}}>{val}</p>
        </div>
      ))}
      <button className="auth-screen-btn" style={{marginTop:4,borderRadius:9}}>Create account</button>
      <p style={{fontSize:7.5,color:'#aeaeb2',textAlign:'center',lineHeight:1.5}}>By creating an account you agree to our Terms. Data encrypted with AES-256.</p>
    </div>
  </div>
);

export default SignupScreen;
