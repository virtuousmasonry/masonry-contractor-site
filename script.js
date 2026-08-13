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
          el.style.transition = ease;
          if (i > 0) el.style.transform = 'translateY(22px)';
        });
        const show = (el) => { el.style.opacity = '1'; el.style.transform = 'none'; };
        requestAnimationFrame(() => show(els[0]));
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
        els.slice(1).forEach((el) => io.observe(el));
      }
    });
  }

  // Estimate / contact form submit — posts to our own Vercel serverless
  // function at /api/estimate, which emails the submission via Resend.
  const ESTIMATE_ENDPOINT = '/api/estimate';

  document.querySelectorAll('form[data-estimate-form]').forEach((form) => {
    const btn = form.querySelector('button[type="submit"]');
    const thanks = form.querySelector('.form-thanks');
    const originalBtnLabel = btn ? btn.textContent : '';
    const originalThanksText = thanks ? thanks.textContent : '';
    const originalThanksColor = thanks ? thanks.style.color : '';

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const payload = Object.fromEntries(new FormData(form).entries());

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }
      if (thanks) thanks.style.display = 'none';

      fetch(ESTIMATE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok || !data.success) throw new Error((data && data.message) || 'Submission failed');
          if (btn) btn.textContent = btn.getAttribute('data-sent-label') || 'Sent';
          if (thanks) {
            thanks.textContent = originalThanksText;
            thanks.style.color = originalThanksColor;
            thanks.style.display = 'block';
          }
          form.reset();
        })
        .catch(() => {
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalBtnLabel;
          }
          if (thanks) {
            thanks.textContent = 'Something went wrong sending that — please call or text (703) 659-5310 instead.';
            thanks.style.color = '#ff563c';
            thanks.style.display = 'block';
          }
        });
    });
  });
});
