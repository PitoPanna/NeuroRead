import axiosClient from './axiosClient';

export const loginUser = async (email, password) => {
  // FastAPI OAuth2-höz x-www-form-urlencoded formátum kell
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await axiosClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // ITT VAN A HELYE A SETITEM-NEK:
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
  }

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axiosClient.post('/auth/register', userData);
  return response.data;
};

export const logoutUser = () => {
  // Kijelentkezéskor pedig itt töröljük:
  localStorage.removeItem('access_token');
};