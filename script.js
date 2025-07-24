document.addEventListener('DOMContentLoaded', () => {
    renderFoodList();
});

const addButton = document.getElementById('addButton');
    addButton.addEventListener('click', searchFood);

function searchFood() {
 const searchInput = document.getElementById('searchInput')
    const searchQuery = searchInput.value.toLowerCase();
    fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&search_simple=1&action=process&json=1`)
    .then(response => response.json())
    .then(data => {
        const produkt = data.products[0];
        const weight = document.getElementById('weight');
        console.log("Celý produkt:", produkt);
        if (produkt && produkt.nutriments && produkt.nutriments["energy-kcal_100g"]) {
           const kalorie = produkt.nutriments["energy-kcal_100g"];
           const weightcalories = (kalorie / 100) * weight.value;
           saveFood(weightcalories);
        } else {
           console.log("Produkt nenalezen nebo nemá kalorické údaje.");
        }
})
}

function saveFood(weightcalories) {
    const searchInput = document.getElementById('searchInput').value.trim();
    const newEntry = `${searchInput} + ${weightcalories}`;


    const cookies = document.cookie.split('; ').find(row => row.startsWith('food='));
    const oldValue = cookies ? decodeURIComponent(cookies.split('=')[1]) : '';


    const updatedValue = oldValue ? `${oldValue},${newEntry}` : newEntry;


    document.cookie = `food=${encodeURIComponent(updatedValue)}; path=/; max-age=3600`;
    renderFoodList();
}

function renderFoodList() {
    const cookies = document.cookie.split('; ').find(row => row.startsWith('food='));
    if (!cookies) return;

    const foodData = decodeURIComponent(cookies.split('=')[1]).split(',');
    const listElement = document.getElementById('foodList');
    listElement.innerHTML = '';

    let totalCalories = 0;

    foodData.forEach((item, index) => {
        const [name, calories] = item.split(' + ');

        const li = document.createElement('li');
        li.className = 'bg-zinc-700 p-4 rounded-lg mb-2 flex justify-between items-center';

        const caloriesRounded = parseFloat(calories).toFixed(0);


        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;

        const calSpan = document.createElement('span');
        calSpan.textContent = caloriesRounded + ' kcal';

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.className = 'ml-4 text-red-400 hover:text-red-600 text-xl font-bold';
        removeBtn.onclick = () => {
            removeFood(index);      
            li.remove();            
            recalculateCalories();  
        };

        li.appendChild(nameSpan);
        li.appendChild(calSpan);
        li.appendChild(removeBtn);
        listElement.appendChild(li);

        const kcal = parseFloat(calories);
        if (!isNaN(kcal)) {
            totalCalories += kcal;
        }
    });
    showcalories(totalCalories.toFixed(0));
}

function recalculateCalories() {
    const cookies = document.cookie.split('; ').find(row => row.startsWith('food='));
    if (!cookies) {
        showcalories(0);
        return;
    }

    let total = 0;
    const foodData = decodeURIComponent(cookies.split('=')[1]).split(',');
    foodData.forEach(item => {
        const [, calories] = item.split(' + ');
        const kcal = parseFloat(calories);
        if (!isNaN(kcal)) total += kcal;
    });
    showcalories(total.toFixed(0));
}

function removeFood(indexToRemove) {
    const cookies = document.cookie.split('; ').find(row => row.startsWith('food='));
    if (!cookies) return;

    let foodData = decodeURIComponent(cookies.split('=')[1]).split(',');
    foodData.splice(indexToRemove, 1); // smaže jeden záznam

    document.cookie = `food=${encodeURIComponent(foodData.join(','))}; path=/; max-age=3600`;
}

function showcalories(total) {
    const targetCalInput = document.getElementById('targetCal');
    const target = targetCalInput ? targetCalInput.value : getCookie('targetCal') || 2000; 
    const percentage = Math.min(total / target, 1);

    const caloriesElement = document.getElementById('calories');
    caloriesElement.innerHTML = `${total}/${target} kcal`;

    const progressCircle = document.getElementById('progressCircle');
    const angle = percentage * 360;

    progressCircle.style.background = `conic-gradient(#7E22CE ${angle}deg, #3F3F46 ${angle}deg)`;
}


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}



