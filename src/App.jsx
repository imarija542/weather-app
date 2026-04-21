import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unit, setUnit] = useState("metric");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getWeatherIcon = (code) => {
    if (code === 0) return "/icon-sunny.webp";
    if (code >= 1 && code <= 3) return "/icon-partly-cloudy.webp";
    if (code >= 45 && code <= 48) return "/icon-fog.webp";
    if (code >= 51 && code <= 57) return "/icon-drizzle.webp";
    if (code >= 61 && code <= 67) return "/icon-rain.webp";
    if (code >= 71 && code <= 77) return "/icon-snow.webp";
    if (code >= 95) return "/icon-storm.webp";
    return "/icon-overcast.webp";
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length > 2) {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${value}&count=5&language=en&format=json`,
        );
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error("Geocoding error", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const fetchWeather = async (lat, lon, name, country) => {
    setLoading(true);
    setSuggestions([]);
    setSearch("");
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
      );
      const data = await weatherRes.json();
      setWeather({ ...data, cityName: name, country });
      setError(false);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(45.81, 15.97, "Zagreb", "Croatia");
  }, []);

  const convertTemp = (temp) =>
    unit === "metric" ? Math.round(temp) : Math.round((temp * 9) / 5 + 32);

  return (
    <div className={`app ${isDarkMode ? "dark" : "light"}`}>
      <div className="bg-wrapper">
        <header className="header">
          <div className="logo-container">
            <img src="/logo.svg" className="logo-img" alt="SkyCast" />
            <span className="logo-text">SkyCast Weather</span>
          </div>

          <div className="search-area">
            <div className="search-wrapper">
              <div className="search-bar">
                <img src="/icon-search.svg" alt="" className="search-icon" />
                <input
                  type="text"
                  placeholder="Search city..."
                  value={search}
                  onChange={handleInputChange}
                />
              </div>
              {suggestions.length > 0 && (
                <ul className="dropdown">
                  {suggestions.map((s) => (
                    <li
                      key={s.id}
                      onClick={() =>
                        fetchWeather(s.latitude, s.longitude, s.name, s.country)
                      }
                    >
                      <strong>{s.name}</strong>, {s.country}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <img
                src={isDarkMode ? "/icon-sun.svg" : "/icon-moon.svg"}
                alt="Toggle Theme"
              />
            </button>
          </div>
        </header>

        <main className="container">
          {loading && (
            <div className="state-screen">
              <img src="/icon-loading.svg" className="spin" alt="" />
              <p>Fetching weather data...</p>
            </div>
          )}

          {error && !loading && (
            <div className="state-screen">
              <img src="/icon-error.svg" alt="" />
              <h2>No results found</h2>
              <button
                onClick={() => fetchWeather(45.81, 15.97, "Zagreb", "Croatia")}
                className="retry-btn"
              >
                <img src="/icon-retry.svg" alt="" /> Try again
              </button>
            </div>
          )}

          {weather && !loading && !error && (
            <div className="weather-layout">
              <div className="main-content">
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
                        alt=""
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
                        <span>Wind speed</span>
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
              </div>

              <aside className="hourly-sidebar">
                <h2>Hourly</h2>
                <div className="hourly-column">
                  {weather.hourly.time.slice(0, 12).map((time, i) => (
                    <div key={time} className="hourly-row">
                      <span className="h-time">
                        {new Date(time).getHours()}:00
                      </span>
                      <img
                        src={getWeatherIcon(weather.hourly.weather_code[i])}
                        alt=""
                        className="h-icon-small"
                      />
                      <strong className="h-temp">
                        {convertTemp(weather.hourly.temperature_2m[i])}°
                      </strong>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
