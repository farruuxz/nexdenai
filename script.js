/**
 * NexdenAI — Interactive Controller
 * Premium micro-interactions, smooth scroll, mobile drawer, modal & clipboard handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Current Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Header Scroll Glassmorphism, Smart Hide/Show & Active Link Spy
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');
  const mobileDrawer = document.getElementById('mobile-drawer');

  let lastScrollY = window.scrollY;
  let ticking = false;
  const SCROLL_THRESHOLD = 10; // minimum delta before triggering hide/show to prevent jitter

  const updateHeaderOnScroll = () => {
    const currentScrollY = window.scrollY;
    const isDrawerOpen = mobileDrawer && mobileDrawer.classList.contains('is-open');

    // Scrolled class for backdrop blur effect
    if (currentScrollY > 15) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Smart Mobile Auto Hide / Reveal logic
    // Always visible at the top (< 25px) or when the mobile drawer is open
    if (currentScrollY <= 25 || isDrawerOpen) {
      header.classList.remove('nav-hidden');
    } else {
      const scrollDiff = currentScrollY - lastScrollY;
      if (Math.abs(scrollDiff) >= SCROLL_THRESHOLD) {
        if (scrollDiff > 0 && currentScrollY > 70) {
          // Scrolling DOWN -> smoothly hide floating navbar
          header.classList.add('nav-hidden');
        } else if (scrollDiff < 0) {
          // Scrolling UP -> smoothly reveal floating navbar
          header.classList.remove('nav-hidden');
        }
      }
    }

    lastScrollY = currentScrollY;

    // ScrollSpy
    let currentId = '';
    const scrollPos = currentScrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderOnScroll);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeaderOnScroll();

  // 3. Mobile Navigation Drawer
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileCloseBtn = document.getElementById('mobile-drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const toggleMobileMenu = () => {
    const isOpen = mobileDrawer.classList.contains('is-open');
    if (isOpen) {
      mobileDrawer.classList.remove('is-open');
      mobileBtn.classList.remove('is-active');
      mobileBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      header.classList.remove('nav-hidden');
    } else {
      mobileDrawer.classList.add('is-open');
      mobileBtn.classList.add('is-active');
      mobileBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      header.classList.remove('nav-hidden');
    }
  };

  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', toggleMobileMenu);

    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('is-open')) {
          toggleMobileMenu();
        }
      });
    }

    const mobileBackdrop = document.getElementById('mobile-drawer-backdrop');
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('is-open')) {
          toggleMobileMenu();
        }
      });
    }

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('is-open')) {
          toggleMobileMenu();
        }
      });
    });
  }

  // 4. Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // 5. Copy Telegram to Clipboard
  const copyBtn = document.getElementById('copy-tg-btn');
  const copyStatusText = document.getElementById('copy-status-text');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  const showToast = (msg) => {
    if (!toast) return;
    toastMessage.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const handle = '@farruuxz';
      try {
        await navigator.clipboard.writeText(handle);
        copyStatusText.textContent = 'Скопировано!';
        showToast('Ник @farruuxz скопирован в буфер обмена');
        setTimeout(() => {
          copyStatusText.textContent = 'Скопировать @farruuxz';
        }, 2500);
      } catch (err) {
        // Fallback for older browsers or restricted clipboard permissions
        const textArea = document.createElement('textarea');
        textArea.value = handle;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          copyStatusText.textContent = 'Скопировано!';
          showToast('Ник @farruuxz скопирован в буфер обмена');
          setTimeout(() => {
            copyStatusText.textContent = 'Скопировать @farruuxz';
          }, 2500);
        } catch (e) {
          showToast('Телеграм: @farruuxz');
        }
        document.body.removeChild(textArea);
      }
    });
  }

  // 6. Interactive "Обсудить проект" Modal with Niche Selection & Direct TG Deep Link
  const modal = document.getElementById('discuss-modal');
  const openModalBtn = document.getElementById('open-discuss-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const nicheButtons = document.querySelectorAll('.niche-select-btn');
  const previewText = document.getElementById('preview-text');
  const modalSubmitTg = document.getElementById('modal-submit-tg');

  let selectedNiche = 'Комплекс: Сайт + AI + CRM';

  const updateMessagePreview = () => {
    let text = `Здравствуйте! Хочу обсудить проект для направления: ${selectedNiche}.`;
    if (previewText) {
      previewText.textContent = text;
    }
  };

  nicheButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      nicheButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedNiche = btn.getAttribute('data-niche') || 'бизнеса';
      updateMessagePreview();
    });
  });

  const openModal = () => {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (openModalBtn) {
    openModalBtn.addEventListener('click', openModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  if (modalSubmitTg) {
    modalSubmitTg.addEventListener('click', () => {
      const msg = `Здравствуйте! Хочу обсудить проект для направления: ${selectedNiche}.`;
      const url = `https://t.me/farruuxz?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      closeModal();
    });
  }

  // 7. Pipeline Flow Light Animation (Subtle Apple Keynote cadence)
  const pipelineNodes = document.querySelectorAll('.pipeline-node');
  if (pipelineNodes.length > 0) {
    let activeIdx = 1;
    setInterval(() => {
      pipelineNodes.forEach((node, idx) => {
        if (idx === activeIdx && !node.classList.contains('highlight-node')) {
          node.style.borderColor = 'rgba(0, 0, 0, 0.4)';
          node.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
        } else if (!node.classList.contains('highlight-node')) {
          node.style.borderColor = '';
          node.style.boxShadow = '';
        }
      });
      activeIdx = (activeIdx + 1) % pipelineNodes.length;
    }, 2400);
  }
});
