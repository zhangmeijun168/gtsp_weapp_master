import {
  request
} from '../utils/api';

export const addSample = (data) => {
  return request("/covid/new", {
    method: "POST",
    data,
  });
};