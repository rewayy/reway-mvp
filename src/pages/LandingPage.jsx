import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import '../landing.css';

const Arrow = () => <span aria-hidden="true">↗</span>;
const Logo = () => <a className="rw-brand" href="#top" aria-label="Reway home"><span className="rw-logo-mark">R</span><span>REWAY</span></a>;
const nav = [['Platform','#platform'],['How It Works','#how'],['Technology','#technology'],['For Businesses','#businesses'],['For Recyclers','#recyclers'],['About','#about']];

const categories = [
  {code:'01', title:'Electronic Waste', text:'Laptops, desktops, monitors, servers, printers, PCBs, cables and other electrical and electronic equipment.', link:'/marketplace/buy?category=e-waste', img:'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1000&q=80'},
  {code:'02', title:'Battery Waste', text:'Lithium-ion, lead-acid, battery packs and other used or end-of-life batteries.', link:'/marketplace/buy?category=battery-waste', img:'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=1000&q=80'},
  {code:'03', title:'End-of-Life Vehicles', text:'Old, damaged and end-of-life vehicles available for responsible scrapping and material recovery.', link:'/marketplace/buy?category=car-scrap', img:'https://images.unsplash.com/photo-1562141961-b5d23a03fb50?auto=format&fit=crop&w=1000&q=80'},
  {code:'04', title:'E-Rickshaws & Components', text:'End-of-life e-rickshaws, batteries, motors and related vehicle components.', link:'/marketplace/buy?category=e-rickshaw-scrap', img:'https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=1000&q=80'}
];

