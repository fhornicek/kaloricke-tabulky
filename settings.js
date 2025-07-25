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
    const proteinInput = document.getElementById('targetProtein');
    const carbsInput = document.getElementById('targetCarbs');
    const fatInput = document.getElementById('targetFat');
    const saveButton = document.getElementById('saveButton');
  
    // Předvyplnění uložených hodnot
    const savedTarget = getCookie('targetCal');
    const savedProtein = getCookie('targetProtein');
    const savedCarbs = getCookie('targetCarbs');
    const savedFat = getCookie('targetFat');
  
    if (savedTarget) targetInput.value = savedTarget;
    if (savedProtein) proteinInput.value = savedProtein;
    if (savedCarbs) carbsInput.value = savedCarbs;
    if (savedFat) fatInput.value = savedFat;
  
    saveButton.addEventListener('click', () => {
      if (targetInput.value) saveTargetCal(targetInput.value);
      if (proteinInput.value) document.cookie = `targetProtein=${proteinInput.value}; path=/`;
      if (carbsInput.value) document.cookie = `targetCarbs=${carbsInput.value}; path=/`;
      if (fatInput.value) document.cookie = `targetFat=${fatInput.value}; path=/`;
  
      alert('Cíle byly uloženy!');
    });
  });