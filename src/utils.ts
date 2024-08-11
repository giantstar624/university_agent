import { exec } from "child_process"

export function getRDPStatus(): Promise<string> {
    return new Promise((resolve, reject) => {
      let username = "administrator";
      exec('quser', (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
        }
        if (stderr) {
          reject(`Stderr: ${stderr}`);
        }
        
        // Process the output to find the session name for the specific user
        const lines = stdout.trim().split('\n');
        let sessionName = null;
        username = ">" + username;
        
        for (const line of lines) {
          const columns = line.trim().split(/\s+/);
          if (columns.length >= 3) {
            const user = columns[0];
            const session = columns[1];
            
            // Check if this line contains the username we're interested in
            if (user.toLowerCase() === username.toLowerCase()) {
              sessionName = session;
              break;
            }
          }
        }
        
        if (sessionName) {
          if( sessionName.includes("rdp-tcp") )
            resolve("connected");
          else resolve( "disconnected" );
        } else {
          reject( `No session found for user: ${username}` );
        }
      });
    })
  }