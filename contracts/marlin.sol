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
        uint256 exists; // lets us know if it exists
        uint256 spent;
        uint256 numLiveUrls;
        Url[] urls; // list of urls added by publisher
    }

    struct Peer {
        string name; // used only for display purposes
        uint256 creationTimestamp; // block timestamp of when createPeer called
        uint256 balance; // LIN balance for this peer
        uint256 numUrls; // total number of urls peer is serving, also the size of `urls` array
        uint256 exists; // lets us know if it exists
        Url[] urls; // list of urls added by publisher
    }

    mapping (address => Publisher) private publishers;
    mapping (address => Peer) private peers;
    
    constructor() public {
        createPublisher(msg.sender, "marlin-admin", "admin@marlin.pro");
        publishers[msg.sender].balance = 2000000;
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
        p.exists = 1;
        p.numLiveUrls = 0;
        p.spent = 0;
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
        return publishers[_addr].balance - publishers[_addr].spent;
    }
    function getSpent(address _addr) public view returns (uint256) {
        require(_addr == msg.sender);
        return publishers[_addr].spent;
    }
    function getLiveUrls(address _addr) public view returns (uint256) {
        require(_addr == msg.sender);
        return publishers[_addr].numLiveUrls;
    }
    function getAllUrls(address _addr) public view returns (uint256) {
        require(_addr == msg.sender);
        return publishers[_addr].numUrls;
    }
    function getPeers(address _addr) public view returns (string) {
        return "18.197.186.218,52.76.53.156,18.196.2.34/x,52.44.34.102,18.196.2.34,13.250.127.173,34.226.154.34,54.93.201.218,52.221.185.33,54.208.29.125";
    }

    function addUrl(string url) public returns (bool success) {
        publishers[msg.sender].urls.push(Url({
            creationTimestamp: block.timestamp,
            active: true,
            url: url,
            replication: 0,
            volume: 0
        }));
        publishers[msg.sender].numUrls+=1;
        publishers[msg.sender].numLiveUrls+=1; //add a remove url function
        success = true;
    }
    function spend(address _addr, uint256 spent) public returns (bool success) {
        require(_addr == msg.sender);
        publishers[_addr].balance -= spent;
        publishers[_addr].spent += spent;
        return success;
    }
    function getPublisher(address _addr) public returns (bool exists) {
        if (publishers[_addr].exists != 1) {
            exists = false;
        } else exists = true;
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
