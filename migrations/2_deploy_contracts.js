const Bookings = artifacts.require("./Bookings.sol");

module.exports = function (deployer) {
  deployer.deploy(Bookings);
};
