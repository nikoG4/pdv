import axiosInstance from './axiosConfig';

class RoleService {
  // Método para obtener la lista de todos los roles con paginación
  async getAllRoles({ page = 0, size = 10, q = "" } = {}) {
    try {
      const response = await axiosInstance.get('/roles', {
        params: { page, size, q }, // Parámetros de paginación
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert(error.response.data);
      throw error; // Lanza el error para manejarlo en otro lugar si es necesario
    }
  }

  async getRoles() {
    try {
      const response = await axiosInstance.get('/roles/unpaged', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert(error.response.data);
      throw error; // Lanza el error para manejarlo en otro lugar si es necesario
    }
  }

  async save(role) {
    try {
      const response = await axiosInstance.post('/roles', role, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving role:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async update(id, role) {
    try {
      const response = await axiosInstance.put(`/roles/${id}`, role, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async delete(id) {
    try {
      await axiosInstance.delete(`/roles/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async getPermissions() {
    try {
      const response = await axiosInstance.get('/roles/permissions', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      alert(error.response.data);
      throw error;
    }
  }
}

export default new RoleService();
