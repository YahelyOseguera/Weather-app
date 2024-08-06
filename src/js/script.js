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

            const dates = result.daily.time;
            const days = dates.map(date =>{
                const day = new Date(date).toLocaleDateString("en-US", {weekday: "long"});
                return day;
            })

            /* First Day */
            let maxTemperatureFirstDay = document.getElementById("maxTemperatureFirstDay");
            maxTemperatureFirstDay.innerHTML = result.daily.temperature_2m_max[1] + "°C"; 
            let minTemperatureFirstDay = document.getElementById("minTemperatureFirstDay");
            minTemperatureFirstDay.innerHTML = result.daily.temperature_2m_min[1] + "°C";
            let imageFirstDay = document.getElementById("imageFirstDay");
            imageFirstDay.src = getCodeWeather(result.daily.weather_code[1]);
            /* IMAGE CODE HERE */
            let firstDate = document.getElementById("firstDate")
            firstDate.innerHTML = days[2];

            /* Secound Day */
            let maxTemperatureSecoundDay = document.getElementById("maxTemperatureSecoundDay");
            maxTemperatureSecoundDay.innerHTML = result.daily.temperature_2m_max[2] + "°C"; 
            let minTemperatureSecoundDay = document.getElementById("minTemperatureSecoundDay");
            minTemperatureSecoundDay.innerHTML = result.daily.temperature_2m_min[2] + "°C";

            let secoundtDate = document.getElementById("secoundtDate")
            secoundtDate.innerHTML = days[3];
        
            /* THIRD DAY */
            let maxTemperatureThirdDay = document.getElementById("maxTemperatureThirdDay");
            maxTemperatureThirdDay.innerHTML = result.daily.temperature_2m_max[3] + "°C"; 
            let minTemperatureThirdDay = document.getElementById("minTemperatureThirdDay");
            minTemperatureThirdDay.innerHTML = result.daily.temperature_2m_min[3] + "°C";

            let thirdDate = document.getElementById("thirdDate")
            thirdDate.innerHTML = days[4];
            /* FOUR DAY */
            let maxTemperatureFourDay = document.getElementById("maxTemperatureFourDay");
            maxTemperatureFourDay.innerHTML = result.daily.temperature_2m_max[4] + "°C"; 
            let minTemperatureFourDay = document.getElementById("minTemperatureFourDay");
            minTemperatureFourDay.innerHTML = result.daily.temperature_2m_min[4] + "°C";

            let fourthDate = document.getElementById("fourthDate")
            fourthDate.innerHTML = days[5];
            /* FIVE  DAY  */
            let maxTemperatureFiveDay = document.getElementById("maxTemperatureFiveDay");
            maxTemperatureFiveDay.innerHTML = result.daily.temperature_2m_max[5] + "°C"; 
            let minTemperatureFiveDay = document.getElementById("minTemperatureFiveDay");
            minTemperatureFiveDay.innerHTML = result.daily.temperature_2m_min[5] + "°C";

            let fifthDate = document.getElementById("fifthDate")
            fifthDate.innerHTML = days[6];

            console.log(result);
        }) 
        .catch((error) => console.error(error));    
} 

function getCodeWeather (value) {
    switch(value){
        case 0: 
            var image = "img/sun.png";
            break;
        case 1:
        case 2:
        case 3:  
            var image = "img/mainlyClear.png";
            break;
        case 45:
        case 48:
            var image = "img/Fog.png";
            break;
        case 51:
        case 53: 
        case 55:
            var image = "img/Frezzing drizzle.png";
            break;
        case 56: 
        case 57:
            var image = "img/rain.png";
            break;
        case 61:
        case 63: 
        case 65:
            var image = "img/Fog.png";
            break;
        case 66: 
        case 67:
            var image = "img/rainyshower.png";
            break;
        case 71:
        case 73: 
        case 75:
            var image = "img/snowfall.png";
            break;
        case 77:
            var image = "img/snowgrain.png";
            break;
        case 80:
        case 81: 
        case 82:
            var image = "img/rainyshower.png";
            break;
        case 85: 
        case 86:
            var image = "img/snowshower.png";
            break;
        case 95:
        case 96: 
        case 99: 
            var image = "img/storm.png";
            break;
        default:
            var image = "img/sun.png";
            break;
        }
        let finalObject = {
            "image" : image
        };
        return finalObject.image;
    }
            // Mostrar datos
            degreesCelsius.innerText = result.current.temperature_2m;
            city_Name.innerText = object.city;

        })
        .catch((error) => console.error(error));
}

// Llamar a la API de clima con los valores iniciales del objeto
apiWeatherCall(object);
