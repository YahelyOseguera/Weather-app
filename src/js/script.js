const RADAR_API_KEY = "prj_test_pk_be09ea0c78f3858e0fb5a481d10b3818ac15cb18";

document.addEventListener("DOMContentLoaded", () => {
  main();
  updateStarIcon(); // Asegúrate de que la estrella esté en el estado correcto al cargar

  // Recuperar ciudades favoritas del localStorage y agregar al menú desplegable
  const favoriteCities = getFavoriteCities();
  favoriteCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city.city.toLowerCase().replace(/ /g, "-");
    option.textContent = city.city;
    option.dataset.latitude = city.latitude;
    option.dataset.longitude = city.longitude;
    select.appendChild(option);
  });
});

let cityInput = document.getElementById("cityInput");
const select = document.getElementById("favorite-cities");
const starIcon = document.querySelector(".star-icon");
const city_Name = document.getElementById("city_Name");
const weatherDescription = document.getElementById("weatherDescription");
const dayOrNight = document.getElementById('dayOrNight');
const precipitation = document.getElementById('precipitation');
const currentTime = document.getElementById('currentTime')
const currentHour = document.getElementById('currentHour')
let isUpdating = false;
let selectedCityValue = "";

// Inicializar el objeto con valores predeterminados
let object = {
  city: "Vancouver, BC CAN",
  latitude: 49.319183,
  longitude: -123.13855,
};


async function main() {
  select.addEventListener("change", () => {
    if (isUpdating) return;

    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption.value) {
      isUpdating = true;
      cityInput.value = "";
      selectedCityValue = selectedOption.text;

      // Encontrar la ciudad en el objeto y actualizar la información del clima
      const cityData = {
        city: selectedOption.text,
        latitude: parseFloat(selectedOption.dataset.latitude),
        longitude: parseFloat(selectedOption.dataset.longitude),
      };

      object = cityData; // Actualiza el objeto con la ciudad seleccionada
      apiWeatherCall(object);

      updateStarIcon(); // Actualiza el icono de estrella
      isUpdating = false;
    }
  });

  cityInput.addEventListener("input", () => {
    if (isUpdating) return;

    const inputText = cityInput.value.trim();
    if (inputText) {
      isUpdating = true;
      select.value = "";
      fetchSuggestions(inputText);
      isUpdating = false;
    } else {
      document.getElementById("suggestions").innerHTML = "";
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !cityInput.contains(event.target) &&
      !document.getElementById("suggestions").contains(event.target)
    ) {
      document.getElementById("suggestions").innerHTML = "";
    }
  });
}

starIcon.addEventListener("click", () => {
  starIcon.classList.toggle("selected");
  if (starIcon.classList.contains("selected")) {
    addCityToFavorites(object);
  } else {
    removeCityFromFavorites(object.city);
  }
});

function updateStarIcon() {
  const favoriteCities = getFavoriteCities();
  if (favoriteCities.some((city) => city.city === object.city)) {
    starIcon.classList.add("selected");
  } else {
    starIcon.classList.remove("selected");
  }
}

async function fetchSuggestions(query) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", RADAR_API_KEY);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(
    `https://api.radar.io/v1/search/autocomplete?query=${query}&limit=7`,
    requestOptions
  );
  const data = await response.json();

  const suggestions = data.addresses.map((address) => ({
    formattedAddress: address.formattedAddress,
    latitude: address.latitude,
    longitude: address.longitude,
  }));
  const suggestionsList = document.getElementById("suggestions");
  suggestionsList.innerHTML = "";

  suggestions.forEach((suggestion) => {
    const li = document.createElement("li");
    li.textContent = suggestion.formattedAddress;
    li.addEventListener("click", () => {
      cityInput.value = suggestion.formattedAddress;
      suggestionsList.innerHTML = "";
      select.value = "";
      selectedCityValue = suggestion.formattedAddress;

      // Actualizar el objeto con la ciudad seleccionada y sus coordenadas
      object.city = suggestion.formattedAddress;
      object.latitude = suggestion.latitude;
      object.longitude = suggestion.longitude;

      apiWeatherCall(object);

      updateStarIcon(); // Actualizar el icono de estrella

      console.log("Ciudad seleccionada de sugerencias:", selectedCityValue);
      console.log("Objeto actualizado:", object);
    });

    suggestionsList.appendChild(li);
  });
}

