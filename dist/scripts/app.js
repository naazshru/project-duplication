import {
  TRANSITIONS,
  selectRandomTransition,
  normalizeSlideDuration,
} from "./slideshow.js";

const imageInput = document.getElementById("imageInput");
const audioInput = document.getElementById("audioInput");
const previewBtn = document.getElementById("previewBtn");
const stopBtn = document.getElementById("stopBtn");
const previewImage = document.getElementById("previewImage");
const transitionName = document.getElementById("transitionName");
const filterSelect = document.getElementById("filterSelect");
const durationInput = document.getElementById("durationInput");
const audioPlayer = document.getElementById("audioPlayer");
const subtitleEditor = document.getElementById("subtitleEditor");
const subtitleDisplay = document.getElementById("subtitleDisplay");

let slides = [];
let activeIndex = 0;
let slideshowTimer = null;
let audioUrl = null;

imageInput.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  slides = await Promise.all(files.map(readImageFile));
  buildSubtitleEditor(slides);
  resetPreview();
});

audioInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  }

  if (file) {
    audioUrl = URL.createObjectURL(file);
    audioPlayer.src = audioUrl;
    audioPlayer.load();
  } else {
    audioPlayer.removeAttribute("src");
    audioPlayer.load();
  }
});

previewBtn.addEventListener("click", () => {
  if (!slides.length) {
    alert("Please upload at least one image to preview.");
    return;
  }

  const slideDuration = normalizeSlideDuration(durationInput.value);
  const filterValue = filterSelect.value;
  const subtitles = collectSubtitles();

  previewBtn.disabled = true;
  stopBtn.disabled = false;
  imageInput.disabled = true;
  audioInput.disabled = true;
  filterSelect.disabled = true;
  durationInput.disabled = true;

  activeIndex = 0;
  startAudioPlayback();
  renderSlide(slides[activeIndex], subtitles[activeIndex], filterValue);

  clearInterval(slideshowTimer);
  slideshowTimer = setInterval(() => {
    activeIndex = (activeIndex + 1) % slides.length;
    renderSlide(slides[activeIndex], subtitles[activeIndex], filterValue);
  }, slideDuration);
});

stopBtn.addEventListener("click", stopSlideshow);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopSlideshow();
  }
});

function stopSlideshow() {
  previewBtn.disabled = false;
  stopBtn.disabled = true;
  imageInput.disabled = false;
  audioInput.disabled = false;
  filterSelect.disabled = false;
  durationInput.disabled = false;

  clearInterval(slideshowTimer);
  slideshowTimer = null;
  transitionName.textContent = "—";
  previewImage.className = "";
  subtitleDisplay.classList.remove("visible");

  audioPlayer.pause();
  audioPlayer.currentTime = 0;
}

function startAudioPlayback() {
  if (!audioPlayer.src) {
    return;
  }

  audioPlayer.currentTime = 0;
  const playPromise = audioPlayer.play();
  if (playPromise) {
    playPromise.catch(() => {
      // If autoplay is blocked, expose controls to let the user start manually.
      audioPlayer.controls = true;
    });
  }
}

function renderSlide(slide, subtitle, filterValue) {
  if (!slide) {
    return;
  }

  const transition = selectRandomTransition(TRANSITIONS);

  previewImage.src = slide.src;
  previewImage.style.filter = filterValue;
  previewImage.className = "";
  // Force reflow to restart CSS animation classes.
  void previewImage.offsetWidth;
  previewImage.className = `image-display ${transition.className}`;

  transitionName.textContent = transition.name;

  if (subtitle && subtitle.trim().length) {
    subtitleDisplay.textContent = subtitle.trim();
    subtitleDisplay.classList.add("visible");
  } else {
    subtitleDisplay.textContent = "";
    subtitleDisplay.classList.remove("visible");
  }
}

function collectSubtitles() {
  return Array.from(
    subtitleEditor.querySelectorAll(".subtitle-row input")
  ).map((input) => input.value || "");
}

function buildSubtitleEditor(items) {
  subtitleEditor.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.textContent = "No images added yet.";
    empty.className = "empty-hint";
    subtitleEditor.appendChild(empty);
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "subtitle-row";

    const label = document.createElement("label");
    label.textContent = `Subtitle for slide ${index + 1}`;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Describe this moment";
    input.value = item.subtitle || "";

    row.appendChild(label);
    row.appendChild(input);
    subtitleEditor.appendChild(row);
  });
}

function resetPreview() {
  stopSlideshow();
  previewImage.removeAttribute("src");
  transitionName.textContent = "—";
  subtitleDisplay.textContent = "";
  subtitleDisplay.classList.remove("visible");
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: reader.result, subtitle: "" });
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Initialize with empty state placeholder.
buildSubtitleEditor([]);

window.addEventListener("beforeunload", () => {
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
  }
});
