const RADAR_API_KEY = 'prj_test_pk_be09ea0c78f3858e0fb5a481d10b3818ac15cb18';

document.addEventListener("DOMContentLoaded", () => {
    main();
});

let cityInput = document.getElementById("cityInput");
const select = document.getElementById("favorite-cities");
let isUpdating = false;  
let selectedCityValue = ''; 

async function main() {

    select.addEventListener('change', () => {
        if (isUpdating) return;  // Salir si se está actualizando mutuamente

        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption.value) {
            isUpdating = true;  
            cityInput.value = '';  
            selectedCityValue = selectedOption.text; 
            console.log("Ciudad seleccionada:", selectedCityValue); 
            isUpdating = false;  
        }
    });

    cityInput.addEventListener('input', () => {
        if (isUpdating) return;  

        const inputText = cityInput.value.trim();
        if (inputText) {
            isUpdating = true;  
            select.value = '';  
            fetchSuggestions(inputText);
            isUpdating = false;  
        } else {
            document.getElementById('suggestions').innerHTML = '';  
        }
    });
}

async function fetchSuggestions(query) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", RADAR_API_KEY);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const response = await fetch(`https://api.radar.io/v1/search/autocomplete?query=${query}`, requestOptions);
    const data = await response.json();

    const suggestions = data.addresses.map(address => address.formattedAddress);
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = '';

    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {
            cityInput.value = suggestion;
            suggestionsList.innerHTML = '';
            select.value = '';  
            selectedCityValue = suggestion; 
            console.log("Ciudad seleccionada de sugerencias:", selectedCityValue);
        });
        suggestionsList.appendChild(li);
    });
}

async function autocompleteCity() {
    const input = cityInput.value;
    if (input.length < 3) {
        document.getElementById('suggestions').innerHTML = '';
        return;
    }

    fetchSuggestions(input);
}

// Función de ejemplo para usar selectedCityValue con la otra API
function useSelectedCity() {
    if (selectedCityValue) {
        console.log("Usando la ciudad seleccionada para otra API:", selectedCityValue);
    } else {
        console.log("No hay ciudad seleccionada");
    }
}