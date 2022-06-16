//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract Wall is ERC721Enumerable,Ownable,ReentrancyGuard{

    string private baseURI;
    // address private operator;

    uint256 private currentTokenId = 0; //token id
    uint256 immutable public MAX_AMOUT; //max mint amout
    bytes32 public merkleRoot;  // whitelist merkle root

    // sale state
    enum SaleState{
        alphaSale,
        betaSale,
        publicSale

        
    }

    SaleState public currentSaleState;  // current sale state : alphaSale,betaSale,publicSale

    //construct
    constructor(string memory name,
        string memory symbol,
        uint256 amout
    ) ERC721(name,symbol){
        MAX_AMOUT = amout;

    }

    // only address not contract caller
    modifier callerIsUser(){
        require(tx.origin == msg.sender,"The caller is contract!");
        _;
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

    // set sale state
    function setSaleState(SaleState _state) external onlyOwner{
        require(currentSaleState != _state, "current state already begun!");
        currentSaleState = _state;
    }

    // alpha mint
    function alphaMint(uint256 num, bytes32[] calldata merkleProof) external payable callerIsUser nonReentrant{
        console.log("address:%s",msg.sender);
        require(currentSaleState == SaleState.alphaSale,"Alpha mint is not current!");
        require(num > 0,"Must mint at least one!");
        require(num + currentTokenId < MAX_AMOUT,"Must mint at least one!");
        require(MerkleProof.verify(merkleProof,merkleRoot,keccak256(abi.encodePacked(msg.sender))),"Sender address is not in whitelist!");

        for(uint256 i; i < num; i++){
            _safeMint(msg.sender,currentTokenId++);
        }
        
    }

    // beta mint
    function betaMint(uint256 num, bytes32[] calldata merkleProof) external payable callerIsUser nonReentrant{
        require(currentSaleState == SaleState.betaSale,"Alpha mint is not current!");
        require(num > 0,"Must mint at least one!");
        require(num + currentTokenId < MAX_AMOUT,"Must mint at least one!");
        require(MerkleProof.verify(merkleProof,merkleRoot,keccak256(abi.encodePacked(msg.sender))),"Sender address is not in whitelist!");

        for(uint256 i; i < num; i++){
            _safeMint(msg.sender,currentTokenId++);
        }
        
    }
}
