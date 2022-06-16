// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "erc721a/contracts/ERC721A.sol"; // npm install erc721a
// import "./ERC721A";  // cope code to project


contract Wall_721A is Ownable,ERC721A,ReentrancyGuard {

    uint256  MAX_MINT_PER_AMOUNT; 
    uint256  MAX_TOTALSUPPLY_AMOUNT;
    mapping(address => uint256) minedPerAddress;    //  address minted amount
    mapping(address => uint256) whitelistAndSlots;
    string private baseURI;
    bytes32 public merkleRoot;  // whitelist merkle root

    constructor(
        uint256 _max_mint_per_amount,
        uint256 _max_totalsupply_amount
    ) ERC721A("Wall_721A", "WALL721A") {    // 721A must override constructor
        MAX_MINT_PER_AMOUNT = _max_mint_per_amount;
        MAX_TOTALSUPPLY_AMOUNT = _max_totalsupply_amount;
    }

    //set baseURI
    function setBaseURI(string memory _baseUri) external onlyOwner{
        baseURI = _baseUri;
    }

    //get baseURI
    function getBaseURI() public view returns(string memory){
        return baseURI;
    }

    // set whitelist merkle root hash
    function setMerkleRoot(bytes32 _merkleroot) external onlyOwner{
        merkleRoot = _merkleroot;
    }

    // set whitelist merkle root hash
    function merkleVerify(bytes32[] memory _proof, bytes32  _leaf) public view returns(bool){
        return MerkleProof.verify(_proof,merkleRoot,_leaf);
    }

    //get whitelist merkle root hash
    function getMerkleRoot() public view returns(bytes32){
        return merkleRoot;
    }

    // set allow whitelist address and mint amount
    function setWhitelist(address[] memory addresses, uint256[] memory numSlots) external onlyOwner{
        require(addresses.length == numSlots.length, "list not match");
        for(uint256 i = 0; i < addresses.length; i++){
            whitelistAndSlots[addresses[i]] = numSlots[i];
        }
    }


    function whitelistSaleMint(uint256 quantity,bytes32[] calldata _merkleProof) external payable nonReentrant {
        require(merkleVerify(_merkleProof, keccak256(abi.encodePacked(msg.sender))));   // is whitelist 
        require(minedPerAddress[msg.sender] + quantity <= MAX_MINT_PER_AMOUNT); //  allow whitelist mint amount
        require(totalSupply() + quantity <= MAX_TOTALSUPPLY_AMOUNT,"not enough mint amount!");  //  mint amount less then supply amount
        _safeMint(msg.sender, quantity);
        minedPerAddress[msg.sender] += quantity;
    }


    function publicSaleMint(uint256 quantity) external payable nonReentrant {
        require(minedPerAddress[msg.sender] + quantity <= MAX_MINT_PER_AMOUNT); //  allow whitelist mint amount
        require(totalSupply() + quantity <= MAX_TOTALSUPPLY_AMOUNT,"not enough mint amount!");  //  mint amount less then supply amount
        _safeMint(msg.sender, quantity);
        minedPerAddress[msg.sender] += quantity;
    }

}