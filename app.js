/* ============================================================
   Oluwanii Signature Cuts — app.js
   Form validation, file preview, Telegram booking, page polish
   ============================================================ */

(function () {
  "use strict";

  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var TOKEN = "8026364800:AAHzkJz0wFsFkJUMR60JKrFYes4Dx_gxH5k";
  var CHAT_ID = "-1002551826027";
  var MAX_IMAGE_MB = 10; // Telegram sendPhoto limit
  var BOOKING_KEY = "oluwaniicutz_last_booking";

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */

  var yearEl = $("#year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Sticky header shadow ---------- */

  var header = $(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Reveal on scroll (with a little stagger in grids) ---------- */

  $$(".pricing-grid, .gallery-grid").forEach(function (grid) {
    $$(".reveal", grid).forEach(function (el, i) {
      el.style.transitionDelay = (i % 6) * 60 + "ms";
    });
  });

  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- Form references ---------- */

  var form = $("#appointmentForm");
  if (!form) return;

  var submitBtn = $("#submitBtn");
  var formError = $("#formError");
  var serviceSelect = $("#service");
  var dateInput = $("#date");
  var timeInput = $("#time");
  var uploadInput = $("#upload");
  var uploadPreview = $("#uploadPreview");

  /* ---------- Date: no past dates; time: shop hours ---------- */

  if (dateInput) {
    var now = new Date();
    var iso =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    dateInput.min = iso;
  }

  /* ---------- Field errors ---------- */

  function fieldWrap(input) {
    return input && input.closest ? input.closest(".field") : null;
  }

  function setFieldError(input, message) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    var err = $(".field-error", wrap);
    if (err) err.textContent = message;
  }

  function clearFieldError(input) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    var err = $(".field-error", wrap);
    if (err) err.textContent = "";
  }

  function validateField(input) {
    var value = (input.value || "").trim();
    switch (input.id) {
      case "name":
        if (value.length < 2) {
          setFieldError(input, "Please enter your full name.");
          return false;
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          setFieldError(input, "Please enter a valid email address.");
          return false;
        }
        break;
      case "phone":
        if (!/^\+?[\d\s\-()]{7,15}$/.test(value)) {
          setFieldError(input, "Please enter a valid phone number.");
          return false;
        }
        break;
      case "service":
        if (!value) {
          setFieldError(input, "Please choose a service.");
          return false;
        }
        break;
      case "date":
        if (!value) {
          setFieldError(input, "Please pick a date.");
          return false;
        } else if (dateInput.min && value < dateInput.min) {
          setFieldError(input, "The date can’t be in the past.");
          return false;
        }
        break;
      case "time":
        if (!value) {
          setFieldError(input, "Please pick a time.");
          return false;
        } else if (
          (timeInput.min && value < timeInput.min) ||
          (timeInput.max && value > timeInput.max)
        ) {
          setFieldError(input, "We’re open 8:00am – 8:00pm.");
          return false;
        }
        break;
    }
    clearFieldError(input);
    return true;
  }

  // Clear / re-validate a field as soon as the user fixes it
  ["name", "email", "phone", "service", "date", "time"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, function () {
      if (fieldWrap(el) && fieldWrap(el).classList.contains("invalid")) {
        validateField(el);
      }
    });
  });

  /* ---------- Image upload: preview + size guard ---------- */

  var previewUrl = null;

  function formatSize(bytes) {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    return Math.round(bytes / 1024) + " KB";
  }

  function renderPreview() {
    if (!uploadPreview) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    uploadPreview.hidden = true;
    uploadPreview.textContent = "";

    var file = uploadInput.files && uploadInput.files[0];
    if (!file) return;

    if (!file.type || file.type.indexOf("image/") !== 0) {
      setFieldError(uploadInput, "Please choose an image file (JPG or PNG).");
      uploadInput.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setFieldError(
        uploadInput,
        "That image is " +
          formatSize(file.size) +
          " — please keep it under " +
          MAX_IMAGE_MB +
          " MB."
      );
      uploadInput.value = "";
      return;
    }

    clearFieldError(uploadInput);

    previewUrl = URL.createObjectURL(file);
    var img = document.createElement("img");
    img.src = previewUrl;
    img.alt = "Reference preview";

    var meta = document.createElement("div");
    meta.className = "preview-meta";
    var nameEl = document.createElement("div");
    nameEl.className = "preview-name";
    nameEl.textContent = file.name;
    var sizeEl = document.createElement("div");
    sizeEl.className = "preview-size";
    sizeEl.textContent = formatSize(file.size);
    meta.appendChild(nameEl);
    meta.appendChild(sizeEl);

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "preview-remove";
    removeBtn.setAttribute("aria-label", "Remove image");
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", function () {
      uploadInput.value = "";
      clearFieldError(uploadInput);
      renderPreview();
    });

    uploadPreview.appendChild(img);
    uploadPreview.appendChild(meta);
    uploadPreview.appendChild(removeBtn);
    uploadPreview.hidden = false;
  }

  if (uploadInput) {
    uploadInput.addEventListener("change", renderPreview);
  }

  /* ---------- Banner + loading state ---------- */

  function showBanner(type, message) {
    if (!formError) return;
    formError.className = "form-banner " + type;
    // Messages passed here are static strings (never user input), so this is safe.
    formError.innerHTML = message;
    formError.hidden = false;
  }

  function hideBanner() {
    if (formError) formError.hidden = true;
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.classList.toggle("is-loading", loading);
    submitBtn.disabled = loading;
    submitBtn.setAttribute("aria-busy", String(loading));
    var label = $(".btn-label", submitBtn);
    if (label) {
      label.textContent = loading ? "Sending your request…" : "Book Appointment";
    }
  }

  /* ---------- Pricing card → pre-select service ---------- */

  $$(".card-select").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var service = btn.getAttribute("data-service");
      if (service && serviceSelect) {
        serviceSelect.value = service;
        clearFieldError(serviceSelect);
      }
      var book = $("#book");
      if (book) {
        book.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      }
      window.setTimeout(function () {
        var name = document.getElementById("name");
        if (name) name.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 500);
    });
  });

  /* ---------- Submit: validate, send to Telegram, redirect ---------- */

  // Escape Markdown specials so Telegram never fails on a name with "_" etc.
  function md(s) {
    return String(s).replace(/[_*[\]]/g, "\\$&");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    hideBanner();

    var ids = ["name", "email", "phone", "service", "date", "time"];
    var firstInvalid = null;
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (!validateField(el) && !firstInvalid) firstInvalid = el;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      showBanner(
        "error",
        "Please fix the highlighted fields and try again."
      );
      return;
    }

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var service = document.getElementById("service").value;
    var date = dateInput.value;
    var time = timeInput.value;
    var notes = document.getElementById("notes").value.trim();
    var image = uploadInput.files && uploadInput.files[0];

    var message =
      "💈 *New Appointment Booking* 💈\n\n" +
      "👤 *Name:* " + md(name) + "\n" +
      "📧 *Email:* " + md(email) + "\n" +
      "📱 *Phone:* " + md(phone) + "\n" +
      "✂️ *Service:* " + md(service) + "\n" +
      "📅 *Date:* " + md(date) + "\n" +
      "⏰ *Time:* " + md(time) + "\n" +
      "📝 *Notes:* " + md(notes || "None");

    setLoading(true);

    function finish(ok, failText) {
      if (ok) {
        try {
          localStorage.setItem(
            BOOKING_KEY,
            JSON.stringify({ name: name, service: service, date: date, time: time, phone: phone })
          );
        } catch (err) {
          /* private mode — the redirect still works, summary just stays generic */
        }
        window.location.href = "thank-you-page.html";
      } else {
        setLoading(false);
        showBanner("error", failText);
      }
    }

    var sendFail =
      "We couldn’t send your booking just now. Please try again, or " +
      "<a href='https://wa.me/2347025113434' target='_blank' rel='noopener'>WhatsApp us directly</a>.";

    if (
      image &&
      image.type &&
      image.type.indexOf("image/") === 0 &&
      image.size <= MAX_IMAGE_MB * 1024 * 1024
    ) {
      var formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("photo", image);
      formData.append("caption", message);
      formData.append("parse_mode", "Markdown");

      fetch("https://api.telegram.org/bot" + TOKEN + "/sendPhoto", {
        method: "POST",
        body: formData
      })
        .then(function (res) {
          if (res.ok) {
            finish(true);
          } else {
            setLoading(false);
            showBanner("error", sendFail);
          }
        })
        .catch(function () {
          setLoading(false);
          showBanner("error", "Network error occurred. Please check your connection and try again.");
        });
    } else {
      var url =
        "https://api.telegram.org/bot" +
        TOKEN +
        "/sendMessage?chat_id=" +
        encodeURIComponent(CHAT_ID) +
        "&text=" +
        encodeURIComponent(message) +
        "&parse_mode=Markdown";

      fetch(url)
        .then(function (res) {
          if (res.ok) {
            finish(true);
          } else {
            setLoading(false);
            showBanner("error", sendFail);
          }
        })
        .catch(function () {
          setLoading(false);
          showBanner("error", "Network error occurred. Please check your connection and try again.");
        });
    }
  });
})();
