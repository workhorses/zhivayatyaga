const track = document.getElementById('track');

function initTicker() {
  const base = track.children[0];

  track.innerHTML = '';
  track.appendChild(base);

  const screenWidth = window.innerWidth;
  const itemWidth = base.offsetWidth;

  let total = itemWidth;

  // заполняем экран + запас
  while (total < screenWidth * 2) {
    const clone = base.cloneNode(true);
    track.appendChild(clone);
    total += itemWidth;
  }
}

function animateTicker() {
  let x = 0;
  const speed = 0.5;

  function frame() {
    x -= speed;

    const first = track.children[0];
    const width = first.offsetWidth;

    // перенос элемента без сброса
    if (Math.abs(x) >= width) {
      x += width;
      track.appendChild(first);
    }

    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(frame);
  }

  frame();
}

// важно: ждать загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
  initTicker();
  animateTicker();
});

// при ресайзе пересобираем
window.addEventListener('resize', () => {
  initTicker();
});