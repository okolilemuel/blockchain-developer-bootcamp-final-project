// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Contract for automated cat hotel room bookings
/// @author Lemuel Okoli
/// @notice Allows a user to book an available room for their cat
contract Bookings is Ownable {
    /// @notice Emitted when a room is booked
    /// @param room Room id
    /// @param guest Guest address
    event LogRoomBooked(uint256 indexed room, address indexed guest);

    /// @notice Emitted when a guest extends their booking
    /// @param room Property id
    /// @param guest Guest address
    /// @param addedDays Days added
    event LogRoomBookingExtended(
        uint256 indexed room,
        address indexed guest,
        uint256 indexed addedDays
    );

    modifier validRoomId(uint256 roomId) {
        require(roomId > 0, "Invalid booking id");
        _;
    }

    modifier validBookingDuration(uint256 bookingDuration) {
        require(bookingDuration > 0, "Booking duration must be 1 day at least");
        _;
    }

    modifier validBookingAmount(uint256 bookingDuration) {
        require(msg.value == (roomPrice * bookingDuration), "Room booking amount is invalid");
        _;
    }

    /// @dev The total number of rooms in the hotel
    uint256 public totalNumberOfRooms = 20;

    /// @dev The price of rooms
    uint256 private roomPrice = 0.075 ether;

    /// @dev The posible states of a romm at any given time
    enum State { Available, Booked }

    struct Room {
        uint256 id;
        uint256 price;
        State status;
        uint256 bookingDuration;
        uint256 bookingExpiration;
        address guest;
    }

    mapping  (uint256 => Room) private rooms;

    constructor() {
        _createRooms();
    }

    /// @notice Create a booking for a room
    /// @param roomId id of room to book
    /// @param bookingDuration duration of room booking
    function createBooking(
        uint256 roomId, uint256 bookingDuration
    ) public payable validRoomId(roomId) validBookingDuration(bookingDuration) validBookingAmount(bookingDuration) {
        roomId = roomId - 1;
        Room memory room = rooms[roomId];

        require(room.status == State.Available, "Room is already booked");

        uint256 bookingDurationInSeconds = bookingDuration  * 86400;

        room.status = State.Booked;
        room.guest = msg.sender;
        room.bookingDuration = bookingDuration;
        room.bookingExpiration = block.timestamp + bookingDurationInSeconds;
        rooms[roomId] = room;

        emit LogRoomBooked(roomId, msg.sender);
    }

    /// @notice Extend an existing booking
    /// @param roomId id of room to extend its booking
    /// @param addedBookingDuration extra days to add to booking duration
    function extendBooking(
        uint256 roomId, uint256 addedBookingDuration
    ) public payable validRoomId(roomId) validBookingDuration(addedBookingDuration) validBookingAmount(addedBookingDuration) {
        roomId = roomId - 1;
        Room memory room = rooms[roomId];

        // require(room, "Room does not exist");
        require(room.guest == msg.sender, "Room booking can only be extended by the guest");

        addedBookingDuration = addedBookingDuration  * 86400;

        room.bookingDuration = room.bookingDuration + addedBookingDuration;
        room.bookingExpiration = room.bookingExpiration + addedBookingDuration;
        rooms[roomId] = room;

        emit LogRoomBookingExtended(roomId, msg.sender, addedBookingDuration);
    }

    /// @notice Check if a room is available
    /// @param roomId id of room to check availability status
    function isRoomAvailable(uint256 roomId) public view returns (bool) {
        roomId = roomId - 1;
        require(roomId <= totalNumberOfRooms, "Invalid room id");

        Room memory room = rooms[roomId];

        if (room.bookingExpiration < block.timestamp )  {
            return true;
        } else {
            return false;
        }
    }

    /// @notice Get available rooms
    /// @return uint256[] array of available room ids
    function getAvailableRooms() public view returns (uint256 [20] memory) {
        uint256[20] memory availableRooms;
        for (uint256 i = 0; i < totalNumberOfRooms; i++) {
            if (rooms[i].bookingExpiration < block.timestamp) {
                availableRooms[i] = rooms[i].id;
            } else {
                availableRooms[i] = 0;
            }
        }
        return availableRooms;
    }

    /// @notice Get price of room in the cat hotel
    /// @return uint256 price of a room
    function getRoomPrice() public view returns (uint256) {
        return roomPrice;
    }

    /// @notice Set price of room in the cat hotel
    function setRoomPrice(uint256 price) public onlyOwner {
        roomPrice = price;
    }

    /// @notice Create rooms on contract deployment
    function _createRooms() private {
        for (uint256 i = 0; i < totalNumberOfRooms; i++) {
            rooms[i] = Room({
                id: i + 1,
                price: roomPrice,
                status: State.Available,
                bookingDuration: 0,
                bookingExpiration: 0,
                guest: address(0)
            });
        }
    }

    /// @notice Get contract balance
    /// @dev Only the contract owner can call this
    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    /// @notice Withdraw contract funds
    /// @dev Only the contract owner can call this
    function withdraw() public payable onlyOwner {
        address owner = owner();
        (bool sent,) = owner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }
    

    // Function to receive Ether
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
