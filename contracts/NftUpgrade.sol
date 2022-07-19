// SPDX-License-Identifier: MIT
// ERC721 upgrade contract
// Creator: zlh

pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


contract NftUpgrade is Initializable, ContextUpgradeable, OwnableUpgradeable,ERC721Upgradeable, ERC721EnumerableUpgradeable {
    using AddressUpgradeable for address;
    uint256 public MAX_AMOUT;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // function initialize() initializer public {
    //     __Ownable_init();   // can use modifier "onlyOwner"
    //     __Context_init();   // can use _msgSender
    //     // storehouse = msg.sender;
    // }
    
    function initialize(string memory _name, string memory _symbol, uint256 _amount) initializer public {
        __ERC721_init(_name, _symbol);
        __ERC721Enumerable_init();
        __Ownable_init();   // can use modifier "onlyOwner"
        __Context_init();   // can use _msgSender
        MAX_AMOUT = _amount;
        // storehouse = msg.sender;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}