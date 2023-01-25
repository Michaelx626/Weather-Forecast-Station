var APIKey = "744cddad10e5ba818360f1fa98197cbd";
var day = dayjs().format("YYYY-MM-DD");
var display = document.querySelector("#display");
var todayTemp = document.querySelector("#temp");
var todayWinds = document.querySelector("#winds");
var todayHumidity = document.querySelector("#humid");
var cities = document.querySelector("#cities");
var historyList = document.querySelector(".history");
var sumbitBtn = document.querySelector("#submitBtn");
var forecastEmojis = document.getElementById('forecast-emoji');
var forecastContainer = document.getElementById("forecast-container");
var userHistory = JSON.parse(localStorage.getItem("userCity")) || [];

userHistory.forEach(function (userCity) {
  var createList = document.createElement("button");
  createList.setAttribute("type", "button");
  createList.textContent = userCity;
  createList.addEventListener("click", function (event) {
    getWeather(event, userCity);
  });
  historyList.appendChild(createList);
});

function getWeather(event, city) {
  event.preventDefault();
  var userInputCity = city || cities.value.trim();
  var currentUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    userInputCity +
    "&appid=" +
    APIKey;
  var forecastUrl =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    userInputCity +
    "&appid=" +
    APIKey;
  if (userInputCity !== "") {
    fetch(currentUrl)
      .then(function (response) {
        if (!response.ok) {
          display.textContent = "Error: City not found! Please try again!";
          todayTemp.textContent = "";
          todayWinds.textContent = "";
          todayHumidity.textContent = "";
        } else {
          var createList = document.createElement("button");
          createList.setAttribute("type", "button");
          createList.addEventListener("click", function () {
            getWeather(event, userInputCity);
          });
          userHistory.push(userInputCity);
          localStorage.setItem("userCity", JSON.stringify(userHistory));
          createList.textContent = userInputCity;
          historyList.appendChild(createList);
          return response.json();
        }
      })
      .then(function (data) {
        console.log(data);
        var condition = data.weather[0].icon;
        var weatherEmoji =
          "http://openweathermap.org/img/wn/" + condition + "@2x.png";
        var emoji = document.createElement("img");
        var convertKelvin = (data.main.temp - 273.15) * (9 / 5) + 32;
        var rounded = (Math.round(convertKelvin * 100) / 100).toFixed(2);
        emoji.setAttribute("src", weatherEmoji);
        display.textContent = userInputCity + " " + day + " ";
        display.appendChild(emoji);
        todayTemp.textContent = "Temp: " + rounded + "°F";
        todayWinds.textContent = "Winds: " + data.wind.speed + " MPH";
        todayHumidity.textContent = "Humidity: " + data.main.humidity + " %";
      });

    fetch(forecastUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        var forecastArray = data.list;
        var filteredArray = [];
        for (var i = 0; i < forecastArray.length; i++) {
          var date = forecastArray[i].dt_txt.slice(0, 10);
          console.log(date);
          if (date != day) {
            filteredArray.push(forecastArray[i]);
          }
        }
        var midDayArray = filteredArray.filter(
          (day) => day.dt_txt.slice(11) == "12:00:00"
        );
        for (var i = 0; i < midDayArray.length; i++) {
            var weatherCard = displayforecastWeatherCard(midDayArray[i]);
            forecastContainer.insertAdjacentHTML("beforeend", weatherCard);
        }
      });
  }
}

function displayforecastWeatherCard({ dt_txt, weather, main, wind }) {
    var convertKelvin = (main.temp - 273.15) * (9 / 5) + 32;
    var rounded = (Math.round(convertKelvin * 100) / 100).toFixed(2);
    return `
    <div class="col">
        <div class="card h-50">
        <div class="card-body bg-dark">
            <h5 class="card-title text-white">${dt_txt.slice(0,11)}</h5>
            <p class="card-text text-white"><img src="http://openweathermap.org/img/wn/${weather[0].icon}@2x.png"></p>
            <p class="card-text text-white">Temp: ${rounded} °F</p>
            <p class="card-text text-white">Wind: ${wind.speed} MPH</p>
            <p class="card-text text-white">Humidity: ${main.humidity} %</p>
        </div>
        </div>
    </div>
  `
}

sumbitBtn.addEventListener("click", getWeather);
