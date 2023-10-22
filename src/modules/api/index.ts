import axios from "axios";

export const pterodactyl = axios.create({
  baseURL: process.env.PTERODACTYL_API,
  headers: {
    Authorization: `Bearer ${process.env.PTERODACTYL_API_KEY}`,
  },
});
