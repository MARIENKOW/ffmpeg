import { makeAutoObservable } from "mobx";
import adminService from "../services/AdminService";

class Admin {
   isAuth = null;
   token = null;
   admin = {};
   isLoading = true;
   constructor() {
      makeAutoObservable(this);
   }
   setAuth(value) {
      this.isAuth = value;
   }
   setAdmin(value) {
      this.admin = value;
   }
   setUnauthorized = () => {
      this.setAdmin({});
      this.setAuth(false);
      this.setToken(null);
      // localStorage.removeItem("accessTokenAdmin");
   };
   setIsLoading = (value) => {
      this.isLoading = value;
   };
   setToken = (value) => {
      this.token = value;
   };

   signInAdmin = async (value) => {
      const { data } = await adminService.signIn(value);
      this.setAuth(true);
      this.setAdmin(data.admin);
      this.setToken(data.accessTokenAdmin);
      console.log(data);
      localStorage.setItem("accessTokenAdmin", this.token);
   };
   logOut = async () => {
      try {
         await adminService.logOut();
      } finally {
         this.setUnauthorized();
      }
   };
   aboutAdmin = async () => {
      try {
         this.setIsLoading(true);
         const accessToken = localStorage.getItem("accessTokenAdmin");
         if (!accessToken) throw { response: { status: 401 } };
         const { data } = await adminService.aboutAdmin();
         this.setAdmin(data);
         this.setAuth(true);
         this.setToken(accessToken);
         this.setIsLoading(false);
      } catch (e) {
         console.log(e);
         if (e?.response?.status === 401) {
            this.setUnauthorized();
            return this.setIsLoading(false);
         }
         setTimeout(this.aboutAdmin, 5000);
      }
   };
}

export default Admin;
