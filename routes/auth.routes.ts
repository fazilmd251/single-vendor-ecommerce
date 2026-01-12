import express from "express";
import Endpoints from "../api/Endpoints";
import { userRegistration } from "../controllers/auth/authController";

const route = express.Router();

route.post('/register-user',userRegistration);

export default route;