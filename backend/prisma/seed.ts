import "dotenv/config";
import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const departments = [
  {
    code: "IT",
    name: "Information Technology",
    description: "System Owner",
    display_order: 1,
    is_active: true,
  },
  {
    code: "EO",
    name: "Event Organizer",
    description: "Event Organizer Department",
    display_order: 2,
    is_active: true,
  },
  {
    code: "FO",
    name: "Front Office",
    description: "Front Office Department",
    display_order: 3,
    is_active: true,
  },
  {
    code: "HK",
    name: "Housekeeping",
    description: "Housekeeping Department",
    display_order: 4,
    is_active: true,
  },
  {
    code: "ENG",
    name: "Engineering",
    description: "Engineering Department",
    display_order: 5,
    is_active: true,
  },
  {
    code: "HRD",
    name: "Human Resources",
    description: "Human Resources Department",
    display_order: 6,
    is_active: true,
  },
  {
    code: "FBS",
    name: "Food & Beverage Service",
    description: "Food & Beverage Service",
    display_order: 7,
    is_active: true,
  },
  {
    code: "FBP",
    name: "Food & Beverage Product",
    description: "Kitchen",
    display_order: 8,
    is_active: true,
  },
  {
    code: "ACC",
    name: "Accounting",
    description: "Accounting Department",
    display_order: 9,
    is_active: true,
  },
  {
    code: "SM",
    name: "Sales & Marketing",
    description: "Sales & Marketing Department",
    display_order: 10,
    is_active: true,
  },
  {
    code: "PR",
    name: "Public Relation & Social Media",
    description: "PR & Social Media",
    display_order: 11,
    is_active: true,
  },
];

const roles = [
  {
    code: "SUPER_ADMIN",
    name: "Super Administrator",
    description: "Full system access",
    is_system: true,
    is_active: true,
  },
  {
    code: "ADMIN",
    name: "Administrator",
    description: "Department administrator",
    is_system: true,
    is_active: true,
  },
  {
    code: "MANAGER",
    name: "Manager",
    description: "Department manager",
    is_system: true,
    is_active: true,
  },
  {
    code: "STAFF",
    name: "Staff",
    description: "Department staff",
    is_system: true,
    is_active: true,
  },
  {
    code: "VIEWER",
    name: "Viewer",
    description: "Read only",
    is_system: true,
    is_active: true,
  },
];

const permissions = [
  { module: "dashboard", action: "view", description: "View Dashboard" },

  { module: "department", action: "view", description: "View Department" },
  { module: "department", action: "create", description: "Create Department" },
  { module: "department", action: "update", description: "Update Department" },
  { module: "department", action: "delete", description: "Delete Department" },

  { module: "user", action: "view", description: "View User" },
  { module: "user", action: "create", description: "Create User" },
  { module: "user", action: "update", description: "Update User" },
  { module: "user", action: "delete", description: "Delete User" },

  { module: "document", action: "view", description: "View Document" },
  { module: "document", action: "upload", description: "Upload Document" },
  { module: "document", action: "download", description: "Download Document" },
  { module: "document", action: "update", description: "Update Document" },
  { module: "document", action: "delete", description: "Delete Document" },

  { module: "role", action: "view", description: "View Role" },
  { module: "permission", action: "view", description: "View Permission" },

  { module: "role_permission", action: "view", description: "View Role Permission" },
  { module: "role_permission", action: "update", description: "Update Role Permission" },
];

const rolePermissions = [
  { role: "SUPER_ADMIN", permission: "*" },
];

const categories = [
  {
    code: "SOP",
    name: "Standard Operating Procedure",
    description: "Standard Operating Procedure",
    display_order: 1,
    is_system: true,
    is_active: true,
  },
  {
    code: "WI",
    name: "Work Instruction",
    description: "Work Instruction",
    display_order: 2,
    is_system: true,
    is_active: true,
  },
  {
    code: "POL",
    name: "Policy",
    description: "Company Policy",
    display_order: 3,
    is_system: true,
    is_active: true,
  },
  {
    code: "FORM",
    name: "Form",
    description: "Operational Form",
    display_order: 4,
    is_system: true,
    is_active: true,
  },
  {
    code: "IOM",
    name: "Internal Office Memo",
    description: "Internal Office Memo",
    display_order: 5,
    is_system: true,
    is_active: true,
  },
];

