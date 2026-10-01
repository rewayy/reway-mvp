import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Empty } from './Dashboard'

export const wasteCategories = [
  { key:'e-waste', db:'E_WASTE', label:'E-Waste', icon:'EW', description:'Electronics, IT equipment, PCBs and mixed electronics.' },
  { key:'battery-waste', db:'BATTERY_WASTE', label:'Battery Waste', icon:'BW', description:'Lithium-ion and other end-of-life battery streams.' },
  { key:'car-scrap', db:'CAR_SCRAP', label:'Car Scrap', icon:'CS', description:'End-of-life cars and vehicle scrapping requirements.' },
  { key:'e-rickshaw-scrap', db:'E_RICKSHAW_SCRAP', label:'E-Rickshaw Scrap', icon:'ER', description:'E-rickshaws, batteries and related end-of-life components.' },
]

export function categoryKey(value='') {
  const v=value.toLowerCase().replaceAll('_',' ').trim()
  if(v.includes('rickshaw')) return 'e-rickshaw-scrap'
  if(v.includes('car')||v.includes('vehicle')) return 'car-scrap'
  if(v.includes('battery')||v.includes('lithium')) return 'battery-waste'
  return 'e-waste'
}
const categoryFromKey=(key)=>wasteCategories.find(x=>x.key===key)

function PublicMarketplaceHeader(){
 const {profile}=useAuth()
 return <div className="marketplace-public-head"><Link className="marketplace-logo" to="/">REWAY</Link><div><Link to="/services">Our Services</Link><Link to="/marketplace">Marketplace</Link><Link to="/">Home</Link>{profile?<Link to={profile.role==='recycler'?'/orders':'/dashboard'}>My Account</Link>:<Link to="/login">Login</Link>}</div></div>
}

export function Marketplace(){
 return <div className="marketplace-public"><PublicMarketplaceHeader/><div className="marketplace-public-body"><div className="welcome-row"><div><span className="eyebrow">REWAY MARKETPLACE</span><h2>What would you like to do?</h2><p>Buy recoverable material from published listings or list waste for buyers and recyclers to quote on.</p></div></div><div className="market-action-grid"><Link className="market-action-card" to="/marketplace/buy"><span>BUY</span><h3>Buy waste</h3><p>Choose a waste category, browse available material and submit a quotation.</p><strong>Browse marketplace →</strong></Link><Link className="market-action-card" to="/marketplace/sell"><span>SELL</span><h3>Sell waste</h3><p>Choose a category, describe your waste, add items and images, and publish a listing.</p><strong>Create listing →</strong></Link></div></div></div>
}

