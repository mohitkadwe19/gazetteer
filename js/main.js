// Create a tile layer for streets using ArcGIS Online service
let streets = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
  }
);

// Create a tile layer for satellite imagery using ArcGIS Online service

let satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

// Define basemaps object to store the tile layers for streets and satellite imagery

let basemaps = {
  Streets: streets,
  Satellite: satellite,
};

// Create a map using Leaflet and set the initial view to center around coordinates [54.5, -4] with zoom level 6, and add the streets tile layer as the default layer
let map = L.map("map", {
  layers: [streets],
}).setView([54.5, -4], 6);

// Add a layer control to allow switching between streets and satellite imagery tile layers
let layerControl = L.control.layers(basemaps).addTo(map);

// Initialize variables for storing data related to a country
let border;
let currencyCode;
let countryName;
let capitalCityWeather;
let capitalCityLat;
let capitalCityLon;
let iso2CountryCode;
let currencyRate;
let countryCode;

// Create a feature group for storing circles on the map and add it to the map
let myCircles = new L.featureGroup().addTo(map);

// Create a leaflet easyButton with a home icon
L.easyButton("fa-home", function (btn, map) {
  // Show a modal with the id "exampleModal"
  $("#exampleModal").modal("show");
  // Make an AJAX request to the PHP endpoint "./php/restCountries.php"
  $.ajax({
    url: "./php/restCountries.php",
    type: "POST",
    dataType: "json",
    data: {
      country: $("#countrySelect").val(),
    },
    success: function (result) {
      // If the AJAX request is successful
      if (result.status.name == "ok") {
        // Extract currency code, capital city weather, and ISO2 country code from the result
        currencyCode = Object.keys(result.data.currencies)[0];
        capitalCityWeather = result.data.capital[0].toLowerCase();
        iso2CountryCode = result.data.cca2;
        countryCode = result.data.cca2;
        // Replace spaces with underscores in the country name
        let countryName2 = result.data.name.common;
        countryName = countryName2.replace(/\s+/g, "_");

        // Make a second AJAX request to the Wikipedia API for country summary
        $.ajax({
          url:
            "https://en.wikipedia.org/api/rest_v1/page/summary/" + countryName,
          type: "GET",
          dataType: "json",
          success: function (result) {
            // Update the HTML with the Wikipedia summary and image
            $("#txtWikiImg").html(
              "<img src=" + result.thumbnail.source + "><br>"
            );
            $("#txtWiki").html(result.extract_html + "<br>");
          },
          // Log any errors from the Wikipedia API request
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
          },
        });
      }
    },
    // Log any errors from the initial AJAX request
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}).addTo(map);

// Create a Leaflet easyButton with the icon "fa-globe"
L.easyButton("fa-globe", function (btn, map) {
  // Show a modal with the ID "exampleModal2"
  $("#exampleModal2").modal("show");
  // Make an AJAX request to "./php/restCountries.php"
  $.ajax({
    url: "./php/restCountries.php",
    type: "POST",
    dataType: "json",
    data: {
      country: $("#countrySelect").val(),
    },
    success: function (result) {
      // If the request is successful
      if (result.status.name == "ok") {
        // Extract the currency code, capital city weather, ISO 2 country code, and country name
        currencyCode = Object.keys(result.data.currencies)[0];
        capitalCityWeather = result.data.capital[0].toLowerCase();
        iso2CountryCode = result.data.cca2;
        let countryName2 = result.data.name.common;
        countryName = countryName2.replace(/\s+/g, "_");

        // Make another AJAX request to "./php/getCountryInfo.php"
        $.ajax({
          url: "./php/getCountryInfo.php",
          type: "GET",
          dataType: "json",
          data: {
            geonamesInfo: iso2CountryCode,
          },
          success: function (getCountryInfo) {
            // If the request is successful
            if (getCountryInfo.status.name == "ok") {
              // Update the HTML elements with the retrieved country information
              $("#txtCapital").html(
                "Capital: <p>" +
                  getCountryInfo.data.geonames[0].capital +
                  "</p>"
              );
              // Update other HTML elements with the retrieved country information
              $("#txtCapital2").html(
                "<p>" +
                  getCountryInfo.data.geonames[0].capital +
                  "'s Weather</p>"
              );
              $("#txtAreaInSqKm").html(
                "Area: <p>" +
                  getCountryInfo.data.geonames[0].areaInSqKm +
                  "</p> km²"
              );
              $("#txtContinent").html(
                "Continent: <p>" +
                  getCountryInfo.data.geonames[0].continent +
                  "</p>"
              );
              $("#txtPopulation").html(
                "Population: <p>" +
                  getCountryInfo.data.geonames[0].population +
                  "</p>"
              );
              $("#txtLanguages").html(
                "Languages: <p>" +
                  getCountryInfo.data.geonames[0].languages +
                  "</p>"
              );
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            // Log any errors from the AJAX request
            console.log("getCountryInfo ", textStatus, errorThrown);
          },
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Log any errors from the initial AJAX request
      console.log(textStatus, errorThrown);
    },
  });
}).addTo(map);

// Create a Leaflet easyButton with a money bill icon
L.easyButton("fa-cloud", function (btn, map) {
  // Show the modal with ID exampleModal3
  $("#exampleModal3").modal("show");
  // Send a POST request to ./php/restCountries.php for country data
  $.ajax({
    url: "./php/restCountries.php",
    type: "POST",
    dataType: "json",
    data: {
      country: $("#countrySelect").val(), // Get the selected country from the countrySelect element
    },
    success: function (result) {
      if (result.status.name == "ok") {
        // Get the currency code from the returned data
        currencyCode = Object.keys(result.data.currencies)[0];
        // Get the lowercase capital city weather from the returned data
        capitalCityWeather = result.data.capital[0].toLowerCase();
        // Get the ISO2 country code from the returned data
        iso2CountryCode = result.data.cca2;
        // Replace whitespace in the common country name and assign to countryName
        let countryName2 = result.data.name.common;
        countryName = countryName2.replace(/\s+/g, "_");

        // Send a POST request to ./php/openWeatherCurrent.php for current weather data
        $.ajax({
          url: "./php/openWeatherCurrent.php",
          type: "POST",
          dataType: "json",
          data: {
            capital: capitalCityWeather, // Use the lowercase capital city weather as the parameter
          },
          success: function (result) {
            // Get the latitude and longitude of the capital city from the weather data
            capitalCityLat = result.weatherData.coord.lat;
            capitalCityLon = result.weatherData.coord.lon;
            if (result.status.name == "ok") {
              const weather_img = document.querySelector(".weather-img");
              const temperature = document.querySelector(".temperature");
              const description = document.querySelector(".description");
              const humidity = document.getElementById("humidity");
              const wind_speed = document.getElementById("wind-speed");

              const location_not_found = document.querySelector(
                ".location-not-found"
              );

              const weather_body = document.querySelector(".weather-body");

              location_not_found.style.display = "none";
              weather_body.style.display = "flex";
              temperature.innerHTML = `${Math.round(
                result.weatherData.main.temp
              )}°C`;
              description.innerHTML = `${result.weatherData.weather[0].description}`;

              humidity.innerHTML = `${result.weatherData.main.humidity}%`;
              wind_speed.innerHTML = `${result.weatherData.wind.speed}Km/H`;

              switch (result.weatherData.weather[0].main) {
                case "Clouds":
                  weather_img.src = "assets/cloud.png";
                  break;
                case "Clear":
                  weather_img.src = "assets/clear.png";
                  break;
                case "Rain":
                  weather_img.src = "assets/rain.png";
                  break;
                case "Mist":
                  weather_img.src = "assets/mist.png";
                  break;
                case "Snow":
                  weather_img.src = "assets/snow.png";
                  break;
              }

              // Send a GET request to ./php/openWeatherForcast.php for weather forecast data
              $.ajax({
                url: "./php/openWeatherForcast.php",
                type: "GET",
                dataType: "json",
                data: {
                  lat: capitalCityLat, // Use the latitude as a parameter
                  lng: capitalCityLon, // Use the longitude as a parameter
                },
                success: function (result) {
                  if (result.status.name == "ok") {
                    // Update the HTML elements with weather forecast data for tomorrow
                    $("#txtCapitalWeatherForcast").html(
                      "Tomorrow :" +
                        result.weatherForcast.daily[1].weather[0].description +
                        "<br>"
                    );
                    $("#txtCapitalWeatherFHi").html(
                      "Expected High : " +
                        result.weatherForcast.daily[1].temp.max +
                        "&#8451<br>"
                    );
                    $("#txtCapitalWeatherFLo").html(
                      "Expected Low : " +
                        result.weatherForcast.daily[1].temp.min +
                        "&#8451<br>"
                    );
                  }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                  console.log(textStatus, errorThrown);
                },
              });
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
          },
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}).addTo(map);

// Create a Leaflet easyButton with a "fa-landmark" icon
L.easyButton("fa-landmark", function (btn, map) {
  // Show a modal with id "exampleModal4"
  $("#exampleModal4").modal("show");
  // Make an AJAX request to the "./php/restCountries.php" endpoint
  $.ajax({
    url: "./php/restCountries.php",
    type: "POST",
    dataType: "json",
    data: {
      country: $("#countrySelect").val(), // Get the selected country from the #countrySelect element
    },
    success: function (result) {
      // If the request is successful
      if (result.status.name == "ok") {
        // Extract currency code, capital city, and ISO 2 country code from the result
        currencyCode = Object.keys(result.data.currencies)[0];
        capitalCityWeather = result.data.capital[0].toLowerCase();
        iso2CountryCode = result.data.cca2;
        let countryName2 = result.data.name.common;
        countryName = countryName2.replace(/\s+/g, "_");

        // Update UI elements with country information
        $("#txtName").html(result["data"]["name"].common + "<br>");
        $("#txtCurrency").html(
          "<strong> " + result.currency.name + "</strong><br>"
        );
        $("#txtCurrencyCode").html(
          "Code: <strong>" + result.currency.symbol + "</strong><br>"
        );

        document.getElementById("amountTo").innerText = result.currency.name;

        // Make an AJAX request to the "./php/exchangeRates.php" endpoint
        $.ajax({
          url: "./php/exchangeRates.php",
          type: "GET",
          dataType: "json",
          success: function (exchangeRatesResult) {
            // If the request for exchange rates is successful
            if (exchangeRatesResult.status.name == "ok") {
              // Get the exchange rate for the selected currency and update the UI
              exchangeRate =
                exchangeRatesResult.exchangeRate.rates[currencyCode];
              $("#txtRate").html(
                "Rate: <strong>" +
                  exchangeRate.toFixed(3) +
                  "</strong> " +
                  currencyCode +
                  " to <strong>1</strong> USD. <br>"
              );
              currencyRate = exchangeRate;
            }
          },
          // Handle errors for the exchange rate request
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
          },
        });
      }
    },
    // Handle errors for the country information request
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}).addTo(map);

// Create easy button with font-awesome icon
L.easyButton("fa-book", function (btn, map) {
  // Show modal with id "exampleModal5"
  $("#exampleModal5").modal("show");

  // Make AJAX request to get country information
  $.ajax({
    url: "./php/restCountries.php",
    type: "POST",
    dataType: "json",
    data: {
      country: $("#countrySelect").val(),
    },
    success: function (result) {
      if (result.status.name == "ok") {
        // Get currency code, capital city weather, iso2 country code, and formatted country name
        currencyCode = Object.keys(result.data.currencies)[0];
        capitalCityWeather = result.data.capital[0].toLowerCase();
        iso2CountryCode = result.data.cca2;
        let countryName2 = result.data.name.common;
        countryName = countryName2.replace(/\s+/g, "_");

        // Make AJAX request to get current weather for capital city
        $.ajax({
          url: "./php/openWeatherCurrent.php",
          type: "POST",
          dataType: "json",
          data: {
            capital: capitalCityWeather,
          },
          success: function (result) {
            capitalCityLat = result.weatherData.coord.lat;
            capitalCityLon = result.weatherData.coord.lon;
            if (result.status.name == "ok") {
              // Make AJAX request to get places of interest from Wikipedia
              $.ajax({
                url: "./php/wikiPlaces.php",
                type: "GET",
                dataType: "json",
                data: {
                  lat: capitalCityLat,
                  lng: capitalCityLon,
                },
                success: function (result) {
                  // Clear previous content and display Wikipedia places of interest
                  $("#wikiPlaces").html("");
                  if (result.status.name == "ok") {
                    for (let i = 0; i < result.wikiPlaces.length; i++) {
                      $("#wikiPlaces").append(
                        "<li><a href=https://" +
                          result.wikiPlaces[i].wikipediaUrl +
                          ">" +
                          result.wikiPlaces[i].title +
                          "</a></li>"
                      );
                    }
                  }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                  console.log(textStatus, errorThrown);
                },
              });
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
          },
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}).addTo(map);

L.easyButton("fa-newspaper", function (btn, map) {
  // Show a modal with the ID "exampleModal2"
  $("#exampleModal6").modal("show");

  $.ajax({
    url: "./php/restCountries.php",
    type: "POST",
    dataType: "json",
    data: {
      country: $("#countrySelect").val(),
    },
    success: function (result) {
      // If the request is successful
      if (result.status.name == "ok") {
        // Extract the currency code, capital city weather, ISO 2 country code, and country name
        currencyCode = Object.keys(result.data.currencies)[0];
        capitalCityWeather = result.data.capital[0].toLowerCase();
        iso2CountryCode = result.data.cca2;

        $.ajax({
          url: "./php/news.php",
          type: "POST",
          dataType: "json",
          data: {
            country: iso2CountryCode,
          },
          success: function (result) {
            // If the request is successful
            if (result.status.name == "ok") {
              $("#newsContainer").html(
                result.data.map((data) => {
                  return `
            <div class="card mt-2">
              <div class="card-body">
              <h5 class="card-title">${data.name}</h5>
              <p class="card-text">${data.description}</p>
              </div>
            </div>`;
                })
              );
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
          },
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}).addTo(map);

// Make an AJAX request to retrieve the list of countries
$.ajax({
  url: "./php/geoJson.php", // API endpoint to fetch country data
  type: "POST", // HTTP method used for the request
  dataType: "json", // The expected data type of the response

  success: function (result) {
    // Check if the request was successful
    if (result.status.name == "ok") {
      // Loop through the retrieved country data
      for (let i = 0; i < result.data.border.features.length; i++) {
        // Add each country as an option to the select list
        $("#countrySelect").append(
          $("<option>", {
            value: result.data.border.features[i].properties.iso_a3, // ISO code of the country
            text: result.data.border.features[i].properties.name, // Name of the country
          })
        );
      }
    }
    // Sort the options alphabetically
    $("#countrySelect").html(
      $("#countrySelect option").sort(function (a, b) {
        return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
      })
    );
  },
  error: function (jqXHR, textStatus, errorThrown) {
    // Log any errors that occur during the request
    console.log(textStatus, errorThrown);
  },
});

// Function to get user's location and retrieve information from openCage API
const successCallback = (position) => {
  // Send a GET request to openCage API using user's latitude and longitude
  $.ajax({
    url: "./php/openCage.php",
    type: "GET",
    dataType: "json",
    data: {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    },

    // Handle successful response from openCage API
    success: function (result) {
      // Extract latitude and longitude from the API response
      currentLat = result.data[0].geometry.lat;
      currentLng = result.data[0].geometry.lng;

      // Set the value of the select option based on the country code
      $("selectOpt select").val(
        result.data[0].components["ISO_3166-1_alpha-3"]
      );

      // Get the country code from the API response and set it as the selected value in the country select dropdown
      let currentCountry = result.data[0].components["ISO_3166-1_alpha-3"];
      console.log(currentCountry);
      $("#countrySelect").val(currentCountry).change();
    },
    // Handle error response from openCage API
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
};

// Function to handle errors when retrieving user's location
const errorCallback = (error) => {
  console.error(error);
};

// Retrieve user's location using geolocation API and handle success or error using corresponding functions
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

// Event listener for change in country select dropdown
$("#countrySelect").on("change", function () {
  // Get the selected country code from the dropdown
  let countryCode = $("#countrySelect").val();
  let countryOptionText = $("#countrySelect").find("option:selected").text();

  // Function to show the first tab in the UI
  const showFirstTab = function () {
    $("#nav-home-tab").tab("show");
  };
  showFirstTab();

  // Send a POST request to retrieve geoJSON data
  $.ajax({
    url: "./php/geoJson.php",
    type: "POST",
    dataType: "json",
    success: function (result) {
      // Remove existing map border layer if present
      if (map.hasLayer(border)) {
        map.removeLayer(border);
      }

      // Initialize arrays to store country border data
      let countryArray = [];
      let countryOptionTextArray = [];

      // Loop through the geoJSON data to find the border features for the selected country
      for (let i = 0; i < result.data.border.features.length; i++) {
        if (result.data.border.features[i].properties.iso_a3 === countryCode) {
          countryArray.push(result.data.border.features[i]);
        }
      }
      // Loop through the geoJSON data to find the border features based on the country name
      for (let i = 0; i < result.data.border.features.length; i++) {
        if (
          result.data.border.features[i].properties.name === countryOptionText
        ) {
          countryOptionTextArray.push(result.data.border.features[i]);
        }
      }

      // Add the country border to the map with specified styling
      border = L.geoJSON(countryOptionTextArray[0], {
        color: "lime",
        weight: 3,
        opacity: 0.75,
      }).addTo(map);
      let bounds = border.getBounds();
      // Fly to the bounds of the country border on the map with animation
      map.flyToBounds(bounds, {
        padding: [35, 35],
        duration: 2,
      });
    },
    // Handle error response when retrieving geoJSON data
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
});

function currencyExchange() {
  let amountToCurrency = document.getElementById("FromAmount").value;
  let amountFromCurrency = document.getElementById("ToAmount");
  amountFromCurrency.value = amountToCurrency * currencyRate;
}
