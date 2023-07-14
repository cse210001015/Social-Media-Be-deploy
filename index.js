import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import postRoutes from './routes/posts.js';
import { verifyToken } from "./middleware/auth.js";
import {users,posts} from "./data/index.js";
import User from "./models/User.js";
import Post from "./models/Post.js";


//Configrations
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
dotenv.config('../.env');

//MiddleWare
const app=express();
app.use(express.json({limit:"30mb",extended: true}));
app.use(express.urlencoded({limit:"30mb",extended:true}));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy:'cross-origin'}));
app.use(morgan("common"));
app.use(cors());
app.use("/assets",express.static(path.join(__dirname,'public/assets')));//Set where I store the Files/Images.

//File Storage
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/assets");
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
});
const upload=multer({storage});

//Routes that use file storage
app.post("/auth/register",upload.single("picture"),register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

//Routes
app.use("/auth",authRoutes);
app.use("/users",userRoutes);
app.use("/posts",postRoutes);

//Mongoose Setup
const PORT=process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(PORT,()=>{
    console.log(`Server Running on Port ${PORT}`);
  });
  //Add Data Once
  // User.insertMany(users);
  // Post.insertMany(posts);
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});