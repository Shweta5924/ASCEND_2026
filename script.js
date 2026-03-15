const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section[id]');
const parallaxSections = document.querySelectorAll('main section:not(.hero)');
const revealItems = document.querySelectorAll('.reveal');
const form = document.getElementById('registrationForm');
const formMessage = document.getElementById('formMessage');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const countdownElements = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds')
};
const targetDate = new Date('2026-03-28T00:00:00+05:30').getTime();

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navAnchors.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

const updateCountdown = () => {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (!Object.values(countdownElements).every(Boolean)) {
    return;
  }

  if (distance <= 0) {
    countdownElements.days.textContent = '00';
    countdownElements.hours.textContent = '00';
    countdownElements.minutes.textContent = '00';
    countdownElements.seconds.textContent = '00';
    return true;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  countdownElements.days.textContent = String(days).padStart(2, '0');
  countdownElements.hours.textContent = String(hours).padStart(2, '0');
  countdownElements.minutes.textContent = String(minutes).padStart(2, '0');
  countdownElements.seconds.textContent = String(seconds).padStart(2, '0');

  return false;
};

const countdownFinished = updateCountdown();
if (!countdownFinished) {
  const timerId = setInterval(() => {
    if (updateCountdown()) {
      clearInterval(timerId);
    }
  }, 1000);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navAnchors.forEach((anchor) => {
        anchor.classList.toggle(
          'active',
          anchor.getAttribute('href') === `#${entry.target.id}`
        );
      });
    });
  },
  {
    threshold: 0.45,
    rootMargin: '-20% 0px -30% 0px'
  }
);

sections.forEach((section) => sectionObserver.observe(section));

if (!reduceMotionQuery.matches && parallaxSections.length > 0) {
  let isTicking = false;

  const updateParallax = () => {
    const viewportCenter = window.innerHeight * 0.5;

    parallaxSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height * 0.5;
      const distance = sectionCenter - viewportCenter;
      const normalized = Math.max(-1, Math.min(1, distance / (window.innerHeight * 0.8)));
      const mode = section.dataset.parallax || 'default';

      let parallaxY = normalized * -20;
      let parallaxSoftY = normalized * -10;
      let parallaxX = normalized * 6;
      let parallaxRot = normalized * 0.8;
      let parallaxScale = 1 + Math.abs(normalized) * 0.03;

      if (mode === 'orbital') {
        parallaxX = Math.sin(normalized * Math.PI) * 18;
        parallaxY = normalized * -18;
        parallaxSoftY = normalized * -8;
        parallaxRot = normalized * 1.2;
        parallaxScale = 1.02 + Math.abs(normalized) * 0.02;
      } else if (mode === 'diagonal') {
        parallaxX = normalized * 22;
        parallaxY = normalized * -12;
        parallaxSoftY = normalized * -6;
        parallaxRot = normalized * -1.4;
      } else if (mode === 'depth') {
        parallaxX = normalized * -4;
        parallaxY = normalized * -28;
        parallaxSoftY = normalized * -16;
        parallaxRot = 0;
        parallaxScale = 1.05 - Math.abs(normalized) * 0.02;
      } else if (mode === 'wave') {
        parallaxX = Math.sin(normalized * Math.PI * 1.4) * 16;
        parallaxY = Math.cos(normalized * Math.PI * 1.1) * -14;
        parallaxSoftY = normalized * -7;
        parallaxRot = Math.sin(normalized * Math.PI) * 1.4;
      } else if (mode === 'split') {
        parallaxX = normalized * -20;
        parallaxY = normalized * -10;
        parallaxSoftY = normalized * 9;
        parallaxRot = normalized * 1.1;
      } else if (mode === 'spotlight') {
        parallaxX = Math.sin(normalized * Math.PI) * -12;
        parallaxY = normalized * -24;
        parallaxSoftY = normalized * -13;
        parallaxRot = normalized * -0.8;
        parallaxScale = 1.01 + (1 - Math.abs(normalized)) * 0.03;
      } else if (mode === 'mesh') {
        parallaxX = normalized * 14;
        parallaxY = normalized * -14;
        parallaxSoftY = normalized * -5;
        parallaxRot = normalized * 1.8;
        parallaxScale = 1 + Math.abs(normalized) * 0.015;
      }

      section.style.setProperty('--parallax-y', `${parallaxY.toFixed(2)}px`);
      section.style.setProperty('--parallax-y-soft', `${parallaxSoftY.toFixed(2)}px`);
      section.style.setProperty('--parallax-x', `${parallaxX.toFixed(2)}px`);
      section.style.setProperty('--parallax-rot', `${parallaxRot.toFixed(2)}deg`);
      section.style.setProperty('--parallax-scale', parallaxScale.toFixed(3));
    });

    isTicking = false;
  };

  const handleParallaxScroll = () => {
    if (isTicking) {
      return;
    }

    isTicking = true;
    window.requestAnimationFrame(updateParallax);
  };

  updateParallax();
  window.addEventListener('scroll', handleParallaxScroll, { passive: true });
  window.addEventListener('resize', handleParallaxScroll);
}

const validators = {
  fullName: (value) => value.trim().length >= 3 || 'Enter at least 3 characters.',
  collegeName: (value) => value.trim().length >= 3 || 'Enter your college name.',
  department: (value) => value.trim().length >= 2 || 'Enter your department.',
  mobile: (value) => /^[6-9]\d{9}$/.test(value.trim()) || 'Enter a valid 10-digit mobile number.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Enter a valid email address.',
  event: (value) => value.trim() !== '' || 'Please select an event.'
};

const setFieldState = (field, message = '') => {
  const errorText = field.parentElement.querySelector('.error-text');
  const isValid = message === '';

  field.classList.toggle('input-error', !isValid);
  if (errorText) {
    errorText.textContent = message;
  }

  return isValid;
};

if (form) {
  const fields = Array.from(form.querySelectorAll('input, select'));

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      const validator = validators[field.name];
      if (!validator) {
        return;
      }
      const result = validator(field.value);
      setFieldState(field, result === true ? '' : result);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let allValid = true;

    fields.forEach((field) => {
      const validator = validators[field.name];
      if (!validator) {
        return;
      }
      const result = validator(field.value);
      const valid = setFieldState(field, result === true ? '' : result);
      allValid = allValid && valid;
    });

    if (!allValid) {
      formMessage.textContent = 'Please correct the highlighted fields and try again.';
      formMessage.className = 'form-message error';
      return;
    }

    formMessage.textContent = 'Registration submitted successfully. Our team will contact you with payment details.';
    formMessage.className = 'form-message success';
    form.reset();
    fields.forEach((field) => setFieldState(field));
  });
}
