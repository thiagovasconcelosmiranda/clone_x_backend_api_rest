import  express, { urlencoded }  from "express";
import cors from "cors";
import helmet from "helmet";
import { mainRouter } from "./routers/main";
import fileUpload from "express-fileupload";

const server = express();
server.use(fileUpload());
server.use(helmet());
server.use(cors());
server.use(urlencoded({extended: true}));
server.use(express.json());
server.use(mainRouter);
server.use(express.static('public'));

server.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor rodando em ${process.env.BASE_URL}`);
});
