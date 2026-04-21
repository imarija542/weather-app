import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [search, setSearch] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unit, setUnit] = useState("metric");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getWeatherIcon = (code) => {
    if (code >= 1 && code <= 3) return "/icon-overcast.webp";
    if (code >= 45 && code <= 48) return "/icon-fog.webp";
    if (code >= 51 && code <= 57) return "/icon-drizzle.webp";
    return "/icon-sun.svg";
  };

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(false);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`,
      );
      const geoData = await geoRes.json();

      if (!geoData.results) {
        setError(true);
        setLoading(false);
        return;
      }
      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
      );
      const weatherData = await weatherRes.json();

      setWeather({ ...weatherData, cityName: name, country });
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("Zagreb");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) fetchWeather(search);
  };

  const convertTemp = (temp) => {
    if (unit === "metric") return Math.round(temp);
    return Math.round((temp * 9) / 5 + 32);
  };

  return (
    <div className={`app ${isDarkMode ? "dark" : "light"}`}>
      <div className="bg-wrapper">
        <header className="header">
          <img
            src={isDarkMode ? "/logo-dark-theme.svg" : "/logo-light-theme.svg"}
            className="logo"
            alt="Logo"
          />
          <div className="search-area">
            <form onSubmit={handleSearch} className="search-bar">
              <input
                type="text"
                placeholder="Search city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="search-btn">
                {loading ? (
                  <img src="/icon-loading.svg" className="spin" alt="" />
                ) : (
                  "Search"
                )}
              </button>
            </form>
            <button
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <img
                src={isDarkMode ? "/icon-sun.svg" : "/icon-moon.svg"}
                alt="theme"
              />
            </button>
          </div>
        </header>

        <main className="container">
          {loading && (
            <div className="state-screen">
              <img src="/icon-loading.svg" className="main-spinner" alt="" />
              <p>Fetching weather data...</p>
            </div>
          )}

          {error && !loading && (
            <div className="state-screen">
              <img src="/icon-error.svg" alt="" />
              <h2>No results found</h2>
              <p>
                We couldn't find "{search}". Check the spelling and try again.
              </p>
            </div>
          )}

          {weather && !loading && !error && (
            <>
              <div className="main-card">
                <img src="/bg-today-large.svg" className="card-bg" alt="" />
                <div className="card-content">
                  <div className="card-top">
                    <div className="location">
                      <h1>
                        {weather.cityName}, {weather.country}
                      </h1>
                      <p>
                        {new Date().toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    </div>
                    <div className="unit-toggle">
                      <button
                        className={unit === "metric" ? "active" : ""}
                        onClick={() => setUnit("metric")}
                      >
                        °C
                      </button>
                      <button
                        className={unit === "imperial" ? "active" : ""}
                        onClick={() => setUnit("imperial")}
                      >
                        °F
                      </button>
                    </div>
                  </div>

                  <div className="weather-hero">
                    <img
                      src={getWeatherIcon(weather.current.weather_code)}
                      alt="icon"
                      className="main-icon"
                    />
                    <span className="degree">
                      {convertTemp(weather.current.temperature_2m)}°
                    </span>
                  </div>

                  <div className="details-grid">
                    <div className="detail">
                      <span>Feels like</span>
                      <strong>
                        {convertTemp(weather.current.apparent_temperature)}°
                      </strong>
                    </div>
                    <div className="detail">
                      <span>Humidity</span>
                      <strong>{weather.current.relative_humidity_2m}%</strong>
                    </div>
                    <div className="detail">
                      <span>Wind</span>
                      <strong>
                        {Math.round(weather.current.wind_speed_10m)} km/h
                      </strong>
                    </div>
                    <div className="detail">
                      <span>Precipitation</span>
                      <strong>{weather.current.precipitation}mm</strong>
                    </div>
                  </div>
                </div>
              </div>

              <section className="forecast-section">
                <h2>7-Day Forecast</h2>
                <div className="forecast-grid">
                  {weather.daily.time.map((date, i) => (
                    <div key={date} className="forecast-item">
                      <span className="f-day">
                        {new Date(date).toLocaleDateString("en", {
                          weekday: "short",
                        })}
                      </span>
                      <img
                        src={getWeatherIcon(weather.daily.weather_code[i])}
                        alt=""
                        className="f-icon"
                      />
                      <div className="f-temps">
                        <strong>
                          {convertTemp(weather.daily.temperature_2m_max[i])}°
                        </strong>
                        <span className="min">
                          {convertTemp(weather.daily.temperature_2m_min[i])}°
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
