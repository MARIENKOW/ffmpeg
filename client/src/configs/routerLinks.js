export const MAIN_ROUTE = (token) => "/" + token;
export const BLOG_ROUTE = (token) => MAIN_ROUTE(token) + "";
export const SHORT_ROUTE = (token) => MAIN_ROUTE(token) + "/short";
export const NEWS_ROUTE = (token) => MAIN_ROUTE(token) + "/news";

export const ADMIN_ROUTE = "/";
export const ADMIN_ACCESS_ROUTE = ADMIN_ROUTE + "/access";
export const ADMIN_BLOG_ROUTE = ADMIN_ROUTE + "/blog";
export const ADMIN_BLOG_CREATE_ROUTE = ADMIN_BLOG_ROUTE + "/create";
export const ADMIN_BLOG_UPDATE_ROUTE = ADMIN_BLOG_ROUTE + "/update";
