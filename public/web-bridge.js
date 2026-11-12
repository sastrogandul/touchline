(()=>{'use strict';
const keys=new Set(['touchline-state-v1','touchline-state-esp.1-v1','touchline-state-ger.1-v1']);
window.TouchlineNative={
 async saveState(key,value){if(!keys.has(key)||typeof value!=='string'||!JSON.parse(value)?.games)throw Error('Data penyimpanan tidak valid');try{localStorage.setItem(key,value)}catch{throw Error('Penyimpanan browser penuh atau diblokir. Ekspor cadangan; jangan hapus data situs.')}},
 async export(text){const blob=new Blob([text],{type:'application/json'}),data=JSON.parse(text),name='touchline-'+(data.leagueId||'eng.1')+'-'+new Date().toISOString().slice(0,10)+'.json';const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)},
 flush:async()=>{}
};
document.addEventListener('DOMContentLoaded',()=>{const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;document.body.append(input);document.getElementById('importWeb').onclick=()=>{input.value='';input.click()};input.onchange=async()=>{const file=input.files?.[0];if(!file)return;try{if(file.size>20*1024*1024)throw Error('Berkas terlalu besar (maksimal 20 MB)');await window.TouchlineJournal.importData(JSON.parse(await file.text()))}catch(e){const message='Impor gagal: '+e.message;document.getElementById('desktopStatus').textContent=message;const n=document.getElementById('actionStatus');n.textContent=message;n.hidden=false}}});
})();
