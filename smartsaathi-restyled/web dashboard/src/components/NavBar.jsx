import { NavLink, useNavigate } from "react-router-dom";
import BrandLogo from "../assets/logos/smart_sarthi.png";

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <nav style={{
      position:'sticky',top:0,zIndex:50,
      background:'rgba(255,255,255,.85)',
      backdropFilter:'saturate(180%) blur(20px)',
      WebkitBackdropFilter:'saturate(180%) blur(20px)',
      borderBottom:'.5px solid rgba(0,0,0,.08)',
      padding:'0 40px',
      height:52,
      display:'flex',alignItems:'center',justifyContent:'space-between'
    }}>
      {/* Logo */}
      <NavLink to="/" style={{display:'flex',alignItems:'center',gap:9,textDecoration:'none'}}>
        <div style={{width:28,height:28,borderRadius:7,background:'#1975d2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg viewBox="0 0 36 36" width="16" height="16" fill="none">
            <circle cx="11" cy="11" r="5.5" fill="white" opacity=".95"/>
            <path d="M2 28c0-5 4-8.5 9-8.5s9 3.5 9 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="26" cy="11" r="4.5" fill="white" opacity=".65"/>
            <path d="M17 28c0-4 3-7 9-7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{fontSize:16,fontWeight:700,color:'#1d1d1f',letterSpacing:'-.02em'}}>
          Smart<span style={{color:'#1975d2'}}>Saathi</span>
        </span>
      </NavLink>

      {/* Nav links — plain text, Finora style */}
      <div style={{display:'flex',alignItems:'center'}}>
        {[['/', 'Home'],['/abstract','Abstract'],['/features','Features'],['/contact','Contact']].map(([path, label]) => (
          <NavLink
            key={path}
            to={path}
            style={({isActive}) => ({
              padding:'5px 12px',
              fontSize:12,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? '#1975d2' : '#6e6e73',
              textDecoration:'none',
              transition:'color .12s',
              letterSpacing:'-.01em',
            })}
          >{label}</NavLink>
        ))}
      </div>

      {/* CTAs — Sign Up = plain bold text, Log In = solid pill */}
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <NavLink to="/signup" style={{
          fontSize:12,fontWeight:700,color:'#1d1d1f',
          textDecoration:'none',transition:'color .12s'
        }}
          onMouseEnter={e=>e.target.style.color='#1975d2'}
          onMouseLeave={e=>e.target.style.color='#1d1d1f'}
        >Sign Up</NavLink>
        <NavLink to="/login">
          <button className="cta-login-pill">Log In</button>
        </NavLink>
      </div>
    </nav>
  );
};

export default NavBar;
