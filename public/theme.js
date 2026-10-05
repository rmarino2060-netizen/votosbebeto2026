(function(){
 let saved;
 try{saved=localStorage.getItem('votosbebeto-theme');}catch{}
 document.documentElement.dataset.theme=saved==='dark'||saved==='light'?saved:'light';
 function label(){const button=document.getElementById('theme-toggle');if(!button)return;const dark=document.documentElement.dataset.theme==='dark';button.textContent=dark?'Modo claro':'Modo escuro';button.setAttribute('aria-pressed',String(dark));}
 document.addEventListener('DOMContentLoaded',()=>{label();document.getElementById('theme-toggle')?.addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('votosbebeto-theme',document.documentElement.dataset.theme);}catch{}label();});});
})();
