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

    const suggestions = data.addresses.map(address => address.formattedAddress);
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = '';

    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {

            console.log(suggestion);


            cityInput.value = suggestion;
            suggestionsList.innerHTML = '';
            select.value = '';
            selectedCityValue = suggestion;

            apiWeatherCall(objecto);

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

/* Daily Forescast */ 
let object = {
    city: "Vancouver",
    latitude: 49.2819,
    longitude: 123.11874, 
}

apiWeatherCall(object);

async function apiWeatherCall (object){
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
            maxTemperatureFirstDay.innerHTML = result.daily.temperature_2m_max[1] + "C"; 
            let minTemperatureFirstDay = document.getElementById("minTemperatureFirstDay");
            minTemperatureFirstDay.innerHTML = result.daily.temperature_2m_min[1] + "C";
            let imageFirstDay = document.getElementById("imageFirstDay");
            imageFirstDay.src = getCodeWeather(result.daily.weather_code[1]);
            /* IMAGE CODE HERE */
            let firstDate = document.getElementById("firstDate")
            firstDate.innerHTML = days[2];

            /* Secound Day */
            let maxTemperatureSecoundDay = document.getElementById("maxTemperatureSecoundDay");
            maxTemperatureSecoundDay.innerHTML = result.daily.temperature_2m_max[2] + "C"; 
            let minTemperatureSecoundDay = document.getElementById("minTemperatureSecoundDay");
            minTemperatureSecoundDay.innerHTML = result.daily.temperature_2m_min[2] + "C";

            let secoundtDate = document.getElementById("secoundtDate")
            secoundtDate.innerHTML = days[3];
        
            /* THIRD DAY */
            let maxTemperatureThirdDay = document.getElementById("maxTemperatureThirdDay");
            maxTemperatureThirdDay.innerHTML = result.daily.temperature_2m_max[3] + "C"; 
            let minTemperatureThirdDay = document.getElementById("minTemperatureThirdDay");
            minTemperatureThirdDay.innerHTML = result.daily.temperature_2m_min[3] + "C";

            let thirdDate = document.getElementById("thirdDate")
            thirdDate.innerHTML = days[4];
            /* FOUR DAY */
            let maxTemperatureFourDay = document.getElementById("maxTemperatureFourDay");
            maxTemperatureFourDay.innerHTML = result.daily.temperature_2m_max[4] + "C"; 
            let minTemperatureFourDay = document.getElementById("minTemperatureFourDay");
            minTemperatureFourDay.innerHTML = result.daily.temperature_2m_min[4] + "C";

            let fourthDate = document.getElementById("fourthDate")
            fourthDate.innerHTML = days[5];
            /* FIVE  DAY  */
            let maxTemperatureFiveDay = document.getElementById("maxTemperatureFiveDay");
            maxTemperatureFiveDay.innerHTML = result.daily.temperature_2m_max[5] + "C"; 
            let minTemperatureFiveDay = document.getElementById("minTemperatureFiveDay");
            minTemperatureFiveDay.innerHTML = result.daily.temperature_2m_min[5] + "C";

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
