import express from "express";
import Endpoints from "../api/Endpoints";
import { userRegistration } from "../controllers/auth/authController";

const route = express.Router();

route.post(Endpoints.REG_USER,userRegistration);

export default route;