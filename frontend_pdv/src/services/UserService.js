import axiosInstance from './axiosConfig';

class UserService {
  // Método para obtener la lista de todos los usuarios con paginación
  async getAllUsers({ page = 0, size = 10, q = "" } = {}) {
    try {
      const response = await axiosInstance.get('/users', {
        params: { page, size, q }, // Parámetros de paginación
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(error.response.data);
      throw error; // Lanza el error para manejarlo en otro lugar si es necesario
    }
  }

  // Método para guardar un nuevo usuario
  async save(user) {
    try {
      const response = await axiosInstance.post('/users/create-user', user, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para actualizar un usuario existente
  async update(id, user) {
    try {
      const response = await axiosInstance.put(`/users/update-user/${id}`, user, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para eliminar un usuario
  async delete(id) {
    try {
      await axiosInstance.delete(`/users/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response.data);
      throw error;
    }
  }
}

export default new UserService();
