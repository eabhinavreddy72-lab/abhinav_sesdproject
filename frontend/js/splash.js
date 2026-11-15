document.addEventListener("DOMContentLoaded", function () {
  const splashRoot = document.querySelector("#splash-root");
  const introSeenKey = "canteengo_registration_intro_seen";
  const duration = 6000;
  const fadeDuration = 500;

  function revealPage() {
    document.body.classList.remove("intro-pending");
    document.body.classList.add("intro-complete");
  }

  if (!splashRoot) {
    revealPage();
    return;
  }

  const page = splashRoot.dataset.splashPage;
  const isHome = page === "home";
  const isRegistration = page === "registration";
  const developmentReplay = new URLSearchParams(window.location.search).has("devIntro");

  if (!isHome && !isRegistration) {
    splashRoot.remove();
    revealPage();
    return;
  }

  function hasSeenRegistrationIntro() {
    try {
      return localStorage.getItem(introSeenKey) === "true";
    } catch (error) {
      console.warn("CanteenGo could not check the registration intro state.", error);
      return false;
    }
  }

  function markRegistrationIntroSeen() {
    if (!isRegistration) {
      return;
    }

    try {
      localStorage.setItem(introSeenKey, "true");
    } catch (error) {
      console.warn("CanteenGo could not save the registration intro state.", error);
    }
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const registrationAlreadySeen = isRegistration && hasSeenRegistrationIntro() && !developmentReplay;
  if (reducedMotion || registrationAlreadySeen) {
    splashRoot.remove();
    revealPage();
    return;
  }

  const logoSrc = splashRoot.dataset.logoSrc;
  splashRoot.innerHTML = `
    <div class="splash-screen" id="splash-screen" role="status" aria-label="SR University CanteenGo intro" aria-hidden="true">
      <div class="splash-glow splash-glow-one" aria-hidden="true"></div>
      <div class="splash-glow splash-glow-two" aria-hidden="true"></div>
      <div class="splash-particles" id="splash-particles" aria-hidden="true"></div>
      <div class="splash-beam" aria-hidden="true"></div>
      <div class="splash-content">
        <div class="university-lockup">
          <div class="sru-logo-window">
            <img class="sru-logo-image" src="${logoSrc}" alt="SR University logo">
          </div>
          <p class="university-caption">SR UNIVERSITY</p>
        </div>
        <div class="canteengo-lockup">
          <svg class="canteengo-symbol" viewBox="0 0 64 64" role="img" aria-label="CanteenGo symbol">
            <circle class="symbol-ring" cx="32" cy="32" r="27"></circle>
            <path class="symbol-steam" d="M23 23c-3-4 3-5 0-9M32 21c-3-4 3-5 0-9M41 23c-3-4 3-5 0-9"></path>
            <path class="symbol-bowl" d="M17 31h30l-4 14H21l-4-14Z"></path>
            <path class="symbol-base" d="M25 50h14"></path>
          </svg>
          <div class="canteengo-wordmark" aria-label="CanteenGo">
            <span style="--letter-delay: 3.35s">C</span>
            <span style="--letter-delay: 3.44s">A</span>
            <span style="--letter-delay: 3.53s">N</span>
            <span style="--letter-delay: 3.62s">T</span>
            <span style="--letter-delay: 3.71s">E</span>
            <span style="--letter-delay: 3.80s">E</span>
            <span style="--letter-delay: 3.89s">N</span>
            <span style="--letter-delay: 3.98s">G</span>
            <span style="--letter-delay: 4.07s">O</span>
          </div>
        </div>
        <p class="splash-tagline">YOUR CAMPUS. YOUR CANTEEN. YOUR FOOD.</p>
        <div class="splash-progress" id="splash-progress" role="progressbar" aria-label="Loading CanteenGo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <span class="splash-progress-fill" id="splash-progress-fill"></span>
        </div>
      </div>
      <button class="splash-skip" type="button" id="splash-skip">Skip intro</button>
    </div>
    <button class="splash-replay" id="splash-replay" type="button" hidden>Replay intro</button>
  `;

  const splash = splashRoot.querySelector("#splash-screen");
  const skipButton = splashRoot.querySelector("#splash-skip");
  const replayButton = splashRoot.querySelector("#splash-replay");
  const particles = splashRoot.querySelector("#splash-particles");
  const progress = splashRoot.querySelector("#splash-progress");
  const progressFill = splashRoot.querySelector("#splash-progress-fill");
  const showReplay = isHome || developmentReplay;
  let animationFrame = 0;
  let finishTimer = 0;
  let fadeTimer = 0;

  function createParticles() {
    if (!particles || particles.childElementCount > 0) {
      return;
    }

    for (let index = 0; index < 34; index += 1) {
      const particle = document.createElement("span");
      particle.className = "splash-particle";
      particle.style.setProperty("--particle-size", `${2 + Math.random() * 3}px`);
      particle.style.setProperty("--particle-x", `${Math.random() * 100}%`);
      particle.style.setProperty("--particle-y", `${Math.random() * 100}%`);
      particle.style.setProperty("--particle-delay", `${Math.random() * 2.4}s`);
      particle.style.setProperty("--particle-duration", `${2.8 + Math.random() * 2.5}s`);
      particle.style.setProperty("--particle-opacity", `${0.3 + Math.random() * 0.45}`);
      particles.appendChild(particle);
    }
  }

  function setProgress(value) {
    const percent = Math.max(0, Math.min(100, Math.round(value)));
    progressFill.style.width = `${percent}%`;
    progress.setAttribute("aria-valuenow", String(percent));
  }

  function finishIntro() {
    window.cancelAnimationFrame(animationFrame);
    window.clearTimeout(finishTimer);
    markRegistrationIntroSeen();
    setProgress(100);
    splash.classList.add("is-leaving");

    fadeTimer = window.setTimeout(function () {
      if (splash.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      splash.classList.remove("is-visible", "is-running", "is-leaving");
      splash.setAttribute("aria-hidden", "true");
      replayButton.hidden = !showReplay;
      revealPage();
    }, fadeDuration);
  }

  function runIntro() {
    window.cancelAnimationFrame(animationFrame);
    window.clearTimeout(finishTimer);
    window.clearTimeout(fadeTimer);
    document.body.classList.remove("intro-complete");
    document.body.classList.add("intro-pending");
    createParticles();
    setProgress(0);
    splash.setAttribute("aria-hidden", "false");
    splash.classList.remove("is-running", "is-leaving");
    splash.classList.add("is-visible");
    void splash.offsetWidth;
    splash.classList.add("is-running");

    const progressDuration = duration - fadeDuration;
    const startedAt = performance.now();

    function updateProgress(now) {
      const elapsed = now - startedAt;
      setProgress((elapsed / progressDuration) * 100);

      if (elapsed < progressDuration) {
        animationFrame = window.requestAnimationFrame(updateProgress);
      }
    }

    animationFrame = window.requestAnimationFrame(updateProgress);
    finishTimer = window.setTimeout(finishIntro, progressDuration);
  }

  skipButton.addEventListener("click", finishIntro);
  replayButton.hidden = !showReplay;
  if (showReplay) {
    replayButton.addEventListener("click", runIntro);
  }

  window.replayCanteenGoIntro = runIntro;
  runIntro();
});