export function BuyMarketplace(){
 const [searchParams,setSearchParams]=useSearchParams(); const initial=searchParams.get('category')||''; const [category,setCategory]=useState(categoryFromKey(initial)?initial:''); const [rows,setRows]=useState([]); const [search,setSearch]=useState(''); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
 useEffect(()=>{async function load(){if(!supabase){setLoading(false);return}const {data,error}=await supabase.from('listings').select('*').eq('status','PUBLISHED').order('created_at',{ascending:false});if(error)setError(error.message);setRows(data||[]);setLoading(false)}load()},[])
 function chooseCategory(key){setCategory(key);const next=new URLSearchParams(searchParams);if(key)next.set('category',key);else next.delete('category');setSearchParams(next,{replace:true})}
 const filtered=useMemo(()=>rows.filter(x=>(!category||categoryKey(`${x.category} ${x.material_type}`)===category)&&`${x.title} ${x.category} ${x.material_type} ${x.location} ${x.description||''}`.toLowerCase().includes(search.toLowerCase())),[rows,category,search])
 const selected=categoryFromKey(category)
 return <div className="marketplace-public"><PublicMarketplaceHeader/><div className="marketplace-public-body"><div className="welcome-row"><div><span className="eyebrow">BUY WASTE</span><h2>{selected?selected.label:'Choose a waste category'}</h2><p>{selected?`Browse published ${selected.label.toLowerCase()} listings.`:'What type of waste or recoverable material are you looking for?'}</p></div>{category&&<button className="secondary-btn" onClick={()=>chooseCategory('')}>← Change category</button>}</div>{!category?<CategoryGrid action="Browse" onChoose={chooseCategory}/>:<><div className="marketplace-filter-row"><div className="search-bar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${selected.label}, material or location…`}/></div><select value={category} onChange={e=>chooseCategory(e.target.value)}>{wasteCategories.map(x=><option key={x.key} value={x.key}>{x.label}</option>)}</select></div>{error&&<div className="error-box">{error}</div>}{loading?<div className="loading-box">Loading marketplace…</div>:filtered.length===0?<div className="panel"><Empty text={`No published ${selected.label.toLowerCase()} listings match your search.`}/></div>:<div className="listing-grid">{filtered.map(x=><ListingCard key={x.id} item={x}/>)}</div>}</>}</div></div>
}

export function SellMarketplace(){
 const {user,profile}=useAuth(); const [searchParams,setSearchParams]=useSearchParams(); const navigate=useNavigate(); const initial=searchParams.get('category')||''; const selected=categoryFromKey(initial)
 function chooseCategory(key){const next=new URLSearchParams(searchParams);next.set('category',key);setSearchParams(next,{replace:true})}
 function continueSell(){const target=`/listings/new?category=${selected.key}`; if(!user){navigate('/login',{state:{from:target}});return} if(profile?.role==='recycler'){navigate('/marketplace/buy?category='+selected.key);return} navigate(target)}
 return <div className="marketplace-public"><PublicMarketplaceHeader/><div className="marketplace-public-body"><div className="welcome-row"><div><span className="eyebrow">SELL WASTE</span><h2>{selected?`Sell ${selected.label}`:'Choose a waste category'}</h2><p>{selected?'Continue to add quantity, description, itemized waste, images, pickup and contact details.':'What type of waste would you like to list?'}</p></div>{selected&&<button className="secondary-btn" onClick={()=>{const next=new URLSearchParams(searchParams);next.delete('category');setSearchParams(next,{replace:true})}}>← Change category</button>}</div>{!selected?<CategoryGrid action="Sell" onChoose={chooseCategory}/>:<div className="sell-category-confirm panel"><div className="category-big-icon">{selected.icon}</div><div><span className="eyebrow">SELECTED CATEGORY</span><h3>{selected.label}</h3><p>{selected.description}</p></div><button className="primary-btn" onClick={continueSell}>Continue with {selected.label} →</button></div>}</div></div>
}

function CategoryGrid({action,onChoose}){return <div className="waste-category-grid">{wasteCategories.map(x=><button className="waste-category-card" key={x.key} onClick={()=>onChoose(x.key)}><span>{x.icon}</span><h3>{x.label}</h3><p>{x.description}</p><strong>{action} {x.label} →</strong></button>)}</div>}

export function MyListings(){const {profile}=useAuth();const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);async function load(){if(!supabase||!profile)return;setLoading(true);const {data}=await supabase.from('listings').select('*').eq('seller_id',profile.id).order('created_at',{ascending:false});setRows(data||[]);setLoading(false)}useEffect(()=>{load()},[profile]);return <section className="panel"><div className="panel-head"><div><span className="eyebrow">SELLER</span><h3>My listings</h3></div><Link to="/marketplace/sell" className="primary-btn small-btn">+ List waste</Link></div>{loading?<div className="loading-box">Loading…</div>:rows.length===0?<Empty text="No listings yet."/>:<div className="listing-grid">{rows.map(x=><ListingCard key={x.id} item={x}/>)}</div>}</section>}

function ListingCard({item}){const label=categoryFromKey(categoryKey(`${item.category} ${item.material_type}`))?.label||item.category;return <article className="listing-card"><div className="listing-top"><span className="category-tag">{label}</span><span className="status-pill">{item.status}</span></div><h3>{item.title}</h3><div className="listing-meta"><div><span>Quantity</span><b>{item.quantity} {item.unit}</b></div><div><span>Location</span><b>{item.location}</b></div><div><span>Condition</span><b>{item.condition||'—'}</b></div></div>{item.description&&<p>{item.description.slice(0,120)}{item.description.length>120?'…':''}</p>}<Link to={`/listings/${item.id}`} className="card-link">View listing ↗</Link></article>}

