import { useState } from "react";
import "./App.css";

import BackgroundVideo from "./Video/Background.mp4";
import WeatherLogo from "./Icons/weather.png";
import SearchIcon from "./Icons/search.png";

const API_KEY = "73cdb68ff88c34b802a58ede16032258";

function App() {
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const getForecast = async () => {
    if (!city.trim()) return;

    try {
      setErrorMsg("");

      const cityRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const cityData = await cityRes.json();

      if (cityData.cod !== 200) {
        setStatus("error");
        setForecast([]);
        setErrorMsg("City does not exist. Please try again.");
        return;
      }

      const { lat, lon } = cityData.coord;

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      const grouped = {};
      forecastData.list.forEach(item => {
        const day = item.dt_txt.split(" ")[0];
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(item);
      });

      const dailySummary = Object.values(grouped)
        .slice(0, 4)
        .map(dayData => {
          const temps = dayData.map(d => d.main.temp);
          const avgTemp =
            temps.reduce((a, b) => a + b, 0) / temps.length;

          const midday =
            dayData.find(d => d.dt_txt.includes("12:00:00")) ||
            dayData[0];

          return {
            date: new Date(dayData[0].dt_txt).toDateString(),
            temp: Math.round(avgTemp),
            condition: midday.weather[0].description,
            icon: midday.weather[0].icon
          };
        });

      setForecast(dailySummary);
      setStatus("success");

    } catch (error) {
      setStatus("error");
      setForecast([]);
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);

    if (value.trim() === "") {
      setStatus("idle");
      setForecast([]);
      setErrorMsg("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      getForecast();
    }
  };

  const isShifted = status !== "idle";

  return (
    <section className="Container">
      <video className="BackgroundVideo" autoPlay loop muted playsInline>
        <source src={BackgroundVideo} type="video/mp4" />
      </video>

      <section className="ContainerCover">
        <section className={`Header ${isShifted ? "raised" : ""}`}>
          <img src={WeatherLogo} alt="" width="30%" />
          <h1>Weather Forecast</h1>
          <hr style={{ width: "55%", marginBottom: "-2.5%" }} />
          <p>
            To see the weather, simply type the name of your city in the search box above.
            We'll show you the forecast right away.
          </p>
        </section>

        <section className={`InputPanel ${isShifted ? "raised" : ""}`}>
          <input
            type="text"
            placeholder="Enter a City"
            value={city}
            onChange={handleCityChange}
            onKeyDown={handleKeyDown}
          />
          <button onClick={getForecast}>
            <img src={SearchIcon} alt="" />
          </button>
        </section>

        {/* SUCCESS */}
        {status === "success" && (
          <section className="ForecastPanel below">
            {forecast.map((day, index) => (
              <div className="DayCard" key={index}>
                <h3>{day.date}</h3>

                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                  alt={day.condition}
                  className="WeatherIcon"
                />

                <p className="Temp">{day.temp}°C</p>
                <p className="Condition">{day.condition}</p>
              </div>
            ))}
          </section>
        )}

        {/* ERROR */}
        {status === "error" && (
          <section className="ForecastPanel below">
            <div className="ErrorCard">
              {errorMsg}
            </div>
          </section>
        )}
      </section>
    </section>
  );
}

export default App;