const confidentialLevels = [
  {
    code: "PUBLIC",
    name: "Public",
    description: "Visible to all authorized users",
    display_order: 1,
    is_active: true,
  },
  {
    code: "DEPARTMENT",
    name: "Department",
    description: "Visible only within the same department",
    display_order: 2,
    is_active: true,
  },
  {
    code: "PRIVATE",
    name: "Private",
    description: "Visible only to selected users",
    display_order: 3,
    is_active: true,
  },
];

const tags = [
  {
    name: "Important",
    color: "#EF4444",
    description: "Important document",
    is_system: true,
    is_active: true,
  },
  {
    name: "Draft",
    color: "#F59E0B",
    description: "Draft document",
    is_system: true,
    is_active: true,
  },
  {
    name: "Approved",
    color: "#22C55E",
    description: "Approved document",
    is_system: true,
    is_active: true,
  },
  {
    name: "Archive",
    color: "#6B7280",
    description: "Archived document",
    is_system: true,
    is_active: true,
  },
];

const users = [
  {
    username: "admin",
    password: "superadmin123",
    full_name: "Super Administrator",
    employee_number: "000001",
    email: "admin@localhost",
    role: "SUPER_ADMIN",
    department: "IT",
  },
  {
    username: "testadmin",
    password: "admin123",
    full_name: "Test Administrator",
    employee_number: "900001",
    email: "testadmin@localhost",
    role: "ADMIN",
    department: "IT",
  },
  {
    username: "testmanager",
    password: "manager123",
    full_name: "Test Manager",
    employee_number: "900002",
    email: "testmanager@localhost",
    role: "MANAGER",
    department: "IT",
  },
  {
    username: "teststaff",
    password: "staff123",
    full_name: "Test Staff",
    employee_number: "900003",
    email: "teststaff@localhost",
    role: "STAFF",
    department: "IT",
  },
];
async function main() {
  console.log("🌱 SEDS Seed Started");

  for (const department of departments) {
    await prisma.department.upsert({
      where: {
        code: department.code,
      },
	update: {},
      create: department,
    });
  }

    console.log("✅ Department Seeded");
    for (const role of roles) {
    await prisma.role.upsert({
      where: {
        code: role.code,
      },
      update: {},
      create: role,
    });
    }

    console.log("✅ Role Seeded");

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        module_action: {
          module: permission.module,
          action: permission.action,
        },
      },
      update: {},
      create: permission,
    });
  }

  console.log("✅ Permission Seeded");
  const superAdminRole = await prisma.role.findUnique({
    where: {
      code: "SUPER_ADMIN",
    },
  });

  const allPermissions = await prisma.permission.findMany();

  if (superAdminRole) {
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: superAdminRole.id,
            permission_id: permission.id,
          },
        },
	update: {},
        create: {
          role_id: superAdminRole.id,
          permission_id: permission.id,
        },
      });
    }
  }

  console.log("✅ RolePermission Seeded");
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        code: category.code,
      },
      update: {},
      create: category,
    });
  }

  console.log("✅ Category Seeded");

  for (const level of confidentialLevels) {
    await prisma.confidentialLevel.upsert({
      where: {
        code: level.code,
      },
      update: {},
      create: level,
    });
  }

  console.log("✅ ConfidentialLevel Seeded");

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: {
        name: tag.name,
      },
      update: {},
      create: tag,
    });
  }

  console.log("✅ Tag Seeded");

for (const item of users) {
  const password_hash = await bcrypt.hash(
    item.password,
    10,
  );

  const user = await prisma.user.upsert({
    where: {
      username: item.username,
    },
    update: {
      password_hash,
      full_name: item.full_name,
      employee_number: item.employee_number,
      email: item.email,
      is_active: true,
    },
    create: {
      username: item.username,
      password_hash,
      full_name: item.full_name,
      employee_number: item.employee_number,
      email: item.email,
      is_active: true,
    },
  });

  const role = await prisma.role.findUnique({
    where: {
      code: item.role,
    },
  });

  if (!role) {
    throw new Error(
      `Role ${item.role} not found`,
    );
  }

  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: user.id,
        role_id: role.id,
      },
    },
    update: {},
    create: {
      user_id: user.id,
      role_id: role.id,
    },
  });

  const department =
    await prisma.department.findUnique({
      where: {
        code: item.department,
      },
    });

  if (!department) {
    throw new Error(
      `Department ${item.department} not found`,
    );
  }

  await prisma.userDepartment.upsert({
    where: {
      user_id_department_id: {
        user_id: user.id,
        department_id: department.id,
      },
    },
    update: {},
    create: {
      user_id: user.id,
      department_id: department.id,
    },
  });

  console.log(`✅ ${item.username} Seeded`);
}

}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
