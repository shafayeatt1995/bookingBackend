const puppeteer = require("puppeteer");
const {
  postReq,
  objectID,
  dateDifferent,
  hasOne,
  paginate,
  generateBkashPaymentUrl,
  hasMany,
} = require("../utils");
const { Booking, RoomType, Hotel, Room } = require("../models");
const { bookingInvoice } = require("../utils/invoice");

async function availableRoom({ hotelID, checkIn, checkOut }) {
  try {
    const rooms = await Room.find({ hotelID, status: true }).select(
      "name roomTypeID"
    );
    const bookings = await Booking.find({
      hotelID,
      roomIDs: { $in: rooms.map(({ _id }) => _id) },
      checkIn: { $lte: new Date(checkOut) },
      checkOut: { $gte: new Date(checkIn) },
    }).select("roomIDs created_at");

    const bookingRoomIDs = bookings
      .flatMap(({ roomIDs }) => roomIDs)
      .map((id) => id.toString());

    return rooms.filter(
      (room) => !bookingRoomIDs.includes(room._id.toString())
    );
  } catch (error) {}
}

function totalAmount(rooms, nightCount) {
  const totals = rooms.reduce(
    (acc, room) => {
      const { price, discount, tax, quantity, commissionAmount } = room;
      const totalPrice = price * quantity * nightCount;
      const totalDiscount = discount * quantity * nightCount;
      const totalRoomPrice = totalPrice + totalDiscount;
      const totalTax = Math.round((totalPrice * (tax || 0)) / 100);
      const totalPricePerNight = totalPrice / nightCount;
      const totalPayable = totalPrice + totalTax;
      const totalCommission = commissionAmount * quantity * nightCount;

      acc.totalPrice += Math.round(totalPrice);
      acc.totalRoomPrice += Math.round(totalRoomPrice);
      acc.totalDiscount += Math.round(totalDiscount);
      acc.totalTax += Math.round(totalTax);
      acc.totalPricePerNight += Math.round(totalPricePerNight);
      acc.totalPayable += Math.round(totalPayable);
      acc.totalCommission += Math.round(totalCommission);
      return acc;
    },
    {
      totalPrice: 0,
      totalRoomPrice: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalPricePerNight: 0,
      totalPayable: 0,
      totalCommission: 0,
    }
  );

  return totals;
}

