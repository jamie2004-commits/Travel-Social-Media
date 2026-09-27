const os=require('node:os');
const {createApp}=require('../server.cjs');
const port=8002;
const server=createApp({secure:false});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Phone testing is already running on port 8002. Close its window before restarting.':error.message);process.exitCode=1;});
server.listen(port,'0.0.0.0',()=>{
  console.log('\nRoam phone testing — connect your phone to the same Wi-Fi.\n');
  for(const [name,addresses] of Object.entries(os.networkInterfaces()))for(const address of addresses||[]){
    if(address.family==='IPv4'&&!address.internal&&!address.address.startsWith('169.254.'))console.log(`${name}: http://${address.address}:${port}/login`);
  }
  console.log('\nUsername: user123\nPassword: password\nKeep this window open and the laptop awake. Press Ctrl+C to stop.\nIf Windows asks, allow access on your private network only.');
});
