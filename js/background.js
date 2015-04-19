/**
 * Background script for ZeroNet
 * @author Karthikeyan VJ
 */

function onBeforeRequest(details)
{
	var currentURLRequest = document.createElement('a');
	currentURLRequest.href = details.url;

	//console.log("hostname " + currentURLRequest.hostname +", protocol " + currentURLRequest.protocol, "url " + currentURLRequest.href);

	var isZeroTLD = false;
	var isZeroHost = false;

	// tld
	for(var i = 0; i < ZERO_ACCEPTED_TLDS.length; i++)
	{
		var currentTLD = currentURLRequest.hostname.slice(-ZERO_ACCEPTED_TLDS[i].length);
		if(currentTLD == ZERO_ACCEPTED_TLDS[i])
		{
			isZeroTLD =  true;
			break;
		}
	}

	// host
	var currentHost = currentURLRequest.host.toLowerCase();
	for(i = 0; i < ZERO_ACCEPTED_HOSTS.length; i++)
	{
		if(currentHost == ZERO_ACCEPTED_HOSTS[i])
		{
			isZeroHost =  true;
			break;
		}
	}


	if(isZeroTLD == false && isZeroHost == false)
	{
		// not a zeroNet TLD or Host, return immediately
		return;
	}


	//console.log("on before request! ", details);	
	//console.log("hostname " + currentURLRequest.hostname +", protocol " + currentURLRequest.protocol, "url " + currentURLRequest.href);
	
	// get data from local storage
	chrome.storage.local.get(function(item)
    {
        //console.log(item);
        handleProxy(item.zeroHostData);
    });

 	
 		
}

function handleProxy(zeroHostData) 
{
	//console.log("handle proxy " + zeroHostData);
	zeroHostData = zeroHostData || DEFAULT__ZERO_HOST_DATA;

	var config = getPacConfig(zeroHostData);


	chrome.proxy.settings.set(
		{
			value: config,
			scope: "regular"
		},
		function() {
			//console.log("proxy set done!");
		}
	);

}


function getPacConfig(zeroHostData)
{
	//console.log("getPacConfig " + zeroHostData);
	var pacConfigWithLocalHost = {
		mode: "pac_script",
		pacScript: {
			data: "function FindProxyForURL(url, host) {\n" +
			"  if (shExpMatch(host, '*.bit') || shExpMatch(host, '*.zero') || host == 'zero' || shExpMatch(url, '*127.0.0.1:43110*') || shExpMatch(url, '*localhost:43110*'))\n" +
			"    return 'PROXY " + zeroHostData + "';\n" +
			"  return 'DIRECT';\n" +
			"}"
		}

	};

	var pacConfig = {
		mode: "pac_script",
		pacScript: {
			data: "function FindProxyForURL(url, host) {\n" +
			"  if (shExpMatch(host, '*.bit') || shExpMatch(host, '*.zero') || host == 'zero')\n" +
			"    return 'PROXY " + zeroHostData + "';\n" +
			"  return 'DIRECT';\n" +
			"}"
		}

	};

	if(zeroHostData != DEFAULT__ZERO_HOST_DATA)
	{
		// user is running ZeroNet in remote machine
		// we can proxy 127.0.0.1:43110 and localhost:43110 to go through remote machine
		return pacConfigWithLocalHost;
	}

	// user is ZeroNet running in his/her current machine, so we can't proxy 127.0.0.1:43110 connections
	// will end in infinite loop.
	return pacConfig;
}

var ZERO_ACCEPTED_TLDS = [".zero", ".bit"]; // if you modify this also change pacScript (sorry)
var ZERO_ACCEPTED_HOSTS = ["zero", "127.0.0.1:43110", "localhost:43110"]; // if you modify this also change pacScript (sorry)

var DEFAULT__ZERO_HOST_DATA = "127.0.0.1:43110";

var filter = { urls: ["<all_urls>"] };
var opt_extraInfoSpec = ["blocking"];

chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, filter, opt_extraInfoSpec);

// to clear proxy
// remove and add the extension again

// proxy error listener
chrome.proxy.onProxyError.addListener(function(details){
	console.log(details);
});