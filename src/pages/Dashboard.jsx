import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function Dashboard(){
 const {profile}=useAuth(); const [stats,setStats]=useState({listings:0,quotes:0,orders:0,completed:0}); const [recent,setRecent]=useState([])
 useEffect(()=>{ if(!supabase||!profile)return; async function load(){
   if(profile.role==='seller'){
     const [{count:l},{count:o}]=await Promise.all([supabase.from('listings').select('*',{count:'exact',head:true}).eq('seller_id',profile.id),supabase.from('orders').select('*',{count:'exact',head:true}).eq('seller_id',profile.id)])
     const {data}=await supabase.from('listings').select('id,title,quantity,unit,location,status,created_at').eq('seller_id',profile.id).order('created_at',{ascending:false}).limit(5)
     setStats({listings:l||0,quotes:0,orders:o||0,completed:0}); setRecent(data||[])
   } else {
     const [{count:q},{count:o}]=await Promise.all([supabase.from('quotes').select('*',{count:'exact',head:true}).eq('recycler_id',profile.id),supabase.from('orders').select('*',{count:'exact',head:true}).eq('recycler_id',profile.id)])
     const {data}=await supabase.from('quotes').select('id,price_per_unit,status,created_at,listing:listings(title,quantity,unit,location)').eq('recycler_id',profile.id).order('created_at',{ascending:false}).limit(5)
     setStats({listings:0,quotes:q||0,orders:o||0,completed:0}); setRecent(data||[])
   }
 } load()},[profile])
 const seller=profile?.role==='seller'
 return <>
  <div className="welcome-row"><div><span className="eyebrow">OVERVIEW</span><h2>Good to see you, {profile?.full_name?.split(' ')[0]||'there'}.</h2><p>{seller?'List material, review recycler quotes and manage your transactions.':'Discover available e-waste and manage your quotations and orders.'}</p></div>{seller&&<Link to="/listings/new" className="primary-btn inline">+ List e-waste</Link>}</div>
  <div className="stat-grid"><Stat label={seller?'Active listings':'Quotes submitted'} value={seller?stats.listings:stats.quotes}/><Stat label="Active orders" value={stats.orders}/><Stat label="Completed" value={stats.completed}/><Stat label="Account status" value="Active" text/></div>
  <section className="panel"><div className="panel-head"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>{seller?'Your listings':'Your quotes'}</h3></div>{seller&&<Link to="/my-listings">View all ↗</Link>}</div>{recent.length===0?<Empty text={seller?'No listings yet. Create your first e-waste listing.':'No quotes yet. Browse the marketplace to find material.'}/>:<div className="table-wrap"><table><thead><tr><th>{seller?'Material':'Listing'}</th><th>{seller?'Quantity':'Quote'}</th><th>{seller?'Location':'Status'}</th><th>Status</th></tr></thead><tbody>{recent.map(r=><tr key={r.id}><td><b>{seller?r.title:r.listing?.title}</b></td><td>{seller?`${r.quantity} ${r.unit||''}`:`₹${r.price_per_unit}/unit`}</td><td>{seller?r.location:'—'}</td><td><span className="status-pill">{r.status}</span></td></tr>)}</tbody></table></div>}</section>
 </>
}
function Stat({label,value,text}){return <div className="stat-card"><span>{label}</span><strong className={text?'text-stat':''}>{value}</strong></div>}
export function Empty({text}){return <div className="empty"><div>◫</div><p>{text}</p></div>}
