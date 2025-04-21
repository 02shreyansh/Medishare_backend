import expressApp from "./expressApp"
import { logger } from "./utils";
import { Connect } from "./config/connect";
const PORT=Connect.PORT || 5000;
export const StartServer=async()=>{
    expressApp.listen(PORT,()=>{
        logger.info(`Server is running to PORT:${PORT}`);
    });
    process.on("uncaughtException",async(err)=>{
        logger.error(err);
        process.exit(1); 
    });
}
StartServer().then(()=>{
    logger.info("Server is up");
})
