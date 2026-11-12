(function(root){
const L=typeof module==='object'&&module.exports?require('./leagues.js'):root.TouchlineLeagues;
const num=x=>Number(typeof x==='object'?x?.value??x?.displayValue:x),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function normalize(e,leagueId){const c=e.competitions?.[0];if(!c)return null;const h=c.competitors?.find(x=>x.homeAway==='home'),a=c.competitors?.find(x=>x.homeAway==='away');if(!h||!a)return null;const status=c.status?.type||e.status?.type||{};return {leagueId:leagueId||e.leagueId||'eng.1',id:String(e.id),date:e.date||c.date,season:e.season?.year,home:{id:h.id,name:h.team.displayName},away:{id:a.id,name:a.team.displayName},hs:num(h.score),as:num(a.score),ht:h.linescores?.length===2&&a.linescores?.length===2?[num(h.linescores[0]),num(a.linescores[0])]:null,state:status.name,done:status.name==='STATUS_FULL_TIME',venue:c.venue?.fullName||''};}
function predict(g,history,now=Date.now()){
 if(g.state!=='STATUS_SCHEDULED'||Date.parse(g.date)<=now)return null;
 const leagueId=g.leagueId||'eng.1',cfg=L.leagues[leagueId];if(!cfg)return null;
 const cut=Math.min(now,Date.parse(g.date)),past=history.filter(x=>(x.leagueId||'eng.1')===leagueId&&x.id!==g.id&&x.done&&Date.parse(x.date)<cut&&x.season>=g.season-1&&Number.isFinite(x.hs)&&Number.isFinite(x.as));
 const lh=past.length?past.reduce((s,x)=>s+x.hs,0)/past.length:1.5,la=past.length?past.reduce((s,x)=>s+x.as,0)/past.length:1.2,mean=(lh+la)/2;
 function form(id,home){const games=past.filter(x=>x.home.id===id||x.away.id===id).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,12);let w=4,gf=4*mean,ga=4*mean;games.forEach((x,i)=>{let own=x.home.id===id,weight=.88**i*(own===home?1.3:.8);w+=weight;gf+=weight*(own?x.hs:x.as);ga+=weight*(own?x.as:x.hs)});return {attack:gf/w,defence:ga/w,n:games.length,ids:games.map(x=>x.id)}}
 const h=form(g.home.id,true),a=form(g.away.id,false);if(h.n<4||a.n<4)return null;
 let hg=(h.attack+a.defence)/2+Math.max(0,lh-la)/2,ag=(a.attack+h.defence)/2-Math.max(0,lh-la)/2;
 const hh=past.filter(x=>[x.home.id,x.away.id].includes(g.home.id)&&[x.home.id,x.away.id].includes(g.away.id));const hw=.1*hh.length/(hh.length+4);
 if(hh.length){hg=hg*(1-hw)+hw*hh.reduce((s,x)=>s+(x.home.id===g.home.id?x.hs:x.as),0)/hh.length;ag=ag*(1-hw)+hw*hh.reduce((s,x)=>s+(x.home.id===g.away.id?x.hs:x.as),0)/hh.length;}
 // Custom two-strategy replicator: attack vs contain. Proxies are goals, not observed tactics.
 let p=clamp(h.attack/(h.attack+h.defence||1),.2,.8),q=clamp(a.attack/(a.attack+a.defence||1),.2,.8);
 for(let i=0;i<12;i++){const ph=p,qa=q;p=clamp(ph+.08*ph*(1-ph)*((h.attack-a.defence)*qa+(h.attack-mean)*(1-qa)),.1,.9);q=clamp(qa+.08*qa*(1-qa)*((a.attack-h.defence)*ph+(a.attack-mean)*(1-ph)),.1,.9)}
 const shift=clamp((p-q)*.3,-.15,.15);hg=clamp(hg+shift,.15,4.5);ag=clamp(ag-shift,.15,4.5);
 const context=L.context(g),contextGames=context.kind?past.filter(x=>L.context(x).kind===context.kind):[];
 // Learn a small total-goal residual for comparable local fixtures within this league.
 // Team scoring means remove a first-order team-strength effect. Sparse groups stay neutral.
 const teamMean=id=>{const xs=past.filter(x=>x.home.id===id||x.away.id===id);return xs.length?xs.reduce((s,x)=>s+x.hs+x.as,0)/xs.length:lh+la};
 let contextShift=0;if(contextGames.length>=8){const residual=contextGames.reduce((s,x)=>s+x.hs+x.as-(teamMean(x.home.id)+teamMean(x.away.id))/2,0)/contextGames.length;contextShift=clamp(residual*contextGames.length/(contextGames.length+24),-.3,.3);hg=clamp(hg+contextShift/2,.15,4.5);ag=clamp(ag+contextShift/2,.15,4.5)}
 const halves=past.filter(x=>Array.isArray(x.ht)&&x.ht.length===2&&x.ht.every(Number.isFinite)&&x.hs+x.as>0);const full=halves.reduce((s,x)=>s+x.hs+x.as,0),first=halves.reduce((s,x)=>s+x.ht[0]+x.ht[1],0);const htShare=clamp((first+20*.45)/(full+20),.3,.6);
 const round=x=>Math.round(x*100)/100;const goals=[round(hg),round(ag)],score=goals.map(Math.round);
 return {version:cfg.version,leagueId,profile:{leagueGames:past.length,homeMean:round(lh),awayMean:round(la),htShare:round(htShare),halfSamples:halves.length},context:{...context,samples:contextGames.length,totalAdjustment:round(contextShift),experimental:true},createdAt:new Date(now).toISOString(),goals,score,ht:goals.map(x=>round(x*htShare)),second:goals.map(x=>round(x*(1-htShare))),margin:round(hg-ag),total:round(hg+ag),sample:[h.n,a.n],historyIds:[...new Set([...h.ids,...a.ids,...hh.map(x=>x.id),...past.map(x=>x.id)])],h2h:hh.length,shift:round(shift)};
}
function settle(value,line){const parts=Math.abs(line*4)%2===1?[line-.25,line+.25]:[line];return parts.reduce((s,x)=>s+Math.sign(value+x),0)/parts.length}
const api={normalize,predict,settle};if(typeof module!=='undefined')module.exports=api;else root.EPLModel=api;
})(typeof window!=='undefined'?window:globalThis);
