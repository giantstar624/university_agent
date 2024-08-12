import express, { Request, Response } from "express"
import * as selenium from "./selenium"
import fs from "fs"
import path from "path"
import cors from "cors"
import { exec } from "child_process"
import { getRDPStatus } from "./utils"

import os from 'os';
const networkInterfaces = os.networkInterfaces();

// Change 'en0' to your primary network interface name if needed
const interfaceName = 'Ethernet'; // Replace with the correct interface name

if (networkInterfaces[interfaceName]) {
  for (const net of networkInterfaces[interfaceName]!) {
    if (net.family === 'IPv4' && !net.internal) {
      console.log(`Primary IP Address: ${net.address}`);
      break;
    }
  }
} else {
  console.log(`No such interface: ${interfaceName}`);
}

const app = express();

let curUserId = "";

const staticDir = path.join(__dirname, "../static");
app.use(cors());
app.use(express.static(staticDir));

app.get("/launch", async (req: Request, res: Response) => {
  if (await selenium.isOpened()) {
    res.send({ success: false });
  }
  else {
    await selenium.run("https://umn.qualtrics.com/jfe/form/SV_1KTlsYSJk1UsWeq");
    curUserId = req.query.id as string;
    selenium.startScreenShot(curUserId);
    res.send({ success: true });
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
  const logUrl = `http://${process.env.EC2_IP}:8001/${id}/search_log.txt`;

  const dirPath = path.resolve(__dirname, "../static", id);
  const files = fs.readdirSync(dirPath);
  const pngFiles = files.filter(file => path.extname(file).toLowerCase() === ".png");
  const screenUrls = pngFiles.map(png => `http://${process.env.EC2_IP}:8001/${id}/${png}`);
  res.send({ logUrl, screenUrls });
});

app.get("/status", async (req: Request, res: Response) => {
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

