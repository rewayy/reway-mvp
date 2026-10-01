import React from 'react'
import { Link } from 'react-router-dom'
import '../landing.css'
import '../services.css'

const services = [
  { slug:'/e-waste', category:'e-waste', number:'01', title:'E-Waste', short:'Electronics & IT assets', description:'A structured marketplace route for end-of-life electronics, IT equipment, circuit boards and mixed electrical assets.', examples:['Laptops & computers','Servers & IT equipment','PCBs & components'] },
  { slug:'/battery-waste', category:'battery-waste', number:'02', title:'Battery Waste', short:'Batteries & energy storage', description:'List and discover end-of-life batteries and battery-containing assets through a clear digital workflow.', examples:['Lithium-ion batteries','EV battery packs','Industrial batteries'] },
  { slug:'/car-scrapping', category:'car-scrap', number:'03', title:'Car Scrapping', short:'End-of-life vehicles', description:'A digital starting point for vehicle scrapping requirements, fleet retirement and recoverable vehicle material.', examples:['End-of-life cars','Fleet retirement','Vehicle components'] },
  { slug:'/e-rickshaw-scrapping', category:'e-rickshaw-scrap', number:'04', title:'E-Rickshaw Scrapping', short:'Electric mobility assets', description:'A dedicated pathway for end-of-life e-rickshaws, batteries, motors, controllers and related components.', examples:['E-rickshaws','Motors & controllers','Mixed components'] },
]

const serviceContent = {
  'e-waste': { eyebrow:'E-WASTE', title:'Give electronics a smarter route forward.', intro:'List end-of-life electronics through Reway, make material details clear and connect the opportunity with relevant marketplace participants.', category:'e-waste', examples:['Laptops & computers','Servers & IT equipment','Printed circuit boards','Mobile devices','Consumer electronics','Mixed electronics'] },
  'battery-waste': { eyebrow:'BATTERY WASTE', title:'A clearer route for end-of-life batteries.', intro:'Structure battery waste information in one place and make it discoverable to relevant participants through the Reway marketplace.', category:'battery-waste', examples:['Lithium-ion batteries','EV battery packs','Portable batteries','Industrial batteries','Battery modules','Mixed battery lots'] },
  'car-scrapping': { eyebrow:'CAR SCRAPPING', title:'Move end-of-life vehicles into the recovery ecosystem.', intro:'Create a structured digital listing for vehicle scrapping requirements and connect supply with relevant marketplace participants.', category:'car-scrap', examples:['End-of-life cars','Accident-damaged vehicles','Fleet retirement','Old commercial vehicles','Vehicle components','Bulk vehicle lots'] },
  'e-rickshaw-scrapping': { eyebrow:'E-RICKSHAW SCRAPPING', title:'A dedicated pathway for end-of-life e-rickshaws.', intro:'List e-rickshaw scrapping requirements and make vehicles and recoverable components visible to the wider recovery ecosystem.', category:'e-rickshaw-scrap', examples:['End-of-life e-rickshaws','Fleet retirement','Battery-containing vehicles','Motors & controllers','Vehicle frames','Mixed components'] }
}

