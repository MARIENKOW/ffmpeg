import videoService from "../services/video-service.js";
import prisma from "../services/prisma.js";

const VIDEOS_COUNT = 12;

// Добавляет API_URL к path — замена Sequelize getter'ов
function withPublicPaths(video) {
    return {
        ...video,
        path: process.env.API_URL + video.path,
        img: video.img
            ? { ...video.img, path: process.env.API_URL + video.img.path }
            : null,
    };
}

class Controller {
    create = async (req, res) => {
        try {
            const video = req?.files?.video;
            if (!video)
                return res.status(400).json({ "root.server": "Incorrect values" });

            const { video_id, path, poster } = await videoService.save(video);

            return res.status(200).json({
                id:     video_id,
                path:   process.env.API_URL + path,
                poster: process.env.API_URL + poster,
            });
        } catch (e) {
            console.error(e);
            res.status(500).json(e?.message);
        }
    };

    delete = async (req, res) => {
        try {
            const id = Number(req.params.id);
            if (!id) return res.status(400).json("id is not found");

            const video = await prisma.video.findUnique({ where: { id } });
            if (!video) return res.status(404).json("video is not found");

            await videoService.delete(id);
            return res.status(200).json(id);
        } catch (e) {
            console.error(e);
            res.status(500).json(e?.message);
        }
    };

    deleteAll = async (req, res) => {
        try {
            const videos = await prisma.video.findMany();
            if (!videos.length)
                return res.status(404).json("video is not found");

            for (const v of videos) {
                await videoService.delete(v.id);
            }

            return res.status(200).json(true);
        } catch (e) {
            console.error(e);
            res.status(500).json(e?.message);
        }
    };

    getAll = async (req, res) => {
        try {
            let page = Math.max(Number(req?.query?.page) || 1, 1);
            const skip = (p) => (p - 1) * VIDEOS_COUNT;

            let videos = await prisma.video.findMany({
                where:   { img: { isNot: null } },
                include: { img: true },
                orderBy: { id: "desc" },
                skip:    skip(page),
                take:    VIDEOS_COUNT,
            });

            if (videos.length === 0 && page > 1) {
                page -= 1;
                videos = await prisma.video.findMany({
                    where:   { img: { isNot: null } },
                    include: { img: true },
                    orderBy: { id: "desc" },
                    skip:    skip(page),
                    take:    VIDEOS_COUNT,
                });
            }

            const countItems = await prisma.video.count();
            const countPages = Math.ceil(countItems / VIDEOS_COUNT);
            const isLastPage = page === countPages;

            return res.status(200).json({
                data: videos.map(withPublicPaths),
                info: {
                    currentPage: page,
                    countPages,
                    countItems,
                    isLastPage,
                    itemsOnCurrentPage: isLastPage
                        ? countItems - VIDEOS_COUNT * (countPages - 1)
                        : VIDEOS_COUNT,
                },
            });
        } catch (e) {
            console.error(e);
            res.status(500).json(e?.message);
        }
    };
}

export default new Controller();
