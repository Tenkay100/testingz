/**
 * 305CARGO - Animations JavaScript
 * Handles Intersection Observers for scroll reveals and micro-interactions.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Scroll Reveal Observer ---
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom');

  const revealObserverOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // Trigger slightly before it comes into view
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        // Stop observing once revealed if you only want it to happen once
        observer.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- 2. Custom Cursor (Optional enhancement) ---
  // If requested, uncomment or keep disabled for better performance on standard setups.
  /*
  const cursorDot = document.createElement('div');
  const cursorOutline = document.createElement('div');
  cursorDot.classList.add('cursor-dot');
  cursorOutline.classList.add('cursor-outline');
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorOutline);

  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with a slight delay
    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
  });

  // Hover effect on interactables
  const interactables = document.querySelectorAll('a, button, input, .hover-lift');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursorOutline.style.backgroundColor = 'rgba(200, 16, 46, 0.1)';
    });
    el.addEventListener('mouseleave', () => {
      cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorOutline.style.backgroundColor = 'transparent';
    });
  });
  */
});
