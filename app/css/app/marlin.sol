// abstract idea for the contract
contract Marlin {

	struct UrlStats {
		uint256 replication; // number of peers serving this url
		uint256 volume; // total volume of traffic (in bytes) served
	}

	struct Url {
		uint256 creationTimestamp; // set once when add_url is called
		bool active; // true if the url is currently being served
		string url; // weblink to the content
		UrlStats stats; // vital stats for this url
	}

	struct Publisher {
		string name; // used only for display purposes
		string email; // used only for display purposes
		uint256 creationTimestamp; // block timestamp of when createPublisher called
		Url[] urls; // list of urls added by publisher
	}

	mapping (address => Publisher) private publishers;
	
	constructor() public {

	}

	function createPublisher(
		address _addr, string _name, string _email) public returns (bool) {
		Publisher memory p = Publisher({
			name: _name,
			email: _email, 
			creationTimestamp: block.timestamp,
			urls: new Url[](0)
		});
		publishers[_addr] = p;
		return true;
	}
}
