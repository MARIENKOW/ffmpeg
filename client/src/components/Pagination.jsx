"use client";

import { Pagination, LinearProgress, Box } from "@mui/material";
import { useState } from "react";

const StyledPagination = ({ pageCount, currentPage, getData,color }) => {
   const [paginationIsLoader, setPaginationIsLoader] = useState(false); //! состояние загрузки всегда выше      нужно поменять

   const handlePaginationChange = (event, page) => {
    console.log(page);
      if(page == currentPage) return
      setPaginationIsLoader(true);
      const showAllBlogs = async () => {
         await getData(page);
         setPaginationIsLoader(false);
      };
      showAllBlogs();
   };
   if (pageCount < 2) return null;

   return (
      <Box
         sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 1,
            position: "relative",
         }}
      >
         {paginationIsLoader && (
            <LinearProgress
               sx={{
                  minWidth: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
               }}
               color="primary"
            />
         )}
         <Pagination
            onChange={handlePaginationChange}
            siblingCount={1}
            boundaryCount={1}
            
            shape="rounded"
            variant="outlined"
            count={pageCount}
            size="medium"
            page={+currentPage}
            color={color || "secondary"}
         />
         {paginationIsLoader && (
            <LinearProgress
               sx={{
                  minWidth: "100%",
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
               }}
               color="primary"
            />
         )}
      </Box>
   );
};

export default StyledPagination;
