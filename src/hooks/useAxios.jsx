import axiosInstance from "../lib/axiosInstance";
import { getToken } from "../lib/token";

const useAxios = () => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
};

export default useAxios;
