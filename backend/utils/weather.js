import axios from 'axios';

export async function fetchWeather(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // optional: &units=metric

  const response = await axios.get(url);
  const data = response.data;

  return {
    weather_main: data.weather?.[0]?.main || null,
    description: data.weather?.[0]?.description || null,
    humidity: data.main?.humidity || null,
    temp_max: data.main?.temp_max || null,
    pressure: data.main?.pressure || null,
    cloudiness: data.clouds?.all || null,
  };
}