function addCityToFavorites(cityObject) {
  const favoriteCities = getFavoriteCities();
  if (!favoriteCities.some((city) => city.city === cityObject.city)) {
    favoriteCities.push(cityObject);
    saveFavoriteCities(favoriteCities);

    const option = document.createElement("option");
    option.value = cityObject.city.toLowerCase().replace(/ /g, "-");
    option.textContent = cityObject.city;
    option.dataset.latitude = cityObject.latitude;
    option.dataset.longitude = cityObject.longitude;
    option.selected = true;
    select.appendChild(option);
  }
}

function removeCityFromFavorites(cityName) {
  let favoriteCities = getFavoriteCities();
  favoriteCities = favoriteCities.filter((city) => city.city !== cityName);
  saveFavoriteCities(favoriteCities);

  const options = Array.from(select.options);
  const optionToRemove = options.find(
    (option) => option.textContent === cityName
  );
  if (optionToRemove) {
    select.removeChild(optionToRemove);
  }
}

function saveFavoriteCities(cities) {
  localStorage.setItem("favoriteCities", JSON.stringify(cities));
}

function getFavoriteCities() {
  const cities = localStorage.getItem("favoriteCities");
  return cities ? JSON.parse(cities) : [];
}

async function apiWeatherCall(object) {
  let latitude = object.latitude;
  let longitude = object.longitude;
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      var result = JSON.parse(result);
      console.log(result);

      // Mostrar datos
      city_Name.innerText = object.city;
      degreesCelsius.innerText = result.current.temperature_2m + ' °C';
      precipitation.innerText = "Precipitation: " + result.current.precipitation + " mm";

      currentTime.innerText = new Date(result.current.time).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"});

    //   currentHour.innerText = new Date(result.current.time).toLocaleTimeString();



      switch (result.current.weather_code) {
        case 0:
          weatherDescription.innerText = "Clear Sky";
          break;
        case 1:
          weatherDescription.innerText = "Mainly Clear";
          break;
        case 2:
          weatherDescription.innerText = "Partly Cloudy";
          break;
        case 3:
          weatherDescription.innerText = "Overcast";
          break;
        case 45:
          weatherDescription.innerText = "Fog";
          break;
        case 48:
          weatherDescription.innerText = "Depositing Rime Fog";
          break;
        case 51:
          weatherDescription.innerText = "Light Drizzle";
          break;
        case 53:
          weatherDescription.innerText = "Moderate Drizzle";
          break;
        case 55:
          weatherDescription.innerText = "Heavy Drizzle";
          break;
        case 56:
          weatherDescription.innerText = "Light Freezing Drizzle";
          break;
        case 57:
          weatherDescription.innerText = "Heavy Freezing Drizzle";
          break;
        case 61:
          weatherDescription.innerText = "Slight Rain";
          break;
        case 63:
          weatherDescription.innerText = "Moderate Rain";
          break;
        case 65:
          weatherDescription.innerText = "Heavy Rain";
          break;
        case 66:
          weatherDescription.innerText = "Light Freezing Rain";
          break;
        case 67:
          weatherDescription.innerText = "Heavy Freezing Rain";
          break;
        case 71:
          weatherDescription.innerText = "Slight Snow Fall";
          break;
        case 73:
          weatherDescription.innerText = "Moderate Snow Fall";
          break;
        case 75:
          weatherDescription.innerText = "Heavy Snow Fall";
          break;
        case 77:
          weatherDescription.innerText = "Snow Grains";
          break;
        case 80:
          weatherDescription.innerText = "Slight Rain Showers";
          break;
        case 81:
          weatherDescription.innerText = "Moderate Rain Showers";
          break;
        case 82:
          weatherDescription.innerText = "Violent Rain Showers";
          break;
        case 85:
          weatherDescription.innerText = "Slight Snow Showers";
          break;
        case 86:
          weatherDescription.innerText = "Heavy Snow Showers";
          break;
        case 95:
          weatherDescription.innerText = "Slight Thunderstorm";
          break;
        case 96:
          weatherDescription.innerText = "Moderate Thunderstorm";
          break;
        case 99:
          weatherDescription.innerText = "Thunderstorm with slight and heavy hail";
          break;
      }

      if(result.current.is_day === 1){
        dayOrNight.innerText = 'Day Time'
      } else {
        dayOrNight.innerText = 'Night Time'
      }

    })
    .catch((error) => console.error(error));
}

// Llamar a la API de clima con los valores iniciales del objeto
apiWeatherCall(object);
