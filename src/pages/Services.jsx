import React from 'react'
import { Link } from 'react-router-dom'
import '../landing.css'

const services = [
  { slug: '/e-waste', code: 'EW', title: 'E-Waste', description: 'Electronics, IT equipment, circuit boards and other end-of-life electrical assets.' },
  { slug: '/battery-waste', code: 'BW', title: 'Battery Waste', description: 'A dedicated route for end-of-life batteries and battery-containing assets.' },
  { slug: '/car-scrapping', code: 'CS', title: 'Car Scrapping', description: 'A digital starting point for end-of-life vehicle scrapping requirements.' },
  { slug: '/e-rickshaw-scrapping', code: 'ER', title: 'E-Rickshaw Scrapping', description: 'A dedicated pathway for end-of-life e-rickshaws and their recoverable components.' },
]

const serviceContent = {
  'e-waste': {
    eyebrow: 'E-WASTE', title: 'Move end-of-life electronics into the right recovery network.',
    intro: 'Use Reway to list electronic waste, discover marketplace opportunities and connect the material with the next participant in its circular journey.',
    examples: ['Laptops & computers', 'Servers & IT equipment', 'Printed circuit boards', 'Mobile devices', 'Consumer electronics', 'Mixed electronics'],
    category: 'e-waste'
  },
  'battery-waste': {
    eyebrow: 'BATTERY WASTE', title: 'A clearer digital route for end-of-life batteries.',
    intro: 'List battery waste through Reway and make it discoverable to relevant marketplace participants through a structured digital workflow.',
    examples: ['Lithium-ion batteries', 'EV battery packs', 'Portable batteries', 'Industrial batteries', 'Battery modules', 'Mixed battery lots'],
    category: 'battery-waste'
  },
  'car-scrapping': {
    eyebrow: 'CAR SCRAPPING', title: 'Bring end-of-life vehicles into a more connected scrapping journey.',
    intro: 'Reway provides a digital entry point for vehicle scrapping requirements, helping connect supply with relevant ecosystem participants.',
    examples: ['End-of-life cars', 'Accident-damaged vehicles', 'Fleet retirement', 'Old commercial vehicles', 'Vehicle components', 'Bulk vehicle lots'],
    category: 'car-scrap'
  },
  'e-rickshaw-scrapping': {
    eyebrow: 'E-RICKSHAW SCRAPPING', title: 'A dedicated pathway for end-of-life e-rickshaws.',
    intro: 'List e-rickshaw scrapping requirements through Reway and connect vehicles and components with the wider recovery ecosystem.',
    examples: ['End-of-life e-rickshaws', 'Fleet retirement', 'Battery-containing vehicles', 'Motors & controllers', 'Vehicle frames', 'Mixed components'],
    category: 'e-rickshaw-scrap'
  }
}

function PublicHeader() {
  return <header className="service-nav"><div className="container service-nav-inner"><Link className="service-brand" to="/">REWAY</Link><nav><Link to="/">Home</Link><Link to="/services">Our Services</Link><Link to="/marketplace">Marketplace</Link><Link className="service-nav-cta" to="/signup?role=seller">Sell Waste ↗</Link></nav></div></header>
}

export function Services() {
  return <div className="service-site"><PublicHeader/><main><section className="service-hero"><div className="container"><span className="kicker">OUR SERVICES</span><h1>Different waste streams.<br/><em>One connected platform.</em></h1><p>Explore Reway's growing set of digital pathways for end-of-life assets and materials.</p></div></section><section className="service-section"><div className="container service-grid">{services.map(s=><Link className="service-card" to={s.slug} key={s.slug}><span className="service-code">{s.code}</span><h2>{s.title}</h2><p>{s.description}</p><strong>Explore service ↗</strong></Link>)}</div><div className="container service-market-cta"><div><span className="kicker">REWAY MARKETPLACE</span><h2>Ready to explore available material?</h2></div><Link className="btn primary" to="/marketplace">Go to Marketplace ↗</Link></div></section></main></div>
}

export function ServicePage({ type }) {
  const s = serviceContent[type]
  if (!s) return null
  return <div className="service-site"><PublicHeader/><main><section className="service-detail-hero"><div className="container service-detail-grid"><div><span className="kicker">{s.eyebrow}</span><h1>{s.title}</h1><p>{s.intro}</p><div className="actions"><Link className="btn primary" to={`/marketplace?category=${s.category}`}>Explore Marketplace ↗</Link><Link className="btn ghost" to="/signup?role=seller">List Waste ↗</Link></div></div><div className="service-detail-mark"><span>{s.eyebrow}</span><b>REWAY</b><small>CIRCULAR MARKETPLACE</small></div></div></section><section className="service-section"><div className="container"><div className="service-section-head"><span className="kicker">WHAT YOU CAN LIST</span><h2>Built around the material stream.</h2></div><div className="example-grid">{s.examples.map((x,i)=><div className="example-card" key={x}><span>0{i+1}</span><b>{x}</b></div>)}</div></div></section><section className="service-process"><div className="container"><span className="kicker">HOW IT WORKS</span><div className="process-grid">{[['01','List','Share the material or asset details.'],['02','Discover','Make the requirement visible in the marketplace.'],['03','Quote','Relevant participants can evaluate the opportunity.'],['04','Move','Coordinate the next step once an offer is accepted.']].map(x=><div key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div><div className="service-final-cta"><h2>Ready to get started?</h2><Link className="btn primary" to={`/marketplace?category=${s.category}`}>Go to Marketplace ↗</Link></div></div></section></main></div>
}
