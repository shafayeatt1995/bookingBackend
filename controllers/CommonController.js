const {
  Hotel,
  Location,
  RoomType,
  Facility,
  AccommodationType,
  Review,
  BedType,
  Room,
  Booking,
} = require("../models");
const {
  message,
  hasMany,
  hasOne,
  objectID,
  paginate,
  addDate,
  arrayConverter,
} = require("../utils");

const controller = {
  async fetchHomeData(req, res) {
    try {
      const [locations, hotels] = await Promise.all([
        Location.find({ status: true }),
        Hotel.aggregate([
          { $match: { suspended: false, deleted: false } },
          { $sample: { size: 8 } },
          ...hasMany("facilities", "facilities", "_id", "facilityDetails", [
            "name",
          ]),
        ]),
      ]);
      return res.json({ locations, hotels });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchLocationsProperty(req, res) {
    try {
      const { search } = req.query;
      const locationMatchQuery = {};
      const propertyMatchQuery = {};
      if (search) {
        locationMatchQuery.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { slug: { $regex: new RegExp(search, "i") } },
        ];
        // propertyMatchQuery.$or = [
        //   { name: { $regex: new RegExp(search, "i") } },
        //   { slug: { $regex: new RegExp(search, "i") } },
        // ];
      }
      const [locations] = await Promise.all([
        Location.aggregate([
          { $match: locationMatchQuery },
          { $sample: { size: 10 } },
          { $project: { name: 1, image: 1 } },
          { $sort: { name: 1 } },
        ]),
        // Hotel.aggregate([
        //   { $match: propertyMatchQuery },
        //   { $sample: { size: 15 } },
        //   ...hasOne("locationID", "locations", "location", ["name"]),
        //   { $project: { images: 1, image: 1, name: 1, location: 1 } },
        // ]),
      ]);
      return res.json({ locations, properties: [] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchAllLocation(req, res) {
    try {
      const locations = await Location.find({ status: true });
      return res.json({ locations });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchAllFacilitiesOnce(req, res) {
    try {
      const facilities = await Facility.find({ status: true });
      return res.json({ facilities });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchAllBedsOnce(req, res) {
    try {
      const beds = await BedType.find().select({ name: 1, slug: 1, icon: 1 });
      return res.json({ beds });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchAllAccommodationType(req, res) {
    try {
      const accommodationType = await AccommodationType.find().sort({
        name: 1,
      });
      return res.json({ accommodationType });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchSearchHotels(req, res) {
    try {
      const {
        search,
        checkInOut,
        adult,
        child,
        room,
        timezone,
        perPage,
        page,
        accommodation,
        facilities,
        minPrice = 0,
        maxPrice = 0,
        ratings,
        sort,
      } = req.body;

      const matchQuery = { deleted: false, suspended: false };
      let sortQuery = {};
      const searchConditions = [];
      const ratingConditions = [];
      const matchConditions = [];

      if (search) {
        searchConditions.push(
          { name: { $regex: new RegExp(search, "i") } },
          { slug: { $regex: new RegExp(search, "i") } },
          { address: { $regex: new RegExp(search, "i") } }
        );
      }

      if (ratings && ratings.length > 0) {
        const ratingMapping = arrayConverter(ratings)
          .map((rating) => {
            const normalizedRating = +rating;
            switch (normalizedRating) {
              case 1:
                return { rating: { $gte: 0, $lt: 2 } };
              case 2:
                return { rating: { $gte: 2, $lt: 3 } };
              case 3:
                return { rating: { $gte: 3, $lt: 4 } };
              case 4:
                return { rating: { $gte: 4, $lt: 4.75 } };
              case 5:
                return { rating: { $gte: 4.75, $lte: 5 } };
              default:
                return null;
            }
          })
          .filter(Boolean);

        ratingConditions.push(...ratingMapping);
      }

      if (accommodation && accommodation.length > 0) {
        matchQuery.accommodations = {
          $in: arrayConverter(accommodation).map((id) => objectID(id)),
        };
      }

      if (facilities && facilities.length > 0) {
        matchQuery.facilities = {
          $in: arrayConverter(facilities).map((id) => objectID(id)),
        };
      }

      if (minPrice || maxPrice) {
        matchQuery.minPrice = {};
        if (minPrice > 0) matchQuery.minPrice.$gte = +minPrice;
        if (maxPrice > 0) matchQuery.minPrice.$lte = +maxPrice;
      }

      if (sort) {
        sortQuery = JSON.parse(sort);
      }

      if (searchConditions.length > 0) {
        matchConditions.push({ $or: searchConditions });
      }

      if (ratingConditions.length > 0) {
        matchConditions.push({ $or: ratingConditions });
      }

      if (matchConditions.length > 0) {
        matchQuery.$and = matchConditions;
      }

      const aggregationPipeline = [
        { $match: matchQuery },
        ...(Object.keys(sortQuery).length ? [{ $sort: sortQuery }] : []),
        ...paginate(page, perPage),
      ];

      const [hotels, total] = await Promise.all([
        Hotel.aggregate(aggregationPipeline),
        Hotel.countDocuments(matchQuery),
      ]);

      return res.json({ hotels, total });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async fetchSingleHotelData(req, res) {
    try {
      const { slug } = req.body;
      const [hotel] = await Hotel.aggregate([
        { $match: { slug, deleted: false, suspended: false } },
        { $limit: 1 },
        {
          $project: {
            accommodations: 0,
            deleted: 0,
            suspended: 0,
            managers: 0,
            owners: 0,
          },
        },
      ]);

      return res.json({ hotel });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async fetchHotelRoomTypes(req, res) {
    try {
      let {
        hotelID,
        adult = 2,
        child = 0,
        room = 1,
        checkIn,
        checkOut,
      } = req.body;

      checkIn = new Date(checkIn);
      checkOut = addDate(-1, checkOut);

      const findRoomTypes = await RoomType.aggregate([
        {
          $match: {
            hotelID: objectID(hotelID),
            status: true,
            approved: true,
          },
        },
        {
          $lookup: {
            from: "complements",
            let: { complementIds: "$complements" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$complementIds"] } } },
              { $project: { name: 1, item: 1 } },
            ],
            as: "complement",
          },
        },
        {
          $addFields: {
            disabled: {
              $or: [{ $gt: [+adult, "$adult"] }, { $gt: [+child, "$child"] }],
            },
          },
        },
        {
          $project: {
            name: 1,
            slug: 1,
            accommodationType: 1,
            price: 1,
            cancelFee: 1,
            coin: 1,
            checkIn: 1,
            checkOut: 1,
            adult: 1,
            child: 1,
            tax: 1,
            discount: 1,
            facilities: 1,
            complement: 1,
            images: 1,
            rating: 1,
            bedPerRoomType: 1,
            disabled: 1,
            bathroom: 1,
            bedroom: 1,
            cancelStatus: 1,
          },
        },
        { $sort: { price: 1 } },
      ]);

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

      const availableRooms = rooms.filter(
        (room) => !bookingRoomIDs.includes(room._id.toString())
      );

      const roomTypes = findRoomTypes.map((val) => ({
        ...val,
        rooms: availableRooms.filter(
          ({ roomTypeID }) => roomTypeID.toString() === val._id.toString()
        ),
      }));

      return res.json({ roomTypes });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchReview(req, res) {
    try {
      const { hotelID, page, perPage } = req.body;
      const items = await Review.aggregate([
        { $match: { hotelID: objectID(hotelID) } },
        { $sort: { _id: -1 } },
        ...paginate(page, perPage),
        ...hasOne("userID", "users", "user", ["name", "avatar"]),
        {
          $project: {
            message: 1,
            rating: 1,
            created_at: 1,
            user: 1,
          },
        },
      ]);
      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchReviewSummary(req, res) {
    try {
      const { hotelID } = req.body;
      const [summary] = await Review.aggregate([
        { $match: { hotelID: objectID(hotelID) } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            avgStaff: { $avg: "$staff" },
            avgFacility: { $avg: "$facility" },
            avgLocation: { $avg: "$location" },
            avgValueForMoney: { $avg: "$valueForMoney" },
            avgBedRoom: { $avg: "$bedRoom" },
            avgWashroom: { $avg: "$washroom" },
          },
        },
        { $limit: 1 },
        {
          $project: {
            _id: 0,
            totalReviews: 1,
            avgStaff: { $round: ["$avgStaff", 1] },
            avgFacility: { $round: ["$avgFacility", 1] },
            avgLocation: { $round: ["$avgLocation", 1] },
            avgValueForMoney: { $round: ["$avgValueForMoney", 1] },
            avgBedRoom: { $round: ["$avgBedRoom", 1] },
            avgWashroom: { $round: ["$avgWashroom", 1] },
          },
        },
      ]);
      return res.json({ summary });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchOwnerDashboard(req, res) {
    try {
      const { hotel } = req.user;
      const { today, monthly } = req.body;
      const [[todaySummery], [monthlySummery]] = await Promise.all([
        Booking.aggregate([
          {
            $match: {
              hotelID: objectID(hotel._id),
              status: "complete",
              created_at: {
                $gte: new Date(today.start),
                $lte: new Date(today.end),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              earning: { $sum: "$totalPayable" },
            },
          },
        ]),
        Booking.aggregate([
          {
            $match: {
              hotelID: objectID(hotel._id),
              status: "complete",
              created_at: {
                $gte: new Date(monthly.start),
                $lte: new Date(monthly.end),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              earning: { $sum: "$totalPayable" },
            },
          },
        ]),
      ]);

      return res.json({ todaySummery, monthlySummery });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchManagerDashboard(req, res) {
    try {
      const { hotel } = req.user;
      const { today, monthly } = req.body;
      const [[todaySummery], [monthlySummery]] = await Promise.all([
        Booking.aggregate([
          {
            $match: {
              hotelID: objectID(hotel._id),
              status: "complete",
              created_at: {
                $gte: new Date(today.start),
                $lte: new Date(today.end),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              earning: { $sum: "$totalPayable" },
            },
          },
        ]),
        Booking.aggregate([
          {
            $match: {
              hotelID: objectID(hotel._id),
              status: "complete",
              created_at: {
                $gte: new Date(monthly.start),
                $lte: new Date(monthly.end),
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              earning: { $sum: "$totalPayable" },
            },
          },
        ]),
      ]);

      return res.json({ todaySummery, monthlySummery });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async getSalesLog(req, res) {
    try {
      const { hotel } = req.user;
      const { start, end, timezone } = req.body;
      const salesLog = await Booking.aggregate([
        {
          $match: {
            hotelID: objectID(hotel._id),
            status: "complete",
            created_at: {
              $gte: new Date(start),
              $lte: new Date(end),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: "$created_at",
                timezone,
              },
            },
            total: { $sum: "$totalPayable" },
          },
        },
      ]);

      return res.json({ salesLog });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
