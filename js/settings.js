var Settings = (function () 
{
    
    function Settings() 
    {
    	// constructor        
        this.DEFAULT_IP = "127.0.0.1";
        this.DEFAULT_PORT = "43110";

		this.ipTextField = document.getElementById("js-ip_tf");
		this.ipTextField.placeholder = this.DEFAULT_IP;

		this.portTextField = document.getElementById("js-port_tf");
		this.portTextField.placeholder = this.DEFAULT_PORT;

		// map binds
		this.onSaveButtonClick = this.onSaveButtonClick.bind(this);
		this.onClearButtonClick = this.onClearButtonClick.bind(this);
		this.updateCurrentValues = this.updateCurrentValues.bind(this);

		this.updateCurrentValues();

		// to clear local storage - useful for dev
		//chrome.storage.local.clear();

        var saveButton = document.getElementById("js-save_btn");
        saveButton.addEventListener("click", this.onSaveButtonClick);

        var clearButton = document.getElementById("js-clear_btn");
        clearButton.addEventListener("click", this.onClearButtonClick);
    }

    Settings.prototype.onSaveButtonClick = function(event)
    {
    	var zeroHostData = this.ipTextField.value.trim() === "" ? this.DEFAULT_IP : this.ipTextField.value;
    	zeroHostData += ":" + (this.portTextField.value.trim() === "" ? this.DEFAULT_PORT : this.portTextField.value);

    	chrome.storage.local.set({ "zeroHostData" : zeroHostData }, function()
        {
        	alert("Saved!");            
        });
    	
    };

    Settings.prototype.onClearButtonClick = function(event)
    {
    	this.ipTextField.value = "";
	    this.portTextField.value = "";
    };

    Settings.prototype.updateCurrentValues = function()
    {
    	var thisObject = this;
    	chrome.storage.local.get(function(item)
	    {
	        console.log(item.zeroHostData);        
	        if(item && item.zeroHostData !== undefined)
	        {
	        	var data = item.zeroHostData.split(':');
	        	thisObject.ipTextField.value = data[0];
	        	thisObject.portTextField.value = data[1];
	        }
	        
	    });
    };

    
    return Settings;
})();

window.addEventListener("load", onLoadComplete);

function onLoadComplete(event)
{
	//alert("done");
	new Settings();
}
