import React, { useState } from "react";
import axios from "axios";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function Dashboard() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);

  const apiKey = "3994de955ee331b52e6fc03f71bba541";

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      setWeather(response.data);
      displayGlobe(response.data.coord);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Please enter a valid city name.");
    }
  };

  const displayGlobe = (coordinates) => {
    // Set up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("globe-container").appendChild(renderer.domElement);

    // Controler
    const controls = new OrbitControls(camera, renderer.domElement);

    // Create the globe geometry
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    // Load the Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(require("./texture.jpg"));
    // Create a material with the Earth texture
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    // Create the globe mesh with the Earth texture
    const globe = new THREE.Mesh(geometry, earthMaterial);
    scene.add(globe);

    // Set camera position
    camera.position.z = 15;

    // Calculate position on the globe
    const phi = (90 - coordinates.lat) * (Math.PI / 180);
    const theta = (coordinates.lon + 180) * (Math.PI / 180);

    // Calculate position in 3D space
    const x = 5 * Math.sin(phi) * Math.cos(theta);
    const y = 5 * Math.cos(phi);
    const z = 5 * Math.sin(phi) * Math.sin(theta);

    // Create a new material for the highlighted city
    const highlightedMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });

    // Create a new mesh for the highlighted city
    const highlightedCity = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 32, 32),
      highlightedMaterial
    );
    highlightedCity.position.set(x, y, z);

    // Add the highlighted city to the scene
    globe.add(highlightedCity);


    // Handle window resize
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  };

  return (
    <div>
      <h1 className="text-lg font-bold align-center">
        Weather Station Dashboard
      </h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={handleCityChange}
      />
      <button onClick={fetchWeatherData}>Fetch Weather</button>
      {weather && (
        <div className="weather-details">
          <h2>
            {weather.name}, {weather.sys.country}
          </h2>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <p>Weather: {weather.weather[0].description}</p>
        </div>
      )}
      <div
        id="globe-container"
        style={{ width: "400px", height: "400px" }}
      ></div>
    </div>
  );
}

export default Dashboard;
