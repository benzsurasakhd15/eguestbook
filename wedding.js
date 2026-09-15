(()=>{
  const $=id=>document.getElementById(id);
  const savedLogo=()=>localStorage.getItem('eguestbookWelcomeLogo')||'';
  function welcome(){
    document.querySelector('.wedding-welcome')?.remove();
    const src=savedLogo()||'wanwan-logo.png';
    const screen=document.createElement('section');
    screen.className='wedding-welcome';
    screen.innerHTML=`<div class="welcome-content"><p class="welcome-kicker">Welcome to our wedding</p><img class="welcome-logo" src="${src}" alt="WANWAN Video Guestbook"><button class="welcome-enter">เริ่มบันทึกคำอวยพร</button><br><button class="welcome-admin">Admin</button></div>`;
    screen.querySelector('.welcome-enter').onclick=async()=>{screen.classList.add('leaving');try{const preview=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'user'},aspectRatio:{ideal:3/4}},audio:true});$('camera').srcObject=preview;window.wanwanPreviewStream=preview;$('status').textContent='กล้องพร้อมแล้ว'}catch(e){$('status').textContent=e.name==='NotAllowedError'?'กรุณาอนุญาตกล้องและไมโครโฟนในเบราว์เซอร์':'ไม่สามารถเปิดกล้องได้'}setTimeout(()=>screen.remove(),550)};
    screen.querySelector('.welcome-admin').onclick=()=>{screen.remove();$('admin').click()};
    document.body.append(screen);
  }
  function addLogoControl(){
    const overlay=$('overlay');if(!overlay||$('welcomeLogo'))return;
    const label=document.createElement('label');label.htmlFor='welcomeLogo';label.textContent='โลโก้บ่าวสาวหน้าเปิดแอป (PNG)';
    const field=document.createElement('input');field.id='welcomeLogo';field.type='file';field.accept='image/png';
    overlay.parentNode.insertBefore(label,overlay.nextSibling);overlay.parentNode.insertBefore(field,label.nextSibling);
    const preview=document.createElement('img');preview.className='logo-preview';preview.alt='ตัวอย่างโลโก้';preview.src=savedLogo()||'wanwan-logo.png';preview.style.display='block';
    overlay.parentNode.insertBefore(preview,field.nextSibling);
    field.onchange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader;reader.onload=()=>{localStorage.setItem('eguestbookWelcomeLogo',reader.result);preview.src=reader.result;welcome()};reader.readAsDataURL(file)};
  }
  async function renameLatestFile(){
    const request=indexedDB.open('eGuestbookMedia',1);request.onsuccess=()=>{const database=request.result;const tx=database.transaction('media','readwrite');const store=tx.objectStore('media');const all=store.getAll();all.onsuccess=()=>{const latest=all.result.sort((a,b)=>b.created-a.created)[0];if(!latest)return;const d=new Date(latest.created);const date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');const time=[String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0'),String(d.getSeconds()).padStart(2,'0')].join('-');latest.name=`${date}_${time}.${latest.type==='video'?'webm':'jpg'}`;store.put(latest)}};
  }
  document.addEventListener('DOMContentLoaded',()=>{welcome();addLogoControl();const save=$('saveMedia'),original=save.onclick;save.onclick=async event=>{await original.call(save,event);await renameLatestFile()};const record=$('record'),recordOriginal=record.onclick;record.onclick=async event=>{if(window.wanwanPreviewStream){window.wanwanPreviewStream.getTracks().forEach(track=>track.stop());window.wanwanPreviewStream=null}return recordOriginal.call(record,event)}});
})();
