(()=>{
  const $=id=>document.getElementById(id);
  const savedLogo=()=>localStorage.getItem('wanwanWelcomeLogoV2')||'';
  let preparedFile;
  function welcome(){
    document.querySelector('.wedding-welcome')?.remove();
    const src=savedLogo()||'wanwan-logo.png';
    const screen=document.createElement('section');
    screen.className='wedding-welcome';
    screen.innerHTML=`<div class="welcome-content"><p class="welcome-kicker">Welcome to our wedding</p><img class="welcome-logo" src="${src}" alt="WANWAN Video Guestbook"><button class="welcome-enter">เริ่มบันทึกคำอวยพร</button><br><button class="welcome-admin">Admin</button></div>`;
    screen.querySelector('.welcome-enter').onclick=async()=>{screen.classList.add('leaving');setTimeout(()=>screen.remove(),550);try{const preview=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'user'},aspectRatio:{ideal:3/4}},audio:true});$('camera').srcObject=preview;window.wanwanPreviewStream=preview;$('status').textContent='กล้องพร้อมแล้ว'}catch(e){$('status').textContent=e.name==='NotAllowedError'?'กรุณาอนุญาตกล้องและไมโครโฟนในเบราว์เซอร์':'ไม่สามารถเปิดกล้องได้'}};
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
    field.onchange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader;reader.onload=()=>{localStorage.setItem('wanwanWelcomeLogoV2',reader.result);preview.src=reader.result;welcome()};reader.readAsDataURL(file)};
  }
  async function renameLatestFile(){
    const request=indexedDB.open('eGuestbookMedia',1);request.onsuccess=()=>{const database=request.result;const tx=database.transaction('media','readwrite');const store=tx.objectStore('media');const all=store.getAll();all.onsuccess=()=>{const latest=all.result.sort((a,b)=>b.created-a.created)[0];if(!latest)return;const d=new Date(latest.created);const date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');const time=[String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0'),String(d.getSeconds()).padStart(2,'0')].join('-');latest.name=`${date}_${time}.${latest.type==='video'?'webm':'jpg'}`;store.put(latest)}};
  }
  async function prepareDeviceFile(){
    const media=$('#reviewMedia video,#reviewMedia img');if(!media?.src)return;const blob=await fetch(media.src).then(response=>response.blob());const video=media.tagName==='VIDEO',now=new Date();const extension=video?(blob.type.includes('mp4')?'mp4':'webm'):'jpg';const name=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}.${extension}`;preparedFile=new File([blob],name,{type:blob.type|| (video?'video/webm':'image/jpeg')});
  }
  async function saveToDevice(){
    if(!preparedFile)await prepareDeviceFile();if(!preparedFile)throw new Error('file unavailable');
    if(navigator.canShare?.({files:[preparedFile]})){await navigator.share({files:[preparedFile],title:'WANWAN Video Guestbook',text:'บันทึกไฟล์ลงเครื่อง'});return}
    const link=document.createElement('a');link.href=URL.createObjectURL(preparedFile);link.download=preparedFile.name;document.body.append(link);link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);link.remove();
  }
  document.addEventListener('DOMContentLoaded',()=>{welcome();addLogoControl();const save=$('saveMedia'),original=save.onclick;save.textContent='บันทึกลงเครื่องและคลัง';const note=document.createElement('p');note.className='save-gallery-note';note.textContent='iPhone: เลือก “บันทึกวิดีโอ” หรือ “บันทึกรูปภาพ” จากเมนูแชร์';save.closest('.actions').after(note);new MutationObserver(()=>{preparedFile=null;prepareDeviceFile().catch(()=>{})}).observe($('reviewMedia'),{childList:true,subtree:true});save.onclick=async event=>{try{await saveToDevice()}catch(error){if(error.name!=='AbortError')alert('ไม่สามารถเปิดเมนูบันทึกได้ กรุณาลองกดอีกครั้ง')}await original.call(save,event);await renameLatestFile();welcome()};const record=$('record'),recordOriginal=record.onclick;record.onclick=async event=>{window.WanwanSound?.pause();if(window.wanwanPreviewStream){window.wanwanPreviewStream.getTracks().forEach(track=>track.stop());window.wanwanPreviewStream=null;await new Promise(resolve=>setTimeout(resolve,350))}return recordOriginal.call(record,event)}});
  document.addEventListener('DOMContentLoaded',()=>{const home=document.createElement('button');home.type='button';home.className='secondary';home.textContent='กลับหน้าแรก';home.onclick=()=>{$('retake').click();welcome()};$('saveMedia').closest('.actions').append(home)});
})();
(()=>{const script=document.createElement('script');script.src='r2.js';script.onload=()=>{const tools=document.createElement('script');tools.src='admin-tools.js';document.head.append(tools)};document.head.append(script)})();
