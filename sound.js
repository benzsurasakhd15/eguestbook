(()=>{
  let ctx,enabled=false,timer,playing=false,control;
  const AudioEngine=window.AudioContext||window.webkitAudioContext;
  const get=()=>{if(!AudioEngine)throw new Error('audio unavailable');return ctx||(ctx=new AudioEngine())};
  function updateControl(){if(control)control.textContent=playing?'♪ ปิดเพลง':'♪ เปิดเพลง'}
  function tone(freq,time=.24,volume=.018,type='triangle'){if(!enabled)return;try{const c=get(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(volume,c.currentTime+.025);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+time);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+time+.03)}catch{}}
  const chords=[[220,261.63,329.63,392],[196,246.94,293.66,349.23],[174.61,220,261.63,329.63],[196,233.08,293.66,369.99]];let bar=0;
  function playBar(){const chord=chords[bar++%chords.length];tone(chord[0],1.25,.02,'sine');chord.slice(1).forEach((f,i)=>setTimeout(()=>tone(f,.55,.014,'triangle'),i*130))}
  function start(){if(!enabled)return;try{get().resume()}catch{}if(playing)return;playing=true;playBar();timer=setInterval(playBar,1800);updateControl()}
  function stop(){playing=false;clearInterval(timer);updateControl()}
  function click(){tone(740,.08,.03,'sine')}function tick(){tone(880,.07,.05,'square')}
  window.WanwanSound={start,stop,click,tick};
  function unlock(){enabled=true;start();document.removeEventListener('touchstart',unlock);document.removeEventListener('pointerdown',unlock)}
  document.addEventListener('touchstart',unlock,{once:true,passive:true});document.addEventListener('pointerdown',unlock,{once:true});
  document.addEventListener('click',event=>{if(event.target.closest('button'))click()},true);
  document.addEventListener('DOMContentLoaded',()=>{control=document.createElement('button');control.className='sound-hint';control.type='button';control.textContent='♪ เปิดเพลง';control.onclick=event=>{event.stopPropagation();enabled=true;playing?stop():start()};document.body.append(control);const count=document.getElementById('count'),record=document.getElementById('record');new MutationObserver(()=>{if(count.textContent.trim())tick()}).observe(count,{childList:true,subtree:true,characterData:true});new MutationObserver(()=>{if(!record.classList.contains('live')&&!document.querySelector('.wedding-welcome'))start()}).observe(record,{attributes:true,attributeFilter:['class']})});
})();
