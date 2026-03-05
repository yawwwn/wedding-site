function restoreLuckyDrawState(){
  if(!activeGuest) return;
  const name=activeGuest.name||activeGuest.alias||Object.values(activeGuest)[0];
  const btn=document.getElementById('luckyDrawBtn');
  const status=document.getElementById('luckyDrawStatus');
  if(!btn) return;
  fetch('/.netlify/functions/luckydraw')
    .then(r=>r.json())
    .then(data=>{
      const collectedNames=new Set((Array.isArray(data)?data:[]).map(c=>c.name.toLowerCase()));
      const isCollected=collectedNames.has(name.toLowerCase());
      if(isCollected){
        btn.textContent='🎟 Collected — tap to undo';
        btn.style.background='#2d7a7a';
        btn.style.borderColor='#2d7a7a';
        btn.style.color='white';
        btn.style.cursor='pointer';
        btn.dataset.done='1';
        status.textContent='Lucky draw ticket collected ✦';
        status.style.color='rgba(74,158,158,.8)';
        localStorage.setItem('luckyDraw_'+name,'1');
      } else {
        btn.textContent='🎟 Collect Lucky Draw';
        btn.style.background='#4a9e9e';
        btn.style.borderColor='#4a9e9e';
        btn.style.color='white';
        btn.style.cursor='pointer';
        delete btn.dataset.done;
        status.textContent='';
        localStorage.removeItem('luckyDraw_'+name);
      }
    })
    .catch(()=>{
      if(localStorage.getItem('luckyDraw_'+name)){
        btn.textContent='🎟 Collected — tap to undo';
        btn.style.background='#2d7a7a';
        btn.style.borderColor='#2d7a7a';
        btn.style.color='white';
        btn.style.cursor='pointer';
        btn.dataset.done='1';
        status.textContent='Lucky draw ticket collected ✦';
        status.style.color='rgba(74,158,158,.8)';
      }
    });
}
