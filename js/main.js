// Create a tile layer for streets using ArcGIS Online service
let streets = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", // URL for street tiles
  {
    // Attribution for the tile layer
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
  }
);

// Create a tile layer for satellite imagery using ArcGIS Online service
let satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", // URL for satellite tiles
  {
    // Attribution for the tile layer
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

// Define basemaps object to store the tile layers for streets and satellite imagery
let basemaps = {
  Streets: streets, // Streets tile layer
  Satellite: satellite, // Satellite tile layer
};

// Create a map using Leaflet and set the initial view to center around coordinates [54.5, -4] with zoom level 6, and add the streets tile layer as the default layer
let map = L.map("map", {
  // Create Leaflet map object with 'map' id
  layers: [streets], // Add streets tile layer as the initial layer
}).setView([54.5, -4], 6); // Set initial view to coordinates [54.5, -4] with zoom level 6

// Initialize marker cluster groups for airports and cities
var airports = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
});

var cities = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "#fff",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
});

// Add airports and cities marker cluster groups to the map
map.addLayer(airports);
map.addLayer(cities);

var overlays = {
  Airports: airports,
  Cities: cities,
};

// Add layer control with basemaps to the map
var layerControl = L.control.layers(basemaps, overlays).addTo(map);

var airportIcon = L.icon({
  iconUrl: "./css/images/air.png",
  iconSize: [25, 41],
});

var cityIcon = L.icon({
  iconUrl: "./css/images/city.png",
  iconSize: [25, 41],
});

// Initialize variables for storing data related to a country
let border; // Variable to store country border
let currencyCode; // Variable to store currency code
let countryName; // Variable to store country name
let capitalCityWeather; // Variable to store capital city weather
let capitalCityLat; // Variable to store capital city latitude
let capitalCityLon; // Variable to store capital city longitude
let iso2CountryCode; // Variable to store ISO 2 country code
let currencyRate; // Variable to store currency exchange rate
let countryCode; // Variable to store country code
let countryCodeISO; // Variable to store country code in ISO format
let basecountryArray = []; // Array to store country border data

// Create a feature group for storing circles on the map and add it to the map
let myCircles = new L.featureGroup().addTo(map); // Create feature group for circles

let markers = new L.MarkerClusterGroup();

