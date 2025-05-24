import axios from "axios";

export default axios.create({
 baseURL: "https://vaultsync.es/api/v1/",
  headers: {
    "Content-type": "application/json"
  }
});