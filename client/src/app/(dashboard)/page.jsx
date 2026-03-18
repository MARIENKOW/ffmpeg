"use client";

import { useEffect, useRef, useState } from "react";
import {
    useQuery,
    keepPreviousData,
    useQueryClient,
} from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
    Box,
    Typography,
    Stack,
    LinearProgress,
    CircularProgress,
    Divider,
    Grid,
    Button,
} from "@mui/material";
import VideoService from "../../services/VideoService";
import Pagination from "../../components/Pagination";
import { VideoControll } from "../../components/video/VideoControll";
import ErrorElement from "../../components/ErrorElement";
import { Empty } from "../../components/Empty";
import { ContainerComponent } from "../../components/wrappers/ContainerComponent";
import {
    UploadTriggerButton,
    UploadDrawer,
    useVideoUpload,
} from "../../components/video/upload";

const video = new VideoService();

export default function Page() {
    const popupRef = useRef();
    const [page, setPage] = useState(1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const queryClient = useQueryClient();
    const [loadingDeleteAll, setLoadingDeleteAll] = useState(false);

    const {
        uploads,
        processFiles,
        removeUpload,
        clearUploads,
        cancelUpload,
        cancelAll,
    } = useVideoUpload();

    const { data, isPending, refetch, isError, isFetching } = useQuery({
        queryKey: ["videos", page],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const { data } = await video.getAll(page);
            return data;
        },
    });

    useEffect(() => {
        popupRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, [page]);

    const handleDeleteAll = async () => {
        if (!confirm("Удалить все видео?")) return;
        try {
            setLoadingDeleteAll(true);
            await video.deleteAll();
            queryClient.invalidateQueries({ queryKey: ["videos", 1] });
            enqueueSnackbar("Все видео удалены", { variant: "success" });
        } catch {
            enqueueSnackbar("Упс! что-то пошло не так", { variant: "error" });
        } finally {
            setLoadingDeleteAll(false);
        }
    };

    return (
        <ContainerComponent>
            <Box
                display="flex"
                flexDirection="column"
                flex={1}
                height="100%"
                gap={2}
            >
                {/* Top bar */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    flexShrink={0}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            color="text.primary"
                        >
                            Видеотека
                            {data?.info?.countItems
                                ? ` (${data.info.countItems})`
                                : ""}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {data?.info?.countPages > 0
                                ? `стр. ${data.info.currentPage} из ${data.info.countPages}`
                                : "нет видео"}
                        </Typography>
                    </Box>

                    <Stack direction="row" gap={1} alignItems="center">
                        {data?.info?.countItems ? (
                            <Button
                                variant="outlined"
                                color="error"
                                loading={loadingDeleteAll}
                                onClick={handleDeleteAll}
                            >
                                Удалить все
                            </Button>
                        ) : (
                            ""
                        )}

                        <UploadTriggerButton
                            uploads={uploads}
                            onClick={() => setDrawerOpen(true)}
                        />
                    </Stack>
                </Stack>

                <Divider flexItem />

                {/* Video library */}
                <Box
                    ref={popupRef}
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    sx={{ overflowY: "auto", position: "relative" }}
                >
                    {isFetching && (
                        <LinearProgress
                            color="primary"
                            sx={{
                                height: 2,
                                borderRadius: 99,
                                mb: 1.5,
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 99,
                                },
                            }}
                        />
                    )}

                    {isPending ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height={200}
                        >
                            <CircularProgress color="primary" size={28} />
                        </Box>
                    ) : isError ? (
                        <ErrorElement />
                    ) : data?.data?.length >= 1 ? (
                        <>
                            <Box display="flex" flexDirection="column" flex={1}>
                                <Grid
                                    container
                                    spacing={1.5}
                                    columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                                >
                                    {data.data.map((e) => (
                                        <Grid size={1} key={e.id}>
                                            <VideoControll
                                                refetch={refetch}
                                                e={e}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                            <Box mt={2}>
                                <Pagination
                                    color="primary"
                                    pageCount={data.info.countPages}
                                    currentPage={data.info.currentPage}
                                    getData={setPage}
                                />
                            </Box>
                        </>
                    ) : (
                        <Empty />
                    )}
                </Box>
            </Box>

            <UploadDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                uploads={uploads}
                onFiles={processFiles}
                onRemove={removeUpload}
                onCancel={cancelUpload}
                onCancelAll={cancelAll}
                onClear={clearUploads}
            />
        </ContainerComponent>
    );
}
