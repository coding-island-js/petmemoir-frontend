// PetMemoir Quiz — State Machine
// All state lives here + localStorage for refresh survival

const API_URL = 'https://petmemoir-backend.up.railway.app'; // Update after Railway deploy

// ============================================================
// STATE
// ============================================================

const TOTAL_STEPS = 8;
let currentStep = 0;

const state = loadState() || {
  petName: '', petType: '', size: '',
  personality: '', relationship: '',
  habit: '', laughThing: '', strongOpinion: '',
  oneMessage: '', vibe: '', extraStory: '',
  shippingName: '', shippingAddress1: '', shippingAddress2: '',
  shippingCity: '', shippingState: '', shippingZip: '',
  email: ''
};

function saveState() {
  try { localStorage.setItem('petmemoir_state', JSON.stringify(state)); } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('petmemoir_state');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function clearState() {
  try { localStorage.removeItem('petmemoir_state'); } catch (_) {}
}

// ============================================================
// ENTRY POINT
// ============================================================

function startQuiz() {
  showSection('quiz');
  goToStep(1);
}

// ============================================================
// STEP NAVIGATION
// ============================================================

function goToStep(n) {
  // Hide all steps
  document.querySelectorAll('.step').forEach(s => s.classList.add('hidden'));

  const stepEl = document.getElementById(`step-${n}`);
  if (!stepEl) return;
  stepEl.classList.remove('hidden');

  currentStep = n;
  updateProgress(n);
  updatePetNames();

  // Restore saved values
  restoreStep(n);

  // Focus first input
  setTimeout(() => {
    const first = stepEl.querySelector('input:not([type=hidden]), textarea');
    if (first) first.focus();
  }, 100);
}

function nextStep(from) {
  if (!validateStep(from)) return;
  collectStep(from);
  saveState();

  const next = from + 1;
  if (next > TOTAL_STEPS) return;
  goToStep(next);
}

function updateProgress(step) {
  const pct = Math.round(((step - 1) / TOTAL_STEPS) * 100);
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressLabel').textContent = `Step ${step} of ${TOTAL_STEPS}`;
}

// ============================================================
// VALIDATION
// ============================================================

function validateStep(n) {
  clearError(n);

  if (n === 1) {
    const name = document.getElementById('petName').value.trim();
    if (!name) return showError(n, 'Please enter your pet\'s name.');
    return true;
  }

  if (n === 2) {
    const type = getSelectedChip('petType');
    const size = getSelectedChip('petSize');
    if (!type) return showError(n, 'Please select your pet\'s type.');
    if (type === 'Other' && !document.getElementById('petTypeOther').value.trim()) {
      return showError(n, 'Please enter your pet\'s type.');
    }
    if (!size) return showError(n, 'Please select your pet\'s size.');
    return true;
  }

  if (n === 3) {
    const p = getSelectedChip('personality');
    const r = getSelectedChip('relationship');
    if (!p) return showError(n, 'Please pick a personality.');
    if (!r) return showError(n, 'Please pick a relationship.');
    return true;
  }

  if (n === 4) {
    const habit = document.getElementById('habit').value.trim();
    const laugh = document.getElementById('laughThing').value.trim();
    const opinion = document.getElementById('strongOpinion').value.trim();
    if (!habit) return showError(n, 'Please fill in the habit field (or use the example!).');
    if (!laugh) return showError(n, 'Please fill in the laugh field (or use the example!).');
    if (!opinion) return showError(n, 'Please fill in the strong opinion field.');
    return true;
  }

  if (n === 5) {
    const msg = document.getElementById('oneMessage').value.trim();
    if (!msg) return showError(n, 'Please write one thing your pet would say to you.');
    return true;
  }

  if (n === 7) {
    const name = document.getElementById('shippingName').value.trim();
    const addr = document.getElementById('shippingAddress1').value.trim();
    const city = document.getElementById('shippingCity').value.trim();
    const st = document.getElementById('shippingState').value.trim();
    const zip = document.getElementById('shippingZip').value.trim();
    if (!name) return showError(n, 'Please enter your name for shipping.');
    if (!addr) return showError(n, 'Please enter a street address.');
    if (!city) return showError(n, 'Please enter your city.');
    if (!st || st.length !== 2) return showError(n, 'Please enter a 2-letter state (e.g. CA).');
    if (!zip || zip.length < 5) return showError(n, 'Please enter a valid ZIP code.');
    return true;
  }

  return true;
}

function showError(n, msg) {
  const el = document.getElementById(`error-${n}`);
  if (el) el.textContent = msg;
  return false;
}

function clearError(n) {
  const el = document.getElementById(`error-${n}`);
  if (el) el.textContent = '';
}

// ============================================================
// DATA COLLECTION
// ============================================================

function collectStep(n) {
  if (n === 1) {
    state.petName = document.getElementById('petName').value.trim();
  }

  if (n === 2) {
    const rawType = getSelectedChip('petType');
    state.petType = rawType === 'Other'
      ? document.getElementById('petTypeOther').value.trim()
      : rawType;
    state.size = getSelectedChip('petSize');
  }

  if (n === 3) {
    state.personality = getSelectedChip('personality');
    state.relationship = getSelectedChip('relationship');
  }

  if (n === 4) {
    state.habit = document.getElementById('habit').value.trim();
    state.laughThing = document.getElementById('laughThing').value.trim();
    state.strongOpinion = document.getElementById('strongOpinion').value.trim();
  }

  if (n === 5) {
    state.oneMessage = document.getElementById('oneMessage').value.trim();
  }

  if (n === 6) {
    state.vibe = getSelectedChip('vibe') || '';
    state.extraStory = document.getElementById('extraStory').value.trim();
  }

  if (n === 7) {
    state.shippingName = document.getElementById('shippingName').value.trim();
    state.shippingAddress1 = document.getElementById('shippingAddress1').value.trim();
    state.shippingAddress2 = document.getElementById('shippingAddress2').value.trim();
    state.shippingCity = document.getElementById('shippingCity').value.trim();
    state.shippingState = document.getElementById('shippingState').value.trim().toUpperCase();
    state.shippingZip = document.getElementById('shippingZip').value.trim();
    state.email = document.getElementById('email').value.trim();
  }
}

// ============================================================
// RESTORE STATE ON STEP LOAD
// ============================================================

function restoreStep(n) {
  if (n === 1 && state.petName) {
    document.getElementById('petName').value = state.petName;
  }

  if (n === 2) {
    if (state.petType) {
      const standard = ['Dog', 'Cat', 'Other'];
      if (standard.includes(state.petType)) {
        selectChip('petType', state.petType);
      } else {
        selectChip('petType', 'Other');
        document.getElementById('otherTypeWrap').classList.remove('hidden');
        document.getElementById('petTypeOther').value = state.petType;
      }
    }
    if (state.size) selectChip('petSize', state.size);
  }

  if (n === 3) {
    if (state.personality) selectChip('personality', state.personality);
    if (state.relationship) selectChip('relationship', state.relationship);
  }

  if (n === 4) {
    if (state.habit) document.getElementById('habit').value = state.habit;
    if (state.laughThing) document.getElementById('laughThing').value = state.laughThing;
    if (state.strongOpinion) document.getElementById('strongOpinion').value = state.strongOpinion;
  }

  if (n === 5 && state.oneMessage) {
    document.getElementById('oneMessage').value = state.oneMessage;
  }

  if (n === 6) {
    if (state.vibe) selectChip('vibe', state.vibe);
    if (state.extraStory) document.getElementById('extraStory').value = state.extraStory;
  }

  if (n === 7) {
    if (state.shippingName) document.getElementById('shippingName').value = state.shippingName;
    if (state.shippingAddress1) document.getElementById('shippingAddress1').value = state.shippingAddress1;
    if (state.shippingAddress2) document.getElementById('shippingAddress2').value = state.shippingAddress2;
    if (state.shippingCity) document.getElementById('shippingCity').value = state.shippingCity;
    if (state.shippingState) document.getElementById('shippingState').value = state.shippingState;
    if (state.shippingZip) document.getElementById('shippingZip').value = state.shippingZip;
    if (state.email) document.getElementById('email').value = state.email;
    // Update booklet cover with pet name
    const bookletName = document.getElementById('bookletPetName');
    if (bookletName && state.petName) bookletName.textContent = state.petName + "'s";
  }
}

// ============================================================
// CHIP HELPERS
// ============================================================

function getSelectedChip(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return '';
  const selected = group.querySelector('.chip.selected');
  return selected ? selected.getAttribute('data-value') : '';
}

function selectChip(groupId, value) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('selected', c.getAttribute('data-value') === value);
  });
}

