// /Users/alessa/Desktop/test/script.js
// Simple weather app (place this file in a page or open an HTML file that loads it)
// Get an API key from https://openweathermap.org and paste it below:
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + API_KEY;

document.addEventListener('DOMContentLoaded', () => {
    // Build minimal UI
    document.body.style.fontFamily = 'Arial, sans-serif';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.padding = '24px';
    const app = document.createElement('div');
    app.style.maxWidth = '420px';
    app.style.width = '100%';
    app.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
    app.style.padding = '16px';
    app.style.borderRadius = '8px';
    app.innerHTML = `
        <h2 style="margin:0 0 12px">Simple Weather</h2>
        <div style="display:flex;gap:8px;margin-bottom:12px">
            <input id="cityInput" placeholder="Enter city (e.g. London)" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:4px" />
            <button id="searchBtn" style="padding:8px 12px">Search</button>
            <button id="locBtn" style="padding:8px 12px">Use My Location</button>
        </div>
        <div id="result" style="min-height:120px;padding:12px;border-radius:6px;background:#f9f9f9;border:1px solid #eee"></div>
    `;
    document.body.appendChild(app);

    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const locBtn = document.getElementById('locBtn');
    const result = document.getElementById('result');

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (!city) {
            showError('Please enter a city name.');
            return;
        }
        fetchWeatherByCity(city);
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });

    locBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            showError('Geolocation is not supported by your browser.');
            return;
        }
        result.innerHTML = 'Getting location...';
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            (err) => showError('Unable to get location: ' + (err.message || err.code))
        );
    });

    async function fetchWeatherByCity(city) {
        result.innerHTML = 'Loading...';
        try {
            const url = `${BASE_URL}&q=${encodeURIComponent(city)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('City not found');
            const data = await res.json();
            renderWeather(data);
        } catch (err) {
            showError(err.message || 'Failed to fetch weather');
        }
    }

    async function fetchWeatherByCoords(lat, lon) {
        result.innerHTML = 'Loading...';
        try {
            const url = `${BASE_URL}&lat=${lat}&lon=${lon}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Weather not found for your location');
            const data = await res.json();
            renderWeather(data);
        } catch (err) {
            showError(err.message || 'Failed to fetch weather');
        }
    }

    function renderWeather(d) {
        const name = d.name;
        const country = d.sys && d.sys.country ? d.sys.country : '';
        const temp = Math.round(d.main.temp);
        const desc = d.weather && d.weather[0] ? capitalize(d.weather[0].description) : '';
        const icon = d.weather && d.weather[0] ? d.weather[0].icon : null;
        const humidity = d.main && d.main.humidity != null ? d.main.humidity + '%' : '—';
        const wind = d.wind && d.wind.speed != null ? d.wind.speed + ' m/s' : '—';

        result.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px">
                <div style="flex:1">
                    <div style="font-size:18px;font-weight:600">${name} ${country ? ', ' + country : ''}</div>
                    <div style="font-size:28px;margin-top:6px">${temp}°C</div>
                    <div style="color:#555;margin-top:6px">${desc}</div>
                    <div style="margin-top:10px;color:#555;font-size:13px">Humidity: ${humidity} · Wind: ${wind}</div>
                </div>
                ${icon ? `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" style="width:72px;height:72px" />` : ''}
            </div>
        `;
    }

    function showError(msg) {
        result.innerHTML = `<div style="color:#900">${escapeHtml(msg)}</div>`;
    }

    function capitalize(s = '') {
        return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // simple escape to avoid injecting unexpected HTML
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
});