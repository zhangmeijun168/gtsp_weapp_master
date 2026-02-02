import { request } from "../utils/api";

export const getAuthPublicKey = () => {
  return request("/auth/public-key");
}

export const login = (data) => {
  return request("/auth/login", {
    method: "POST",
    data,
  });
};

export const user = (data) => {
  return request("/user", {
    method: "GET",
    data,
  });
};

export const updateUser = (id, data) => {
  return request(`/users/${id}`, {
    method: 'PUT',
    data,
  });
}

export const verificationCode = (data) => {
  return request("/auth/sendVerificationCode", {
    method: "POST",
    data,
  });
};

export const queryCurrentUser = () => {
  return request("/user", {
    method: "GET",
  });
};