function Arrow(){ return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function Check(){ return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 10 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> }

function PublicHeader(){
  return <header className="sv-nav"><div className="sv-container sv-nav-inner"><Link className="sv-brand" to="/">REWAY<span>.</span></Link><nav><Link to="/">Home</Link><Link className="active" to="/services">Services</Link><Link to="/marketplace">Marketplace</Link></nav><Link className="sv-nav-cta" to="/marketplace/sell">Sell waste <Arrow/></Link></div></header>
}

export function Services(){
  return <div className="sv-site"><PublicHeader/><main>
    <section className="sv-hero"><div className="sv-container sv-hero-grid"><div className="sv-hero-copy"><div className="sv-kicker"><span/> OUR SERVICES</div><h1>One platform for the <em>next life</em> of materials.</h1><p>Purpose-built digital pathways for high-value waste streams — from electronics and batteries to end-of-life vehicles.</p><div className="sv-hero-actions"><Link className="sv-btn sv-btn-primary" to="/marketplace/sell">Sell waste <Arrow/></Link><Link className="sv-btn sv-btn-secondary" to="/marketplace/buy">Browse marketplace</Link></div></div><div className="sv-hero-stat"><span>04</span><p>material streams<br/>and growing</p><div className="sv-orbit"><i/><i/><i/></div></div></div></section>

    <section className="sv-services"><div className="sv-container"><div className="sv-section-intro"><div><div className="sv-kicker"><span/> MATERIAL STREAMS</div><h2>Choose what you want to move.</h2></div><p>Each service leads into the same transparent marketplace workflow, tailored to the material you are handling.</p></div><div className="sv-service-list">{services.map(s=><article className="sv-service-row" key={s.slug}><div className="sv-service-number">{s.number}</div><div className="sv-service-name"><span>{s.short}</span><h3>{s.title}</h3></div><p className="sv-service-desc">{s.description}</p><div className="sv-service-links"><Link to={`${s.slug}`}>Explore <Arrow/></Link><Link to={`/marketplace/sell?category=${s.category}`}>Sell <Arrow/></Link></div></article>)}</div></div></section>

    <section className="sv-flow"><div className="sv-container"><div className="sv-flow-card"><div><div className="sv-kicker light"><span/> HOW REWAY WORKS</div><h2>From waste to opportunity,<br/>without the friction.</h2></div><div className="sv-flow-steps">{[['01','List','Add material, quantity, images and pickup details.'],['02','Discover','Your listing becomes visible to relevant marketplace participants.'],['03','Quote','Compare quotations submitted against your listing.'],['04','Move','Accept an offer and coordinate the next step.']].map(x=><div className="sv-flow-step" key={x[0]}><span>{x[0]}</span><div><h3>{x[1]}</h3><p>{x[2]}</p></div></div>)}</div></div></div></section>

    <section className="sv-bottom"><div className="sv-container sv-bottom-inner"><div><span>REWAY MARKETPLACE</span><h2>Have material to move?</h2><p>Create a structured listing and bring it into the marketplace.</p></div><div><Link className="sv-btn sv-btn-primary" to="/marketplace/sell">Create a listing <Arrow/></Link><Link className="sv-text-link" to="/marketplace/buy">Looking to buy? Browse listings <Arrow/></Link></div></div></section>
  </main></div>
}

export function ServicePage({type}){
  const s=serviceContent[type]; if(!s)return null
  return <div className="sv-site"><PublicHeader/><main>
    <section className="sv-detail-hero"><div className="sv-container"><div className="sv-breadcrumb"><Link to="/services">Services</Link><span>/</span><b>{s.eyebrow}</b></div><div className="sv-detail-grid"><div><div className="sv-kicker"><span/> {s.eyebrow}</div><h1>{s.title}</h1><p>{s.intro}</p><div className="sv-hero-actions"><Link className="sv-btn sv-btn-primary" to={`/marketplace/sell?category=${s.category}`}>Sell this material <Arrow/></Link><Link className="sv-btn sv-btn-secondary" to={`/marketplace/buy?category=${s.category}`}>Browse listings</Link></div></div><div className="sv-detail-panel"><span>MARKETPLACE PATHWAY</span><strong>{s.eyebrow}</strong><p>Structured listing<br/>→ marketplace discovery<br/>→ quotation<br/>→ next step</p><i>REWAY / CIRCULAR MARKETPLACE</i></div></div></div></section>

    <section className="sv-examples"><div className="sv-container"><div className="sv-section-intro"><div><div className="sv-kicker"><span/> WHAT YOU CAN LIST</div><h2>Built around the material stream.</h2></div><p>Use these as a starting point. Your listing can include multiple item types, quantities and supporting images.</p></div><div className="sv-example-grid">{s.examples.map((x,i)=><div className="sv-example" key={x}><span>{String(i+1).padStart(2,'0')}</span><div className="sv-check"><Check/></div><h3>{x}</h3></div>)}</div></div></section>

    <section className="sv-detail-process"><div className="sv-container"><div className="sv-kicker"><span/> SIMPLE BY DESIGN</div><div className="sv-process-grid"><div><h2>Four steps.<br/>One clear workflow.</h2><p>Reway keeps the process structured from the first listing to the accepted quotation.</p></div><div className="sv-process-list">{[['01','Describe the material','Add category, item details, quantity, condition and images.'],['02','Set pickup context','Share location and preferred pickup timing.'],['03','Receive quotations','Relevant marketplace participants can evaluate and quote.'],['04','Choose the next step','Review the opportunity and proceed with the quotation you accept.']].map(x=><div key={x[0]}><span>{x[0]}</span><div><h3>{x[1]}</h3><p>{x[2]}</p></div></div>)}</div></div></div></section>

    <section className="sv-bottom"><div className="sv-container sv-bottom-inner"><div><span>{s.eyebrow}</span><h2>Ready to get started?</h2><p>Choose the side of the marketplace that fits what you need today.</p></div><div><Link className="sv-btn sv-btn-primary" to={`/marketplace/sell?category=${s.category}`}>Sell {s.eyebrow.toLowerCase()} <Arrow/></Link><Link className="sv-text-link" to={`/marketplace/buy?category=${s.category}`}>Browse available listings <Arrow/></Link></div></div></section>
  </main></div>
}
