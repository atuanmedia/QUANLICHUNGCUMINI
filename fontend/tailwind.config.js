/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: { colors: {
      primary: '#2563eb', // xanh lam chính
      secondary: '#60a5fa', // xanh nhạt
      primary: "#1d4ed8", // xanh đậm sang trọng
      // "primary-dark": "#1e3a8a",
    },},
  },
  plugins: [],
  

  
}
