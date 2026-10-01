import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Empty } from './Dashboard'

const wasteCategories = [
  { key: 'e-waste', label: 'E-Waste', icon: 'EW', description: 'Electronics, IT equipment, PCBs and mixed electronics.' },
  { key: 'battery-waste', label: 'Battery Waste', icon: 'BW', description: 'Lithium-ion and other end-of-life battery streams.' },
  { key: 'car-scrap', label: 'Car Scrap', icon: 'CS', description: 'End-of-life cars and vehicle scrapping requirements.' },
  { key: 'e-rickshaw-scrap', label: 'E-Rickshaw Scrap', icon: 'ER', description: 'E-rickshaws and related end-of-life components.' },
]

function listingGroup(item) {
  const value = `${item.category || ''} ${item.material_type || ''}`.toLowerCase()
  if (value.includes('e-rickshaw') || value.includes('rickshaw')) return 'e-rickshaw-scrap'
  if (value.includes('car scrap') || value.includes('vehicle') || value.includes('car scrapping')) return 'car-scrap'
  if (value.includes('battery') || value.includes('lithium')) return 'battery-waste'
  return 'e-waste'
}

export function MyListings(){
 const {profile}=useAuth(); const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true)
 async function load(){ if(!supabase||!profile)return; setLoading(true); const {data}=await supabase.from('listings').select('*').eq('seller_id',profile.id).order('created_at',{ascending:false}); setRows(data||[]); setLoading(false)}
 useEffect(()=>{load()},[profile])
 return <section className="panel"><div className="panel-head"><div><span className="eyebrow">SELLER</span><h3>My listings</h3></div><Link to="/listings/new" className="primary-btn small-btn">+ List waste</Link></div>{loading?<div className="loading-box">Loading…</div>:rows.length===0?<Empty text="No listings yet."/>:<div className="listing-grid">{rows.map(x=><ListingCard key={x.id} item={x}/>)}</div>}</section>
}

