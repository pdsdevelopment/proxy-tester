const http = require('http');

const errors = [
    'Bad proxy string',
    'Proxy offline'
];

const formatProxies = (data, customHost, customTimeout) => {
    if(data)
    {
        var proxies = [];

        data.split("\n").forEach((proxy) => {

            var proxyData = {}; 

            if(proxy != '')
            {
                if(proxy.indexOf("@") + 1)
                {
                    proxyData.authentication = proxy.split('@')[0];
                    
                    const connectionData = proxy.split('@')[1];
        
                    if(connectionData.indexOf(":") + 1)
                    {
                        proxyData.host = connectionData.split(':')[0];
                        proxyData.port = connectionData.split(':')[1];
                    }
                }
                else if(proxy.indexOf(":") + 1)
                {
                    proxyData.host = proxy.split(':')[0];
                    proxyData.port = proxy.split(':')[1];
        
                    var proxyUsername = proxy.split(':')[2];
                    var proxyPassword = proxy.split(':')[3];
        
                    if(proxyUsername && proxyPassword && proxyUsername != '' && proxyPassword != '')
                    {
                        proxyData.authentication = proxyUsername + ":" + proxyPassword;
                    }
                }

                if(customHost)
                {
                    proxyData.customHost = customHost;
                }
                else
                {
                    proxyData.customHost = "www.google.com:443";
                }

                if(customTimeout)
                {
                    proxyData.timeout = customTimeout;
                }
                else
                {
                    proxyData.timeout = 5000;
                }
        
                proxies.push(proxyData);
            }
         })

        return proxies;
    }
    else
    {
        return false;
    }
 }


 const checkProxy = proxyData => {
    return new Promise((resolve) => {

        let proxy = {
            host: '',
            port: 0,
            proxyAuth: ''
        };

        proxy = proxyData;

        var start = "";
        var end = "";

        const proxy_options = {
            method: 'CONNECT',
            path: proxy.customHost,
            timeout: parseInt(proxy.timeout),
            agent: false
        };

        if (proxy.host) {
            proxy_options.host = proxy.host;
        }
        if (proxy.port) {
            proxy_options.port = proxy.port;
        }
        if (proxy.authentication) {
            proxy_options.headers = {
                'Proxy-Authorization': 'Basic ' + Buffer.from(proxy.authentication).toString('base64')
            };
        }

        var start = new Date().getTime();

        const request = http.request(proxy_options);

        request.on('connect', result => {
            request.destroy();

            if(result.statusCode === 200)
            {
                var end = new Date().getTime();

                let resultData = {
                    host: proxy.host,
                    port: proxy.port,
                    proxyAuth: proxy.authentication,
                    result: true,
                    responseTime: (end - start),
                }

                return resolve(resultData);
            } else {

                var end = new Date().getTime();

                let resultData = {
                    host: proxy.host,
                    port: proxy.port,
                    proxyAuth: proxy.authentication,
                    result: false,
                    responseTime: (end - start),
                }

                return resolve(resultData);
            }
        })

        request.on('timeout', () => {
            request.destroy();

            var end = new Date().getTime();

            let resultData = {
                host: proxy.host,
                port: proxy.port,
                proxyAuth: proxy.authentication,
                result: false,
                responseTime: (end - start),
            }

            return resolve(resultData);
        });

        request.on("error", error => {
            request.destroy();
            
            var end = new Date().getTime();

            let resultData = {
                host: proxy.host,
                port: proxy.port,
                proxyAuth: proxy.authentication,
                result: false,
                responseTime: (end - start),
            }

            return resolve(resultData);
        })

        request.end();
       
    });
}

module.exports = {checkProxy, formatProxies};