// Make an AJAX request to retrieve the list of countries
$.ajax({
  url: "./php/geoJson.php", // API endpoint to fetch country data
  type: "POST", // HTTP method used for the request
  dataType: "json", // The expected data type of the response

  success: function (result) {
    // Check if the request was successful
    if (result.status.name == "ok") {
      basecountryArray = result;
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

// Create a leaflet easyButton with a home icon
L.easyButton("fa-home", function (btn, map) {
  // Show a modal with the id "exampleModal"
  $("#exampleModal").modal("show"); // Show modal with id "exampleModal"
  // Make an AJAX request to the PHP endpoint "./php/restCountries.php"
  $.ajax({
    url: "./php/restCountries.php", // PHP endpoint URL
    type: "POST", // HTTP POST method
    dataType: "json", // Expected data type
    data: {
      country: $("#countrySelect").val(), // Data to be sent (selected country)
    },
    success: function (result) {
      // Success callback function
      // If the AJAX request is successful
      if (result.status.name == "ok") {
        // Extract currency code, capital city weather, and ISO2 country code from the result
        currencyCode = Object.keys(result?.data?.currencies)[0]; // Extract currency code
        capitalCityWeather = result.data.capital[0].toLowerCase(); // Extract capital city weather
        iso2CountryCode = result.data.cca2; // Extract ISO2 country code
        countryCode = result.data.cca2; // Assign country code
        // Replace spaces with underscores in the country name
        let countryName2 = result.data.name.common; // Get country name
        countryName = countryName2.replace(/\s+/g, "_"); // Replace spaces with underscores
        // Make a second AJAX request to the Wikipedia API for country summary
        $.ajax({
          url:
            "https://en.wikipedia.org/api/rest_v1/page/summary/" + countryName, // Wikipedia API endpoint URL
          type: "GET", // HTTP GET method
          dataType: "json", // Expected data type
          success: function (result) {
            // Success callback function
            // Update the HTML with the Wikipedia summary and image
            $("#txtWikiImg").html(
              // Update HTML for Wikipedia image
              "<img src=" + result.thumbnail.source + "><br>"
            );
            $("#txtWiki").html(result.extract_html + "<br>"); // Update HTML for Wikipedia summary
          },
          // Log any errors from the Wikipedia API request
          error: function (jqXHR, textStatus, errorThrown) {
            // Error callback function
            console.log(textStatus, errorThrown); // Log error
          },
        });
      }
    },
    // Log any errors from the initial AJAX request
    error: function (jqXHR, textStatus, errorThrown) {
      // Error callback function
      console.log(textStatus, errorThrown); // Log error
    },
  });
}).addTo(map); // Add easyButton to map

// Create a Leaflet easyButton with the icon "fa-globe"
L.easyButton("fa-globe", function (btn, map) {
  // Show a modal with the ID "exampleModal2"
  $("#exampleModal2").modal("show"); // Show modal with id "exampleModal2"
  // Make an AJAX request to "./php/restCountries.php"
  $.ajax({
    url: "./php/restCountries.php", // PHP endpoint URL
    type: "POST", // HTTP POST method
    dataType: "json", // Expected data type
    data: {
      country: $("#countrySelect").val(), // Data to be sent (selected country)
    },
    success: function (result) {
      // Success callback function
      // If the request is successful
      if (result.status.name == "ok") {
        // Extract the currency code, capital city weather, ISO 2 country code, and country name
        currencyCode = Object.keys(result?.data?.currencies)[0]; // Extract currency code
        capitalCityWeather = result.data.capital[0].toLowerCase(); // Extract capital city weather
        iso2CountryCode = result.data.cca2; // Extract ISO2 country code
        let countryName2 = result.data.name.common; // Get country name
        countryName = countryName2.replace(/\s+/g, "_"); // Replace spaces with underscores
        // Make another AJAX request to "./php/getCountryInfo.php"
        $.ajax({
          url: "./php/getCountryInfo.php", // PHP endpoint URL
          type: "GET", // HTTP GET method
          dataType: "json", // Expected data type
          data: {
            geonamesInfo: iso2CountryCode, // Data to be sent (ISO2 country code)
          },
          success: function (getCountryInfo) {
            // Success callback function
            // If the request is successful
            if (getCountryInfo.status.name == "ok") {
              console.log(getCountryInfo.data.geonames[0]);
              // Update the HTML elements with the retrieved country information
              $("#general_information").html(`
              <table class="table table-striped">
              <tr>
                <td class="text-center col-2">
                  <i class="fa-solid fa-landmark-flag fa-xl text-success"></i>
                </td>

                <td class="text-nowrap">Capital city</td>

                <td id="capitalCity" class="text-end">${getCountryInfo.data.geonames[0].capital}</td>
              </tr>
              <tr>
                <td class="text-center">
                  <i class="fa-solid fa-globe fa-xl text-success"></i>
                </td>

                <td>Continent</td>

                <td id="continent" class="text-end">${getCountryInfo.data.geonames[0].continent}</td>
              </tr>
              <tr>
                <td class="text-center">
                  <i class="fa-solid fa-ear-listen fa-xl text-success"></i>
                </td>

                <td>Languages</td>

                <td id="languages" class="text-end">${getCountryInfo.data.geonames[0].languages}</td>
              </tr>
              <tr>
                <td class="text-center">
                  <i class="fa-solid fa-coins fa-xl text-success"></i>
                </td>

                <td>Currency</td>

                <td id="currency" class="text-end">${getCountryInfo.data.geonames[0].currencyCode}</td>
              </tr>
              <tr>
                <td class="text-center">
                  <i class="fa-solid fa-bars fa-xl text-success"></i>
                </td>

                <td class="text-nowrap">ISO alpha 3</td>

                <td id="isoAlpha3" class="text-end">${getCountryInfo.data.geonames[0].isoAlpha3}</td>
              </tr>
              <tr>
                <td class="text-center">
                  <i class="fa-solid fa-person fa-xl text-success"></i>
                </td>

                <td>Population</td>

                <td id="population" class="text-end">${getCountryInfo.data.geonames[0].population}</td>
              </tr>
              <tr>
                <td class="text-center">
                  <i class="fa-solid fa-ruler-combined fa-xl text-success"></i>
                </td>

                <td class="text-nowrap">Area (km<sup>2</sup>)</td>

                <td id="areaInSqKm" class="text-end">${getCountryInfo.data.geonames[0].areaInSqKm}</td>
              </tr>
              <tr>
                <td class="text-center">
                  <i class="fa-solid fa-envelope fa-xl text-success"></i>
                </td>

                <td class="text-nowrap">Postal code format</td>

                <td id="postalCodeFormat" class="text-end">${getCountryInfo.data.geonames[0].postalCodeFormat}</td>
              </tr>
            </table>
              `);
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            // Error callback function
            // Log any errors from the AJAX request
            console.log("getCountryInfo ", textStatus, errorThrown); // Log error
          },
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Error callback function
      // Log any errors from the initial AJAX request
      console.log(textStatus, errorThrown); // Log error
    },
  });
}).addTo(map); // Add easyButton to map

// Create a Leaflet easyButton with a money bill icon
L.easyButton("fa-cloud", function (btn, map) {
  // Show the modal with ID exampleModal3
  $("#exampleModal3").modal("show"); // Show modal with id "exampleModal3"
  // Send a POST request to ./php/restCountries.php for country data
  $.ajax({
    url: "./php/restCountries.php", // PHP endpoint URL
    type: "POST", // HTTP POST method
    dataType: "json", // Expected data type
    data: {
      country: $("#countrySelect").val(), // Get the selected country from the countrySelect element
    },
    success: function (result) {
      // Success callback function
      if (result.status.name == "ok") {
        // Get the currency code from the returned data
        currencyCode = Object.keys(result?.data?.currencies)[0]; // Extract currency code
        // Get the lowercase capital city weather from the returned data
        capitalCityWeather = result.data.capital[0].toLowerCase(); // Extract capital city weather
        // Get the ISO2 country code from the returned data
        iso2CountryCode = result.data.cca2; // Extract ISO2 country code
        // Replace whitespace in the common country name and assign to countryName
        let countryName2 = result.data.name.common; // Get country name
        countryName = countryName2.replace(/\s+/g, "_"); // Replace spaces with underscores
        // Send a POST request to ./php/openWeatherCurrent.php for current weather data
        $("#weather_modal_title").html(result.data.capital[0]);
        $.ajax({
          url: "./php/openWeatherCurrent.php", // PHP endpoint URL
          type: "POST", // HTTP POST method
          dataType: "json", // Expected data type
          data: {
            capital: capitalCityWeather, // Use the lowercase capital city weather as the parameter
          },
          success: function (result) {
            // Success callback function
            // Get the latitude and longitude of the capital city from the weather data
            capitalCityLat = result.weatherData.coord.lat; // Get capital city latitude
            capitalCityLon = result.weatherData.coord.lon; // Get capital city longitude
            if (result.status.name == "ok") {
              const weather_img = document.querySelector(".weather-img"); // Get weather image element
              const temperature = document.querySelector(".temperature"); // Get temperature element
              const description = document.querySelector(".description"); // Get weather description element
              const humidity = document.getElementById("humidity"); // Get humidity element
              const wind_speed = document.getElementById("wind-speed"); // Get wind speed element
              const location_not_found = document.querySelector(
                ".location-not-found"
              ); // Get location not found element
              const weather_body = document.querySelector(".weather-body"); // Get weather body element
              location_not_found.style.display = "none"; // Hide location not found message
              weather_body.style.display = "flex"; // Show weather body
              temperature.innerHTML = `${Math.round(
                // Update temperature HTML
                result.weatherData.main.temp
              )}°C`;
              description.innerHTML = `${result.weatherData.weather[0].description}`; // Update weather description HTML
              humidity.innerHTML = `${result.weatherData.main.humidity}%`; // Update humidity HTML
              wind_speed.innerHTML = `${result.weatherData.wind.speed}Km/H`; // Update wind speed HTML
              switch (
                result.weatherData.weather[0].main // Switch based on weather main
              ) {
                case "Clouds":
                  weather_img.src = "assets/cloud.png"; // Update weather image for clouds
                  break;
                case "Clear":
                  weather_img.src = "assets/clear.png"; // Update weather image for clear sky
                  break;
                case "Rain":
                  weather_img.src = "assets/rain.png"; // Update weather image for rain
                  break;
                case "Mist":
                  weather_img.src = "assets/mist.png"; // Update weather image for mist
                  break;
                case "Snow":
                  weather_img.src = "assets/snow.png"; // Update weather image for snow
                  break;
              }
              // Send a GET request to ./php/openWeatherForcast.php for weather forecast data
              $.ajax({
                url: "./php/openWeatherForcast.php", // PHP endpoint URL
                type: "GET", // HTTP GET method
                dataType: "json", // Expected data type
                data: {
                  lat: capitalCityLat, // Use the latitude as a parameter
                  lng: capitalCityLon, // Use the longitude as a parameter
                },
                success: function (result) {
                  // Success callback function
                  if (result.status.name == "ok") {
                    // Update the HTML elements with weather forecast data for tomorrow
                    $("#txtCapitalWeatherForcast").html(
                      // Update HTML for weather forecast
                      "Tomorrow :" +
                        result.weatherForcast.daily[1].weather[0].description +
                        "<br>"
                    );
                    $("#txtCapitalWeatherFHi").html(
                      // Update HTML for weather forecast high temperature
                      "Expected High : " +
                        result.weatherForcast.daily[1].temp.max +
                        "&#8451<br>"
                    );
                    $("#txtCapitalWeatherFLo").html(
                      // Update HTML for weather forecast low temperature
                      "Expected Low : " +
                        result.weatherForcast.daily[1].temp.min +
                        "&#8451<br>"
                    );
                  }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                  // Error callback function
                  console.log(textStatus, errorThrown); // Log error
                },
              });
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            // Error callback function
            console.log(textStatus, errorThrown); // Log error
          },
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Error callback function
      console.log(textStatus, errorThrown); // Log error
    },
  });
}).addTo(map); // Add easyButton to map

// Create a Leaflet easyButton with a "fa-landmark" icon
L.easyButton("fa-landmark", function (btn, map) {
  // Show a modal with id "exampleModal4"
  $("#exampleModal4").modal("show"); // Show modal with ID "exampleModal4"
  // Make an AJAX request to the "./php/restCountries.php" endpoint
  $.ajax({
    url: "./php/restCountries.php", // PHP endpoint URL
    type: "POST", // HTTP POST method
    dataType: "json", // Expected data type
    data: {
      country: $("#countrySelect").val(), // Get the selected country from the #countrySelect element
    },
    success: function (result) {
      // Success callback function
      // If the request is successful
      if (result.status.name == "ok") {
        // Extract currency code, capital city, and ISO 2 country code from the result
        currencyCode = Object.keys(result?.data?.currencies)[0]; // Extract currency code
        capitalCityWeather = result.data.capital[0].toLowerCase(); // Extract lowercase capital city weather
        iso2CountryCode = result.data.cca2; // Extract ISO2 country code
        let countryName2 = result.data.name.common; // Get country name
        countryName = countryName2.replace(/\s+/g, "_"); // Replace spaces with underscores
        // Update UI elements with country information
        $("#txtName").html(result["data"]["name"].common + "<br>"); // Update HTML for country name
        document.getElementById("amountTo").innerText = result.currency.name; // Update amount to currency
        // Make an AJAX request to the "./php/exchangeRates.php" endpoint
        $.ajax({
          url: "./php/exchangeRates.php", // PHP endpoint URL
          type: "GET", // HTTP GET method
          dataType: "json", // Expected data type
          success: function (exchangeRatesResult) {
            // Success callback function
            // If the request for exchange rates is successful
            if (exchangeRatesResult.status.name == "ok") {
              // Get the exchange rate for the selected currency and update the UI
              exchangeRate =
                exchangeRatesResult.exchangeRate.rates[currencyCode]; // Get exchange rate for selected currency
              currencyRate = exchangeRate; // Assign exchange rate to currencyRate variable
              $("#FromAmount").val(1);
              $("#ToAmount").val(currencyRate.toFixed(3));
            }
          },
          // Handle errors for the exchange rate request
          error: function (jqXHR, textStatus, errorThrown) {
            // Error callback function
            console.log(textStatus, errorThrown); // Log error
          },
        });
      }
    },
    // Handle errors for the country information request
    error: function (jqXHR, textStatus, errorThrown) {
      // Error callback function
      console.log(textStatus, errorThrown); // Log error
    },
  });
}).addTo(map); // Add easyButton to map

// Create easy button with font-awesome icon
L.easyButton("fa-book", function (btn, map) {
  // Show modal with id "exampleModal5"
  $("#exampleModal5").modal("show"); // Show modal with ID "exampleModal5"
  // Make AJAX request to get country information
  $.ajax({
    url: "./php/restCountries.php", // PHP endpoint URL
    type: "POST", // HTTP POST method
    dataType: "json", // Expected data type
    data: {
      country: $("#countrySelect").val(), // Get selected country from countrySelect element
    },
    success: function (result) {
      // Success callback function
      if (result.status.name == "ok") {
        // Get currency code, capital city weather, iso2 country code, and formatted country name
        currencyCode = Object.keys(result?.data?.currencies)[0]; // Extract currency code
        capitalCityWeather = result.data.capital[0].toLowerCase(); // Extract lowercase capital city weather
        iso2CountryCode = result.data.cca2; // Extract ISO2 country code
        let countryName2 = result.data.name.common; // Get country name
        countryName = countryName2.replace(/\s+/g, "_"); // Replace spaces with underscores
        // Make AJAX request to get current weather for capital city
        $.ajax({
          url: "./php/openWeatherCurrent.php", // PHP endpoint URL
          type: "POST", // HTTP POST method
          dataType: "json", // Expected data type
          data: {
            capital: capitalCityWeather, // Capital city weather as parameter
          },
          success: function (result) {
            // Success callback function
            capitalCityLat = result.weatherData.coord.lat; // Get capital city latitude
            capitalCityLon = result.weatherData.coord.lon; // Get capital city longitude
            if (result.status.name == "ok") {
              // Make AJAX request to get places of interest from Wikipedia
              $.ajax({
                url: "./php/wikiPlaces.php", // PHP endpoint URL
                type: "GET", // HTTP GET method
                dataType: "json", // Expected data type
                data: {
                  lat: capitalCityLat, // Latitude parameter
                  lng: capitalCityLon, // Longitude parameter
                },
                success: function (result) {
                  // Success callback function
                  // Clear previous content and display Wikipedia places of interest
                  $("#wikiPlaces").html(""); // Clear previous content
                  if (result.status.name == "ok") {
                    // If request is successful
                    for (let i = 0; i < result.wikiPlaces.length; i++) {
                      $("#wikiPlaces").append(
                        // Append each Wikipedia place
                        "<li><a href=https://" +
                          result.wikiPlaces[i].wikipediaUrl +
                          ">" +
                          result.wikiPlaces[i].title +
                          "</a></li>"
                      );
                    }
                  }
                },
                // Log errors for the Wikipedia places request
                error: function (jqXHR, textStatus, errorThrown) {
                  // Error callback function
                  console.log(textStatus, errorThrown); // Log error
                },
              });
            }
          },
          // Log errors for the capital city weather request
          error: function (jqXHR, textStatus, errorThrown) {
            // Error callback function
            console.log(textStatus, errorThrown); // Log error
          },
        });
      }
    },
    // Log errors for the country information request
    error: function (jqXHR, textStatus, errorThrown) {
      // Error callback function
      console.log(textStatus, errorThrown); // Log error
    },
  });
}).addTo(map); // Add easyButton to map

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
        currencyCode = Object.keys(result?.data?.currencies)[0];
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
              <h5 class="card-title"><a href="${data.url}" class="headline" target="_blank">${data.name} </a></h5>
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
      if (result.data.length == 0) {
        return;
      }
      currentLat = result.data[0].geometry.lat;
      currentLng = result.data[0].geometry.lng;

      // Set the value of the select option based on the country code
      $("selectOpt select").val(
        result.data[0].components["ISO_3166-1_alpha-3"]
      );

      // Get the country code from the API response and set it as the selected value in the country select dropdown
      let currentCountry = result.data[0].components["ISO_3166-1_alpha-3"];
      countryCodeISO = result.data[0].components["ISO_3166-1_alpha-2"];
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

  // Remove existing map border layer if present
  if (map.hasLayer(border)) {
    map.removeLayer(border);
  }

  // Initialize arrays to store country border data
  let countryArray = [];
  let countryOptionTextArray = [];

  // Loop through the geoJSON data to find the border features for the selected country
  for (let i = 0; i < basecountryArray.data.border.features.length; i++) {
    if (
      basecountryArray.data.border.features[i].properties.iso_a3 === countryCode
    ) {
      countryArray.push(basecountryArray.data.border.features[i]);
      countryCodeISO =
        basecountryArray.data.border.features[i].properties.iso_a2;
    }
  }
  // Loop through the geoJSON data to find the border features based on the country name
  for (let i = 0; i < basecountryArray.data.border.features.length; i++) {
    if (
      basecountryArray.data.border.features[i].properties.name ===
      countryOptionText
    ) {
      countryOptionTextArray.push(basecountryArray.data.border.features[i]);
    }
  }
  // find lat and long for the selected country
  $.ajax({
    url:
      "https://en.wikipedia.org/api/rest_v1/page/summary/" + countryOptionText, // Wikipedia API endpoint URL
    type: "GET", // HTTP GET method
    dataType: "json", // Expected data type
    success: function (resultWiki) {
      // Success callback function
      const lat = resultWiki.coordinates.lat;
      const long = resultWiki.coordinates.lon;

      // Update the HTML with the Wikipedia summary and image
      // check if layers are present
      if (!lat || !long) {
        return;
      } else {
        // Remove existing markers layer if present
        markers.clearLayers();

        const customIcon = L.icon({
          iconUrl: resultWiki.thumbnail.source,
          iconSize: [50, 50],
        });
        // Add a new markers layer for the selected country
        let marker = L.marker([lat, long], {
          icon: customIcon,
          title: countryOptionText,
        });
        marker.bindPopup(`<b>${countryOptionText}</b>`);
        markers.addLayer(marker);
      }

      const customIconAirport = L.icon({
        iconUrl: "./css/images/air.png",
        iconSize: [25, 41],
      });

      const customIconCity = L.icon({
        iconUrl: "./css/images/city.png",
        iconSize: [25, 41],
      });

      // Send a GET request to retrieve the top 100 airports for the selected country
      $.ajax({
        url: `./php/wikipediaSearchJSONAirport.php`,
        type: "POST",
        dataType: "json",
        data: {
          country: countryCodeISO,
        },
        success: function (resultWiki) {
          for (let key of resultWiki.geonames) {
            if (
              key.feature !== "city" &&
              key.feature !== "country" &&
              key.feature !== "landmark" &&
              key.feature !== "adm1st" &&
              key.feature !== "isle" &&
              key.feature !== undefined
            ) {
              // Add a new markers layer for the selected country
              let marker = L.marker([key.lat, key.lng], {
                icon: customIconAirport,
                title: key.title,
              });
              marker.bindPopup(`<b>${key.title}</b>`);
              markers.addLayer(marker);
            }
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
        },
      });

      $.ajax({
        url: `./php/wikipediaSearchJSONCity.php`,
        type: "POST",
        dataType: "json",
        data: {
          country: countryCodeISO,
        },
        success: function (resultWiki) {
          for (let key of resultWiki.geonames) {
            if (
              key.feature !== "airport" &&
              key.feature !== "country" &&
              key.feature !== "landmark" &&
              key.feature !== "adm1st" &&
              key.feature !== "isle" &&
              key.feature !== undefined
            ) {
              // Add a new markers layer for the selected country
              let marker = L.marker([key.lat, key.lng], {
                icon: customIconCity,
                title: key.title,
              });
              marker.bindPopup(`<b>${key.title}</b>`);
              markers.addLayer(marker);
            }
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
        },
      });
    },
    // Log any errors from the Wikipedia API request
    error: function (jqXHR, textStatus, errorThrown) {
      // Error callback function
      console.log(textStatus, errorThrown); // Log error
    },
  });

  // Add the country border to the map with specified styling
  border = L.geoJSON(countryOptionTextArray[0], {
    color: "lime",
    weight: 3,
    opacity: 0.75,
  }).addTo(map);
  let bounds = border.getBounds();
  map.addLayer(markers);
  // Fly to the bounds of the country border on the map with animation
  map.flyToBounds(bounds, {
    padding: [35, 35],
    duration: 2,
  });
});

// Function to highlight the user's country on the map and display the modal with information
// Function to highlight the user's country on the map and display the modal with information
const highlightUserCountry = (latitude, longitude) => {
  // Send a GET request to openCage API using user's latitude and longitude
  $.ajax({
    url: "./php/openCage.php",
    type: "GET",
    dataType: "json",
    data: {
      lat: latitude,
      lng: longitude,
    },
    // Handle successful response from openCage API
    success: function (result) {
      if (
        result.status &&
        result.status.code === 200 &&
        result.data &&
        result.data.length > 0
      ) {
        // Extract country code from the API response
        const countryCode = result.data[0].components["ISO_3166-1_alpha-3"];

        // Highlight the user's country on the map
        $("#countrySelect").val(countryCode).change();

        // Display the modal with information about the user's location
        $("#exampleModal").modal("show");
        // Update modal content with user's location information
        $("#modalTitle").text(result.data[0].formatted); // Display country name as modal title
        $("#modalContent").html(
          `Latitude: ${latitude}<br>Longitude: ${longitude}`
        ); // Display latitude and longitude in modal content
      }
    },
    // Handle error response from openCage API
    error: function (jqXHR, textStatus, errorThrown) {
      console.error(textStatus, errorThrown);
    },
  });
};

// Retrieve user's location using geolocation API and handle success or error using corresponding functions
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // Highlight the user's country on the map

  highlightUserCountry(latitude, longitude);
}, errorCallback);

// Function to handle exchange rate requests
function exchangeRateUSDToCurrentCurrency() {
  // Send a GET request to the exchange rate API
  $.ajax({
    url: "./php/exchangeRates.php", // PHP endpoint URL
    type: "GET", // HTTP GET method
    dataType: "json", // Expected data type
    success: function (result) {
      // Success callback function
      // If the request for exchange rates is successful
      if (result.status.name == "ok") {
        // If the request is successful
        // Get the exchange rate for the selected currency
        let currentRate = result.exchangeRate.rates[currencyCode]; // Get exchange rate for selected currency
        const FromAmount = $("#FromAmount").val();
        const ToAmount = (FromAmount * currentRate).toFixed(2);
        $("#ToAmount").val(ToAmount);
      }
    },
    // Handle error response from the exchange rate API
    error: function (jqXHR, textStatus, errorThrown) {
      console.error(textStatus, errorThrown);
    },
  });
}
