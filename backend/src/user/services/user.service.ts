import bcrypt from "bcryptjs";

import prisma from "../../config/prisma.js";
import { generatePassword } from "../../utils/password.util.js";
import { UserRepository } from "../repositories/user.repository.js";

type CreateUserInput = {
  employee_number: string;
  username: string;
  full_name: string;
  email: string;
  phone?: string | null;
  job_title?: string | null;

  role_ids: string[];
  department_ids: string[];

  password_mode: "auto" | "manual";
  password?: string;

  must_change_password: boolean;
  is_active: boolean;

  created_by?: string | null;
};

type UpdateUserInput = {
  id: string;

  employee_number: string;
  full_name: string;
  email: string;
  phone?: string | null;
  job_title?: string | null;

  role_ids: string[];
  department_ids: string[];

  is_active: boolean;

  updated_by?: string | null;
};

type ResetPasswordInput = {
  id: string;

  password_mode: "auto" | "manual";
  password?: string;

  must_change_password: boolean;

  updated_by?: string | null;
};

type UpdateUserStatusInput = {
  id: string;
  is_active: boolean;
  current_user_id: string;
  updated_by?: string | null;
};

type SoftDeleteUserInput = {
  id: string;

  current_user_id: string;
  deleted_by?: string | null;
};

type UpdateMyProfileInput = {
  user_id: string;

  full_name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
};

type ChangeMyPasswordInput = {
  user_id: string;

  current_password: string;
  new_password: string;
  confirm_password: string;
};

export class UserService {
  private repository = new UserRepository();

