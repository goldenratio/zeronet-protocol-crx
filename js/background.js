/**
 * Background script for ZeroNet
 * @author Karthikeyan VJ
 */

function onBeforeRequest(details)
{
		
	var currentURLRequest = document.createElement('a');
	currentURLRequest.href = details.url;

	// check for "zero" hostname
	var isZero = currentURLRequest.hostname.toLowerCase() == HOSTNAME;
	if(isZero == false)
	{
		// not a zeronet host, return immediately
		return;
	}

		
	//console.log("on before request! ", details);	
	//console.log("hostname " + currentURLRequest.hostname +", protocol " + currentURLRequest.protocol, "url " + currentURLRequest.href);
	
	// get data from local storage
	chrome.storage.local.get(function(item)
    {
        console.log(item);        
        handleProxy(item.zeroHostData);        
    });

 	
 		
}

function handleProxy(zeroHostData) 
{
	//console.log("handle proxy " + zeroHostData);
	zeroHostData = zeroHostData || DEFAULT_ZERO_HOSTDATA;

	var config = {
		mode: "pac_script",
		pacScript: {
			data: "function FindProxyForURL(url, host) {\n" +
                "  if (host == '" + HOSTNAME + "')\n" +
                "    return 'PROXY " + zeroHostData + "';\n" +
                "  return 'DIRECT';\n" +
                "}"
		}		

	};

	chrome.proxy.settings.set(
		{
			value: config, 
			scope: "regular"
		},
		function() {
			//console.log("done!");
		}
	);

}

var HOSTNAME = "zero";
var DEFAULT_ZERO_HOSTDATA = "127.0.0.1:43110";

//var filter = { urls: ["<all_urls>"] };
var filter = { urls: ["*://zero/*"] };
var opt_extraInfoSpec = ["blocking"];

chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, filter, opt_extraInfoSpec);