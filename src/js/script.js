const RADAR_API_KEY = 'prj_test_pk_be09ea0c78f3858e0fb5a481d10b3818ac15cb18';

document.addEventListener("DOMContentLoaded", () => {
    main();
});

let cityInput = document.getElementById("cityInput");
const select = document.getElementById("favorite-cities");
let isUpdating = false;
let selectedCityValue = '';

// Inicializar el objeto con valores predeterminados
let object = {
    city: "Vancouver, BC CAN",
    latitude: 49.2819,
    longitude: 123.11874,
}

async function main() {

    select.addEventListener('change', () => {
        if (isUpdating) return;

        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption.value) {
            isUpdating = true;
            cityInput.value = '';
            selectedCityValue = selectedOption.text;
            // console.log("Ciudad seleccionada:", selectedCityValue);
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

    document.addEventListener('click', (event) => {
        if (!cityInput.contains(event.target) && !document.getElementById('suggestions').contains(event.target)) {
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

    const response = await fetch(`https://api.radar.io/v1/search/autocomplete?query=${query}&limit=7`, requestOptions);
    const data = await response.json();

    const suggestions = data.addresses.map(address => ({
        formattedAddress: address.formattedAddress,
        latitude: address.latitude,
        longitude: address.longitude
    }));
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = '';

    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion.formattedAddress;
        li.addEventListener('click', () => {
            cityInput.value = suggestion.formattedAddress;
            suggestionsList.innerHTML = '';
            select.value = '';
            selectedCityValue = suggestion.formattedAddress;

            // Actualizar el objeto con la ciudad seleccionada y sus coordenadas
            object.city = suggestion.formattedAddress;
            object.latitude = suggestion.latitude;
            object.longitude = suggestion.longitude;

            apiWeatherCall(object);

            console.log("Ciudad seleccionada de sugerencias:", selectedCityValue);
            console.log("Objeto actualizado:", object);
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

/* Daily Forecast */
async function apiWeatherCall(object) {
    let latitude = object.latitude;
    let longitude = object.longitude;
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            var result = JSON.parse(result);
            console.log(result);
        })
        .catch((error) => console.error(error));
}

// Llamar a la API de clima con los valores iniciales del objeto
apiWeatherCall(object);
