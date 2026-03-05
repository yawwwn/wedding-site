function renderLuckyDraw(data, showMissing=false){
  const total=guests.length||'?';
  document.getElementById('luckyDrawSummary').textContent=
    showMissing
      ? `${data.length} not yet collected / ${total} total`
      : `${data.length} collected / ${total} total`;
  if(!data.length){
    document.getElementById('luckyDrawList').innerHTML=`<p style="color:var(--text-dim);font-style:italic;font-size:.82rem;">${showMissing?'Everyone has collected! 🎉':'No collections yet.'}</p>`;
    return;
  }
  let html=`<table class="preview-table" style="width:100%;"><thead><tr>
    <th>#</th><th>Name</th><th>Table</th><th>${showMissing?'Status':'Collected At'}</th>
  </tr></thead><tbody>`;
  data.forEach((c,i)=>{
    const time=c.collected_at
      ? new Date(c.collected_at).toLocaleString('en-SG',{dateStyle:'short',timeStyle:'short'})
      : '—';
    const badge=showMissing
      ? `<span style="font-size:.7rem;padding:2px 8px;border-radius:2px;background:rgba(229,115,115,.15);color:#e57373;border:1px solid rgba(229,115,115,.3);">Not collected</span>`
      : `<span style="font-size:.7rem;">${escHtml(time)}</span>`;
    html+=`<tr>
      <td style="color:var(--text-dim);width:36px;">${i+1}</td>
      <td><strong style="color:var(--text)">${escHtml(c.name)}</strong></td>
      <td><span style="background:#4a9e9e;color:#fff;padding:2px 8px;border-radius:2px;font-size:.7rem;">Table ${escHtml(c.table_no)}</span></td>
      <td>${badge}</td>
    </tr>`;
  });
  html+='</tbody></table>';
  document.getElementById('luckyDrawList').innerHTML=html;
}
