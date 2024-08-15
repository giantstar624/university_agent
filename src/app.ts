import express, { Request, Response } from "express"
import * as selenium from "./selenium"
import fs from "fs"
import path from "path"
import cors from "cors"
import { exec } from "child_process"
import axios from 'axios';
import { getRDPStatus } from "./utils"
const METADATA_URL = 'http://169.254.169.254/latest/meta-data';
const TOKEN_URL = 'http://169.254.169.254/latest/api/token';

// Function to get the metadata service token
async function getToken(): Promise<string> {
  try {
    const response = await axios.put(TOKEN_URL, null, {
      headers: {
        'X-aws-ec2-metadata-token-ttl-seconds': '21600'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching metadata token:', error);
    throw error;
  }
}

// Function to get metadata using the token
async function getMetadata(path: string, token: string): Promise<string> {
  try {
    const response = await axios.get(`${METADATA_URL}/${path}`, {
      headers: {
        'X-aws-ec2-metadata-token': token
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching metadata from path ${path}:`, error);
    throw error;
  }
}

// Main function to get IP addresses
async function getIpAddresses() {
  try {
    // Fetch the token
    const token = await getToken();

    // Fetch the public and private IP addresses
    return await getMetadata('public-ipv4', token);
  } catch (error) {
    console.error('Error retrieving IP addresses:', error);
    return "";
  }
}
getIpAddresses().then((myIP) => {
  console.log(`my address is ${myIP}`)

  const app = express();

  let curUserId = "";

  const staticDir = path.join(__dirname, "../static");
  app.use(cors());
  app.use(express.static(staticDir));

  app.get("/launch", async (req: Request, res: Response) => {
    try {
      if (await selenium.isOpened())
        await selenium.exit();
      await selenium.run("https://umn.qualtrics.com/jfe/form/SV_1KTlsYSJk1UsWeq");
      curUserId = req.query.id as string;
      selenium.startScreenShot(curUserId);
      res.send({ success: true });
    } catch (error) {
      console.error('Error fetching metadata token:', error);
    }
  });


  app.get("/searchlog", async (req: Request, res: Response) => {
    const { type, text } = req.query;
    const logText = `Searched ${text} on ${type} \n`;
    const dir = path.resolve(__dirname, "../static", curUserId);
    await fs.promises.mkdir(dir, { recursive: true });
    fs.appendFile(path.resolve(dir, "search_log.txt"), logText, (err) => {
      if (err) console.error("Error during editing search log file");
    });
    res.send("ok");
  });

  app.get("/ids", (req: Request, res: Response) => {
    const dirPath = path.resolve(__dirname, "../static");
    const dirs = fs.readdirSync(dirPath);
    res.send(dirs);
  })

  app.get("/logs", (req: Request, res: Response) => {
    const id = req.query.id as string;
    const logUrl = `http://${myIP}:8001/${id}/search_log.txt`;

    const dirPath = path.resolve(__dirname, "../static", id);
    const files = fs.readdirSync(dirPath);
    const pngFiles = files.filter(file => path.extname(file).toLowerCase() === ".png");
    const screenUrls = pngFiles.map(png => `http://${myIP}:8001/${id}/${png}`);
    res.send({ logUrl, screenUrls });
  });

  app.get("/status", async (req: Request, res: Response) => {
    // res.send({ status: await selenium.isOpened() });
    const status = await getRDPStatus();
    console.log(status);
    res.send(status);
  })

  app.get("/logoff", (req: Request, res: Response) => {
    exec("logoff rdp-tcp");
    selenium.exit();
    res.send("Awesome");
  })

  app.listen(8001, () => {
    console.log("server running on port 8001");
  });
}).catch((err) => console.error(err))