// Table reservation form (POST /api/reservations) and feedback form (POST /api/feedback).
const Forms = (() => {
  function todayString() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  async function submitReservation(event) {
    event.preventDefault();
    clearError('reservation-error');
    const form = event.target;

    const data = {
      name: form.name.value.trim(),
      contact: form.contact.value.trim(),
      date: form.date.value,
      time: form.time.value,
      guests: Number(form.guests.value)
    };

    if (!data.name) return showError('reservation-error', 'Enter your name.');
    if (!data.contact) return showError('reservation-error', 'Enter an email or phone number.');
    if (!data.date) return showError('reservation-error', 'Pick a date.');
    if (data.date < todayString()) return showError('reservation-error', 'Pick today or a future date.');
    if (!data.time) return showError('reservation-error', 'Pick a time.');
    if (data.time < '08:00' || data.time > '21:30') return showError('reservation-error', 'We take bookings between 08:00 and 21:30.');
    if (!Number.isInteger(data.guests) || data.guests < 1 || data.guests > 20) return showError('reservation-error', 'Guests must be between 1 and 20.');

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Reserving...';
    try {
      const result = await apiPost('/reservations', data);
      form.reset();
      form.guests.value = 2;
      showToast('Table booked. Your reservation number is #' + result.id + '.');
    } catch (err) {
      showError('reservation-error', err.message);
    } finally {
      button.disabled = false;
      button.textContent = 'Reserve this table';
    }
  }

  async function submitFeedback(event) {
    event.preventDefault();
    clearError('feedback-error');
    const form = event.target;

    const checked = form.querySelector('input[name="rating"]:checked');
    const data = {
      name: form.name.value.trim(),
      rating: checked ? Number(checked.value) : 0,
      message: form.message.value.trim()
    };

    if (!data.rating) return showError('feedback-error', 'Choose a star rating.');
    if (!data.message) return showError('feedback-error', 'Write a short message.');

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Sending...';
    try {
      await apiPost('/feedback', data);
      form.reset();
      showToast('Thank you. Your feedback has been sent.');
    } catch (err) {
      showError('feedback-error', err.message);
    } finally {
      button.disabled = false;
      button.textContent = 'Send feedback';
    }
  }

  function init() {
    const dateInput = $('#res-date');
    dateInput.min = todayString();
    $('#reservation-form').addEventListener('submit', submitReservation);
    $('#feedback-form').addEventListener('submit', submitFeedback);
  }

  return { init };
})();
