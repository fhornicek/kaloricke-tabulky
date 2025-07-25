document.addEventListener('DOMContentLoaded', () => {
    renderFoodList();
    showcalories(0);
    recalculateMacros();
});

const addButton = document.getElementById('addButton');
    addButton.addEventListener('click', searchFood);

    function searchFood() {
        const searchInput = document.getElementById('searchInput');
        const searchQuery = searchInput.value.toLowerCase();
        const weight = document.getElementById('weight').value;
    
        fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&search_simple=1&action=process&json=1`)
        .then(response => response.json())
        .then(data => {
            const produkt = data.products[0];
            if (produkt && produkt.nutriments) {
                const nutr = produkt.nutriments;
    
                const cal = nutr["energy-kcal_100g"];
                const protein = nutr["proteins_100g"];
                const carbs = nutr["carbohydrates_100g"];
                const fat = nutr["fat_100g"];
    
                if (cal !== undefined) {
                    const kcal = (cal / 100) * weight;
                    const proteinG = (protein / 100) * weight || 0;
                    const carbsG = (carbs / 100) * weight || 0;
                    const fatG = (fat / 100) * weight || 0;
    
                    saveFood(kcal, proteinG, carbsG, fatG);
                    recalculateMacros();
                } else {
                    console.log("Produkt nemá kalorické údaje.");
                }
            } else {
                console.log("Produkt nenalezen nebo chybí nutriments.");
            }
        });
    }

function saveFood(weightcalories, protein, carb, fat) {
    const searchInput = document.getElementById('searchInput').value.trim();
    const newEntry = `${searchInput} + ${weightcalories} + ${protein} + ${carb} + ${fat}`;

    const cookies = document.cookie.split('; ').find(row => row.startsWith('food='));
    const oldValue = cookies ? decodeURIComponent(cookies.split('=')[1]) : '';

    const updatedValue = oldValue ? `${oldValue},${newEntry}` : newEntry;

    document.cookie = `food=${encodeURIComponent(updatedValue)}; path=/; max-age=3600`;

    renderFoodList();
}

function showMacros(protein, carb, fat) {
    const targetProtein = 150;
    const targetCarb = 250;
    const targetFat = 70;

    const proteinPercent = Math.min(protein / targetProtein, 1);
    const carbPercent = Math.min(carb / targetCarb, 1);
    const fatPercent = Math.min(fat / targetFat, 1);

    const circleMap = [
        { id: 'proteinCircle', percent: proteinPercent, color: '#7E22CE', value: protein, textId: 'protein' },
        { id: 'carbCircle', percent: carbPercent, color: '#22c55e', value: carb, textId: 'carb' },
        { id: 'fatCircle', percent: fatPercent, color: '#facc15', value: fat, textId: 'fat' }
    ];

    circleMap.forEach(item => {
        const circle = document.getElementById(item.id);
        const angle = item.percent * 360;
        circle.style.background = `conic-gradient(${item.color} ${angle}deg, #3F3F46 ${angle}deg)`;

        const textElement = document.getElementById(item.textId);
        textElement.innerText = `${Math.round(item.value)}g`;
    });
}

function recalculateMacros() {
    const cookies = document.cookie.split('; ').find(row => row.startsWith('food='));
    if (!cookies) {
        showMacros(0, 0, 0);
        return;
    }

    let totalProtein = 0;
    let totalCarb = 0;
    let totalFat = 0;

    const foodData = decodeURIComponent(cookies.split('=')[1]).split(',');

    foodData.forEach(item => {
        const [ , , protein, carb, fat ] = item.split(' + ').map(v => parseFloat(v));
        if (!isNaN(protein)) totalProtein += protein;
        if (!isNaN(carb)) totalCarb += carb;
        if (!isNaN(fat)) totalFat += fat;
    });

    showMacros(totalProtein, totalCarb, totalFat);
}

function updateMacros(protein, carbs, fats) {
    document.getElementById('protein').textContent = protein.toFixed(1) + ' g';
    document.getElementById('carb').textContent = carbs.toFixed(1) + ' g';
    document.getElementById('fat').textContent = fats.toFixed(1) + ' g';
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
            recalculateMacros();
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





const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocompleteList');

function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

searchInput.addEventListener('input', debounce(async () => {
    const query = searchInput.value.trim();
    if (query.length < 3) {
        autocompleteList.innerHTML = '';
        return;
    }

    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`);
    const data = await response.json();

    const suggestions = data.products.slice(0, 5).filter(p => p.product_name);

    autocompleteList.innerHTML = '';

    suggestions.forEach(product => {
        const li = document.createElement('li');
        li.textContent = product.product_name;
        li.className = 'outline-1 outline-gray-400 px-4 py-2 hover:bg-purple-200 cursor-pointer';

        li.addEventListener('click', () => {
            searchInput.value = product.product_name;
            autocompleteList.innerHTML = '';
        });

        autocompleteList.appendChild(li);
    });
}, 300));

