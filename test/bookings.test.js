const Bookings = artifacts.require("./Bookings.sol");

const getErrorObj = (obj = {}) => {
    const txHash = Object.keys(obj)[0];
    return obj[txHash];
};

const ERR_NOT_AVAILABLE = "Room is already booked";
const ERR_EXACT_AMOUNT = "Room booking amount is invalid";
const ERR_NOT_OWNER = "Ownable: caller is not the owner";

contract("Bookings", function (accounts) {
    const [owner, secondAccount] = accounts;

    beforeEach(async () => {
        instance = await Bookings.new();
    });

    /**
     * Checks that the contract inherits OpenZeppelin Ownable by using owner()
     */
    it("should add first account as owner using OpenZeppelin Ownable", async () => {
        assert.strictEqual(await instance.owner(), owner);
    });

    describe("createBooking()", () => {
        /**
         * Creates a booking and then tries to book same room again.
         */
        it("should fail to book an already booked room", async () => {
            await instance.createBooking(1, 1, {
                value: web3.utils.toWei("0.075")
            });
            try {
                await instance.createBooking(1, 1, {
                    value: web3.utils.toWei("0.075")
                });
            } catch (e) {
                const {
                    error,
                    reason
                } = getErrorObj(e.data);
                assert.equal(error, "revert");
                assert.equal(reason, ERR_NOT_AVAILABLE);
            }
        });

        /**
         * Attempt to create a booking with the wrong amount.
         */
        it("should fail if payment is not exact", async () => {
            try {
                await instance.createBooking(2, 1, {
                    value: web3.utils.toWei("0.00140")
                });
            } catch (e) {
                const {
                    error,
                    reason
                } = getErrorObj(e.data);
                assert.equal(error, "revert");
                assert.equal(reason, ERR_EXACT_AMOUNT);
            }
        });

        /**
         * Verifies the booking amount is paid in full.
         */
        it("should get booking amount in full", async () => {
            await instance.createBooking(1, 1, {
                value: web3.utils.toWei("0.075")
            });
            const balanceAfter = await instance.getBalance();
            const bookingAmount = 75000000000000000;
            assert.equal(balanceAfter, bookingAmount);
        });
    });

    describe("extendBooking()", () => {
        /**
         * Creates a booking and then tries to extend the booking duration.
         */
        it("should extend booking duration of an already booked room", async () => {
            await instance.createBooking(1, 1, {
                value: web3.utils.toWei("0.075")
            });
            await instance.extendBooking(1, 2, {
                value: web3.utils.toWei("0.150")
            });
        });

        /**
         * Attempt to extend a booking with the wrong amount.
         */
        it("should fail to extend booking if payment is not exact", async () => {
            try {
                await instance.extendBooking(1, 2, {
                    value: web3.utils.toWei("0.00140")
                });
            } catch (e) {
                const {
                    error,
                    reason
                } = getErrorObj(e.data);
                assert.equal(error, "revert");
                assert.equal(reason, ERR_EXACT_AMOUNT);
            }
        });
    });

    describe("getRoomPrice()", () => {
        /**
         * Get the booking price of rooms.
         */
        it("should get booking price of rooms", async () => {
            const roomPrice = await instance.getRoomPrice();
            assert.equal(roomPrice, 75000000000000000);
        });
    });

    describe("setRoomPrice()", () => {
        /**
         * Set the booking price of rooms.
         */
        it("should set booking price of rooms", async () => {
            await instance.setRoomPrice("95000000000000000");
            const roomPrice = await instance.getRoomPrice();
            assert.equal(roomPrice, 95000000000000000);
        });
    });

    describe("getAvailableRooms()", () => {
        /**
         * Get a list of a ll the available rooms
         */
        it("should get a list of all available rooms", async () => {
            const availableRooms = (await instance.getAvailableRooms()).map(a => Number(a));
            const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
            for (let i = 0; i<availableRooms.length;i++){
                assert.equal(availableRooms[i], expected[i]);
            }
        });
    });

    describe("getBalance()", () => {
        /**
         * Get a balance of the contract
         */
        it("should get a list of all available rooms", async () => {
            const balance = await instance.getBalance();
            assert.strictEqual(balance, 00022);
        });
    });

    // describe("addProperty()", () => {
    //   /**
    //    * Verify ownable usage in function.
    //    */
    //   it("should allow only the owner to add properties", async () => {
    //     try {
    //       await addFirstProperty(instance, { from: secondAccount });
    //     } catch (e) {
    //       const { error, reason } = getErrorObj(e.data);
    //       assert.equal(error, "revert");
    //       assert.equal(reason, ERR_NOT_OWNER);
    //     }
    //   });

    //   /**
    //    * Verify:
    //    * * given property gets added to properties mapping
    //    * * length counter gets incremented
    //    */
    //   it("should add a property to properties mapping", async () => {
    //     const idListLengthBefore = await instance.idListLength();
    //     await addSecondProperty(instance, { from: owner });
    //     const idListLengthAfter = await instance.idListLength();
    //     assert.equal(
    //       idListLengthAfter.toNumber(),
    //       idListLengthBefore.toNumber() + 1
    //     );
    //     const { tenant } = await instance.properties(3);
    //     assert.equal(tenant, ADDRESS_ZERO);
    //   });
    // });
});