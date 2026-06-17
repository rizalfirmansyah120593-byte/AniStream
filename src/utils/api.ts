import { API_URL } from '@/utils/config';
export const fetchNewAnime = async () => {
  try {
    const response = await fetch(`${API_URL}/new-anime`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching new anime:', error);
    throw error;
  }
};
