import { UserRepository } from "../repositories/user.repository.js";

export class UserService {
  private repository = new UserRepository();

  async findAll() {
    const users = await this.repository.findAll();

    return users.map((user) => ({
      id: user.id,
      employee_number: user.employee_number,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      job_title: user.job_title,
      avatar: user.avatar,
      last_login_at: user.last_login_at,
      is_active: user.is_active,

      roles: user.userRoles.map((item) => ({
        id: item.role.id,
        code: item.role.code,
        name: item.role.name,
      })),

      departments: user.userDepartments.map((item) => ({
        id: item.department.id,
        code: item.department.code,
        name: item.department.name,
      })),
    }));
  }

  async findById(id: string) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      employee_number: user.employee_number,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      job_title: user.job_title,
      avatar: user.avatar,
      last_login_at: user.last_login_at,
      password_changed_at: user.password_changed_at,
      is_active: user.is_active,

      roles: user.userRoles.map((item) => ({
        id: item.role.id,
        code: item.role.code,
        name: item.role.name,
      })),

      departments: user.userDepartments.map((item) => ({
        id: item.department.id,
        code: item.department.code,
        name: item.department.name,
      })),
    };
  }

}
