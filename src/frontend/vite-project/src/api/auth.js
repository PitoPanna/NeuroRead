import axiosClient from './axiosClient';

export const loginUser = async (email, password) => {
  // FastAPI OAuth2PasswordRequestForm FORM-DATA-t vár!
  const formData = new FormData();
  formData.append('username', email); // A FastAPI 'username'-nek hívja az emailt is
  formData.append('password', password);

  const response = await axiosClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // vagy 'application/x-www-form-urlencoded'
    },
  });

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