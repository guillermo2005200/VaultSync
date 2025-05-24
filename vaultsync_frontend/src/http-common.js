import axios from "axios";

export default axios.create({
  baseURL: "http://vaultsync.es:8000/api/v1/",
  headers: {
    "Content-type": "application/json"
  }
});