import React from 'react';
import { Link } from 'react-router-dom';
import FloatingFruits from '../components/FloatingFruits';

const cardBase = {
  background:'rgba(255,255,255,0.12)', backdropFilter:'blur(12px)',
  border:'1px solid rgba(255,255,255,0.25)', borderRadius:4,
  padding:'2rem 2.5rem', cursor:'pointer', textDecoration:'none',
  transition:'all 0.4s', minWidth:200, display:'flex',
  flexDirection:'column', alignItems:'center',
};

function Card({ to, children }) {
  return (
    <Link to={to} className="region-card-w" style={cardBase}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'; e.currentTarget.style.boxShadow='0 20px 50px rgba(59,25,15,0.3)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; e.currentTarget.style.boxShadow=''; }}
    >{children}</Link>
  );
}

export default function RegionSelector() {
  return (
    <>
      <style>{`
        html,body{height:100%;overflow:hidden;background:#f8cb78}
        @media(max-width:600px){html,body{overflow:auto}.page-inner{height:auto!important;min-height:100vh;padding:6rem 1.5rem 4rem!important}.regions-wrap{flex-direction:column!important;align-items:center}.region-card-w{min-width:260px!important;width:100%;max-width:320px}.or-div{display:none!important}}
      `}</style>

      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{backgroundImage:"url('/images/bg-hero.jpg')",filter:'brightness(0.35) saturate(0.6)'}}/>
      <div className="fixed inset-0 z-[1]" style={{background:'linear-gradient(135deg,rgba(248,203,120,0.88) 0%,rgba(59,25,15,0.75) 100%)'}}/>
      <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
        <FloatingFruits variant="selector"/>
      </div>

      <div className="page-inner relative z-[3] h-screen flex flex-col items-center justify-center text-center" style={{padding:'2rem'}}>

        <p style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(42px,7vw,80px)',fontWeight:300,letterSpacing:'0.18em',color:'#fff',textTransform:'uppercase',lineHeight:0.9,textShadow:'0 2px 20px rgba(59,25,15,0.3)',marginBottom:'0.3rem'}}>
          EOLEKARE
        </p>
        <p style={{fontSize:11,letterSpacing:'0.35em',fontWeight:300,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',marginBottom:'2rem'}}>by Eoleeg</p>
        <p style={{fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(16px,2.5vw,22px)',fontStyle:'italic',color:'rgba(255,255,255,0.85)',maxWidth:420,lineHeight:1.6,marginBottom:'0.8rem'}}>
          Votre skincare aux parfums uniques
        </p>
        <p style={{fontSize:11,letterSpacing:'0.25em',fontWeight:300,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',marginBottom:'3.5rem'}}>
          100% Naturel · Made in 🇧🇯 · Pour tous
        </p>

        <div className="regions-wrap flex gap-6 flex-wrap justify-center mb-10">
          <Card to="/benin">
            <div style={{fontSize:52,marginBottom:'1rem',lineHeight:1}}>🇧🇯</div>
            <p style={{fontFamily:'"Cormorant Garamond",serif',fontSize:26,fontWeight:300,color:'#fff',letterSpacing:'0.1em',marginBottom:'0.4rem'}}>Bénin</p>
            <p style={{fontSize:10,letterSpacing:'0.18em',fontWeight:300,color:'rgba(255,255,255,0.55)',textTransform:'uppercase',lineHeight:1.6,textAlign:'center'}}>Commandez directement<br/>via WhatsApp</p>
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:'1rem',background:'rgba(37,211,102,0.15)',border:'0.5px solid rgba(37,211,102,0.35)',borderRadius:3,padding:'5px 12px'}}>
              <span style={{fontSize:14}}>💬</span>
              <span style={{fontSize:9,letterSpacing:'0.18em',color:'rgba(255,255,255,0.7)',textTransform:'uppercase'}}>WhatsApp · Paiement mobile</span>
            </div>
            <p style={{marginTop:'1rem',fontSize:9,letterSpacing:'0.2em',fontWeight:300,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',borderTop:'0.5px solid rgba(255,255,255,0.2)',paddingTop:'0.8rem',width:'100%',textAlign:'center'}}>
              Livraison locale · FCFA
            </p>
          </Card>

          <div className="or-div" style={{fontFamily:'"Cormorant Garamond",serif',fontSize:18,fontStyle:'italic',color:'rgba(255,255,255,0.4)',display:'flex',alignItems:'center',gap:'1rem'}}>
            <span style={{width:40,height:'0.5px',background:'rgba(255,255,255,0.25)',display:'block'}}/>
            ou
            <span style={{width:40,height:'0.5px',background:'rgba(255,255,255,0.25)',display:'block'}}/>
          </div>

          <Card to="/europe">
            <div style={{fontSize:52,marginBottom:'1rem',lineHeight:1}}>🇪🇺</div>
            <p style={{fontFamily:'"Cormorant Garamond",serif',fontSize:26,fontWeight:300,color:'#fff',letterSpacing:'0.1em',marginBottom:'0.4rem'}}>Europe</p>
            <p style={{fontSize:10,letterSpacing:'0.18em',fontWeight:300,color:'rgba(255,255,255,0.55)',textTransform:'uppercase',lineHeight:1.6,textAlign:'center'}}>Commandez en ligne<br/>Livraison Mondial Relay</p>
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:'1rem',background:'rgba(150,191,99,0.15)',border:'0.5px solid rgba(150,191,99,0.35)',borderRadius:3,padding:'5px 12px'}}>
              <span style={{fontSize:14}}>🛒</span>
              <span style={{fontSize:9,letterSpacing:'0.18em',color:'rgba(255,255,255,0.7)',textTransform:'uppercase'}}>Shopify · Paiement sécurisé</span>
            </div>
            <p style={{marginTop:'1rem',fontSize:9,letterSpacing:'0.2em',fontWeight:300,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',borderTop:'0.5px solid rgba(255,255,255,0.2)',paddingTop:'0.8rem',width:'100%',textAlign:'center'}}>
              Tracking · EUR · CB / PayPal
            </p>
          </Card>
        </div>

        <p className="absolute bottom-8" style={{fontSize:9,letterSpacing:'0.18em',fontWeight:300,color:'rgba(255,255,255,0.3)',textTransform:'uppercase'}}>
          © 2025 Eolekare by Eoleeg &nbsp;·&nbsp; Instagram @eolekare
        </p>
      </div>
    </>
  );
}
