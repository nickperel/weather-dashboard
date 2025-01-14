// Element selectors
var searchBoxEl = document.querySelector("#search");
var clearBtnEl = document.querySelector("#clear");
var cityInputEl = document.querySelector(".validate");
var btnContainerEl = document.querySelector(".btn-container");
var todayEl = document.querySelector("#today");
var fiveDayEl = document.querySelector(".five-day");
var cityDisplayEl = document.querySelector("#jumbotron");
var tempEl = document.querySelector("#main-temp");
var windEl = document.querySelector("#main-wind");
var humidEl = document.querySelector("#main-humid");
var uvEl = document.querySelector("#main-uv");
var uvWrapperEl = document.querySelector("#uv-background");
var lat;
var lon;

// Global Variables
var defaultLocations = ["New Jersey", "Colorado", "Orlando"];
var today = moment().format("MMM Do");
var apiKey = "4e8ea4c48fc1caa38029a76e8f4dcc2b";
var recentSearch = [];
var currentCity = "";
var eachDay = fiveDayEl.children;

// Set today and next five dates
var setDates = function () {
  todayEl.closest("span").textContent = today;

  for (var i = 0; i < eachDay.length; i++) {
    var child = eachDay[i];
    child.children[0].textContent = moment()
      .add(i + 1, "days")
      .format("MMM Do");
  }
};

// API call and main logic handler
var getWeather = function (cityName) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`;
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        populateToday(data);
        setHeadingIcon(data);
        setUVIndex();
        populateFiveDay(data);
        generateRecentSearchBtn(data.city.name);
        localStorage.setItem("cities", JSON.stringify(recentSearch));
        currentCity = cityName;
      });
    } else {
      alert("City Not Found");
    }
  });
};

var setUVIndex = function () {
  let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        uvEl.textContent = data.current.uvi;
        setUVBackground(data);
      });
    }
  });
};

var setUVBackground = function (data) {
  if (data.current.uvi >= 8) {
    uvWrapperEl.style.setProperty("--uv-index", "rgb(219, 13, 13)");
  } else if (data.current.uvi >= 6) {
    uvWrapperEl.style.setProperty("--uv-index", "rgb(245, 170, 31)");
  } else if (data.current.uvi >= 3) {
    uvWrapperEl.style.setProperty("--uv-index", "rgb(230, 230, 36)");
  } else {
    uvWrapperEl.style.setProperty("--uv-index", "rgb(155, 216, 155)");
  }
};

var populateToday = function (data) {
  cityDisplayEl.textContent = data.city.name;
  tempEl.textContent = data.list[2].main.temp;
  windEl.textContent = data.list[2].wind.speed;
  humidEl.textContent = data.list[2].main.humidity;
  lat = data.city.coord.lat;
  lon = data.city.coord.lon;
};

var setHeadingIcon = function (data) {
  var iconEl = document.querySelector(".heading-icon");
  var iconUrl =
    "http://openweathermap.org/img/wn/" +
    data.list[2].weather[0].icon +
    "@2x.png";
  iconEl.setAttribute("src", iconUrl);
};

var populateFiveDay = function (data) {
  var nextDay = 0;
  for (var i = 0; i < eachDay.length; i++) {
    var child = eachDay[i];
    var imgUrl =
      "http://openweathermap.org/img/wn/" +
      data.list[nextDay].weather[0].icon +
      "@2x.png";
    child.children[1].setAttribute("src", imgUrl);
    child.children[2].textContent =
      "Temp: " + data.list[nextDay].main.temp + " °F";
    child.children[3].textContent =
      "Wind: " + data.list[nextDay].wind.speed + " MPH";
    child.children[4].textContent =
      "Humidity: " + data.list[nextDay].main.humidity + " %";
    nextDay += 5;
  }
};

var generateRecentSearchBtn = function (city) {
  if (!recentSearch.includes(city)) {
    var cityBtnEl = document.createElement("a");
    cityBtnEl.classList = "waves-effect waves-light btn-large search-btn";
    cityBtnEl.setAttribute("data-city", city);
    cityBtnEl.textContent = city;

    btnContainerEl.appendChild(cityBtnEl);
    recentSearch.push(city);
  }
};

// Gets value from btn to and sends to getWeather function to use recent searches
var getWeatherFromBtn = function (event) {
  var city = event.target.getAttribute("data-city");
  getWeather(city);
};

var loadRecentSearch = function () {
  var loadedSearches = JSON.parse(localStorage.getItem("cities"));

  for (let i = 0; i < loadedSearches.length; i++) {
    generateRecentSearchBtn(loadedSearches[i]);
  }
};

// Defaults all cities in the default array and maintains them as recent search btns
var setDefaults = function () {
  for (var i = 0; i < defaultLocations.length; i++) {
    getWeather(defaultLocations[i]);
  }
};

// Only try to load recent searches if there are itmes saved in local storage
if (localStorage.getItem("cities")) {
  loadRecentSearch();
}

// Default function calls
setDefaults();
setDates();

// Btn handlers
var submitBtnHandler = function (event) {
  event.preventDefault();

  var city = cityInputEl.value.trim();
  if (city) {
    getWeather(city);
    cityInputEl.value = "";
  } else {
    alert("Please Enter a City Name");
  }
};

var clearBtnHandler = function () {
  var loadedSearches = JSON.parse(localStorage.getItem("cities"));
  for (let i = 0; i < loadedSearches.length; i++) {
    var btnEl = document.querySelector(".search-btn");
    btnContainerEl.removeChild(btnEl);
  }
  recentSearch = [];
  localStorage.setItem("cities", "");
};

// Event Listeners
searchBoxEl.addEventListener("click", submitBtnHandler);
clearBtnEl.addEventListener("click", clearBtnHandler);
btnContainerEl.addEventListener("click", getWeatherFromBtn);
