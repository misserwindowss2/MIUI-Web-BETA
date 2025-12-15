document.body.addEventListener("touchstart", () => {
  alert("BODY TOUCH");
}, { passive: false });

const home = document.querySelector('.home');
const screen = document.querySelector('.screen');
const lockscreen = document.querySelector('.lockscreen');
const lockTime = document.getElementById('lock-time');
const lockDate = document.getElementById('lock-date');

let currentApp = null;
let startY = 0;
let dragY = 0;

/* CLOCK */
function updateTime() {
  const now = new Date();
  lockTime.textContent =
    now.getHours().toString().padStart(2,'0') + ":" +
    now.getMinutes().toString().padStart(2,'0');

  lockDate.textContent = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
}
updateTime();
setInterval(updateTime, 60000);

/* UNLOCK */
let lockStartY = 0;

lockscreen.addEventListener('touchstart', e => {
  lockStartY = e.touches[0].clientY;
});

lockscreen.addEventListener('touchmove', e => {
  const diff = e.touches[0].clientY - lockStartY;
  if (diff < 0) lockscreen.style.transform = `translateY(${diff}px)`;
});

lockscreen.addEventListener('touchend', e => {
  if (e.changedTouches[0].clientY - lockStartY < -120) {
    lockscreen.classList.remove('active');
  }
  lockscreen.style.transform = '';
});

/* OPEN APP */
function openApp(id) {
  currentApp = document.getElementById(id);
  home.classList.add('shrink');
  currentApp.classList.add('active');
}

/* CLOSE APP (SPRING) */
function closeApp() {
  const start = performance.now();
  const duration = 500;
  const damping = 0.04;

  function animate(t) {
    const p = Math.min((t - start) / duration, 1);
    const ease = 1 - Math.exp(-p / damping) * Math.cos(10 * p);

    currentApp.style.transform =
      `translateY(${120 * ease}px) scale(${1 - 0.2 * ease})`;
    currentApp.style.opacity = 1 - p;

    if (p < 1) {
      requestAnimationFrame(animate);
    } else {
      currentApp.classList.remove('active');
      currentApp.style = '';
      home.classList.remove('shrink');
      currentApp = null;
    }
  }
  requestAnimationFrame(animate);
}

/* APP GESTURES */
screen.addEventListener('touchstart', e => {
  if (!currentApp) return;
  startY = e.touches[0].clientY;
});

screen.addEventListener('touchmove', e => {
  if (!currentApp) return;
  dragY = (e.touches[0].clientY - startY) * 0.07;
  dragY = Math.max(0, Math.min(dragY, 202));
  currentApp.style.transition = "none";
  currentApp.style.transform =
    `translateY(${dragY}px) scale(${1 - dragY / 600})`;
});

screen.addEventListener('touchend', () => {
  if (!currentApp) return;
  if (dragY > 202) closeApp();
  else {
    currentApp.style.transition =
      "transform 260ms cubic-bezier(0.32,0.76,0.23,0.93)";
    currentApp.style.transform = "translateY(0) scale(1)";
  }
  dragY = 0;
});

let startY = 0;
let currentY = 0;
let swiping = false;

lockscreen.addEventListener("touchstart", e => {
  e.preventDefault();           // IMPORTANT
  startY = e.touches[0].clientY;
  swiping = true;
}, { passive: false });

lockscreen.addEventListener("touchmove", e => {
  if (!swiping) return;

  e.preventDefault();           // IMPORTANT
  currentY = e.touches[0].clientY;
  const diff = currentY - startY;

  if (diff < 0) {
    lockscreen.style.transform = `translateY(${diff}px)`;
  }
}, { passive: false });

lockscreen.addEventListener("touchend", e => {
  e.preventDefault();           // IMPORTANT
  swiping = false;

  const diff = currentY - startY;

  if (diff < -120) {
    unlock();
  } else {
    lockscreen.style.transform = "translateY(0)";
  }

  startY = 0;
  currentY = 0;
}, { passive: false });

function unlock() {
  lockscreen.style.transition = "transform 0.35s ease";
  lockscreen.style.transform = "translateY(-100%)";

  setTimeout(() => {
    lockscreen.classList.remove("active");
    lockscreen.style.transition = "";
    lockscreen.style.transform = "";
  }, 350);
}
