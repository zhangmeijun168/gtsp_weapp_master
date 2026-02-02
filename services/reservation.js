import { request } from '../utils/api';

export const queryReservations = (data) => {
    data.page = 1;
    data.limit = 10;
    data._timestamp = new Date().getTime();
    return request("/reservations", {
        method: "GET",
        data,
    });
};

export const queryReservationsList = (params) => {
    return request('/reservations/find', {
        method: 'GET',
        data: params
    })
}

export const queryOnlineList = (data) => {
    return request('/reservations/weapp-list', {
      data
    })
  }

export const queryReservationById = (id) => {
    return request('/reservations/' + id, {
        method: 'GET',
    })
}

export const invalidReservation = (id) => {
    return request('/reservations/' + id + '/invalid', { method: 'PUT' })
}

export const saveReservations = (data) => {
    return request("/reservations/" + data.id, {
        method: "PUT",
        data,
    });
};

export const addReservations = (data) => {
    data.source = "WEAPP";
    return request("/reservations", {
        method: "POST",
        data,
    });
};

export const getPreRegistration = (id) => {
  return request('/pre-registrations/' + id, {
      method: 'GET',
  })
}