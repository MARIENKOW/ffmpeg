import token from "../services/token-service.js";

const authAdminMiddleware = (req, res, next) => {
   try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) return res.status(401).json("not authorized");

      const accessToken = authorizationHeader.split(" ")[1];

      if (!accessToken) return res.status(401).json("not authorized");

      const adminData = token.validateAccessToken(accessToken);

      if (!adminData) return res.status(401).json("not authorized");

      if (adminData.role !== "admin")
         return res.status(401).json("not authorized");

      req.admin = adminData;
      next();
   } catch (e) {
      console.log(e);
      return res.status(500).json("some Error in middleware");
   }
};

export default authAdminMiddleware;
