document.addEventListener('DOMContentLoaded', () => {
  // Hover effects (elements carry a style-hover attribute with the hover styles)
  document.querySelectorAll('[style-hover]').forEach((el) => {
    const hoverStyle = el.getAttribute('style-hover');
    const baseStyle = el.getAttribute('style') || '';
    el.addEventListener('mouseenter', () => {
      el.setAttribute('style', baseStyle + ';' + hoverStyle);
    });
    el.addEventListener('mouseleave', () => {
      el.setAttribute('style', baseStyle);
    });
  });

  // Fade-in on scroll
  if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    requestAnimationFrame(() => {
      const all = Array.from(document.querySelectorAll('section, footer'));
      const els = all.filter((el) => !(el.parentElement && el.parentElement.closest('section, footer')));
      if (els.length) {
        const ease = 'opacity 700ms cubic-bezier(0.16,0.84,0.44,1), transform 700ms cubic-bezier(0.16,0.84,0.44,1)';
        els.forEach((el, i) => {
          el.style.willChange = 'opacity, transform';
          el.style.opacity = '0';
          el.style.transition =
