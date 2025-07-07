import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // your backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
