import api from "./api";

/**
 * Serviço de usuários. Todas as requisições usam o token no header (api.js).
 * API esperada: GET/POST /users, GET/PUT/DELETE /users/:id
 */
class UserService {
  async list() {
    const { data } = await api.get("/users");
    return data;
  }

  async get(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  }

  async create(payload) {
    const { data } = await api.post("/users", payload);
    return data;
  }

  async update(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  }

  async delete(id) {
    await api.delete(`/users/${id}`);
  }
}

export default new UserService();
