
  (function () {
    "use strict";

    var root = document.querySelector("[data-bil-home]");
    if (!root || root.dataset.ready === "true") return;
    root.dataset.ready = "true";

    /* Measure the cue rather than relying on a fixed card height. Its wrapper
       remains tall enough to render correctly, while the negative bottom
       margin removes exactly the space below the hero at every breakpoint. */
    var scrollCueWrap = root.querySelector(".bil-scroll-cue-wrap");
    var cueResizeFrame = null;

    function syncScrollCueBridge() {
      if (!scrollCueWrap) return;
      var styles = window.getComputedStyle(scrollCueWrap);
      var topOverlap = Math.max(0, -(parseFloat(styles.marginTop) || 0));
      var flowOffset = Math.max(0, scrollCueWrap.getBoundingClientRect().height - topOverlap);
      scrollCueWrap.style.setProperty("--bil-cue-flow-offset", flowOffset.toFixed(2) + "px");
    }

    syncScrollCueBridge();
    window.requestAnimationFrame(syncScrollCueBridge);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncScrollCueBridge);
    }
    window.addEventListener("resize", function () {
      window.cancelAnimationFrame(cueResizeFrame);
      cueResizeFrame = window.requestAnimationFrame(syncScrollCueBridge);
    });

    /* Give every major section component a reveal treatment. Repeated groups
       are staggered and alternate direction so the motion feels varied while
       still sharing one timing and easing language. */
    var reducePageMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function prepareRevealGroup(selector, effects, delayStep) {
      var items = Array.prototype.slice.call(root.querySelectorAll(selector));
      items.forEach(function (item, index) {
        item.classList.add("bil-reveal", effects[index % effects.length]);
        item.style.setProperty("--bil-reveal-delay", ((index % 4) * delayStep) + "ms");
      });
    }

    prepareRevealGroup(".bil-section-intro", ["bil-reveal-up"], 0);
    prepareRevealGroup(".bil-machine-selector", ["bil-reveal-scale"], 0);
    prepareRevealGroup(".bil-range-foundation", ["bil-reveal-left"], 0);
    prepareRevealGroup(".bil-machine-grid > .bil-machine-card", ["bil-reveal-left", "bil-reveal-up", "bil-reveal-right"], 90);
    prepareRevealGroup(".bil-ownership-bar", ["bil-reveal-up"], 0);
    prepareRevealGroup(".bil-finance-disclaimer", ["bil-reveal-up"], 0);
    prepareRevealGroup(".bil-benefit-grid > .bil-benefit", ["bil-reveal-left", "bil-reveal-up", "bil-reveal-right"], 85);
    prepareRevealGroup(".bil-extra-support", ["bil-reveal-scale"], 0);
    prepareRevealGroup(".bil-service-grid > .bil-resource-card", ["bil-reveal-left", "bil-reveal-up", "bil-reveal-right"], 100);
    prepareRevealGroup(".bil-supplies-wrap", ["bil-reveal-right"], 0);
    prepareRevealGroup(".bil-testimonial-carousel", ["bil-reveal-scale"], 0);
    prepareRevealGroup(".bil-demo-strip", ["bil-reveal-left"], 0);
    prepareRevealGroup(".bil-guide-grid > .bil-guide-card", ["bil-reveal-left", "bil-reveal-up", "bil-reveal-right"], 100);
    prepareRevealGroup(".bil-guide-footer", ["bil-reveal-up"], 0);
    prepareRevealGroup(".bil-final-card", ["bil-reveal-scale"], 0);

    root.querySelectorAll(".bil-reveal").forEach(function (item) {
      if (!item.classList.contains("bil-reveal-left") &&
          !item.classList.contains("bil-reveal-right") &&
          !item.classList.contains("bil-reveal-scale") &&
          !item.classList.contains("bil-reveal-up")) {
        item.classList.add("bil-reveal-up");
      }
    });

    root.classList.add("bil-motion-ready");

    var revealItems = Array.prototype.slice.call(root.querySelectorAll(".bil-reveal"));
    if (reducePageMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, {
        threshold: .08,
        rootMargin: "0px 0px -10% 0px"
      });

      revealItems.forEach(function (item) {
        revealObserver.observe(item);
      });
    }

    var machineSelector = root.querySelector("[data-machine-selector]");
    var activeMachinePanel = null;

    function setMachinePanel(name, options) {
      if (!machineSelector) return;
      options = options || {};
      activeMachinePanel = name || null;
      machineSelector.classList.toggle("has-active", Boolean(activeMachinePanel));
      machineSelector.dataset.active = activeMachinePanel || "";

      machineSelector.querySelectorAll("[data-machine-panel]").forEach(function (panel) {
        var isActive = panel.dataset.machinePanel === activeMachinePanel;
        var details = panel.querySelector(".bil-machine-panel-details");
        var trigger = panel.querySelector("[data-machine-trigger]");
        panel.classList.toggle("is-active", isActive);
        if (details) details.hidden = !isActive;
        if (trigger) trigger.setAttribute("aria-expanded", String(isActive));
      });

      if (options.focusTrigger && options.focusTrigger.focus) {
        options.focusTrigger.focus();
      }
    }

    if (machineSelector) {
      machineSelector.querySelectorAll("[data-machine-trigger]").forEach(function (trigger) {
        trigger.addEventListener("click", function () {
          setMachinePanel(trigger.dataset.machineTrigger);
          window.requestAnimationFrame(function () {
            root.querySelector("#machines").scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });
      });

      machineSelector.querySelectorAll("[data-machine-close]").forEach(function (closeButton) {
        closeButton.addEventListener("click", function () {
          var trigger = machineSelector.querySelector('[data-machine-trigger="' + closeButton.dataset.machineClose + '"]');
          setMachinePanel(null, { focusTrigger: trigger });
          root.querySelector("#machines").scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape" || !activeMachinePanel) return;
        var trigger = machineSelector.querySelector('[data-machine-trigger="' + activeMachinePanel + '"]');
        setMachinePanel(null, { focusTrigger: trigger });
      });
    }

    root.querySelectorAll("[data-machine-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-machine-slide]"));
      var previous = carousel.querySelector("[data-machine-carousel-prev]");
      var next = carousel.querySelector("[data-machine-carousel-next]");
      var currentIndex = 0;
      var timer = null;
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function showSlide(index) {
        if (!slides.length) return;
        currentIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          var isActive = slideIndex === currentIndex;
          var video = slide.querySelector("video");
          slide.classList.toggle("is-active", isActive);
          slide.setAttribute("aria-hidden", String(!isActive));
          if (video) {
            if (isActive) {
              var playPromise = video.play();
              if (playPromise && typeof playPromise.catch === "function") playPromise.catch(function () {});
            } else {
              video.pause();
            }
          }
        });
      }

      function stopRotation() {
        if (timer) window.clearInterval(timer);
        timer = null;
      }

      function startRotation() {
        stopRotation();
        if (reduceMotion || slides.length < 2) return;
        timer = window.setInterval(function () {
          showSlide(currentIndex + 1);
        }, 5500);
      }

      if (previous) previous.addEventListener("click", function () {
        showSlide(currentIndex - 1);
        startRotation();
      });

      if (next) next.addEventListener("click", function () {
        showSlide(currentIndex + 1);
        startRotation();
      });

      carousel.addEventListener("mouseenter", stopRotation);
      carousel.addEventListener("mouseleave", startRotation);
      carousel.addEventListener("focusin", stopRotation);
      carousel.addEventListener("focusout", function (event) {
        if (!carousel.contains(event.relatedTarget)) startRotation();
      });

      showSlide(0);
      startRotation();
    });

    root.querySelectorAll("[data-review-toggle]").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var card = toggle.closest(".bil-testimonial--long");
        if (!card) return;
        var expanded = card.classList.toggle("is-expanded");
        toggle.setAttribute("aria-expanded", String(expanded));
        toggle.textContent = expanded ? "Show less" : "Read more";
      });
    });

    root.querySelectorAll("[data-testimonial-carousel]").forEach(function (carousel) {
      var track = carousel.querySelector("[data-testimonial-track]");
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-testimonial-slide]"));
      var previous = carousel.querySelector("[data-testimonial-prev]");
      var next = carousel.querySelector("[data-testimonial-next]");
      var dotsWrap = carousel.querySelector("[data-testimonial-dots]");
      var pageIndex = 0;
      var pageCount = 1;
      var perView = 3;
      var touchStartX = null;
      var resizeTimer = null;

      function getPerView() {
        if (window.matchMedia("(max-width: 650px)").matches) return 1;
        if (window.matchMedia("(max-width: 1100px)").matches) return 2;
        return 3;
      }

      function buildDots() {
        dotsWrap.innerHTML = "";
        for (var index = 0; index < pageCount; index += 1) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "bil-testimonial-dot";
          dot.setAttribute("aria-label", "Show review group " + (index + 1));
          dot.dataset.testimonialPage = String(index);
          dot.addEventListener("click", function () {
            goToPage(Number(this.dataset.testimonialPage));
          });
          dotsWrap.appendChild(dot);
        }
      }

      function updateControls() {
        var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll(".bil-testimonial-dot"));
        dots.forEach(function (dot, index) {
          var active = index === pageIndex;
          dot.classList.toggle("is-active", active);
          dot.setAttribute("aria-current", active ? "true" : "false");
        });
        if (previous) previous.disabled = pageIndex === 0;
        if (next) next.disabled = pageIndex >= pageCount - 1;
      }

      function goToPage(nextPage, skipAnimation) {
        if (!track || !slides.length) return;
        pageIndex = Math.max(0, Math.min(nextPage, pageCount - 1));
        var targetIndex = Math.min(pageIndex * perView, slides.length - 1);
        var target = slides[targetIndex];
        var offset = target ? target.offsetLeft - track.offsetLeft : 0;
        if (skipAnimation) track.style.transition = "none";
        track.style.transform = "translate3d(" + (-offset) + "px, 0, 0)";
        if (skipAnimation) {
          window.requestAnimationFrame(function () {
            track.style.transition = "";
          });
        }
        updateControls();
      }

      function configureCarousel() {
        perView = getPerView();
        pageCount = Math.max(1, Math.ceil(slides.length / perView));
        pageIndex = Math.min(pageIndex, pageCount - 1);
        buildDots();
        goToPage(pageIndex, true);
      }

      if (previous) previous.addEventListener("click", function () {
        goToPage(pageIndex - 1);
      });

      if (next) next.addEventListener("click", function () {
        goToPage(pageIndex + 1);
      });

      carousel.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") goToPage(pageIndex - 1);
        if (event.key === "ArrowRight") goToPage(pageIndex + 1);
      });

      carousel.addEventListener("touchstart", function (event) {
        touchStartX = event.changedTouches[0].clientX;
      }, { passive: true });

      carousel.addEventListener("touchend", function (event) {
        if (touchStartX === null) return;
        var difference = event.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(difference) < 45) return;
        goToPage(pageIndex + (difference < 0 ? 1 : -1));
      }, { passive: true });

      window.addEventListener("resize", function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(configureCarousel, 120);
      });

      configureCarousel();
    });

    root.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var target = root.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();

        var machinePanel = target.matches("[data-machine-panel]") ? target : target.closest("[data-machine-panel]");
        if (machinePanel) {
          setMachinePanel(machinePanel.dataset.machinePanel);
          root.querySelector("#machines").scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    var countdown = root.querySelector("[data-bil-sale-countdown]");
    if (countdown) {
      var deadline = Date.parse(countdown.getAttribute("data-deadline"));
      var salePanel = root.querySelector("[data-bil-sale]");
      var saleTitle = root.querySelector("[data-bil-sale-title]");
      var saleText = root.querySelector("[data-bil-sale-text]");
      var daysEl = countdown.querySelector("[data-bil-days]");
      var hoursEl = countdown.querySelector("[data-bil-hours]");
      var minutesEl = countdown.querySelector("[data-bil-minutes]");
      var secondsEl = countdown.querySelector("[data-bil-seconds]");

      function twoDigits(value) {
        return String(value).padStart(2, "0");
      }

      function updateCountdown() {
        if (!Number.isFinite(deadline)) return false;

        var remaining = deadline - Date.now();
        if (remaining <= 0) {
          if (salePanel) salePanel.classList.add("is-expired");
          if (saleTitle) saleTitle.innerHTML = "The July machine sale has ended";
          if (saleText) saleText.textContent = "Contact our team for current machine pricing and finance options.";
          countdown.innerHTML = '<p class="bil-sale-ended">Sale ended</p>';
          countdown.setAttribute("aria-label", "The July machine sale has ended");
          return false;
        }

        var totalSeconds = Math.floor(remaining / 1000);
        var days = Math.floor(totalSeconds / 86400);
        var hours = Math.floor((totalSeconds % 86400) / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        daysEl.textContent = twoDigits(days);
        hoursEl.textContent = twoDigits(hours);
        minutesEl.textContent = twoDigits(minutes);
        secondsEl.textContent = twoDigits(seconds);
        countdown.setAttribute("aria-label", days + " days, " + hours + " hours, " + minutes + " minutes and " + seconds + " seconds remaining until the machine sale ends");
        return true;
      }

      if (updateCountdown()) {
        var countdownTimer = window.setInterval(function () {
          if (!updateCountdown()) window.clearInterval(countdownTimer);
        }, 1000);
      }
    }
  })();
