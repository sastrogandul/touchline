(function(root){
const aliases={'Bournemouth':'AFC Bournemouth','Brighton':'Brighton & Hove Albion','Leeds':'Leeds United','Man City':'Manchester City','Man Utd':'Manchester United','Newcastle':'Newcastle United',"Nott'm Forest":'Nottingham Forest','Spurs':'Tottenham Hotspur'};
const pair=(season,h,a)=>`${season}:${h}:${a}`;
function merge(previous,bootstrap,fixtures,standings,season){
 const teams=new Map(bootstrap.teams.map(t=>[t.id,standings.find(e=>e.team.displayName===(aliases[t.name]||t.name))?.team.id]));
 if(teams.size!==20||[...teams.values()].some(x=>!x))throw Error('Tim FPL belum cocok dengan musim klasemen');
 const dated=fixtures.filter(f=>f.kickoff_time).map(f=>Date.parse(f.kickoff_time));const start=Date.UTC(season,5,1),end=Date.UTC(season+1,5,1);
 if(!dated.length||dated.some(d=>!Number.isFinite(d)||d<start||d>=end))throw Error('Musim FPL berbeda dari klasemen');
 const result={...previous};for(const f of fixtures){const h=teams.get(f.team_h),a=teams.get(f.team_a),k=pair(season,h,a),old=result[k];const week=old?.week??(Number.isInteger(f.event)&&f.event>=1&&f.event<=38?f.event:null);result[k]={season,home:h,away:a,week,currentWeek:f.event,fixtureId:f.id,date:f.kickoff_time,originalDate:old?.originalDate||f.kickoff_time,source:'FPL',...old,date:f.kickoff_time,currentWeek:f.event};if(result[k].week===null&&week!==null)result[k].week=week}return result;
}
function info(state,g){return state.matchweeks?.[pair(g.season,g.home.id,g.away.id)]||null}
function belongs(state,g,week){return g.season===state.season&&(week==='all'||(week==='upcoming'?(!g.done&&Date.parse(g.date)>Date.now()&&Date.parse(g.date)<=Date.now()+14*86400000):(info(state,g)?.week??'unknown')==week))}
const api={pair,merge,info,belongs};if(typeof module!=='undefined')module.exports=api;else root.Matchweeks=api;
})(typeof window!=='undefined'?window:globalThis);
