import {
  request
} from '../utils/api';

export const createEnvSample = data => {
  const newData = {
    ...data
  };
  const {
    number
  } = data;
  if (number) {
    newData.status = 'PROCESSING';
  }
  return request('/env-samples', {
    method: 'POST',
    data: newData,
  });
};

export const queryList = params => {
  return request('/env-samples', {
    data: params,
  });
};

export const queryOnlineList = (data) => {
  return request('/env-samples/weapp-list', {
    data
  })
}

export const findOne = id => {
  return request('/env-samples/' + id)
}

export const updateEnvSample = params => {
  const {
    id,
    ...others
  } = params;
  return request(`/env-samples/${params.id}`, {
    method: 'PUT',
    data: others
  })
}

export const deleteEnvSample = id => {
  return request(`/env-samples/${id}`, {
    method: 'DELETE',
  });
};