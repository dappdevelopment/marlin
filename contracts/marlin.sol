pragma solidity ^0.4.23;

contract Marlin {

    uint256 totalSupply = 7.6e9;
    event BalanceChanged(address indexed _address, uint256 _balance);

    struct Url {
        uint256 creationTimestamp; // set once when addUrl is called
        bool active; // true if the url is currently being served
        string url; // weblink to the content
        uint256 replication; // number of peers serving this url
        uint256 volume; // total volume of traffic (in bytes) served
    }

    struct Publisher {
        string name; // used only for display purposes
        string email; // used only for display purposes
        uint256 creationTimestamp; // block timestamp of when createPublisher called
        uint256 balance; // LIN balance for this publisher
        uint256 numUrls; // total number of urls, also the size of `urls` array
        Url[] urls; // list of urls added by publisher
    }

    mapping (address => Publisher) private publishers;
    
    constructor() public {
        createPublisher(msg.sender, "marlin-admin", "admin@marlin.pro");
        publishers[msg.sender].balance = totalSupply;
    }
    
    function getPublisherInfo(address _addr) public returns (string name, string email) {
        name = publishers[_addr].name;
        email = publishers[_addr].email;
    }

    function createPublisher(
        address _addr, string _name, string _email) public returns (bool success) {
        Publisher storage p;
        p.name = _name;
        p.email = _email;
        p.creationTimestamp = block.timestamp;
        p.balance = 0;
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

    function getBalance(address _addr) public view returns (uint256) {
        require(_addr == msg.sender);
        return publishers[_addr].balance;
    }
    function getAllUrls(address _addr) public view returns (uint256) {
        require(_addr == msg.sender);
        return publishers[_addr].numUrls;
    }

    function addUrl(string url, address _addr) public returns (bool success) {
        publishers[msg.sender].urls.push(Url({
            creationTimestamp: block.timestamp,
            active: true,
            url: url,
            replication: 0,
            volume: 0
        }));
        publishers[_addr].urls.push(Url({
            creationTimestamp: block.timestamp,
            active: true,
            url: url,
            replication: 0,
            volume: 0
        }));
        publishers[_addr].numUrls+=1;
        publishers[msg.sender].numUrls+=1;
        success = true;
    }

    function getUrl(uint256 _index) public returns (
        uint256 _creationTimestamp,
        bool _active,
        string _url,
        uint256 _replication,
        uint256 _volume
    ) {
        require(_index < publishers[msg.sender].numUrls);
        Url memory u = publishers[msg.sender].urls[_index];
        _creationTimestamp = u.creationTimestamp;
        _active = u.active;
        _url = u.url;
        _replication = u.replication;
        _volume = u.volume;
    }
    
}
