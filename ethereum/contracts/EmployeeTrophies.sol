// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.2/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts@5.0.2/access/Ownable.sol";

contract EmployeeTrophies is ERC1155, Ownable {
    // Company info
    string public companyName;
    string public companyDomain;
    uint256 public companyFoundingDate;

    constructor(
        address initialOwner, 
        string memory initialCompanyName, 
        string memory initialCompanyDomain,
        uint256 foundingDate
    ) ERC1155("https://circle-employee-anniversary-nft.vercel.app/nfts/{id}") Ownable(initialOwner) {
        companyName = initialCompanyName;
        companyDomain = initialCompanyDomain;
        companyFoundingDate = foundingDate;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }
}
