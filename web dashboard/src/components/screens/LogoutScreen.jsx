import React from 'react';

const LogoutScreen = () => (
  <div className="logout-screen">
    <div style={{background:'#fff',padding:'36px 14px 16px',borderBottom:'.5px solid #e8e8ed'}}>
      <div className="logout-avatar">P</div>
      <p style={{fontSize:13,fontWeight:700,color:'#1d1d1f',textAlign:'center',letterSpacing:'-.01em'}}>Dr. Priya Sharma</p>
      <p style={{fontSize:9,color:'#6e6e73',textAlign:'center',marginTop:2}}>priya@example.com</p>
      <div style={{display:'flex',justifyContent:'center',marginTop:6}}>
        <span style={{background:'#e8f1fc',color:'#1975d2',fontSize:8,fontWeight:700,padding:'3px 9px',borderRadius:99}}>Family Account</span>
      </div>
    </div>
    <div style={{padding:'10px 14px'}}>
      {[['Notifications','Push alerts on'],['Paired seniors','1 connected'],['Language','English'],['Privacy','View policy'],['Help & Support','Contact us']].map(([lbl,val])=>(
        <div key={lbl} className="logout-row">
          <p style={{fontSize:11,color:'#1d1d1f'}}>{lbl}</p>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <p style={{fontSize:10,color:'#aeaeb2'}}>{val}</p>
            <p style={{fontSize:10,color:'#aeaeb2'}}>›</p>
          </div>
        </div>
      ))}
      <div className="logout-btn">Sign Out</div>
    </div>
  </div>
);

export default LogoutScreen;
