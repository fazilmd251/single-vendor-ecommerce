import express from "express";
import Endpoints from "../api/Endpoints";
import { userRegistration, verifyUser } from "../controllers/auth/authController";

const route = express.Router();

route.post(Endpoints.REG_USER, userRegistration);
route.post(Endpoints.VERIFY_USER, verifyUser);

export default route;