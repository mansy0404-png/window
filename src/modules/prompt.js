const PROMPTS = [
  'Mock up a landing page for a fintech app…',
  'Design a launch campaign for a skincare brand…',
  'Cut a 15-second film from our spring lookbook…',
];

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function initForm(form, offset = 0) {
  const input = form.querySelector('.prompt__input');
  const typer = form.querySelector('[data-typer]');
  const status = form.querySelector('[data-status]');
  if (!input || !typer || !status) return;

  let index = offset % PROMPTS.length;
  let chars = PROMPTS[index].length;
  let timer = 0;
  let busy = false;
  let started = false;

  typer.textContent = PROMPTS[index];

  const schedule = (fn, delay) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(fn, delay);
  };

  const finishTyping = () => {
    chars = PROMPTS[index].length;
    typer.textContent = PROMPTS[index];
  };

  const type = () => {
    if (busy || prefersReduced.matches) return;
    if (input.value || document.activeElement === input) {
      schedule(type, 1400);
      return;
    }
    chars += 1;
    typer.textContent = PROMPTS[index].slice(0, chars);
    if (chars < PROMPTS[index].length) {
      schedule(type, 30 + Math.random() * 42);
    } else {
      schedule(erase, 2800);
    }
  };

  const erase = () => {
    if (busy || prefersReduced.matches) return;
    if (input.value || document.activeElement === input) {
      schedule(erase, 1400);
      return;
    }
    chars -= 1;
    typer.textContent = PROMPTS[index].slice(0, Math.max(chars, 0));
    if (chars <= 0) {
      index = (index + 1) % PROMPTS.length;
      chars = 0;
      schedule(type, 460);
    } else {
      schedule(erase, 15 + Math.random() * 22);
    }
  };

  const start = (delay = 3400) => {
    if (busy || started || prefersReduced.matches) return;
    started = true;
    schedule(erase, delay);
  };

  const stop = () => {
    started = false;
    window.clearTimeout(timer);
  };

  input.addEventListener('input', () => {
    form.classList.toggle('is-filled', input.value.trim().length > 0);
  });

  input.addEventListener('focus', () => {
    stop();
    if (!busy) finishTyping();
  });

  input.addEventListener('blur', () => {
    if (!busy && !input.value.trim() && !prefersReduced.matches) start(1600);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (busy) return;

    const brief = input.value.trim() || PROMPTS[index];
    if (!brief) return;

    busy = true;
    stop();
    form.classList.remove('is-done', 'is-filled', 'is-busy');
    void form.offsetWidth;
    form.classList.add('is-busy');
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Ada is reading the brief…';

    const reading = window.setTimeout(() => {
      if (form.classList.contains('is-busy')) status.textContent = 'Assembling four directions…';
    }, 900);

    const done = window.setTimeout(() => {
      window.clearTimeout(reading);
      form.classList.remove('is-busy');
      form.classList.add('is-done');
      form.setAttribute('aria-busy', 'false');
      status.textContent = 'Four directions added to your canvas ✓';
      input.value = '';

      const reset = window.setTimeout(() => {
        form.classList.remove('is-done');
        status.textContent = '';
        busy = false;
        finishTyping();
        if (!prefersReduced.matches) start(2600);
      }, 3600);

      form.addEventListener(
        'focusin',
        () => {
          window.clearTimeout(reset);
        },
        { once: true },
      );
    }, 2500);

    // Keep the timer handles referenced so a fast re-submit can't strand UI.
    form.dataset.reading = String(reading);
    form.dataset.done = String(done);
  });

  if (!prefersReduced.matches) start(3800);
}

export function initPrompts() {
  const forms = [...document.querySelectorAll('.prompt')];
  forms.forEach((form, i) => initForm(form, i));
}
