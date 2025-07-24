function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  function saveTargetCal(value) {
    document.cookie = `targetCal=${encodeURIComponent(value)}; path=/; max-age=${30 * 24 * 60 * 60}`;
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    const targetInput = document.getElementById('targetCal');
    const saveButton = document.getElementById('saveButton');
  
    const savedTarget = getCookie('targetCal');
    if (savedTarget) {
      targetInput.value = savedTarget;
    }
  
    saveButton.addEventListener('click', () => {
      const value = targetInput.value;
      if (value) {
        saveTargetCal(value);
        alert('Cílové kalorie byly uloženy!');
      } else {
        alert('Prosím, zadejte platnou hodnotu.');
      }
    });
  });