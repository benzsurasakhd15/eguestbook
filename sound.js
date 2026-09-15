(()=>{
  let ctx,enabled=false,timer,playing=false;
  const get=()=>ctx||(ctx=new AudioContext());
  function tone(freq,time=.24,volume=.018,type='triangle'){if(!enabled)return;const c=get(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(volume,c.currentTime+.025);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+time);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+time+.03)}
  const chords=[[220,261.63,329.63,392],[196,246.94,293.66,349.23],[174.61,220,261.63,329.63],[196,233.08,293.66,369.99]];let bar=0;
  function playBar(){const chord=chords[bar++%chords.length];tone(chord[0],1.25,.012,'sine');chord.slice(1).forEach((f,i)=>setTimeout(()=>tone(f,.55,.009,'triangle'),i*130))}
  function start(){if(!enabled)return;get().resume();if(playing)return;playing=true;playBar();timer=setInterval(playBar,1800)}
  function stop(){playing=false;clearInterval(timer)}
  function click(){tone(740,.08,.025,'sine')}function tick(){tone(880,.07,.04,'square')}
  window.WanwanSound={start,stop,click,tick};
  document.addEventListener('pointerdown',()=>{enabled=true;start()},{once:true});
  document.addEventListener('click',event=>{if(event.target.closest('button'))click()},true);
  document.addEventListener('DOMContentLoaded',()=>{const count=document.getElementById('count'),record=document.getElementById('record');new MutationObserver(()=>{if(count.textContent.trim())tick()}).observe(count,{childList:true,subtree:true,characterData:true});new MutationObserver(()=>{if(!record.classList.contains('live')&&!document.querySelector('.wedding-welcome'))start()}).observe(record,{attributes:true,attributeFilter:['class']})});
})();