const listingFormConfig = {
  'e-waste': {
    titlePlaceholder: 'e.g. Office IT equipment lot',
    typeLabel: 'Equipment / material type',
    typePlaceholder: 'e.g. Laptops, monitors, servers',
    defaultUnit: 'kg',
    units: ['kg', 'tonnes', 'units'],
    conditions: ['End-of-life', 'Mixed', 'Working', 'Non-working', 'Sorted'],
    breakdownTitle: 'Equipment breakdown',
    itemPlaceholder: 'e.g. Laptops',
    descriptionPlaceholder: 'Add useful details such as equipment mix, approximate age, working condition, packaging and pickup accessibility.'
  },
  'battery-waste': {
    titlePlaceholder: 'e.g. Used lithium-ion battery lot',
    typeLabel: 'Battery type',
    typePlaceholder: 'e.g. Lithium-ion, lead-acid, LFP',
    defaultUnit: 'kg',
    units: ['kg', 'tonnes', 'units'],
    conditions: ['Used', 'End-of-life', 'Damaged', 'Mixed', 'Sorted'],
    breakdownTitle: 'Battery breakdown',
    itemPlaceholder: 'e.g. Lithium-ion battery packs',
    descriptionPlaceholder: 'Add useful details such as battery chemistry, source/application, condition, packaging and any known specifications.'
  },
  'car-scrap': {
    titlePlaceholder: 'e.g. End-of-life passenger car',
    typeLabel: 'Vehicle type',
    typePlaceholder: 'e.g. Hatchback, sedan, SUV',
    defaultUnit: 'units',
    units: ['units', 'kg', 'tonnes'],
    conditions: ['Running', 'Non-running', 'Accident damaged', 'End-of-life', 'Dismantled'],
    breakdownTitle: 'Vehicle / parts breakdown',
    itemPlaceholder: 'e.g. Complete vehicle or engine',
    descriptionPlaceholder: 'Add useful details such as make/model, year, running condition, major damage, completeness and pickup accessibility.'
  },
  'e-rickshaw-scrap': {
    titlePlaceholder: 'e.g. End-of-life e-rickshaw',
    typeLabel: 'Vehicle / component type',
    typePlaceholder: 'e.g. Complete e-rickshaw, battery, motor',
    defaultUnit: 'units',
    units: ['units', 'kg', 'tonnes'],
    conditions: ['Running', 'Non-running', 'Battery issue', 'Damaged', 'End-of-life', 'Dismantled'],
    breakdownTitle: 'Vehicle / component breakdown',
    itemPlaceholder: 'e.g. Complete vehicle or battery pack',
    descriptionPlaceholder: 'Add useful details such as vehicle/component type, battery condition, running condition, completeness and pickup accessibility.'
  }
}

