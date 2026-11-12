(function(root){
const quarter=x=>Math.round(Number(x)*4)/4;
function project(p){const goals=p.goals.map(quarter),ht=p.ht.map((x,i)=>Math.min(goals[i],quarter(x)));return {...p,goals,ht,second:goals.map((x,i)=>x-ht[i]),total:goals[0]+goals[1],margin:goals[0]-goals[1]}}
const recommended=gap=>Math.abs(gap)>.5;
// User-defined score-scenario heuristic, not a probability or expected-return estimate.
function handicapDirection(margin,line){if(!Number.isFinite(margin)||!Number.isFinite(line))return null;const modelLine=-margin,scenario=x=>Math.sign(x)*Math.floor(Math.abs(x)+.5),modelScenario=scenario(margin);if(line===0)return{side:Math.sign(modelScenario),label:'level',modelLine,modelScenario,marketScenario:0,reason:modelScenario===0?'Model condong imbang; tidak ada pilihan sisi.':'Bursa tanpa unggulan; ikuti arah kemenangan model.'};const favorite=-Math.sign(line),marketScenario=Math.floor(Math.abs(line)+.5),towardFavorite=modelScenario*favorite;let upper=towardFavorite>0&&towardFavorite>=marketScenario;return{side:upper?favorite:-favorite,label:upper?'upper':'lower',modelLine,modelScenario,marketScenario,reason:upper?(towardFavorite===marketScenario?'Skenario kemenangan sejalan dengan tim atas.':'Model lebih kuat mendukung kemenangan tim atas.'):(modelScenario===0?'Model condong imbang; dukungan ke tim bawah.':'Skenario model tidak mencapai keunggulan tim atas; dukungan ke tim bawah.')}}
function recommendation(p,m){return{version:'direction-v2',handicapSide:handicapDirection(p.margin,m.handicap)?.side??0,totalSide:Number.isFinite(m.total)?Math.sign(p.total-m.total):0}}
const api={quarter,project,recommended,handicapDirection,recommendation};if(typeof module!=='undefined')module.exports=api;else root.PredictionLines=api;
})(typeof window!=='undefined'?window:globalThis);
