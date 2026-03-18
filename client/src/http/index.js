import axios from "axios";
import config from "../configs/config";
import { adminStore } from "../app/(dashboard)/layout";
export const ADMIN_API_URL = config.SERVER_API + "/Admin";

export const $AdminApi = axios.create({
    baseURL: config.SERVER_API,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

$AdminApi.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem(
        "accessTokenAdmin",
    )}`;
    return config;
});

let adminPromise = null;

$AdminApi.interceptors.response.use(
    (config) => config,
    async (err) => {
        const originalRequest = err.config;
        if (
            err?.response?.status === 401 &&
            err.config &&
            !err.config._isRetry
        ) {
            originalRequest._isRetry = true;
            try {
                let promise;
                if (adminPromise) {
                    promise = adminPromise;
                } else {
                    promise = axios.get(`${ADMIN_API_URL}/refresh`, {
                        withCredentials: true,
                    });
                    adminPromise = promise;
                }
                const response = await promise;
                adminPromise = null;
                localStorage.setItem("accessTokenAdmin", response.data);
                return await $AdminApi.request(originalRequest);
            } catch (e) {
                if (e?.response?.status === 401) adminStore.setUnauthorized();
                throw e;
            }
        }
        throw err;
    },
);