const controller = {
  async bookingInitiate(req, res) {
    try {
      const {
        hotelID,
        adult,
        child,
        checkIn,
        checkOut,
        contactName,
        contactAddress,
        contactNumber,
        contactNote,
        guestNames,
        paymentMethod,
        totalRoomPrice,
        totalDiscount,
        totalTax,
        totalPayable,
        rooms,
      } = req.body;

      const nightCount = dateDifferent(checkIn, checkOut);
      let priceCalculate = {};
      let updatedRoomTypes = [];
      let booking = {};

      const [roomTypes, [hotel]] = await Promise.all([
        RoomType.aggregate([
          {
            $match: {
              _id: { $in: rooms.map(({ roomTypeID }) => objectID(roomTypeID)) },
              hotelID: objectID(hotelID),
              status: true,
              approved: true,
            },
          },
          {
            $project: {
              name: 1,
              price: 1,
              discount: 1,
              tax: 1,
              commissionAmount: 1,
              cancelStatus: 1,
            },
          },
        ]),
        Hotel.aggregate([
          { $match: { _id: objectID(hotelID) } },
          ...hasOne("locationID", "locations", "location", ["name"]),
          { $limit: 1 },
        ]),
      ]);

      if (roomTypes.length === rooms.length) {
        updatedRoomTypes = roomTypes.map((roomType) => {
          const matchingRoom = rooms.find(
            (room) => room.roomTypeID === roomType._id.toString()
          );
          if (matchingRoom) {
            return {
              ...roomType,
              quantity: matchingRoom.quantity,
            };
          }
        });

        const calculateRoomPrice = totalAmount(updatedRoomTypes, nightCount);
        if (
          (calculateRoomPrice.totalPayable === totalPayable &&
            calculateRoomPrice.totalRoomPrice === totalRoomPrice,
          calculateRoomPrice.totalDiscount === totalDiscount,
          calculateRoomPrice.totalTax === totalTax)
        ) {
          priceCalculate = calculateRoomPrice;
        } else {
          throw new Error(
            `The owner might have changed the hotel price. Please select and book your room again.`
          );
        }
      } else {
        throw new Error(`Cannot find the room you selected`);
      }

      const availableRooms = await availableRoom({
        hotelID,
        checkIn,
        checkOut,
        roomType: rooms,
      });

      const newRooms = rooms.map((val) => {
        const matchedRooms = availableRooms.filter(
          ({ roomTypeID }) =>
            roomTypeID.toString() === val.roomTypeID.toString()
        );

        if (matchedRooms.length < val.quantity) {
          throw new Error("Not enough rooms available");
        }

        return {
          ...val,
          roomIDs: matchedRooms.slice(0, val.quantity).map(({ _id }) => _id),
        };
      });

      const roomIDs = newRooms.flatMap(({ roomIDs }) => roomIDs);

      if (Object.keys(priceCalculate).length > 0) {
        booking = await Booking.create({
          userID: req.user._id,
          hotelID,
          locationID: hotel?.locationID,
          roomIDs,
          cancelFee: hotel.cancelFee || 0,
          userName: req.user.name,
          locationName: hotel?.location?.name || "",
          adult,
          child,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          contactName,
          contactNumber,
          contactAddress,
          contactNote: contactNote || "",
          guestNames,
          paymentMethod,
          totalRoomPrice: priceCalculate.totalRoomPrice,
          totalDiscount: priceCalculate.totalDiscount,
          totalTax: priceCalculate.totalTax,
          totalPayable: priceCalculate.totalPayable,
          ownerAmount: Math.round(
            priceCalculate.totalPayable - priceCalculate.totalCommission
          ),
          commissionAmount: priceCalculate.totalCommission,
          rooms: updatedRoomTypes.map((room) => {
            const { _id, name, quantity, price, discount, tax, cancelStatus } =
              room;
            const calcRoomAmount = totalAmount([room], nightCount);
            return {
              roomTypeID: _id,
              name,
              quantity,
              price,
              discount,
              cancelStatus,
              tax,
              totalTax: calcRoomAmount.totalTax,
              totalAmount: calcRoomAmount.totalPayable,
              ownerAmount: Math.round(
                calcRoomAmount.totalPayable - calcRoomAmount.totalCommission
              ),
              commissionAmount: calcRoomAmount.totalCommission,
            };
          }),
        });
      } else {
        throw new Error(`Cannot find the room you selected`);
      }

      if (paymentMethod === "bkash") {
        const { _id, otp } = booking;
        const { totalPayable } = priceCalculate;

        const data = await generateBkashPaymentUrl(totalPayable, { otp, _id });
        if (data) {
          return res.json({ ...data });
        } else {
          throw new Error(`Bkash payment initialize failed`);
        }
      }
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async bookingVerify(req, res) {
    try {
      const { _id, otp, method, transactionNumber, id_token } = req.body;
      const { _id: userID } = req.user;
      const { BKASH_APP_KEY, BKASH_EXECUTE_URL } = process.env;

      const booking = await Booking.findOne({
        _id,
        otp,
        method,
        userID,
      });

      if (method === "bkash") {
        const checkPayment = await postReq(
          BKASH_EXECUTE_URL,
          {
            Authorization: id_token,
            "X-App-Key": BKASH_APP_KEY,
          },
          { paymentID: transactionNumber }
        );

        const { paymentID, transactionStatus, amount } = checkPayment.data;
        if (
          paymentID === transactionNumber &&
          amount == booking?.totalPayable
        ) {
          await Booking.findOneAndUpdate(
            { _id, otp, method, userID, status: "pending" },
            {
              transactionDetails: checkPayment.data,
              transactionNumber,
              status: transactionStatus === "Completed" ? "complete" : "cancel",
              verify: true,
              otp: "",
            }
          );
        } else {
          await Booking.findOneAndUpdate(
            { _id, otp, method, userID, status: "pending" },
            {
              transactionNumber: paymentID,
              status: "cancel",
              verify: true,
              otp: "",
            }
          );
        }
      }
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async fetchBookingDetails(req, res) {
    try {
      const { id: _id } = req.body;
      const { _id: userID } = req.user;
      const [booking] = await Booking.aggregate([
        { $match: { _id: objectID(_id), userID: objectID(userID) } },
        { $limit: 1 },
        ...hasOne("hotelID", "hotels", "hotel", ["slug", "name"]),
        {
          $project: {
            ownerAmount: 0,
            commissionAmount: 0,
            "rooms.ownerAmount": 0,
            "rooms.commissionAmount": 0,
          },
        },
      ]);
      return res.json({ booking });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async fetchBooking(req, res) {
    try {
      const { date, status, perPage, page } = req.body;
      const { _id } = req.user;
      const matchQuery = { userID: objectID(_id) };
      if (status) {
        matchQuery.status = status;
      }
      if (date) {
        matchQuery.checkIn = { $gt: new Date(date) };
      }

      const [items, total] = await Promise.all([
        Booking.aggregate([
          { $match: matchQuery },
          { $sort: { bookingNumber: -1 } },
          ...paginate(page, perPage),
          ...hasOne("hotelID", "hotels", "hotel", ["slug", "name"]),
          ...hasMany("reviews", "_id", "bookingID", "review"),
          {
            $project: {
              ownerAmount: 0,
              commissionAmount: 0,
              "rooms.ownerAmount": 0,
              "rooms.commissionAmount": 0,
            },
          },
        ]),
        Booking.countDocuments(matchQuery),
      ]);

      return res.json({ items, total });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async makePayment(req, res) {
    try {
      const { _id } = req.body;
      const { _id: userID } = req.user;

      const booking = await Booking.findOne({ _id, userID, status: "pending" });
      const { totalPayable, otp } = booking;
      const data = await generateBkashPaymentUrl(totalPayable, { otp, _id });

      return res.json({ ...data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async downloadInvoice(req, res) {
    try {
      const { _id } = req.body;
      const { _id: userID } = req.user;

      const booking = await Booking.findOne({ _id, userID });
      if (booking) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlContent = bookingInvoice(booking);

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: "A4" });

        await browser.close();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=invoice.pdf"
        );
        return res.send(pdfBuffer);
      } else {
        return res.status(400).send("Booking not found");
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async fetchDashboardBooking(req, res) {
    try {
      const { date, perPage, page } = req.body;
      const { _id } = req.user?.hotel;
      const matchQuery = { hotelID: objectID(_id) };
      if (date) {
        const [start, end] = date;
        matchQuery.checkIn = { $gte: new Date(start), $lte: new Date(end) };
      }

      const items = await Booking.aggregate([
        { $match: matchQuery },
        { $sort: { bookingNumber: -1 } },
        ...paginate(page, perPage),
      ]);

      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = controller;