// Chip click handlers — delegated to chip-groups
document.querySelectorAll('.chip-group').forEach(group => {
  group.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    const groupId = group.id;
    group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');

    // Show "other type" input if needed
    if (groupId === 'petType' && chip.getAttribute('data-value') === 'Other') {
      document.getElementById('otherTypeWrap').classList.remove('hidden');
    } else if (groupId === 'petType') {
      document.getElementById('otherTypeWrap').classList.add('hidden');
    }
  });
});

// ============================================================
// PET NAME PERSONALIZATION
// ============================================================

function updatePetNames() {
  const name = state.petName || 'your pet';
  document.querySelectorAll('.pet-name-inline').forEach(el => {
    el.textContent = name;
  });
  document.querySelectorAll('.pet-name-confirm').forEach(el => {
    el.textContent = name;
  });
}

// ============================================================
// SUBMIT ORDER
// ============================================================

async function submitOrder() {
  if (!validateStep(7)) return;
  collectStep(7);
  saveState();

  const btn = document.getElementById('btnPay');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  goToStep(8); // Show spinner

  try {
    const payload = {
      petName: state.petName,
      petType: state.petType,
      size: state.size,
      personality: state.personality,
      relationship: state.relationship,
      habit: state.habit,
      laughThing: state.laughThing,
      strongOpinion: state.strongOpinion,
      oneMessage: state.oneMessage,
      vibe: state.vibe || '',
      extraStory: state.extraStory || '',
      shippingName: state.shippingName,
      shippingAddress1: state.shippingAddress1,
      shippingAddress2: state.shippingAddress2 || '',
      shippingCity: state.shippingCity,
      shippingState: state.shippingState,
      shippingZip: state.shippingZip,
      email: state.email || ''
    };

    const res = await fetch(`${API_URL}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.paymentUrl) {
      throw new Error(data.error || 'Order creation failed. Please try again.');
    }

    // Redirect to Stripe — clearState() will happen on confirmation page load
    window.location.href = data.paymentUrl;

  } catch (err) {
    console.error('Submit error:', err);
    // Go back to step 7 with error
    goToStep(7);
    showError(7, err.message || 'Something went wrong. Please try again.');
    btn.disabled = false;
    btn.textContent = `Pay $19.99 & Create ${state.petName || 'Your Pet'}'s Memoir →`;
  }
}

// ============================================================
// SECTION MANAGEMENT
// ============================================================

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.style.display = '';
  });
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'block';
    el.classList.add('active');
  }
}

// ============================================================
// CHECK FOR CONFIRMATION REDIRECT
// On return from Stripe, URL will have ?payment=success or similar
// Stripe payment links redirect to the same URL by default — we detect via URL param
// ============================================================

function checkForConfirmation() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success' || params.get('confirmed') === '1') {
    clearState();
    updatePetNames();
    showSection('confirmation');
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  checkForConfirmation();
  updatePetNames();

  // Keyboard: Enter advances step
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      const activeStep = document.querySelector('.step:not(.hidden)');
      if (!activeStep) return;
      const stepNum = parseInt(activeStep.id.replace('step-', ''), 10);
      if (stepNum && stepNum < 7) nextStep(stepNum);
    }
  });
});