export default function LandingPage(){
  const { user, profile, signOut } = useAuth();
  const [menu,setMenu] = useState(false);
  const [scrolled,setScrolled] = useState(false);
  const [traceStage,setTraceStage] = useState(0);
  const [chartPoint,setChartPoint] = useState(5);
  const role = profile?.role || user?.user_metadata?.role;
  const accountPath = role === 'recycler' ? '/marketplace' : '/dashboard';
  useEffect(()=>{ const onScroll=()=>setScrolled(window.scrollY>18); window.addEventListener('scroll',onScroll); return()=>window.removeEventListener('scroll',onScroll); },[]);

  return <div id="top" className="rw-site">
    <header className={`rw-nav ${scrolled?'is-scrolled':''}`}><div className="rw-nav-inner">
      <Logo/>
      <nav className={menu?'open':''}>
        {nav.map(([label,href])=><a key={label} href={href} onClick={()=>setMenu(false)}>{label}</a>)}
        <Link to="/marketplace" onClick={()=>setMenu(false)}>Marketplace</Link>
        {user ? <><Link to={accountPath} onClick={()=>setMenu(false)}>My Account</Link><button className="rw-nav-cta" onClick={async()=>{await signOut();setMenu(false)}}>Sign Out <Arrow/></button></> : <><Link to="/login" onClick={()=>setMenu(false)}>Login</Link><Link className="rw-nav-cta" to="/signup?role=seller" onClick={()=>setMenu(false)}>Sell E-Waste <Arrow/></Link></>}
      </nav>
      <button className="rw-menu" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation">{menu?'×':'☰'}</button>
    </div></header>

    <main>
      <section className="rw-hero">
        <div className="rw-shell rw-hero-grid">
          <div className="rw-hero-copy">
            <span className="rw-kicker light">E-WASTE MANAGEMENT PLATFORM</span>
            <h1>A smarter way to <em>manage and move</em> e-waste.</h1>
            <p>Reway is a digital e-waste management platform that connects businesses, waste generators, recyclers and buyers across India.</p>
            <div className="rw-actions"><Link className="rw-btn lime" to="/marketplace/sell">Sell E-Waste <Arrow/></Link><Link className="rw-btn outline" to="/marketplace/buy">Explore Marketplace <Arrow/></Link></div>
            <div className="rw-audience"><span>Built for</span><b>Businesses</b><b>Authorised recyclers</b><b>Material buyers</b></div><div className="rw-trust-strip"><span>✓ Authorised recyclers only</span><span>◎ Digital-first workflow</span><span>↗ Traceable material journey</span></div>
          </div>
          <div className="rw-hero-media">
            <img src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1400&q=85" alt="Electronic equipment prepared for responsible recovery"/>
            <div className="rw-float rw-float-a"><span>01</span><b>List material</b><small>Add quantity, condition and location</small></div>
            <div className="rw-float rw-float-b"><span>02</span><b>Receive interest</b><small>Connect with recyclers and buyers</small></div>
          </div>
        </div>
        <div className="rw-hero-bottom"><div className="rw-shell"><span>LIST</span><i></i><span>DISCOVER</span><i></i><span>QUOTE</span><i></i><span>CONNECT</span></div></div>
      </section>

      <section id="platform" className="rw-section rw-platform">
        <div className="rw-shell">
          <div className="rw-section-intro"><div><span className="rw-kicker">ABOUT THE PLATFORM</span><h2>Connecting India's <span>e-waste ecosystem.</span></h2></div><p>Electronic waste moves through businesses, recyclers, buyers, collection partners and logistics providers. Reway brings these participants onto one digital platform so opportunities are easier to discover, transactions can be handled digitally and material can move through a more structured, traceable process.</p></div>
          <div className="rw-platform-grid">
            <div className="rw-flow-visual">
              <div className="rw-flow-title"><span>REWAY / ECOSYSTEM MAP</span><small>How participants connect</small></div>
              <div className="rw-network">
                <div className="rw-network-core"><strong>R</strong><span>REWAY</span></div>
                <div className="rw-net-node n1"><b>Businesses</b><small>List e-waste</small></div>
                <div className="rw-net-node n2"><b>Recyclers</b><small>Discover supply</small></div>
                <div className="rw-net-node n3"><b>Buyers</b><small>Source material</small></div>
                <div className="rw-net-node n4"><b>Partners</b><small>Support movement</small></div>
                <svg viewBox="0 0 700 420"><path d="M130 90 C260 100 270 190 350 210"/><path d="M570 90 C440 100 430 190 350 210"/><path d="M130 330 C260 320 270 230 350 210"/><path d="M570 330 C440 320 430 230 350 210"/></svg>
              </div>
            </div>
            <div className="rw-pillars">
              <article><span>01</span><div><h3>Discover</h3><p>Find e-waste listings, recyclable materials and relevant opportunities across the marketplace.</p></div></article>
              <article><span>02</span><div><h3>Connect</h3><p>Bring waste generators, recyclers, buyers and other ecosystem participants together.</p></div></article>
              <article><span>03</span><div><h3>Trace</h3><p>Keep key material and transaction events in a digital trail as e-waste moves through the ecosystem.</p></div></article><article><span>04</span><div><h3>Recover</h3><p>Connect material with authorised recyclers and support more responsible recovery of valuable resources.</p></div></article>
            </div>
          </div>
        </div>
      </section>

      <section className="rw-section rw-market-band">
        <div className="rw-shell">
          <div className="rw-dark-heading"><span className="rw-kicker light">E-WASTE MARKETPLACE</span><h2>Whether you have e-waste<br/>or need it, <em>start here.</em></h2></div>
          <div className="rw-market-cards">
            <article><div className="rw-card-num">01 / SELL</div><h3>Have e-waste to sell?</h3><p>List electronic waste with its material type, quantity, condition, photos and pickup location. Make it visible to relevant buyers and authorised recyclers on the platform.</p><Link to="/marketplace/sell">List your waste <Arrow/></Link><div className="rw-mini-ui"><span>NEW LISTING</span><div><b>Electronic equipment</b><small>Material type</small></div><div><b>1,250 kg</b><small>Quantity</small></div><i>Ready to publish</i></div></article>
            <article><div className="rw-card-num">02 / SOURCE</div><h3>Looking for material?</h3><p>Browse available e-waste and scrap listings, review material details and submit quotations for opportunities relevant to you.</p><Link to="/marketplace/buy">Browse marketplace <Arrow/></Link><div className="rw-mini-ui"><span>MARKETPLACE</span><div><b>IT equipment</b><small>Delhi NCR</small></div><div><b>Battery waste</b><small>Noida</small></div><i>View available material</i></div></article>
          </div>
        </div>
      </section>

      <section id="businesses" className="rw-section rw-persona white">
        <div className="rw-shell rw-persona-grid">
          <div className="rw-persona-copy"><span className="rw-kicker">FOR BUSINESSES</span><h2>Turn e-waste disposal into a <span>clear digital workflow.</span></h2><p>List obsolete electronics and other e-waste, share material details and make your requirement visible to recyclers and buyers through one platform.</p><ul><li>List e-waste with structured details</li><li>Add photos, quantity and pickup information</li><li>Receive quotations from interested participants</li><li>Keep listing, quotations and key activity in one digital workflow</li><li>Build a clearer digital trail for material movement</li></ul><Link className="rw-btn dark" to="/marketplace/sell">List E-Waste <Arrow/></Link></div>
          <div className="rw-photo-panel"><img src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1300&q=85" alt="Electronic devices and components for recycling"/><div className="rw-photo-tag"><span>BUSINESS WORKFLOW</span><b>From obsolete equipment<br/>to a visible opportunity.</b></div></div>
        </div>
      </section>

      <section id="recyclers" className="rw-section rw-persona soft">
        <div className="rw-shell rw-persona-grid reverse">
          <div className="rw-insight-panel"><div className="rw-insight-head"><span>MATERIAL DISCOVERY</span><b>Marketplace overview</b></div><div className="rw-donut"><div><strong>68%</strong><span>Electronics</span></div></div><div className="rw-bars"><div><span>IT Equipment</span><i style={{'--w':'88%'}}></i><b>88</b></div><div><span>Battery Waste</span><i style={{'--w':'64%'}}></i><b>64</b></div><div><span>Vehicle Scrap</span><i style={{'--w':'42%'}}></i><b>42</b></div></div><small>Illustrative interface visual</small></div>
          <div className="rw-persona-copy"><span className="rw-kicker">FOR RECYCLERS</span><h2>Discover e-waste and grow your <span>supply network.</span></h2><p>Authorised recyclers can browse available electronic waste, review listing details and submit quotations directly through the Reway marketplace.</p><ul><li>Marketplace participation for authorised recyclers</li><li>Discover available e-waste</li><li>Filter opportunities by material category</li><li>Review quantity, condition and location</li><li>Submit quotations through the marketplace</li></ul><Link className="rw-btn dark" to="/marketplace/buy">Find E-Waste <Arrow/></Link></div>
        </div>
      </section>

      <section id="how" className="rw-section rw-how">
        <div className="rw-shell"><div className="rw-section-intro compact"><div><span className="rw-kicker">HOW REWAY WORKS</span><h2>E-waste management,<br/><span>made simpler.</span></h2></div><p>Four clear steps take an opportunity from available material to the right connection.</p></div>
          <div className="rw-steps">
            {[['01','List','Add the waste category, quantity, condition, photos and pickup details.'],['02','Discover','Relevant recyclers and buyers discover material that matches what they need.'],['03','Quote','Interested participants review the listing and submit their quotation.'],['04','Connect','Review the interest, connect with the right participant and take the transaction forward.']].map(([n,t,d])=><article key={n}><span>{n}</span><div className="rw-step-icon">{n==='01'?'＋':n==='02'?'⌕':n==='03'?'₹':'↗'}</div><h3>{t}</h3><p>{d}</p></article>)}
          </div>
        </div>
      </section>

      <section id="technology" className="rw-section rw-tech">
        <div className="rw-shell rw-tech-grid">
          <div className="rw-tech-copy"><span className="rw-kicker light">TECH FIRST, END TO END</span><h2>Less offline chasing. <em>More digital visibility.</em></h2><p>Reway is designed around a digital-first workflow. Material details, discovery, quotations and key transaction events live in one environment, creating a clearer trail from listing to the next stage of recovery.</p><div className="rw-tech-list"><span>Structured material data</span><span>Digital quotations</span><span>Traceability trail</span><span>Authorised recycler network</span></div><div className="rw-sustain-note"><b>Sustainability through better movement</b><p>Better information and stronger connections can help useful materials reach recovery channels instead of remaining stranded in fragmented networks.</p></div></div>
          <div className="rw-dashboard interactive"><div className="rw-dashboard-top"><span>REWAY / DIGITAL MATERIAL FLOW</span><small>Move across the graph</small></div><div className="rw-stat-row"><div><small>DIGITAL WORKFLOW</small><b>100%</b><em>Platform-led process</em></div><div><small>NETWORK ACCESS</small><b>AUTH</b><em>Authorised recyclers</em></div></div><div className="rw-chart rw-chart-interactive"><div className="rw-chart-label"><span>Illustrative material activity</span><b>Week {chartPoint+1} · {[18,26,23,37,34,49,45,58][chartPoint]} movements</b></div><svg viewBox="0 0 600 190" preserveAspectRatio="none"><path d="M0 150 C70 140 80 105 145 122 S220 80 280 98 S360 48 425 70 S510 28 600 38"/><path className="fill" d="M0 150 C70 140 80 105 145 122 S220 80 280 98 S360 48 425 70 S510 28 600 38 V190 H0Z"/>{[18,26,23,37,34,49,45,58].map((v,i)=><circle key={i} className={chartPoint===i?'active':''} cx={i*(600/7)} cy={160-(v*2.1)} r={chartPoint===i?8:5} onMouseEnter={()=>setChartPoint(i)} onFocus={()=>setChartPoint(i)} tabIndex="0"/> )}</svg><div className="rw-chart-weeks">{['W1','W2','W3','W4','W5','W6','W7','W8'].map((w,i)=><button key={w} className={chartPoint===i?'active':''} onMouseEnter={()=>setChartPoint(i)} onClick={()=>setChartPoint(i)}>{w}</button>)}</div></div></div>
        </div>
      </section>

      <section className="rw-section rw-trace">
        <div className="rw-shell">
          <div className="rw-section-intro compact"><div><span className="rw-kicker">DIGITAL TRACEABILITY</span><h2>Follow the material, <span>not the paperwork.</span></h2></div><p>Reway creates a digital trail around key marketplace and material events. Select a stage to see how information can stay connected as e-waste moves forward.</p></div>
          <div className="rw-trace-grid">
            <div className="rw-trace-rail">{[
              ['Listed','Material details, quantity, condition, photos and location are captured digitally.'],
              ['Quoted','Marketplace quotations create a recorded commercial interaction.'],
              ['Matched','The selected participant and next step can be linked to the material journey.'],
              ['Moved','Pickup and movement events can form part of the transaction trail.'],
              ['Recovery','The journey moves towards an authorised recycler and material recovery.']
            ].map(([t,d],i)=><button key={t} className={traceStage===i?'active':''} onMouseEnter={()=>setTraceStage(i)} onClick={()=>setTraceStage(i)}><span>{String(i+1).padStart(2,'0')}</span><div><b>{t}</b><small>{d}</small></div></button>)}</div>
            <div className="rw-trace-card">
              <div className="rw-trace-card-top"><span>TRACE ID</span><b>RW-26-1048</b><i>LIVE TRAIL</i></div>
              <div className="rw-trace-orbit"><div className="rw-trace-core">R</div>{['LIST','QUOTE','MATCH','MOVE','RECOVER'].map((x,i)=><span key={x} className={`p${i+1} ${i<=traceStage?'done':''}`}>{i<traceStage?'✓':i===traceStage?'●':'○'} {x}</span>)}</div>
              <div className="rw-trace-detail"><span>CURRENT VIEW</span><h3>{['Material listed','Quotation recorded','Participant matched','Movement tracked','Recovery pathway'][traceStage]}</h3><p>{['Structured material data begins the digital trail.','Commercial interest is captured against the listing.','The material is connected with the selected ecosystem participant.','Pickup and movement information extends the digital record.','The material reaches the recovery stage through an authorised recycler.'][traceStage]}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="rw-section rw-categories">
        <div className="rw-shell"><div className="rw-section-intro compact"><div><span className="rw-kicker">WHAT MOVES THROUGH REWAY</span><h2>Explore material<br/><span>categories.</span></h2></div><p>From used electronics and batteries to end-of-life vehicles, explore the material streams being brought onto Reway.</p></div>
          <div className="rw-category-grid">{categories.map(c=><Link to={c.link} className="rw-category" key={c.code}><div className="rw-category-img"><img src={c.img} alt=""/><span>{c.code}</span></div><div><h3>{c.title}</h3><p>{c.text}</p><b>Explore category <Arrow/></b></div></Link>)}</div>
        </div>
      </section>

      <section id="about" className="rw-section rw-about">
        <div className="rw-shell rw-about-grid"><div><span className="rw-kicker">ABOUT REWAY</span><h2>Building a digital layer for India's <span>circular economy.</span></h2></div><div><p className="lead">Reway is building a tech-first e-waste management platform that connects businesses, authorised recyclers, buyers and other stakeholders across India's electronic waste ecosystem.</p><p>We started with a simple problem: valuable material exists across the economy, but finding the right participant and moving that material forward can still depend on fragmented networks. Reway is building the digital infrastructure to make those connections easier, create better traceability and support more sustainable material recovery.</p></div></div>
      </section>

      <section className="rw-final"><div className="rw-shell rw-final-inner"><div><span className="rw-kicker light">GET STARTED</span><h2>Your e-waste has a<br/>next destination. <em>Find it.</em></h2><p>List electronic waste, discover available materials and connect with participants across the e-waste ecosystem.</p></div><div className="rw-actions"><Link className="rw-btn lime" to="/marketplace/sell">Sell E-Waste <Arrow/></Link><Link className="rw-btn outline" to="/marketplace/buy">Explore Marketplace <Arrow/></Link></div></div></section>
    </main>

    <footer className="rw-footer"><div className="rw-shell rw-footer-grid"><div><Logo/><p>Connecting India's e-waste ecosystem through technology.</p><a href="mailto:support@reway.co.in">support@reway.co.in</a><br/><a href="tel:+917290908877">+91 72909 08877</a></div><div><b>Platform</b><Link to="/marketplace">Marketplace</Link><Link to="/marketplace/sell">Sell E-Waste</Link><a href="#how">How it works</a></div><div><b>Participants</b><a href="#businesses">Businesses</a><a href="#recyclers">Recyclers</a><a href="#technology">Technology</a></div><div><b>Company</b><a href="#about">About Reway</a><Link to="/services">Services</Link><a href="mailto:reway.ewm@gmail.com">Contact</a></div></div><div className="rw-shell rw-footer-bottom"><span>© 2026 Reway Technologies. All rights reserved.</span><span>E-Waste Management · Marketplace · Circular Economy</span></div></footer>
  </div>
}
