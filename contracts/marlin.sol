// abstract idea for the contract
contract Marlin {

	uint256 totalSupply = 7.6e9;
	event BalanceChanged(address indexed _address, uint256 _balance);

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
		uint256 balance;
		Url[] urls; // list of urls added by publisher
	}

	mapping (address => Publisher) private publishers;
	
	constructor() public {
		createPublisher(msg.sender, "marlin-admin", "admin@marlin.pro");
		publishers[msg.sender].balance = totalSupply;
	}

	function createPublisher(
		address _addr, string _name, string _email) public returns (bool success) {
		Publisher memory p = Publisher({
			name: _name,
			email: _email, 
			creationTimestamp: block.timestamp,
			balance: 0,
			urls: new Url[](0)
		});
		publishers[_addr] = p;
		success = true;
	}

	function transfer(address _to, uint256 _value) public returns (bool success) {
		require(publishers[msg.sender].balance >= _value);
		publishers[msg.sender].balance -= _value;
        publishers[_to].balance += _value;
        emit BalanceChanged(msg.sender, publishers[msg.sender].balance);
        emit BalanceChanged(_to, publishers[_to].balance);
        success = true;
	}

	function getBalance(address _addr) public returns (uint256) {
		require(_addr == msg.sender);
		return publishers[_addr].balance;
	}
}
