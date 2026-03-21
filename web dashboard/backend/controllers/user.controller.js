const prisma = require("../db/prisma");
const { UserUncheckedCreateInputSchema } = require("../prisma/generated/zod");

// Use omit to exclude auto-generated/relation fields
const CreateInitialUserSchema = UserUncheckedCreateInputSchema.omit({
  id: true,
  homeId: true,
  workId: true,
});

// GET
const findUser = async (req, res) => {
  try {
    const { ...param } = req.query;
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};

// POST
const createUser = async (req, res) => {
  try {
    const validated = CreateInitialUserSchema.parse(req.body);
    const user = await prisma.user.create({
      data: validated,
    });
    res.status(201).json({
      success: true,
      message: `Account for user ${user.username || user.firstName} created successfully`,
    });
    console.log(req.body);
  } catch (error) {
    console.log(error);

    // Zod validation error
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        errors: error.issues?.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // Prisma errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `${error.meta?.target?.[0] || "Field"} already exists`,
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid reference: related record not found",
      });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// UPDATE
const updateUser = async (req, res) => {
  try {
    
  } catch (error) {
    
  }
}

module.exports = { createUser, findUser };
