const RADAR_API_KEY = 'prj_test_pk_be09ea0c78f3858e0fb5a481d10b3818ac15cb18';

document.addEventListener("DOMContentLoaded", () => {
    main();
    updateStarIcon();  // Asegúrate de que la estrella esté en el estado correcto al cargar

    // Recuperar ciudades favoritas del localStorage y agregar al menú desplegable
    const favoriteCities = getFavoriteCities();
    favoriteCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.city.toLowerCase().replace(/ /g, '-');
        option.textContent = city.city;
        option.dataset.latitude = city.latitude;
        option.dataset.longitude = city.longitude;
        select.appendChild(option);
    });
});

let cityInput = document.getElementById("cityInput");
const select = document.getElementById("favorite-cities");
const starIcon = document.querySelector('.star-icon');
const city_Name = document.getElementById('city_Name')
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
            
            // Encontrar la ciudad en el objeto y actualizar la información del clima
            const cityData = {
                city: selectedOption.text,
                latitude: parseFloat(selectedOption.dataset.latitude),
                longitude: parseFloat(selectedOption.dataset.longitude)
            };

            object = cityData;  // Actualiza el objeto con la ciudad seleccionada
            apiWeatherCall(object);

            updateStarIcon();  // Actualiza el icono de estrella
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

starIcon.addEventListener('click', () => {
    starIcon.classList.toggle('selected');
    if (starIcon.classList.contains('selected')) {
        addCityToFavorites(object);
    } else {
        removeCityFromFavorites(object.city);
    }
});

function updateStarIcon() {
    const favoriteCities = getFavoriteCities();
    if (favoriteCities.some(city => city.city === object.city)) {
        starIcon.classList.add('selected');
    } else {
        starIcon.classList.remove('selected');
    }
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

            updateStarIcon();  // Actualizar el icono de estrella

            console.log("Ciudad seleccionada de sugerencias:", selectedCityValue);
            console.log("Objeto actualizado:", object);
        });

        suggestionsList.appendChild(li);
    });
}

function addCityToFavorites(cityObject) {
    const favoriteCities = getFavoriteCities();
    if (!favoriteCities.some(city => city.city === cityObject.city)) {
        favoriteCities.push(cityObject);
        saveFavoriteCities(favoriteCities);

        const option = document.createElement('option');
        option.value = cityObject.city.toLowerCase().replace(/ /g, '-');
        option.textContent = cityObject.city;
        option.dataset.latitude = cityObject.latitude;
        option.dataset.longitude = cityObject.longitude;
        option.selected = true;
        select.appendChild(option);
    }
}

function removeCityFromFavorites(cityName) {
    let favoriteCities = getFavoriteCities();
    favoriteCities = favoriteCities.filter(city => city.city !== cityName);
    saveFavoriteCities(favoriteCities);

    const options = Array.from(select.options);
    const optionToRemove = options.find(option => option.textContent === cityName);
    if (optionToRemove) {
        select.removeChild(optionToRemove);
    }
}

function saveFavoriteCities(cities) {
    localStorage.setItem('favoriteCities', JSON.stringify(cities));
}

function getFavoriteCities() {
    const cities = localStorage.getItem('favoriteCities');
    return cities ? JSON.parse(cities) : [];
}

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
            // Mostrar datos
            degreesCelsius.innerText = result.current.temperature_2m;
            city_Name.innerText = object.city;

        })
        .catch((error) => console.error(error));
}

// Llamar a la API de clima con los valores iniciales del objeto
apiWeatherCall(object);
