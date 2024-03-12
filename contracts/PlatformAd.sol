// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

/*
1. Every is a unique contract 
2. 
*/
contract PlatformAdV2 {
    address private platform;
    address private advertiser;

    mapping(address => uint256) private viewAdCount;

    event AdViewed(
        address indexed user,
        uint256 adAmountToPlatform,
        uint256 adAmountToViewer
    );
    event EtherReceived(address indexed user, uint256 amount);

    constructor(address _advertiser, address _platform) {
        // Assign platform
        platform = _platform;
        advertiser = _advertiser;
    }

    function viewAd() public payable {
        require(msg.sender != advertiser, "Advertisers cannot view ads.");
        require(msg.sender != platform, "Platform cannot view the ads");
        // require(userOptedIn[msg.sender], "User has not opted in to view ads.");

        // TODO check if publisher exists

        // Perform logic for calculating the ad reward amount
        uint256 adAmountToPlatform = 10000 gwei; // Replace with your desired ad reward amount
        uint256 adAmountToViewer = 10000 gwei; // Replace with your desired ad reward amount

        // Once user views the ad: advertiser shall pay amount to publisher and platform
        (bool successPlatform, ) = payable(platform).call{
            value: adAmountToPlatform
        }("");
        require(successPlatform, "Platform payment failed");

        (bool successViewer, ) = payable(msg.sender).call{
            value: adAmountToViewer
        }("");
        require(successViewer, "Viewer payment failed");

        viewAdCount[msg.sender] += 1;
        emit AdViewed(msg.sender, adAmountToPlatform, adAmountToViewer);
    }

    function adTopUp() public payable {
        // Pay to platfrom address
        payable(platform).transfer(msg.value);
    }

    function viewCount(address user) public view returns (uint256) {
        return viewAdCount[user];
    }

    // Fallback function to accept Ether
    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }
}
