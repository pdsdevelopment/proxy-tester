const path = require('path');

const fs = require("fs");
const proxyTester = require("./modules/proxy");


async function testProxies()
{
    const arguments = process.argv.slice(2);
    
    if(arguments.length > 2)
    {
        const inputFile = arguments[0];
        const outputFile = arguments[1];
        const customHost = arguments[2];
        const customTimeout = arguments[3];

        if(!inputFile)
        {
            console.error("Please enter a proxy list");
            return;
        }

        if(!outputFile)
        {
            console.error("Please enter an output file");
            return;
        }

        if (!fs.existsSync(inputFile)){
            console.error("Cannot read proxy list");
            return;
        }

        try 
        {
            fs.writeFileSync(outputFile, "");
        } 
        catch (error)
        {
            console.error("Unable to write to output file");
            return;
        }

        var proxyList = fs.readFileSync(inputFile, 'UTF8');

        if(!proxyList)
        {
            console.error("Proxy list is empty");
            return;
        }

        var proxyData = proxyTester.formatProxies(proxyList, customHost, customTimeout);

        if(!proxyData)
        {
            console.error("Proxy list is not formatted correctly");
            return;
        }

        for(var i = 0;i < proxyData.length;i++)
        {
            await proxyTester.checkProxy(proxyData[i]).then(result => {
                var authentication = "";

                if(result.proxyAuth)
                {
                    authentication = result.proxyAuth;
                }

                if(result.result == true)
                {
                    console.log("\x1b[32m","[GOOD] " + result.host + ":" + result.port + authentication + " Response Time : " + result.responseTime + " ms");  

                    fs.appendFile(outputFile, result.host + ":" + result.port + authentication + "\n", (err) => {
                        if (err) {
                            console.log("Unable to save proxy result to output file");
                            return;
                        }
                        
                    });
                }
                else
                {
                    console.log('\x1b[31m',"[BAD] " + result.host + ":" + result.port + authentication);
                }
            })
        }
    }
    else
    {
        console.log("Usage: node " + path.basename(__filename) + " [proxy-list-file] [output-file] [custom-check-host] [custom-timeout]")
    }

   

    


}

testProxies();