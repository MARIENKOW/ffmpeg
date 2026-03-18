import videoService from "../services/video-service.js";
import { Video } from "../models/Video.js";
import { Img } from "../models/Img.js";
class Controller {
    create = async (req, res) => {
        try {
            const video = req?.files?.video;

            if (!video)
                return res
                    .status(400)
                    .json({ "root.server": "Incorrect values" });

            const { video_id, path, poster } = await videoService.save(video);
            const info = {
                path: process.env.API_URL + path,
                id: video_id,
                poster: process.env.API_URL + poster,
            };
            return res.status(200).json(info);
        } catch (e) {
            console.log(e);
            res.status(500).json(e?.message);
        }
    };
    delete = async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json("id is not found");
            const blogData = await Video.findOne({
                where: {
                    id,
                },
            });

            if (!blogData) return res.status(404).json("video is not found");

            const { id: video_id } = blogData;

            await videoService.delete(video_id);

            return res.status(200).json(video_id);
        } catch (e) {
            console.log(e);
            res.status(500).json(e?.message);
        }
    };
    deleteAll = async (req, res) => {
        try {
            const blogData = await Video.findAll();

            if (!blogData || blogData.length === 0)
                return res.status(404).json("video is not found");

            for (const element of blogData) {
                await videoService.delete(element.id);
            }

            return res.status(200).json(true);
        } catch (e) {
            console.log(e);
            res.status(500).json(e?.message);
        }
    };
    getAll = async (req, res) => {
        try {
            const VIDEOS_COUNT = 12;
            let { page } = req?.query;
            const offsetCount = (page) => ((page || 1) - 1) * VIDEOS_COUNT;
            const offset = offsetCount(page);

            let blogData = await Video.findAll({
                include: [
                    {
                        model: Img,
                        as: "img",
                        required: true,
                    },
                ],

                order: [["id", "DESC"]],
                offset,
                limit: VIDEOS_COUNT,
            });
            if (blogData.length === 0 && page > 1) {
                page = page - 1;
                blogData = await Video.findAll({
                    include: [
                        {
                            model: Img,
                            as: "img",
                            required: true,
                        },
                    ],

                    order: [["id", "DESC"]],
                    offset: offsetCount(page),
                    limit: VIDEOS_COUNT,
                });
            }
            const countItems = await Video.count();
            const currentPage = page || 1;
            const countPages = Math.ceil(countItems / VIDEOS_COUNT);
            const isLastPage = currentPage == countPages;
            const info = {
                currentPage,
                countPages,
                countItems,
                isLastPage,
                itemsOnCurrentPage: isLastPage
                    ? countItems - VIDEOS_COUNT * (countPages - 1)
                    : VIDEOS_COUNT,
            };
            return res.status(200).json({ data: blogData, info });
        } catch (e) {
            console.log(e);
            res.status(500).json(e?.message);
        }
    };
}
export default new Controller();
