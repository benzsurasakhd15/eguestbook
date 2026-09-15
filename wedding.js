(()=>{
  const $=id=>document.getElementById(id);
  const savedLogo=()=>localStorage.getItem('eguestbookWelcomeLogo')||'';
  function welcome(){
    document.querySelector('.wedding-welcome')?.remove();
    const src=savedLogo()||'wanwan-logo.png';
    const screen=document.createElement('section');
    screen.className='wedding-welcome';
    screen.innerHTML=`<div class="welcome-content"><p class="welcome-kicker">Welcome to our wedding</p><img class="welcome-logo" src="${src}" alt="WANWAN Video Guestbook"><p class="welcome-sub">เก็บวันนี้ ไว้คิดถึงในวันวาน</p><button class="welcome-enter">เริ่มบันทึกคำอวยพร</button><br><button class="welcome-admin">Admin</button></div>`;
    screen.querySelector('.welcome-enter').onclick=()=>{screen.classList.add('leaving');setTimeout(()=>screen.remove(),550)};
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
  document.addEventListener('DOMContentLoaded',()=>{welcome();addLogoControl()});
})();
