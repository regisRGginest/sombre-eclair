// Lightbox minimal — accessible and without dependencies
document.addEventListener('DOMContentLoaded', function(){
  const links = Array.from(document.querySelectorAll('.lightbox-link'));
  if(!links.length) return;

  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('.lightbox-img');
  const lbCaption = lb.querySelector('.lightbox-caption');
  const lbClose = lb.querySelector('.lightbox-close');

  let currentIndex = -1;
  let lastFocused = null;

  function openAt(index){
    const a = links[index];
    if(!a) return;
    const href = a.getAttribute('href');
    const caption = a.dataset.caption || a.getAttribute('title') || '';
    lastFocused = document.activeElement;

    lbImg.src = href;
    lbImg.alt = a.querySelector('img')?.alt || '';
    lbCaption.textContent = caption;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');
    currentIndex = index;
    lbClose.focus();
    // prefetch next image
    const next = links[index+1];
    if(next){
      const p = new Image();
      p.src = next.getAttribute('href');
    }
  }

  function close(){
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');
    lbImg.src = '';
    lbCaption.textContent = '';
    currentIndex = -1;
    if(lastFocused) lastFocused.focus();
  }

  function showNext(dir){
    let i = currentIndex + dir;
    if(i < 0) i = links.length - 1;
    if(i >= links.length) i = 0;
    openAt(i);
  }

  links.forEach((a, idx) => {
    a.addEventListener('click', function(e){
      e.preventDefault();
      openAt(idx);
    });
    // enable Enter/Space on focused figure link
    a.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(idx); }
    });
  });

  lbClose.addEventListener('click', close);

  // close on overlay click (but not when clicking the image)
  lb.addEventListener('click', function(e){
    if(e.target === lb) close();
  });

  document.addEventListener('keydown', function(e){
    if(lb.classList.contains('open')){
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowRight') showNext(1);
      if(e.key === 'ArrowLeft') showNext(-1);
    }
  });

  // add touch nav areas for mobile
  const prevZone = document.createElement('div');
  prevZone.className = 'lightbox-nav prev';
  const nextZone = document.createElement('div');
  nextZone.className = 'lightbox-nav next';
  lb.appendChild(prevZone);
  lb.appendChild(nextZone);
  prevZone.addEventListener('click', () => showNext(-1));
  nextZone.addEventListener('click', () => showNext(1));
});
