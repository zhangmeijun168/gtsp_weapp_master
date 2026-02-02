import { request } from '../utils/api';

export const queryStations = () => {
    return request('/stations/list');
};
