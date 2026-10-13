const BASE_URL = 'http://localhost:5264/api/providers';

export const getProviders = (filter = '') => {
    // Map the dropdown filters to your specific API report routes
    let url = BASE_URL;
    if (filter === 'active') url = `${BASE_URL}/reports/active-with-active-licenses`;
    if (filter === 'expired') url = `${BASE_URL}/reports/active-with-expired-licenses`;
    if (filter === 'deleted') url = `${BASE_URL}/audit/deleted-providers`;

    return fetch(url).then(res => res.json());
};

export const createProvider = (provider) => {
    return fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider)
    }).then(res => res.json());
};

export const updateProvider = (id, provider) => {
    return fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider)
    });
};

export const deleteProvider = (id) => {
    return fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
    });
};