const BASE_URL = 'http://localhost:8080/api';

const apiFetch = async (path, { token, ...options } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`${res.status} - ${errorBody}`);
  }

  return res.status === 204 ? null : res.json();
};

export const login = (email, senha) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });

export const registerAluno = (dados) =>
  apiFetch('/alunos', {
    method: 'POST',
    body: JSON.stringify(dados),
  });

export default apiFetch;
