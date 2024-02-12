import prisma from "../DB/db.config.js";
import {
  imageValidator,
  uploadImage,
} from "../utils/helper.js";

class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      return res.json({ status: 200, user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 500,
        message: "Somethng went wrong!",
      });
    }
  }

  static async store() {}

  static async show() {}

  static async update(req, res) {
    try {
      const { id } = req.params;
      const authUser = req.user;

      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Profile image is required." });
      }

      const image = req.files.profile;
      const message = imageValidator(profile?.size, profile?.mimetype);

      if (message !== null) {
        return res.status(400).json({
          errors: {
            profile: message,
          },
        });
      }

      // * Upload image
      const imageName = uploadImage(image);

      await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          profile: imageName,
        },
      });

      return res.json({
        status: 200,
        message: "Profile Updated Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.json({
        status: 500,
        message: "Something went wrong in server",
      });
    }
  }

  static async distory() {}
}

export default ProfileController;