export function Marketplace(){
 const {profile}=useAuth(); const [searchParams,setSearchParams]=useSearchParams(); const initial=searchParams.get('category') || ''; const [category,setCategory]=useState(wasteCategories.some(x=>x.key===initial)?initial:''); const [rows,setRows]=useState([]); const [search,setSearch]=useState(''); const [loading,setLoading]=useState(true)
 useEffect(()=>{async function load(){if(!supabase){setLoading(false);return} const {data}=await supabase.from('listings').select('*,seller:profiles(full_name,company_name)').eq('status','PUBLISHED').order('created_at',{ascending:false}); setRows(data||[]);setLoading(false)} load()},[])
 function chooseCategory(key){setCategory(key); const next=new URLSearchParams(searchParams); if(key)next.set('category',key);else next.delete('category'); setSearchParams(next,{replace:true})}
 const filtered=useMemo(()=>rows.filter(x=>{const matchesCategory=!category||listingGroup(x)===category;const matchesSearch=`${x.title} ${x.category} ${x.material_type} ${x.location}`.toLowerCase().includes(search.toLowerCase());return matchesCategory&&matchesSearch}),[rows,category,search])
 const selected=wasteCategories.find(x=>x.key===category)
 return <div className="marketplace-public"><div className="marketplace-public-head"><Link className="marketplace-logo" to="/">REWAY</Link><div><Link to="/services">Our Services</Link><Link to="/">Home</Link>{profile?<Link to={profile.role==='recycler'?'/orders':'/dashboard'}>My Account</Link>:<Link to="/login">Login</Link>}</div></div><div className="marketplace-public-body"><div className="welcome-row"><div><span className="eyebrow">MARKETPLACE</span><h2>{selected ? selected.label : 'Choose a waste category'}</h2><p>{selected ? `Browse published ${selected.label.toLowerCase()} listings.` : 'Start by selecting the type of material you want to explore.'}</p></div>{category&&<button className="secondary-btn" onClick={()=>chooseCategory('')}>← All categories</button>}</div>
 {!category ? <div className="waste-category-grid">{wasteCategories.map(x=><button className="waste-category-card" key={x.key} onClick={()=>chooseCategory(x.key)}><span>{x.icon}</span><h3>{x.label}</h3><p>{x.description}</p><strong>Browse listings →</strong></button>)}</div> : <><div className="marketplace-filter-row"><div className="search-bar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${selected?.label || 'marketplace'}, material or location…`}/></div><select value={category} onChange={e=>chooseCategory(e.target.value)}>{wasteCategories.map(x=><option key={x.key} value={x.key}>{x.label}</option>)}</select></div>{loading?<div className="loading-box">Loading marketplace…</div>:filtered.length===0?<div className="panel"><Empty text={`No published ${selected?.label.toLowerCase() || ''} listings match your search.`}/></div>:<div className="listing-grid">{filtered.map(x=><ListingCard key={x.id} item={x} recycler={profile?.role==='recycler'}/>)}</div>}</>}
 </div></div>
}

function ListingCard({item}){return <article className="listing-card"><div className="listing-top"><span className="category-tag">{item.category||'E-Waste'}</span><span className="status-pill">{item.status}</span></div><h3>{item.title}</h3><div className="listing-meta"><div><span>Quantity</span><b>{item.quantity} {item.unit}</b></div><div><span>Location</span><b>{item.location}</b></div><div><span>Condition</span><b>{item.condition||'—'}</b></div></div>{item.description&&<p>{item.description.slice(0,120)}{item.description.length>120?'…':''}</p>}<Link to={`/listings/${item.id}`} className="card-link">View listing ↗</Link></article>}

export function NewListing(){
 const {profile}=useAuth(); const navigate=useNavigate(); const [form,setForm]=useState({title:'',category:'E-Waste',material_type:'',quantity:'',unit:'kg',condition:'End-of-life',location:'',pickup_date:'',pickup_time:'',description:''}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
 const set=(k,v)=>setForm({...form,[k]:v})
 async function submit(e){e.preventDefault();setError('');if(!supabase){setError('Configure Supabase first.');return}setBusy(true);const payload={...form,seller_id:profile.id,quantity:Number(form.quantity),status:'PUBLISHED'};const {data,error}=await supabase.from('listings').insert(payload).select().single();if(error){setError(error.message);setBusy(false);return}await supabase.from('status_events').insert({listing_id:data.id,status:'PUBLISHED',note:'Listing published by seller'});setBusy(false);navigate(`/listings/${data.id}`)}
 return <section className="panel form-panel"><div className="panel-head"><div><span className="eyebrow">SELLER</span><h3>List waste</h3><p>Create a marketplace listing for relevant buyers and recyclers to discover and quote on.</p></div></div><form className="data-form" onSubmit={submit}><div className="form-grid"><Field label="Listing title"><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Corporate laptop lot" required/></Field><Field label="Waste category"><select value={form.category} onChange={e=>set('category',e.target.value)}><option>E-Waste</option><option>Battery Waste</option><option>Car Scrap</option><option>E-Rickshaw Scrap</option></select></Field><Field label="Material / asset type"><input value={form.material_type} onChange={e=>set('material_type',e.target.value)} placeholder="e.g. End-of-life laptops" required/></Field><Field label="Quantity"><div className="input-pair"><input type="number" min="0.01" step="0.01" value={form.quantity} onChange={e=>set('quantity',e.target.value)} required/><select value={form.unit} onChange={e=>set('unit',e.target.value)}><option>kg</option><option>tonnes</option><option>units</option></select></div></Field><Field label="Condition"><select value={form.condition} onChange={e=>set('condition',e.target.value)}><option>End-of-life</option><option>Mixed</option><option>Working</option><option>Non-working</option><option>Sorted</option></select></Field><Field label="Pickup location"><input value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Noida, Uttar Pradesh" required/></Field><Field label="Preferred pickup date"><input type="date" value={form.pickup_date} onChange={e=>set('pickup_date',e.target.value)}/></Field><Field label="Preferred pickup time"><input type="time" value={form.pickup_time} onChange={e=>set('pickup_time',e.target.value)}/></Field></div><Field label="Description"><textarea rows="5" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe the material, approximate composition, packaging, pickup context, etc."/></Field>{error&&<div className="error-box">{error}</div>}<div className="form-actions"><button type="button" className="secondary-btn" onClick={()=>navigate('/my-listings')}>Cancel</button><button className="primary-btn" disabled={busy}>{busy?'Publishing…':'Publish listing'}</button></div></form></section>
}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
