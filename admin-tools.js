(()=>{
  const $=id=>document.getElementById(id);
  let audio=new Audio('wanwan-jazz.mp3'), audioUrl, wantsMusic=false, selected=new Set(), pendingBulk=[];
  audio.loop=true;audio.preload='auto';audio.playsInline=true;
  const audioDb=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('wanwanAudio',1);r.onupgradeneeded=()=>r.result.createObjectStore('assets');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  const getAudio=async()=>{const database=await audioDb();return new Promise((resolve,reject)=>{const r=database.transaction('assets').objectStore('assets').get('background');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})};
  const setAudio=value=>audioDb().then(database=>new Promise((resolve,reject)=>{const r=database.transaction('assets','readwrite').objectStore('assets').put(value,'background');r.onsuccess=resolve;r.onerror=()=>reject(r.error)}));
  function soundButton(){return $('soundControl')}
  function updateSound(){const button=soundButton();if(button)button.textContent=audio&&!audio.paused?'♪ ปิดเพลง':'♪ เปิดเพลง'}
  async function loadMusic(){const file=await getAudio();if(file?.blob){audio?.pause();if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(file.blob);audio=new Audio(audioUrl)}audio.loop=true;audio.preload='auto';audio.playsInline=true;audio.onplay=updateSound;audio.onpause=updateSound;return true}
  async function startMusic(){wantsMusic=true;if(!audio)await loadMusic();if(audio){try{await audio.play();return true}catch{alert('iPhone ต้องกดปุ่ม “เปิดเพลง” อีกครั้งหลังอัปโหลดเพลง')} }window.WanwanSound?.start?.();return false}
  function stopMusic(){wantsMusic=false;audio?.pause();window.WanwanSound?.stop?.();updateSound()}
  function pauseMusic(){audio?.pause();window.WanwanSound?.pause?.();}
  function addMusicControl(){
    const overlay=$('overlay');if(!overlay||$('wanwanBgm'))return;
    const label=document.createElement('label');label.htmlFor='wanwanBgm';label.textContent='เพลงประกอบงาน (MP3 / M4A — แนะนำสำหรับ iPhone)';
    const input=document.createElement('input');input.id='wanwanBgm';input.type='file';input.accept='audio/mpeg,audio/mp4,audio/x-m4a,audio/aac';
    const note=document.createElement('p');note.className='subtitle';note.textContent='YouTube อาจถูก Safari บล็อกบน iPhone; อัปโหลดไฟล์เพลงเพื่อให้เล่นได้เสถียรกว่า';
    overlay.parentNode.insertBefore(label,overlay.nextSibling);overlay.parentNode.insertBefore(input,label.nextSibling);overlay.parentNode.insertBefore(note,input.nextSibling);
    input.onchange=async event=>{const file=event.target.files[0];if(!file)return;await setAudio({blob:file,name:file.name});await loadMusic();alert('บันทึกเพลงแล้ว — กด “เปิดเพลง” ที่หน้าแรกเพื่อเริ่มเล่น')};
  }
  function bulkRender(){
    all().then(records=>{
      selected=new Set([...selected].filter(id=>records.some(record=>record.id===id)));
      $('list').innerHTML=`<div class="bulk-tools"><label><input id="bulkAll" type="checkbox"> เลือกทั้งหมด</label><span id="bulkCount">เลือก ${selected.size} รายการ</span><button id="bulkDelete" class="danger" ${selected.size?'':'disabled'}>ลบที่เลือก</button></div>`;
      if(!records.length)$('list').insertAdjacentHTML('beforeend','<p class="subtitle">ยังไม่มีไฟล์บันทึก</p>');
      records.forEach(item=>{
        const source=item.cloudUrl||URL.createObjectURL(item.blob);const media=item.type==='video'?`<video muted controls src="${source}"></video>`:`<img src="${source}" alt="">`;
        const row=document.createElement('div');row.className='media';row.innerHTML=`<input class="bulkPick" type="checkbox" ${selected.has(item.id)?'checked':''} aria-label="เลือก ${item.name}">${media}<div class="info"><div class="name">${item.name}</div><div class="date">${item.date} · ${item.cloudUrl?'อยู่บน WANWAN Cloud':'อยู่ในเครื่อง'}</div></div><button class="danger">ลบ</button>`;
        const pick=row.querySelector('.bulkPick');pick.onchange=()=>{pick.checked?selected.add(item.id):selected.delete(item.id);bulkRender()};
        row.querySelector('.danger').onclick=()=>{pendingDelete=item;$('fileName').textContent=item.name;$('deletePin').value='';show('confirm')};$('list').append(row);
      });
      const allPick=$('bulkAll');if(allPick){allPick.checked=records.length>0&&selected.size===records.length;allPick.onchange=()=>{selected=allPick.checked?new Set(records.map(record=>record.id)):new Set();bulkRender()};}
      const removeSelected=$('bulkDelete');if(removeSelected)removeSelected.onclick=()=>{pendingBulk=records.filter(record=>selected.has(record.id));$('fileName').textContent=`เลือก ${pendingBulk.length} รายการ`;$('deletePin').value='';show('confirm')};
    });
  }
  function init(){
    addMusicControl();loadMusic().catch(()=>{});
    const button=soundButton();if(button)button.onclick=event=>{event.stopPropagation();if(audio&&!audio.paused)stopMusic();else startMusic()};
    document.addEventListener('pointerdown',event=>{if(event.target.closest('.welcome-enter')&&!wantsMusic)startMusic()},{capture:true});
    const originalPause=window.WanwanSound?.pause;window.WanwanSound={...window.WanwanSound,pause:()=>{audio?.pause();originalPause?.()}};
    new MutationObserver(()=>{if(wantsMusic&&!$('record').classList.contains('live'))audio?.play().catch(()=>{})}).observe($('record'),{attributes:true,attributeFilter:['class']});
    const oldDelete=$('delete').onclick;$('delete').onclick=async()=>{if(pendingBulk.length){if($('deletePin').value!==pin)return;for(const item of pendingBulk)await remove(item.id);pendingBulk=[];selected.clear();await updateStats();bulkRender();show('files');return}return oldDelete()};
    render=bulkRender;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
