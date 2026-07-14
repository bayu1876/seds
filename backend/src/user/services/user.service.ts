import bcrypt from "bcryptjs";

import { generatePassword } from "../../utils/password.util.js";
import { UserRepository } from "../repositories/user.repository.js";

type CreateUserInput = {
  employee_number: string;
  username: string;
  full_name: string;
  email: string;
  phone?: string | null;
  job_title?: string | null;

  password_mode: "auto" | "manual";
  password?: string;

  must_change_password: boolean;
  is_active: boolean;

  created_by?: string | null;
};

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

  async createUser(input: CreateUserInput) {
    if (await this.repository.isUsernameExists(input.username)) {
      throw new Error("Username already exists");
    }

    if (await this.repository.isEmailExists(input.email)) {
      throw new Error("Email already exists");
    }

    if (
      input.employee_number &&
      await this.repository.isEmployeeNumberExists(
        input.employee_number,
      )
    ) {
      throw new Error("Employee number already exists");
    }

    const plainPassword =
      input.password_mode === "auto"
        ? generatePassword()
        : input.password;

    if (!plainPassword) {
      throw new Error("Password is required");
    }

    const password_hash =
      await bcrypt.hash(plainPassword, 10);

   const data = {
     employee_number: input.employee_number,
     username: input.username,
     password_hash,
     full_name: input.full_name,
     email: input.email,
     is_active: input.is_active,

     ...(input.phone !== undefined && {
       phone: input.phone,
     }),

     ...(input.job_title !== undefined && {
       job_title: input.job_title,
     }),

     ...(input.created_by !== undefined && {
       created_by: input.created_by,
     }),
   };

   const user = await this.repository.create(data);

   return {
     user: {
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
       must_change_password: user.must_change_password,
       is_active: user.is_active,
     },

     temporaryPassword:
       input.password_mode === "auto"
         ? plainPassword
         : null,
   };

  }

}
