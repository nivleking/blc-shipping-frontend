import axios from "axios";

const api = axios.create({
  baseURL: "https://api.slg.petra.ac.id/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  // withCredentials: true,
});

// let isRefreshing = false; // Flag to prevent multiple refresh calls
// let subscribers = []; // To queue requests while refreshing token

// function subscribeTokenRefresh(callback) {
//   subscribers.push(callback);
// }

// function onTokenRefreshed(newToken) {
//   subscribers.forEach((callback) => callback(newToken));
//   subscribers = [];
// }

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If the error is due to an expired token
//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       if (!isRefreshing) {
//         isRefreshing = true;

//         try {
//           const refreshToken = sessionStorage.getItem("refreshToken");
//           console.log("Refresh token:", refreshToken);
//           const token = sessionStorage.getItem("token");
//           console.log("Token:", token);

//           if (!refreshToken) {
//             throw new Error("Refresh token missing");
//           }

//           const response = await api.get("user/refresh-token", {
//             headers: {
//               Authorization: `Bearer ${refreshToken}`,
//             },
//           });

//           console.log("Token refreshed:", response);

//           const newToken = response.data.token;
//           const newRefreshToken = response.data.refresh_token;

//           // Store new tokens in session storage
//           sessionStorage.setItem("token", newToken);
//           sessionStorage.setItem("refreshToken", newRefreshToken);

//           // Notify all subscribers with the new token
//           onTokenRefreshed(newToken);

//           isRefreshing = false;
//         } catch (err) {
//           isRefreshing = false;

//           // Handle refresh token failure (e.g., logout user)
//           console.error("Token refresh failed:", err);
//           return Promise.reject(err);
//         }
//       }

//       // Wait for token refresh and retry the original request
//       return new Promise((resolve) => {
//         subscribeTokenRefresh((newToken) => {
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           resolve(api(originalRequest));
//         });
//       });
//     }

//     return Promise.reject(error);
//   }
// );

// // Add Authorization header to all requests
// api.interceptors.request.use((config) => {
//   const token = sessionStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
