(()=>{
  let ctx,enabled=false,player,playing=false,musicWanted=false;
  const AudioEngine=window.AudioContext||window.webkitAudioContext;
  const get=()=>{if(!AudioEngine)throw new Error('audio unavailable');return ctx||(ctx=new AudioEngine())};
  function update(){const button=document.getElementById('soundControl');if(button)button.textContent=playing?'♪ ปิดเพลง':'♪ เปิดเพลง'}
  function tone(freq,duration,volume,type){if(!enabled)return;try{const c=get(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(volume,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+duration+.03)}catch{}}
  function start(){if(!enabled||!musicWanted||playing)return;player=document.createElement('iframe');player.id='wanwanMusic';player.title='WANWAN background music';player.allow='autoplay';player.src='https://www.youtube.com/embed/GBLcMvTFGyg?autoplay=1&loop=1&playlist=GBLcMvTFGyg&controls=0&playsinline=1';document.body.append(player);playing=true;update()}
  function stop(){player?.remove();player=null;playing=false;update()}function pause(){stop()}
  function click(){tone(740,.08,.025,'sine')}function tick(){tone(880,.07,.045,'square')}
  window.WanwanSound={start,stop,pause,click,tick};
  function unlock(){enabled=true;try{get().resume()}catch{}document.removeEventListener('touchstart',unlock);document.removeEventListener('pointerdown',unlock)}
  document.addEventListener('touchstart',unlock,{once:true,passive:true});document.addEventListener('pointerdown',unlock,{once:true});
  document.addEventListener('click',event=>{if(event.target.closest('button'))click()},true);
  document.addEventListener('DOMContentLoaded',()=>{const control=document.createElement('button');control.id='soundControl';control.className='sound-hint';control.type='button';control.textContent='♪ เปิดเพลง';control.onclick=event=>{event.stopPropagation();enabled=true;if(playing){musicWanted=false;stop()}else{musicWanted=true;start()}};document.body.append(control);const count=document.getElementById('count'),record=document.getElementById('record');new MutationObserver(()=>{if(count.textContent.trim())tick()}).observe(count,{childList:true,subtree:true,characterData:true});new MutationObserver(()=>{if(!record.classList.contains('live')&&!document.querySelector('.wedding-welcome'))start()}).observe(record,{attributes:true,attributeFilter:['class']})});
})();