export function NewListing(){
 const {profile}=useAuth(); const navigate=useNavigate(); const [searchParams]=useSearchParams(); const selected=categoryFromKey(searchParams.get('category'))||wasteCategories[0]; const config=listingFormConfig[selected.key]
 const [form,setForm]=useState({title:'',category:selected.db,material_type:'',quantity:'',unit:config.defaultUnit,condition:config.conditions[0],location:'',pickup_date:'',pickup_time:'',description:'',contact_name:profile?.full_name||'',contact_phone:profile?.phone||''}); const [items,setItems]=useState([{item_name:'',quantity:'',unit:config.defaultUnit}]); const [images,setImages]=useState([]); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
 useEffect(()=>{setForm(f=>({...f,category:selected.db,unit:config.units.includes(f.unit)?f.unit:config.defaultUnit,condition:config.conditions.includes(f.condition)?f.condition:config.conditions[0],contact_name:f.contact_name||profile?.full_name||'',contact_phone:f.contact_phone||profile?.phone||''}))},[selected.db,profile?.full_name,profile?.phone])
 const set=(k,v)=>setForm({...form,[k]:v}); const setItem=(i,k,v)=>setItems(items.map((x,n)=>n===i?{...x,[k]:v}:x));
 function addItem(){setItems([...items,{item_name:'',quantity:'',unit:config.defaultUnit}])} function removeItem(i){setItems(items.filter((_,n)=>n!==i))}
 async function submit(e){e.preventDefault();setError('');if(!supabase||!profile){setError('Please sign in as a seller.');return}setBusy(true);const payload={...form,seller_id:profile.id,quantity:Number(form.quantity),pickup_date:form.pickup_date||null,pickup_time:form.pickup_time||null,status:'PUBLISHED'};const {data,error}=await supabase.from('listings').insert(payload).select().single();if(error){setError(error.message);setBusy(false);return}
  const cleanItems=items.filter(x=>x.item_name.trim()).map((x,i)=>({listing_id:data.id,item_name:x.item_name.trim(),quantity:x.quantity?Number(x.quantity):null,unit:x.unit||null})); if(cleanItems.length){const {error:itemError}=await supabase.from('listing_items').insert(cleanItems);if(itemError){setError(`Listing created, but waste items failed: ${itemError.message}`);setBusy(false);return}}
  for(let i=0;i<images.length;i++){const file=images[i];const ext=file.name.split('.').pop();const path=`${profile.id}/${data.id}/${Date.now()}-${i}.${ext}`;const {error:uploadError}=await supabase.storage.from('listing-images').upload(path,file,{upsert:false});if(uploadError){setError(`Listing created, but image upload failed: ${uploadError.message}`);setBusy(false);return}await supabase.from('listing_images').insert({listing_id:data.id,storage_path:path,sort_order:i})}
  await supabase.from('status_events').insert({listing_id:data.id,status:'PUBLISHED',note:'Listing published by seller',created_by:profile.id});setBusy(false);navigate(`/listings/${data.id}`)}
 return <section className="panel form-panel"><div className="panel-head"><div><span className="eyebrow">SELL {selected.label.toUpperCase()}</span><h3>Create listing</h3><p>Add enough detail for buyers and recyclers to understand the material before quoting.</p></div><Link className="secondary-btn" to="/marketplace/sell">Change category</Link></div><form className="data-form" onSubmit={submit}><div className="form-grid"><Field label="Listing title"><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder={config.titlePlaceholder} required/></Field><Field label="Waste category"><input value={selected.label} disabled/></Field><Field label={config.typeLabel}><input value={form.material_type} onChange={e=>set('material_type',e.target.value)} placeholder={config.typePlaceholder} required/></Field><Field label="Overall quantity"><div className="input-pair"><input type="number" min="0.01" step="0.01" value={form.quantity} onChange={e=>set('quantity',e.target.value)} required/><select value={form.unit} onChange={e=>set('unit',e.target.value)}>{config.units.map(u=><option key={u}>{u}</option>)}</select></div></Field><Field label="Condition"><select value={form.condition} onChange={e=>set('condition',e.target.value)}>{config.conditions.map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Pickup location"><input value={form.location} onChange={e=>set('location',e.target.value)} placeholder="e.g. City, State" required/></Field><Field label="Contact name"><input value={form.contact_name} onChange={e=>set('contact_name',e.target.value)} required/></Field><Field label="Phone number"><input type="tel" value={form.contact_phone} onChange={e=>set('contact_phone',e.target.value)} placeholder="+91 98XXXXXXXX" required/></Field><Field label="Preferred pickup date"><input type="date" value={form.pickup_date} onChange={e=>set('pickup_date',e.target.value)}/></Field><Field label="Preferred pickup time"><input type="time" value={form.pickup_time} onChange={e=>set('pickup_time',e.target.value)}/></Field></div><Field label="Description"><textarea rows="5" value={form.description} onChange={e=>set('description',e.target.value)} placeholder={config.descriptionPlaceholder}/></Field><div className="subform-block"><div className="subform-head"><div><span className="eyebrow">OPTIONAL BREAKDOWN</span><h4>{config.breakdownTitle}</h4></div><button type="button" className="secondary-btn small-btn" onClick={addItem}>+ Add item</button></div>{items.map((x,i)=><div className="waste-item-row" key={i}><input value={x.item_name} onChange={e=>setItem(i,'item_name',e.target.value)} placeholder={config.itemPlaceholder}/><input type="number" min="0" step="0.01" value={x.quantity} onChange={e=>setItem(i,'quantity',e.target.value)} placeholder="Qty"/><select value={x.unit} onChange={e=>setItem(i,'unit',e.target.value)}>{config.units.map(u=><option key={u}>{u}</option>)}</select>{items.length>1&&<button type="button" className="remove-item" onClick={()=>removeItem(i)}>×</button>}</div>)}</div><div className="subform-block"><span className="eyebrow">IMAGES</span><h4>Waste photos</h4><p className="form-help">Upload up to 6 JPG, PNG or WebP images. Maximum 5 MB each.</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>setImages(Array.from(e.target.files||[]).slice(0,6))}/>{images.length>0&&<div className="selected-files">{images.map((f,i)=><span key={i}>{f.name}</span>)}</div>}</div>{error&&<div className="error-box">{error}</div>}<div className="form-actions"><button type="button" className="secondary-btn" onClick={()=>navigate('/marketplace/sell')}>Cancel</button><button className="primary-btn" disabled={busy}>{busy?'Publishing…':'Publish listing'}</button></div></form></section>
}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
