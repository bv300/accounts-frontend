import React from "react";
import ReactDOM from "react-dom/client";

console.log("SIMPLE ENTRY POINT LOADED");

ReactDOM.createRoot(document.getElementById("root")).render(
    <h1 style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>
        Minimal React App - If you see this, Vite is working!
    </h1>
);
