import { getImageUrl } from "../utils/helper.js";

class NewsApiTransform {
  static transform(news) {
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      image: getImageUrl(news.image),
      createAt: news.createAt,
      reporter: {
        id: news?.user?.id,
        name: news?.user?.name,
        profile:
          news?.user?.profile !== null
            ? getImageUrl(news?.user?.profile)
            : "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png",
      },
    };
  }
}

export default NewsApiTransform;
