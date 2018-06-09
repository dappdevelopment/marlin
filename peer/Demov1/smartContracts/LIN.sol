pragma solidity ^0.4.24;

import 'SafeMath.sol';
import 'ERC20.sol';

contract LIN is ERC20 {
    using SafeMath for uint;

    string internal _name;
    string internal _symbol;
    uint8 internal _decimals;
    uint256 internal _totalSupply;

    mapping (address => uint256) internal balances;
    mapping (address => mapping (address => uint256)) internal allowed;

    constructor() public {
        _symbol = "LIN";
        _name = "Marlin Protocol Token";
        _decimals = 18;
        _totalSupply = 100000000000000000000000000;
        balances[msg.sender] = _totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);
        balances[msg.sender] = SafeMath.sub(balances[msg.sender], _value);
        balances[_to] = SafeMath.add(balances[_to], _value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);

     balances[_from] = SafeMath.sub(balances[_from], _value);
     balances[_to] = SafeMath.add(balances[_to], _value);
     allowed[_from][msg.sender] = SafeMath.sub(allowed[_from][msg.sender], _value);
     emit Transfer(_from, _to, _value);
     return true;
   }

   function approve(address _spender, uint256 _value) public returns (bool) {
     allowed[msg.sender][_spender] = _value;
     emit Approval(msg.sender, _spender, _value);
     return true;
   }

   function allowance(address _owner, address _spender) public view returns (uint256) {
     return allowed[_owner][_spender];
   }

   function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
     allowed[msg.sender][_spender] = SafeMath.add(allowed[msg.sender][_spender], _addedValue);
     emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
     return true;
   }

  function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
     uint oldValue = allowed[msg.sender][_spender];
     if (_subtractedValue > oldValue) {
       allowed[msg.sender][_spender] = 0;
     } else {
       allowed[msg.sender][_spender] = SafeMath.sub(oldValue, _subtractedValue);
    }
     emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
     return true;
   }
}
