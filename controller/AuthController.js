import prisma from "../DB/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { loginSchema, registerSchema } from "../validations/authValidation.js";
import bycript from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;

      // * validation the register data
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      // * check if email exit
      const findUser = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (findUser) {
        return res.json({
          status: 400,
          errors: {
            email: "Email already taken. Please use another one.",
          },
        });
      }

      // * Encrypt the password
      const salt = bycript.genSaltSync(10);
      payload.password = bycript.hashSync(payload.password, salt);

      // * Insert into the database
      const user = await prisma.user.create({
        data: payload,
      });

      return res.json({
        status: 200,
        data: user,
        message: "User created successfully",
      });
    } catch (error) {
      console.log(`This is the creating user ${error}`);

      // * response back to the validation error register
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.json({
          status: 400,
          errors: error.messages,
        });
      } else {
        return res.json({
          status: 500,
          message: "Something went wrong please try again",
        });
      }
    }
  }

  static async login(req, res) {
    try {
      const body = req.body;

      // * validation the login data
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      // * find user with email
      const findUser = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (findUser) {
        if (!bycript.compareSync(payload.password, findUser.password)) {
          return res.json({
            status: 400,
            errors: {
              email: "Invalid Credentials.",
            },
          });
        }

        // * Issue token to user
        const payloadData = {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
          profile: findUser.profile,
        };
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "364d",
        });

        return res.json({
          status: 200,
          message: "Logged in",
          access_token: `Bearer ${token}`
        });
      }

      return res.json({
        status: 400,
        errors: {
          email: "No user found with this email",
        },
      });
    } catch (error) {
      console.log(`This is the login user ${error}`);
      // * response back to the validation error login
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.json({
          status: 400,
          errors: error.messages,
        });
      } else {
        return res.json({
          status: 500,
          message: "Something went wrong please try again",
        });
      }
    }
  }
}

export default AuthController;