  private mapUserDto(user: {
    id: string;
    employee_number: string | null;
    username: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    avatar: string | null;
    last_login_at: Date | null;
    password_changed_at: Date | null;
    must_change_password: boolean;
    is_active: boolean;
  }) {
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
      must_change_password: user.must_change_password,
      is_active: user.is_active,
    };
  }

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
      ...this.mapUserDto(user),

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
      (await this.repository.isEmployeeNumberExists(input.employee_number))
    ) {
      throw new Error("Employee number already exists");
    }

    if (input.role_ids.length === 0) {
      throw new Error("At least one role is required");
    }

    if (input.department_ids.length === 0) {
      throw new Error("At least one department is required");
    }

    if (new Set(input.role_ids).size !== input.role_ids.length) {
      throw new Error("Duplicate roles are not allowed");
    }

    if (new Set(input.department_ids).size !== input.department_ids.length) {
      throw new Error("Duplicate departments are not allowed");
    }

    if (
      (await this.repository.existingRoleCount(input.role_ids)) !==
      input.role_ids.length
    ) {
      throw new Error("Invalid role selected");
    }

    if (
      (await this.repository.existingDepartmentCount(input.department_ids)) !==
      input.department_ids.length
    ) {
      throw new Error("Invalid department selected");
    }

    const plainPassword =
      input.password_mode === "auto" ? generatePassword() : input.password;

    if (!plainPassword) {
      throw new Error("Password is required");
    }

    const password_hash = await bcrypt.hash(plainPassword, 10);

    const data = {
      employee_number: input.employee_number,
      username: input.username,
      password_hash,
      full_name: input.full_name,
      email: input.email,
      must_change_password: input.must_change_password,
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

    const user = await prisma.$transaction(async (tx) => {
      const user = await this.repository.create(tx, data);

      await this.repository.assignRoles(
        tx,
        user.id,
        input.role_ids,
        input.created_by,
      );

      await this.repository.assignDepartments(
        tx,
        user.id,
        input.department_ids,
        input.created_by,
      );

      return user;
    });

    return {
      user: this.mapUserDto(user),

      temporaryPassword: input.password_mode === "auto" ? plainPassword : null,
    };
  }
  async updateUser(input: UpdateUserInput) {
    if (await this.repository.isEmailExistsExcept(input.id, input.email)) {
      throw new Error("Email already exists");
    }

    if (
      input.employee_number &&
      (await this.repository.isEmployeeNumberExistsExcept(
        input.id,
        input.employee_number,
      ))
    ) {
      throw new Error("Employee number already exists");
    }

    if (input.role_ids.length === 0) {
      throw new Error("At least one role is required");
    }

    if (input.department_ids.length === 0) {
      throw new Error("At least one department is required");
    }

    if (new Set(input.role_ids).size !== input.role_ids.length) {
      throw new Error("Duplicate roles are not allowed");
    }

    if (new Set(input.department_ids).size !== input.department_ids.length) {
      throw new Error("Duplicate departments are not allowed");
    }

    if (
      (await this.repository.existingRoleCount(input.role_ids)) !==
      input.role_ids.length
    ) {
      throw new Error("Invalid role selected");
    }

    if (
      (await this.repository.existingDepartmentCount(input.department_ids)) !==
      input.department_ids.length
    ) {
      throw new Error("Invalid department selected");
    }

    const data = {
      employee_number: input.employee_number,
      full_name: input.full_name,
      email: input.email,
      is_active: input.is_active,

      ...(input.phone !== undefined && {
        phone: input.phone,
      }),

      ...(input.job_title !== undefined && {
        job_title: input.job_title,
      }),

      ...(input.updated_by !== undefined && {
        updated_by: input.updated_by,
      }),
    };

    const user = await prisma.$transaction(async (tx) => {
      const user = await this.repository.update(tx, input.id, data);

      await this.repository.clearRoles(tx, input.id);

      await this.repository.assignRoles(
        tx,
        input.id,
        input.role_ids,
        input.updated_by,
      );

      await this.repository.clearDepartments(tx, input.id);

      await this.repository.assignDepartments(
        tx,
        input.id,
        input.department_ids,
        input.updated_by,
      );

      return user;
    });

    return this.mapUserDto(user);
  }

  async resetPassword(input: ResetPasswordInput) {
    const plainPassword =
      input.password_mode === "auto" ? generatePassword() : input.password;

    if (!plainPassword) {
      throw new Error("Password is required");
    }

    const password_hash = await bcrypt.hash(plainPassword, 10);

    const user = await prisma.$transaction(async (tx) => {
      return this.repository.resetPassword(tx, input.id, {
        password_hash,
        must_change_password: input.must_change_password,
        password_changed_at: new Date(),

        ...(input.updated_by !== undefined && {
          updated_by: input.updated_by,
        }),
      });
    });

    return {
      user: this.mapUserDto(user),

      temporaryPassword: input.password_mode === "auto" ? plainPassword : null,
    };
  }

  async updateStatus(input: UpdateUserStatusInput) {
    if (input.id === input.current_user_id) {
      throw new Error("You cannot deactivate your own account");
    }

    const user = await prisma.$transaction(async (tx) => {
      return this.repository.updateStatus(tx, input.id, {
        is_active: input.is_active,

        ...(input.updated_by !== undefined && {
          updated_by: input.updated_by,
        }),
      });
    });

    return this.mapUserDto(user);
  }

  async softDelete(input: SoftDeleteUserInput) {
    if (input.id === input.current_user_id) {
      throw new Error("You cannot delete your own account");
    }

    const user = await prisma.$transaction(async (tx) => {
      return this.repository.softDelete(tx, input.id, {
        deleted_at: new Date(),

        ...(input.deleted_by !== undefined && {
          deleted_by: input.deleted_by,
        }),
      });
    });

    return this.mapUserDto(user);
  }

  async updateMyProfile(input: UpdateMyProfileInput) {
    if (await this.repository.isEmailExistsExcept(input.user_id, input.email)) {
      throw new Error("Email already exists");
    }

    const data = {
      full_name: input.full_name,
      email: input.email,

      ...(input.phone !== undefined && {
        phone: input.phone,
      }),

      ...(input.avatar !== undefined && {
        avatar: input.avatar,
      }),

      updated_by: input.user_id,
    };

    const user = await prisma.$transaction(async (tx) => {
      return this.repository.updateMyProfile(tx, input.user_id, data);
    });

    return this.mapUserDto(user);
  }

  async getMyProfile(userId: string) {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return this.mapUserDto(user);
  }

  async changeMyPassword(input: ChangeMyPasswordInput) {
    const user = await this.repository.findById(input.user_id);

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(
      input.current_password,
      user.password_hash,
    );

    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    if (input.new_password !== input.confirm_password) {
      throw new Error("Password confirmation does not match");
    }

    const password_hash = await bcrypt.hash(input.new_password, 10);

    await prisma.$transaction(async (tx) => {
      await this.repository.changeMyPassword(tx, input.user_id, {
        password_hash,
        password_changed_at: new Date(),
        must_change_password: false,
        updated_by: input.user_id,
      });
    });
  }

  async updateMyAvatar(userId: string, avatarPath: string | null) {
    const user = await prisma.$transaction(async (tx) => {
      return this.repository.updateMyAvatar(tx, userId, {
        avatar: avatarPath,
        updated_by: userId,
      });
    });
    return this.mapUserDto(user);
  }

  async getMyAvatar(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.avatar as string | null;
  }
}
