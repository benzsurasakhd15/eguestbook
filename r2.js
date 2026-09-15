(()=>{
  const WORKER='https://wanwan-media.wanwanofficialth.workers.dev';
  const $=id=>document.getElementById(id);
  const loadQr=()=>window.QRCode?Promise.resolve():new Promise(resolve=>{
    const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';script.onload=resolve;script.onerror=resolve;document.head.append(script);
  });
  const two=value=>String(value).padStart(2,'0');
  const eventFolder=()=>{
    return localStorage.getItem('wanwanR2Event')||'';
  };
  const timestamp=created=>{
    const d=new Date(created||Date.now());
    return `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}_${two(d.getHours())}-${two(d.getMinutes())}-${two(d.getSeconds())}`;
  };
  const cloudPut=async(key,blob)=>{
    const signed=await fetch('/api/sign-upload',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,contentType:blob.type})});
    const data=await signed.json().catch(()=>({}));if(!signed.ok)throw new Error(data.error||'ยังไม่ได้รับสิทธิ์อัปโหลด');
    const upload=await fetch(data.uploadUrl,{method:'PUT',body:blob,headers:{'Content-Type':blob.type||'application/octet-stream'}});
    if(!upload.ok)throw new Error('ส่งไฟล์ขึ้นคลาวด์ไม่สำเร็จ');return data;
  };
  const writeRecord=record=>new Promise((resolve,reject)=>{
    const request=db.transaction('media','readwrite').objectStore('media').put(record);
    request.onsuccess=resolve;request.onerror=()=>reject(request.error);
  });
  async function compactLocal(name,cloud){
    const records=await all();
    const record=records.find(item=>item.name===name)||records[0];
    if(!record)return;
    record.cloudUrl=cloud.shareUrl;record.cloudKey=cloud.key;record.syncedAt=Date.now();
    record.blob=new Blob([], {type:record.type==='video'?'video/webm':'image/jpeg'});
    await writeRecord(record);
  }
  function showReceipt(cloud,type){
    const modal=document.createElement('div');
    modal.className='modal wanwan-receipt';
    const heading=type==='video'?'วิดีโอพร้อมให้ดาวน์โหลด':'รูปภาพพร้อมให้ดาวน์โหลด';
    modal.innerHTML=`<section class="card"><p class="receipt-kicker">WANWAN CLOUD</p><h2>${heading}</h2><p class="subtitle">อัปโหลดเรียบร้อยแล้ว สแกน QR นี้เพื่อเปิดและบันทึกไฟล์ลง Story, Instagram หรือ Facebook</p><div class="receipt-qr" id="wanwanQr"></div><p class="receipt-code">อัลบั้ม: ${eventFolder()}</p><div class="actions"><button id="wanwanOpen">เปิดลิงก์ดาวน์โหลด</button><button class="secondary" id="wanwanHome">กลับหน้าแรก</button></div></section>`;
    document.body.append(modal);
    const holder=modal.querySelector('#wanwanQr');
    if(window.QRCode)new QRCode(holder,{text:cloud.shareUrl,width:210,height:210,colorDark:'#111111',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
    else holder.innerHTML=`<a href="${cloud.shareUrl}" target="_blank" rel="noopener">เปิดลิงก์ดาวน์โหลด</a>`;
    modal.querySelector('#wanwanOpen').onclick=()=>window.open(cloud.shareUrl,'_blank','noopener');
    modal.querySelector('#wanwanHome').onclick=()=>{modal.remove();$('retake').click();document.querySelector('.wedding-welcome')||location.reload()};
  }
  async function cloudRender(){
    const records=await all();
    $('list').innerHTML=records.length?'':'<p class="subtitle">ยังไม่มีไฟล์บันทึก</p>';
    records.forEach(item=>{
      const source=item.cloudUrl||URL.createObjectURL(item.blob);
      const media=item.type==='video'?`<video muted controls src="${source}"></video>`:`<img src="${source}" alt="">`;
      const row=document.createElement('div');row.className='media';
      row.innerHTML=`${media}<div class="info"><div class="name">${item.name}</div><div class="date">${item.date} · ${item.cloudUrl?'อยู่บน WANWAN Cloud':'อยู่ในเครื่อง'}</div></div><button class="danger">ลบ</button>`;
      row.querySelector('button').onclick=()=>{pendingDelete=item;$('fileName').textContent=item.name;$('deletePin').value='';show('confirm')};
      $('list').append(row);
    });
  }
  function init(){
    const save=$('saveMedia');
    const baseSave=save.onclick;
    save.textContent='บันทึกและอัปโหลด';
    save.onclick=async event=>{
      if(!pendingMedia)return baseSave.call(save,event);
      const media={...pendingMedia};
      const extension=media.type==='video'?'webm':'jpg';
      const folder=eventFolder();if(!folder){alert('กรุณาให้แอดมินเข้าสู่ระบบเพื่อเปิดสิทธิ์อัปโหลดก่อน');return;}
      const key=`events/${folder}/${timestamp(media.created)}.${extension}`;
      save.disabled=true;save.textContent='กำลังอัปโหลด…';
      try{
        const cloud=await cloudPut(key,media.blob);
        pendingMedia.cloudUrl=cloud.shareUrl;pendingMedia.cloudKey=cloud.key;
        await baseSave.call(save,event);
        await compactLocal(media.name,cloud);
        await updateStats();
        await loadQr();
        showReceipt(cloud,media.type);
      }catch(error){
        alert(`ยังอัปโหลดขึ้น WANWAN Cloud ไม่สำเร็จ: ${error.message}\\nไฟล์ยังคงบันทึกไว้ในเครื่อง คุณสามารถลองใหม่ได้`);
      }finally{save.disabled=false;save.textContent='บันทึกและอัปโหลด';}
    };
    const unlock=$('unlock'),baseUnlock=unlock.onclick;
    unlock.onclick=async()=>{await baseUnlock();if($('pin').value===pin){const response=await fetch('/api/session',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})});const data=await response.json().catch(()=>({}));if(response.ok)localStorage.setItem('wanwanR2Event',data.event);else alert('เปิดสิทธิ์อัปโหลดคลาวด์ไม่สำเร็จ')}};
    const baseDelete=$('delete').onclick;
    $('delete').onclick=async()=>{
      if($('deletePin').value!==pin)return;
      const item=pendingDelete;
      if(item?.cloudKey&&!confirm('ไฟล์บน WANWAN Cloud จะยังคงอยู่จนกว่าจะลบจากคลาวด์โดยผู้ดูแล'))return;
      await baseDelete();
    };
    render=cloudRender;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
