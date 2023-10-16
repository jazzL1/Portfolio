if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then((registration) => console.log("serviceWorker Registered", registration))
    .catch((err) => console.log("serviceWorker Not Registered", err));
  }