import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";
import {
  generateRandomNum,
  imageValidator,
  removeImage,
  uploadImage,
} from "../utils/helper.js";
import prisma from "../DB/db.config.js";
import NewsApiTransform from "../transform/newsApiTransform.js";

class NewsController {
  static async index(req, res) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page <= 0) {
      page = 1;
    }

    if (limit <= 0 || limit > 100) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    const news = await prisma.news.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
      take: limit,
      skip: skip,
    });
    const newsTransForm = news?.map((news) => NewsApiTransform.transform(news));

    const totalNews = await prisma.news.count();
    const totalPage = Math.ceil(totalNews / limit);

    return res.json({
      status: 200,
      news: newsTransForm,
      metadata: {
        totalPage,
        currentPage: page,
        currentLimit: limit,
      },
      message: "News fetch successfully",
    });
  }

  static async store(req, res) {
    try {
      const user = req.user;
      const body = req.body;

      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          errors: {
            image: "Image field is required.",
          },
        });
      }

      const image = req.files?.image;

      //   * Image custom validator
      const message = imageValidator(image?.size, image?.mimetype);
      if (message !== null) {
        return res.status(400).json({
          errors: {
            profile: message,
          },
        });
      }

      //   * Upload image
      const imageName = uploadImage(image);

      //   * store in database
      payload.image = imageName;
      payload.userId = user.id;
      const news = await prisma.news.create({
        data: payload,
      });

      return res.json({
        status: 200,
        message: "News created Successfully",
        news,
      });
    } catch (error) {
      console.log(`This is the news ${error}`);
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

  static async show(req, res) {
    try {
      const { id } = req.params;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: true,
            },
          },
        },
      });

      const transFormNews = news ? NewsApiTransform.transform(news) : null;

      return res.json({
        status: 200,
        news: transFormNews,
      });
    } catch (error) {
      console.log(`Server error something went wrong ${error}`);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong to this api to get news by id",
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (user.id !== news.userId) {
        return res.status(400).json({
          status: 400,
          message: "UnAtuhorized",
        });
      }

      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      const image = req?.files?.image;

      if (image) {
        const message = imageValidator(image?.size, image?.mimetype);
        if (message !== null) {
          return res.status(400).json({
            errors: {
              image: message,
            },
          });
        }

        //   * Upload image
        const imageName = uploadImage(image);
        payload.image = imageName;

        // * Delete old image
        removeImage(news.image);
      }

      await prisma.news.update({
        data: payload,
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({
        status: 200,
        message: "News update successfully!",
      });
    } catch (error) {
      console.log(`Server went wrong please try again letter - ${error}`);
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

  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (user.id !== news?.userId) {
        return res.status(401).json({
          message: "UnAuthorized",
        });
      }

      // * Delete image form filesystem
      removeImage(news.image);

      await prisma.news.delete({
        where: {
          id: Number(id),
        },
      });

      res.status(200).json({
        status: 200,
        message: "News Deleted successfully!",
      });
    } catch (error) {
      console.log(`Server went wrong please try again letter - ${error}`);
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

export default NewsController;
